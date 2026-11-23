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
