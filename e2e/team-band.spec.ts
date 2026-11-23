import { expect, test } from "@playwright/test";

/**
 * Team photo band at the top of the home page: reserved space (no layout
 * shift), no horizontal scroll, the photo shown uncropped (so all six faces
 * stay in frame), and the headline and intro above the fold on laptops.
 */

const WIDTHS = [390, 768, 1280, 1440, 1920, 2560];

for (const width of WIDTHS) {
  test(`team band is whole and does not scroll sideways at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const band = page.getByTestId("team-band");
    const img = band.locator("img");
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0))
      .toBe(true);

    const { box, natural } = await img.evaluate((el: HTMLImageElement) => {
      const r = el.getBoundingClientRect();
      return {
        box: { w: r.width, h: r.height },
        natural: { w: el.naturalWidth, h: el.naturalHeight },
      };
    });
    // The crop is shown at its own aspect ratio: nothing is trimmed.
    expect(box.w / box.h).toBeCloseTo(natural.w / natural.h, 1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
}

for (const width of [1280, 1440, 1920, 2560]) {
  test(`team band lines up with the header and hero at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const edges = await page.evaluate(() => {
      const box = (el: Element | null) => el!.getBoundingClientRect();
      const row = document.querySelector('[data-testid="site-header-row"]')!;
      const links = [...row.querySelectorAll("a")].filter(
        (a) => a.getBoundingClientRect().width > 0,
      );
      return {
        band: box(document.querySelector('[data-testid="team-band"] picture')),
        caption: box(
          document.querySelector('[data-testid="team-band"] figcaption'),
        ),
        h1: box(document.querySelector("h1")),
        logo: box(links[0]),
        send: box(links[links.length - 1]),
        slider: box(
          document.querySelector('[aria-roledescription="carousel"] ul'),
        ),
      };
    });
    expect(Math.abs(edges.band.left - edges.h1.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(edges.band.left - edges.logo.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(edges.caption.left - edges.h1.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(edges.band.right - edges.slider.right)).toBeLessThanOrEqual(
      1,
    );
    expect(Math.abs(edges.band.right - edges.send.right)).toBeLessThanOrEqual(
      1,
    );
  });
}

const LANGS = [
  { name: "sv", path: "/" },
  { name: "en", path: "/en" },
] as const;

// Real browser viewport heights: a 1440x900 screen minus ~120px of browser UI,
// and a smaller 1280x720 laptop screen.
const SHORT_VIEWPORTS = [
  [1440, 780],
  [1280, 650],
] as const;

for (const lang of LANGS) {
  for (const [width, height] of SHORT_VIEWPORTS) {
    test.describe(`${lang.name} at ${width}x${height}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(lang.path);
        await page.evaluate(() => document.fonts.ready);
      });

      test("headline and intro are above the fold", async ({ page }) => {
        const h1 = await page
          .locator("h1")
          .first()
          .evaluate((el) => el.getBoundingClientRect().bottom);
        expect(h1).toBeLessThanOrEqual(height);
        const lead = await page
          .locator("h1 + p")
          .first()
          .evaluate((el) => el.getBoundingClientRect().bottom);
        expect(lead).toBeLessThanOrEqual(height);
      });

      test("band is a row with the trust points, aligned to the page", async ({
        page,
      }) => {
        const side = page.getByTestId("team-band-side");
        await expect(side).toBeVisible();
        await expect(side.locator("li")).toHaveCount(3);
        // The separate trust bar is hidden, so the points appear once.
        await expect(page.getByTestId("trust-bar")).toBeHidden();

        const edges = await page.evaluate(() => {
          const box = (el: Element | null) => el!.getBoundingClientRect();
          const row = document.querySelector(
            '[data-testid="site-header-row"]',
          )!;
          const links = [...row.querySelectorAll("a")].filter(
            (a) => a.getBoundingClientRect().width > 0,
          );
          const band = document.querySelector('[data-testid="team-band"]')!;
          const photo = box(band.querySelector("picture"));
          const side = box(
            band.querySelector('[data-testid="team-band-side"]'),
          );
          return {
            photo,
            side,
            h1: box(document.querySelector("h1")),
            send: box(links[links.length - 1]),
            slider: box(
              document.querySelector('[aria-roledescription="carousel"] ul'),
            ),
            container: box(band).width,
          };
        });
        expect(Math.abs(edges.photo.left - edges.h1.left)).toBeLessThanOrEqual(
          1,
        );
        expect(
          Math.abs(edges.side.right - edges.slider.right),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(edges.side.right - edges.send.right),
        ).toBeLessThanOrEqual(1);
        // Photo about 60% of the row; text block vertically centered on it.
        expect(edges.photo.width / edges.container).toBeGreaterThan(0.55);
        expect(edges.photo.width / edges.container).toBeLessThan(0.65);
        const centre = (b: { top: number; height: number }) =>
          b.top + b.height / 2;
        expect(
          Math.abs(centre(edges.side) - centre(edges.photo)),
        ).toBeLessThanOrEqual(2);
      });

      test("no horizontal scroll and no layout shift", async ({ page }) => {
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        expect(overflow).toBe(false);
        const before = await page.getByTestId("team-band").boundingBox();
        await page.waitForLoadState("networkidle");
        const after = await page.getByTestId("team-band").boundingBox();
        expect(after).toEqual(before);
        const h1Top = () =>
          page
            .locator("h1")
            .first()
            .evaluate((el) => el.getBoundingClientRect().top);
        const first = await h1Top();
        await page.waitForTimeout(500);
        expect(await h1Top()).toBe(first);
      });
    });
  }
}

for (const lang of LANGS) {
  test(`phone keeps the full-width band and the trust bar (${lang.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(lang.path);
    await expect(page.getByTestId("team-band-side")).toBeHidden();
    await expect(page.getByTestId("trust-bar")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test(`tall viewport keeps the full-width band and the trust bar (${lang.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(lang.path);
    await expect(page.getByTestId("team-band-side")).toBeHidden();
    await expect(page.getByTestId("trust-bar")).toBeVisible();
  });
}
