import { expect, test, type Page } from "@playwright/test";

/**
 * Header overflow regression: at >=1536px the call button used to show the
 * phone number, which no longer fit inside the 1200px content box and made
 * the "WeDo365" wordmark overlap the first nav link. This checks the fixed
 * layout stays safe across the widths involved and never overflows its
 * container.
 */

const WIDTHS = [1280, 1440, 1536, 1920, 2560];
const PATHS = { sv: "/", en: "/en" } as const;

function intersects(a: DOMRect, b: DOMRect) {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

async function headerBoxes(page: Page) {
  const header = page.getByTestId("site-header-row");

  const headerBox = (await header.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  )) as DOMRect;
  const wordmarkBox = (await header
    .getByTestId("brand-wordmark")
    .evaluate((el) => el.getBoundingClientRect().toJSON())) as DOMRect;
  const linkBoxes = (await header
    .getByTestId("site-nav-link")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))) as DOMRect[];
  return { headerBox, wordmarkBox, linkBoxes };
}

for (const width of WIDTHS) {
  for (const [locale, path] of Object.entries(PATHS)) {
    test(`header does not overlap at ${width}px (${locale})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const header = page.getByTestId("site-header-row");
      await expect(header.getByTestId("brand-wordmark")).toBeVisible();

      const { headerBox, wordmarkBox, linkBoxes } = await headerBoxes(page);

      for (const linkBox of linkBoxes) {
        expect(
          intersects(wordmarkBox, linkBox as DOMRect),
          `wordmark overlaps a nav link at ${width}px (${locale})`,
        ).toBe(false);
      }

      // No header child should spill outside the header container.
      for (const box of [wordmarkBox, ...linkBoxes]) {
        expect(
          box.left,
          `child left-overflow at ${width}px (${locale})`,
        ).toBeGreaterThanOrEqual(headerBox.left - 1);
        expect(
          box.right,
          `child right-overflow at ${width}px (${locale})`,
        ).toBeLessThanOrEqual(headerBox.right + 1);
      }

      // No horizontal scroll either.
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalScroll).toBe(false);
    });
  }
}
