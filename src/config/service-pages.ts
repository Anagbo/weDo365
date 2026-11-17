import type { AppPathname } from "@/i18n/routing";
import type { ImageKey } from "./images";
import type { ServiceId } from "./site";

/**
 * Service pages built with <ServicePage>. To add one:
 * 1. Add a namespace to both messages files with the same keys as
 *    `homeCleaning` (the type checker enforces it).
 * 2. Add an entry here.
 * 3. Add its paths to `pathnames` in src/i18n/routing.ts.
 * 4. Copy src/app/[locale]/hemstadning/page.tsx to the new folder and
 *    change the key it passes.
 * 5. Add it to `footer.serviceLinks` and `home.services` (same order as
 *    SERVICE_IDS).
 * The sitemap and hreflang tags follow from the routing automatically.
 * `image` is the photo slot in src/config/images.ts (null = no photo).
 */
export const SERVICE_PAGES = {
  homeCleaning: { service: "hem", path: "/hemstadning", image: "homeCleaning" },
  moveOut: { service: "flytt", path: "/flyttstadning", image: null },
  deepCleaning: { service: "stor", path: "/storstadning", image: null },
  windowCleaning: { service: "fonster", path: "/fonsterputs", image: null },
} as const satisfies Record<
  string,
  { service: ServiceId; path: AppPathname; image: ImageKey | null }
>;

export type ServicePageKey = keyof typeof SERVICE_PAGES;

/** The page of each service, by wizard service id. */
export const SERVICE_PAGE_PATH = {
  hem: "/hemstadning",
  flytt: "/flyttstadning",
  stor: "/storstadning",
  fonster: "/fonsterputs",
} as const satisfies Record<ServiceId, AppPathname>;
