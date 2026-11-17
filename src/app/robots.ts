import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { IS_PRODUCTION_BUILD } from "@/config/indexing";

/**
 * Production: crawl everything, sitemap with absolute URLs from SITE_URL.
 * Any other deployment (VERCEL_ENV is not "production"): disallow all.
 * A production build that is also reachable on another host (the
 * *.vercel.app address) stays out of search results through the
 * X-Robots-Tag header set in next.config.ts for every host but the real one.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_BUILD) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
