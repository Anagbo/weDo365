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

for (const [width, height] of [
  [1440, 900],
  [1280, 720],
] as const) {
  test(`headline and intro are above the fold at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
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
}
