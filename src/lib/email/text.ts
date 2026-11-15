import { MESSAGES } from "@/messages";

/** The messages files (company details filled in), for emails outside React. */
export { MESSAGES };
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
