import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

// The locale comes from the [locale] root segment via next/root-params, so
// next-intl never needs to read request headers and pages stay static.
export default getRequestConfig(async () => {
  const param = await rootLocale();
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "Europe/Stockholm",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
