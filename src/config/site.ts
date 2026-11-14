import type { Locale } from "@/i18n/routing";

/** Public site URL. Change the domain here (or via NEXT_PUBLIC_SITE_URL). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wedo365ab.se"
).replace(/\/$/, "");

/** Service ids used by the wizard and its ?tjanst= / ?service= preselect. */
export const SERVICE_IDS = ["hem", "flytt", "stor", "fonster"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/** Query parameter that preselects a service in the wizard, per language. */
export const SERVICE_QUERY_KEY = {
  sv: "tjanst",
  en: "service",
} as const satisfies Record<Locale, string>;

/** Link target for the wizard with a service preselected. */
export function bookHref(locale: Locale, service: ServiceId) {
  return {
    pathname: "/boka" as const,
    query: { [SERVICE_QUERY_KEY[locale]]: service },
  };
}
