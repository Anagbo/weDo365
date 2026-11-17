/**
 * Text still to come from the owner starts with "TODO" in the messages files.
 * Anything that contains such text is left out of the page (not rendered),
 * so a visitor never sees a note meant for the owner.
 */
export const isTodo = (text: string) => /^TODO\b/.test(text.trim());

/** True if any string inside `value` (nested objects and lists included) is a TODO. */
export function hasTodo(value: unknown): boolean {
  if (typeof value === "string") return isTodo(value);
  if (Array.isArray(value)) return value.some(hasTodo);
  if (value && typeof value === "object")
    return Object.values(value).some(hasTodo);
  return false;
}
