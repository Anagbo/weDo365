import { expect, test, type Locator, type Page } from "@playwright/test";

const LANGS = [
  { name: "sv", path: "/boka" },
  { name: "en", path: "/en/book" },
] as const;

async function openStep2(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator("#frequency")).toBeVisible();
}

for (const lang of LANGS) {
  for (const width of [390, 768, 1280, 1920]) {
    test(`frequency cards keep their text inside (${lang.name}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStep2(page, lang.path);

      const cards = page.locator("fieldset:has(#frequency) button");
      await expect(cards).toHaveCount(5);

      const result = await cards.evaluateAll((buttons) =>
        buttons.map((button) => {
          const card = button.getBoundingClientRect();
          const text = document.createRange();
          text.selectNodeContents(button);
          const t = text.getBoundingClientRect();
          return {
            card: { l: card.left, r: card.right, t: card.top, b: card.bottom },
            text: { l: t.left, r: t.right, t: t.top, b: t.bottom },
            overflow: button.scrollWidth > button.clientWidth + 1,
          };
        }),
      );

      for (const c of result) {
        expect(c.overflow).toBe(false);
        expect(c.text.l).toBeGreaterThanOrEqual(c.card.l - 0.5);
        expect(c.text.r).toBeLessThanOrEqual(c.card.r + 0.5);
        expect(c.text.t).toBeGreaterThanOrEqual(c.card.t - 0.5);
        expect(c.text.b).toBeLessThanOrEqual(c.card.b + 0.5);
      }

      // Equal heights within each row.
      const rows = new Map<number, number[]>();
      for (const c of result) {
        const key = Math.round(c.card.t);
        rows.set(key, [...(rows.get(key) ?? []), c.card.b - c.card.t]);
      }
      for (const heights of rows.values()) {
        expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
      }

      // 3 + 2 from 768px, two columns on phones.
      const perRow = [...rows.values()].map((r) => r.length);
      expect(perRow).toEqual(width >= 768 ? [3, 2] : [2, 2, 1]);

      const scrolls = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(scrolls).toBe(false);
    });
  }
}

for (const lang of LANGS) {
  for (const width of [390, 500]) {
    test(`step indicator stays on one row (${lang.name}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(lang.path);
      await page.evaluate(() => document.fonts.ready);

      const check = async () => {
        const items = page.locator("ol[aria-label] > li");
        await expect(items).toHaveCount(4);
        const boxes = await items.evaluateAll((lis) =>
          lis.map((li) => {
            const r = li.getBoundingClientRect();
            return { t: Math.round(r.top), r: r.right };
          }),
        );
        expect(new Set(boxes.map((b) => b.t)).size).toBe(1);
        for (const b of boxes) expect(b.r).toBeLessThanOrEqual(width);
        const scrolls = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        expect(scrolls).toBe(false);
      };

      const next = page.locator('form button[type="submit"]');
      await check();
      await next.click();
      await check();
      await page.locator("#size").fill("60");
      await page.locator("#frequency").click();
      await next.click();
      await expect(page.locator("#frequency")).toBeHidden();
      await check();
    });
  }
}
/** Home cleaning, filled with only the required fields, up to step 4. */
async function openStep4(page: Page, path: string) {
  // Nothing in these tests may reach the real send endpoint.
  let sent = 0;
  await page.route("**/api/request", (route) => {
    sent++;
    return route.abort();
  });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  const next = page.locator('form button[type="submit"]');
  // The first click can land before hydration; repeat until step 2 shows.
  await expect(async () => {
    await next.click();
    await expect(page.locator("#size")).toBeVisible({ timeout: 1500 });
  }).toPass();
  await page.locator("#size").fill("60");
  await page.locator("#frequency").click();
  await next.click();
  const tomorrow = new Date(Date.now() + 2 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  await page.locator("#date").fill(tomorrow);
  await page.locator("#slot").click();
  await page.locator("#street").fill("Testgatan 1");
  await page.locator("#zip").fill("12345");
  await page.locator("#city").fill("Stockholm");
  await next.click();
  await expect(page.locator("#name")).toBeVisible();
  return () => sent;
}

/** Everything in the form and the stepper stays inside its container. */
async function expectNoOverflow(page: Page, width: number) {
  const problems = await page.evaluate((viewport) => {
    const out: string[] = [];
    const form = document.querySelector("form")!;
    const fr = form.getBoundingClientRect();
    const scope = [
      ...document.querySelectorAll("ol[aria-label]"),
      form,
      ...form.querySelectorAll("*"),
    ];
    for (const el of scope) {
      const r = el.getBoundingClientRect();
      // Skip hidden elements and the off-screen honeypot.
      if (r.width === 0 || r.height === 0 || r.right < 0 || r.left < 0)
        continue;
      const name = `${el.tagName.toLowerCase()}#${el.id}.${String(el.className).slice(0, 40)}`;
      if (r.right > viewport + 0.5) out.push(`${name} past viewport`);
      if (el !== form && el.tagName !== "OL" && r.right > fr.right + 0.5)
        out.push(`${name} past form`);
      const he = el as HTMLElement;
      if (
        he.scrollWidth > he.clientWidth + 1 &&
        getComputedStyle(he).display !== "inline" &&
        ["P", "LABEL", "BUTTON", "SPAN", "LI", "H2"].includes(he.tagName)
      )
        out.push(`${name} scrolls horizontally`);
    }
    if (document.documentElement.scrollWidth > viewport + 1)
      out.push("page scrolls horizontally");
    return out;
  }, width);
  expect(problems).toEqual([]);
}

async function expectTappable(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  // Poll: layout can still settle (fonts, scroll) right after navigation.
  await expect
    .poll(
      () =>
        target.evaluate((el) => {
          el.scrollIntoView({ block: "center" });
          const r = el.getBoundingClientRect();
          const top = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2,
          );
          return (
            r.left >= 0 &&
            r.right <= window.innerWidth &&
            r.top >= 0 &&
            r.bottom <= window.innerHeight &&
            top !== null &&
            el.contains(top)
          );
        }),
      { message: "fully visible and not covered" },
    )
    .toBe(true);
  return (await target.boundingBox())!.height;
}
async function expectOneRowStepper(page: Page, width: number) {
  const items = page.locator("ol[aria-label] > li");
  const tops = await items.evaluateAll((lis) =>
    lis.map((li) => Math.round(li.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(1);
  const current = page.locator('ol[aria-label] > li[aria-current="step"]');
  const label = current.locator("span").nth(1);
  const lineHeight = await label.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.height / parseFloat(getComputedStyle(el).lineHeight);
  });
  expect(lineHeight).toBeLessThan(1.5);
  expect(
    await current.evaluate((el) => el.getBoundingClientRect().right),
  ).toBeLessThanOrEqual(width);
}

for (const lang of LANGS) {
  for (const width of [390, 500]) {
    test.describe(`step 4 (${lang.name}, ${width}px)`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
      });

      test("layout fits and the submit button and consent are reachable", async ({
        page,
      }) => {
        const sent = await openStep4(page, lang.path);
        await expectOneRowStepper(page, width);
        await expectNoOverflow(page, width);

        const consent = page.locator("form p.text-sm");
        await expect(consent).toBeVisible();
        await expectTappable(page, consent);
        for (const link of await consent.locator("a").all()) {
          await expectTappable(page, link);
        }

        const submit = page.locator('form button[type="submit"]');
        const height = await expectTappable(page, submit);
        expect(height).toBeGreaterThanOrEqual(44);

        // No sticky bar may sit on top of the form's buttons.
        const bar = page.locator("div.sticky.bottom-0");
        expect(await bar.count()).toBe(0);
        expect(sent()).toBe(0);
      });

      test("validation errors fit", async ({ page }) => {
        const sent = await openStep4(page, lang.path);
        await page.locator('form button[type="submit"]').click();
        const alerts = page.locator("form [role=alert], form [id$=-error]");
        await expect(alerts.first()).toBeVisible();
        expect(await alerts.count()).toBeGreaterThanOrEqual(3);
        await expectNoOverflow(page, width);
        await expectOneRowStepper(page, width);

        // Long, invalid values still wrap inside their fields.
        await page.locator("#email").fill("x".repeat(80));
        await page.locator("#phone").fill("y".repeat(40));
        await page.locator('form button[type="submit"]').click();
        await expectNoOverflow(page, width);
        await expectTappable(page, page.locator('form button[type="submit"]'));
        expect(sent()).toBe(0);
      });
    });
  }
}
