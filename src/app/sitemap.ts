import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { INDEXED_PATHS, languageUrls, pageUrl } from "@/lib/seo";

/**
 * Every indexable page, once per language, each listing both languages (and
 * x-default) as alternates. No lastModified: there is no real source for it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: pageUrl(path, locale),
      alternates: { languages: languageUrls(path) },
    })),
  );
}
