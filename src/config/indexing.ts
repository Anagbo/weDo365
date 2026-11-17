import { COMPANY } from "./company";

/**
 * Search engines may index the site only on the real production domain, in
 * a production deployment. Everything else (previews, the *.vercel.app
 * address, localhost, a local build) gets `noindex` and a robots.txt that
 * disallows everything.
 *
 * Plain relative imports only: next.config.ts imports this file too.
 */
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${COMPANY.domain}`
).replace(/\/$/, "");

/** Host of the public site, e.g. "wedo365.se". */
export const PRODUCTION_HOST = new URL(SITE).hostname.replace(/^www\./, "");

/** True for a production deployment (build time: VERCEL_ENV=production). */
export const IS_PRODUCTION_BUILD = process.env.VERCEL_ENV === "production";

/** Value of the X-Robots-Tag header on hosts that must not be indexed. */
export const NOINDEX = "noindex, nofollow";
