import type { AppPathname } from "@/i18n/routing";
import type { ServiceId } from "./site";

/**
 * Service pages built with <ServicePage>. To add one (e.g. Flyttstädning):
 * 1. Add a namespace to both messages files with the same keys as
 *    `homeCleaning`.
 * 2. Add an entry here.
 * 3. Add its paths to `pathnames` in src/i18n/routing.ts.
 * 4. Copy src/app/[locale]/hemstadning/page.tsx to the new folder and
 *    change the key it passes to getServicePage().
 * 5. Point the links that go to the wizard today (home service cards,
 *    footer) at the new page.
 */
export const SERVICE_PAGES = {
  homeCleaning: { service: "hem", path: "/hemstadning" },
} as const satisfies Record<string, { service: ServiceId; path: AppPathname }>;

export type ServicePageKey = keyof typeof SERVICE_PAGES;
