import { COMPANY } from "./company";

/**
 * Search engines may index the site only on its production hosts: the
 * canonical host from SITE_URL and its apex/www twin (wedo365.se and
 * www.wedo365.se). Every other host (localhost, *.netlify.app, *.vercel.app,
 * deploy previews) gets `X-Robots-Tag: noindex, nofollow` and a robots.txt
 * that disallows everything. The decision depends only on the request host,
 * never on a hosting-platform environment variable.
 *
 * Plain relative imports only: next.config.ts imports this file too.
 */
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${COMPANY.domain}`
).replace(/\/$/, "");

/** Registrable domain of the site, e.g. "wedo365.se". */
export const PRODUCTION_HOST = new URL(SITE).hostname.replace(/^www\./, "");

/** The hosts that may be indexed: "wedo365.se" and "www.wedo365.se". */
export const PRODUCTION_HOSTS: readonly string[] = [
  PRODUCTION_HOST,
  `www.${PRODUCTION_HOST}`,
];

/** Value of the X-Robots-Tag header on hosts that must not be indexed. */
export const NOINDEX = "noindex, nofollow";

/**
 * Regular expression (for a `has: host` rule in next.config.ts) matching every
 * host that is NOT a production host, with or without a port.
 */
export const NON_PRODUCTION_HOST_PATTERN = `(?!(?:www\\.)?${PRODUCTION_HOST.replace(
  /\./g,
  "\\.",
)}(?::\\d+)?$).*`;

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, "");
}

/** The host of a request, lowercased and without a port ("" if unknown). */
export function requestHost(headers: Headers): string {
  const raw = headers.get("x-forwarded-host") ?? headers.get("host") ?? "";
  return normalizeHost(raw.split(",")[0]);
}

/** True if a host may be indexed by search engines. */
export function isProductionHost(host: string): boolean {
  return PRODUCTION_HOSTS.includes(normalizeHost(host));
}
