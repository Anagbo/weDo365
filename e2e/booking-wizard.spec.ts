import { expect, test, type Page } from "@playwright/test";

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
