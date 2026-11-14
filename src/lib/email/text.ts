import sv from "@/messages/sv.json";
import en from "@/messages/en.json";
import type { Locale } from "@/i18n/routing";

/** The messages files, for building emails outside React. */
export const MESSAGES = { sv, en } as const satisfies Record<Locale, unknown>;
export type Messages = (typeof MESSAGES)["sv"];

/** Escapes text for use in HTML (element content and attribute values). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Fills {placeholders} in a message. */
export function fill(message: string, values: Record<string, string>): string {
  return message.replace(/\{(\w+)\}/g, (all, key: string) =>
    key in values ? values[key] : all,
  );
}

/** Removes line breaks, e.g. before putting user input in a subject line. */
export function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}
