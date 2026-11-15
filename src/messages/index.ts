import { COMPANY_TOKENS } from "@/config/company";
import type { Locale } from "@/i18n/routing";
import sv from "./sv.json";
import en from "./en.json";

const TOKEN = new RegExp(
  `\\{(${Object.keys(COMPANY_TOKENS).join("|")})\\}`,
  "g",
);

/** Fills the company tokens ({orgNr}, {insurer} …) in every text. */
export function withCompany<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(
      TOKEN,
      (_, key: keyof typeof COMPANY_TOKENS) => COMPANY_TOKENS[key],
    ) as T;
  }
  if (Array.isArray(value)) return value.map(withCompany) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withCompany(item)]),
    ) as T;
  }
  return value;
}

/**
 * The messages of each language with the company details filled in. Pages
 * and emails read the messages through this, so a token like {orgNr} never
 * reaches the screen.
 */
export const MESSAGES = {
  sv: withCompany(sv),
  en: withCompany(en),
} as const satisfies Record<Locale, unknown>;
