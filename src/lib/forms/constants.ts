/**
 * Ids used in form payloads. The labels live in the messages files, in the
 * same order (e.g. book.freqs, quote.types), so emails can be written in
 * either language from the same payload.
 */

/** book.freqs[].id */
export const FREQUENCY_IDS = ["w1", "w2", "w4", "once"] as const;
export type FrequencyId = (typeof FREQUENCY_IDS)[number];

/** book.slots[].id */
export const SLOT_IDS = ["am", "pm"] as const;
export type SlotId = (typeof SLOT_IDS)[number];

/** Same order as quote.types in the messages files. */
export const PREMISES_IDS = [
  "office",
  "stairwell",
  "gym",
  "school",
  "kitchen",
  "other",
] as const;
export type PremisesId = (typeof PREMISES_IDS)[number];

/** Same order as quote.freqs in the messages files. */
export const QUOTE_FREQUENCY_IDS = [
  "daily",
  "severalWeekly",
  "weekly",
  "biweekly",
  "once",
] as const;
export type QuoteFrequencyId = (typeof QUOTE_FREQUENCY_IDS)[number];

/** Allowed ranges for number fields (also shown in error messages). */
export const LIMITS = {
  size: { min: 10, max: 500 },
  windows: { min: 1, max: 100 },
  area: { min: 1, max: 100_000 },
} as const;

/** Max lengths for free text. */
export const MAX = {
  name: 100,
  company: 120,
  street: 120,
  city: 60,
  email: 254,
  notes: 1000,
  message: 2000,
} as const;
