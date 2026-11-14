import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SITE_URL } from "@/config/site";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";

/** Pages that must not be indexed or listed in the sitemap. */
export const NOINDEX_PATHS: readonly AppPathname[] = ["/tack"];

/** Every page that belongs in the sitemap. */
export const INDEXED_PATHS = (
  Object.keys(routing.pathnames) as AppPathname[]
).filter((path) => !NOINDEX_PATHS.includes(path));

const OG_LOCALE: Record<Locale, string> = { sv: "sv_SE", en: "en_GB" };

/** Absolute URL of a page in one language, e.g. https://wedo365ab.se/en/book */
export function pageUrl(path: AppPathname, locale: Locale): string {
  return SITE_URL + getPathname({ href: path, locale });
}

/** hreflang map for a page: sv, en and x-default (the Swedish page). */
export function languageUrls(path: AppPathname) {
  return {
    sv: pageUrl(path, "sv"),
    en: pageUrl(path, "en"),
    "x-default": pageUrl(path, routing.defaultLocale),
  };
}

/**
 * Metadata shared by every page: title, description, canonical, hreflang
 * alternates and Open Graph. `path` is the internal path (a key of
 * `routing.pathnames`), so the same call works in both languages.
 */
export async function pageMetadata({
  path,
  title,
  description,
}: {
  path: AppPathname;
  title: string;
  description: string;
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const siteName = (await getTranslations("meta"))("siteName");
  const url = pageUrl(path, locale);
  const otherLocales = routing.locales.filter((l) => l !== locale);

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageUrls(path) },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: otherLocales.map((l) => OG_LOCALE[l]),
      // [OG-BILD] TODO: add `images: [{ url, width: 1200, height: 630, alt }]`
      // here once the real share image exists.
    },
    ...(NOINDEX_PATHS.includes(path) ? { robots: { index: false } } : {}),
  };
}
