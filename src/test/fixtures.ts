import { requestSchema, type RequestPayload } from "@/lib/forms/schemas";

/** "Now" for tests: Saturday 14 Nov 2026, 11:00 in Stockholm. */
export const NOW = new Date("2026-11-14T10:00:00Z");

/** A valid home request exactly as the wizard holds it (everything a string). */
export const rawHome = {
  kind: "home",
  locale: "sv",
  service: "hem",
  size: "72",
  frequency: "biweekly",
  date: "2026-12-04", // a Friday
  slot: "am",
  street: "Storgatan 1",
  zip: "123 45",
  city: "Solna",
  notes: "Portkod 1234",
  name: "Anna Andersson",
  email: "anna@example.se",
  phone: "070-123 45 67",
} as const;

/** A valid business request exactly as the quote form holds it. */
export const rawBusiness = {
  kind: "business",
  locale: "sv",
  premises: "gym",
  area: "400",
  frequency: "weekly",
  company: "Gym & Co AB",
  contactName: "Bo Ek",
  email: "bo@example.se",
  phone: "+46 76 178 09 02",
  message: "Vi vill ha städning varje vecka.",
} as const;

/** Parses raw form data the way the API does (throws if it is not valid). */
export function parseRequest(raw: Record<string, unknown>): RequestPayload {
  return requestSchema.parse(raw);
}
