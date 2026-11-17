import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { MESSAGES } from "@/messages";
import { routing } from "./routing";

// The locale comes from the [locale] root segment via next/root-params, so
// next-intl never needs to read request headers and pages stay static. The
// 404 page has no such segment; it calls setRequestLocale() itself, and that
// value is used instead.
export default getRequestConfig(async ({ requestLocale }) => {
  let param: string | undefined;
  try {
    param = await rootLocale();
  } catch {
    // No [locale] segment (the 404 page).
  }
  if (!hasLocale(routing.locales, param)) param = await requestLocale;
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "Europe/Stockholm",
    // Company details ({orgNr}, {insurer} …) come from src/config/company.ts.
    messages: MESSAGES[locale],
  };
});
