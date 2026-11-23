import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { NOINDEX, NON_PRODUCTION_HOST_PATTERN } from "./src/config/indexing";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // One complete, server-rendered 404 page for every unknown URL. (A not-found
  // thrown from a page under Cache Components is only a client-rendered shell.)
  experimental: { globalNotFound: true },
  images: {
    // Photos are served as AVIF, with WebP as the fallback.
    formats: ["image/avif", "image/webp"],
    qualities: [80],
  },
  // Only the production hosts (wedo365.se, www.wedo365.se) may be indexed;
  // every other host gets noindex (see src/config/indexing.ts).
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: NON_PRODUCTION_HOST_PATTERN }],
        headers: [{ key: "X-Robots-Tag", value: NOINDEX }],
      },
    ];
  },
  async rewrites() {
    return {
      // The proxy skips URLs with a dot (so it leaves /favicon.ico alone), which
      // lets Next.js read e.g. "/index.html" as a language. Real files and
      // metadata routes (robots.txt, sitemap.xml) are matched before this rule;
      // anything else with a dot goes to a path that matches no page, so it gets
      // the normal 404 page.
      afterFiles: [
        {
          source: "/:file([^/]+\\.[^/]+)",
          destination: "/_no-such-page/:file",
        },
      ],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Reads src/i18n/request.ts by default.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
