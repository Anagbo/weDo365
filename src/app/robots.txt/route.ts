import { SITE_URL } from "@/config/site";
import { isProductionHost, requestHost } from "@/config/indexing";

/**
 * robots.txt, decided per request host (so it is rendered on request, not at
 * build time). Production hosts: crawl everything and point to the sitemap on
 * the canonical host (SITE_URL). Any other host: disallow everything.
 */
export function GET(request: Request) {
  const body = isProductionHost(requestHost(request.headers))
    ? `User-Agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : "User-Agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      Vary: "Host, X-Forwarded-Host",
    },
  });
}
