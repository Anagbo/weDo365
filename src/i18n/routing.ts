import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  // Swedish lives at the root, English under /en.
  localePrefix: "as-needed",
  // Always serve the language in the URL. No Accept-Language redirect and no
  // locale cookie, so "/" is always Swedish and every page can be cached.
  localeDetection: false,
  localeCookie: false,
  // Keys are the internal paths (folder names under src/app/[locale]).
  pathnames: {
    "/": "/",
    "/hemstadning": { sv: "/hemstadning", en: "/home-cleaning" },
    "/foretag": { sv: "/foretag", en: "/business" },
    "/boka": { sv: "/boka", en: "/book" },
    "/offert": { sv: "/offert", en: "/quote" },
    "/tack": { sv: "/tack", en: "/thanks" },
    "/integritetspolicy": { sv: "/integritetspolicy", en: "/privacy" },
    "/villkor": { sv: "/villkor", en: "/terms" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
