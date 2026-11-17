import type { Locale } from "@/i18n/routing";
import { COMPANY } from "./company";

/** Public site URL. Change the domain here (or via NEXT_PUBLIC_SITE_URL). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${COMPANY.domain}`
).replace(/\/$/, "");

/** Service ids used by the wizard and its ?tjanst= / ?service= preselect. */
export const SERVICE_IDS = ["hem", "flytt", "stor", "fonster"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/**
 * Value of the preselect parameter in links, per language. Neutral words, so
 * an English URL has no Swedish in it (?service=move). The wizard accepts
 * either language's words and the plain ids.
 */
export const SERVICE_SLUG = {
  sv: { hem: "hem", flytt: "flytt", stor: "stor", fonster: "fonster" },
  en: { hem: "home", flytt: "move", stor: "deep", fonster: "windows" },
} as const satisfies Record<Locale, Record<ServiceId, string>>;

/** Service id for a ?tjanst= / ?service= value in either language, or null. */
export function serviceFromSlug(value: string | null): ServiceId | null {
  if (!value) return null;
  for (const slugs of Object.values(SERVICE_SLUG)) {
    for (const [id, slug] of Object.entries(slugs)) {
      if (slug === value) return id as ServiceId;
    }
  }
  return (SERVICE_IDS as readonly string[]).includes(value)
    ? (value as ServiceId)
    : null;
}

/** Query parameter that preselects a service in the wizard, per language. */
export const SERVICE_QUERY_KEY = {
  sv: "tjanst",
  en: "service",
} as const satisfies Record<Locale, string>;

/** Link target for the wizard with a service preselected. */
export function bookHref(locale: Locale, service: ServiceId) {
  return {
    pathname: "/boka" as const,
    query: { [SERVICE_QUERY_KEY[locale]]: SERVICE_SLUG[locale][service] },
  };
}

/**
 * Reviews section and the Reco.se rating line on the home page. Off until
 * there are real reviews: set SHOW_REVIEWS=true when building. The texts stay
 * in the messages files (`home.reviews*`, `home.trustReviews`).
 */
export const SHOW_REVIEWS = process.env.SHOW_REVIEWS === "true";

/**
 * Hero photo slider autoplay. On by default (set HERO_AUTOPLAY=false when
 * building to turn it off): advances every 6 seconds (paused on hover, focus and touch, with
 * a pause button, and never when the visitor prefers reduced motion).
 */
export const HERO_AUTOPLAY = process.env.HERO_AUTOPLAY !== "false";
