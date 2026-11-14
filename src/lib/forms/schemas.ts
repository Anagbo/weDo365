import { z } from "zod";
import { SERVICE_IDS } from "@/config/site";
import { routing } from "@/i18n/routing";
import {
  FREQUENCY_IDS,
  LIMITS,
  MAX,
  PREMISES_IDS,
  QUOTE_FREQUENCY_IDS,
  SLOT_IDS,
} from "./constants";
import { todayInStockholm } from "./date";

/*
 * Shared by the forms (client) and /api/request (server).
 * Error messages are keys in the `errors` namespace of the messages files.
 * Form state holds strings; numbers are converted here.
 */

export type ErrorKey =
  | "required"
  | "choose"
  | "email"
  | "phone"
  | "range"
  | "zip"
  | "date"
  | "datePast"
  | "tooLong";

const err = (key: ErrorKey) => ({ error: key });

/** Single-line text: line breaks and repeated spaces become one space. */
const text = (max: number) =>
  z
    .string(err("required"))
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(1, err("required")).max(max, err("tooLong")));

const optionalText = (max: number) =>
  z.string().trim().max(max, err("tooLong")).optional().default("");

/** Whole number in a range; "" and missing count as not filled in. */
const intInRange = ({ min, max }: { min: number; max: number }) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z
      .number(err("required"))
      .int(err("range"))
      .min(min, err("range"))
      .max(max, err("range")),
  );

const email = z
  .string(err("required"))
  .trim()
  .min(1, err("required"))
  .max(MAX.email, err("email"))
  .pipe(z.email(err("email")));

/** Swedish or international number: 7–15 digits, spaces/dashes allowed. */
const phone = z
  .string(err("required"))
  .trim()
  .min(1, err("required"))
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .pipe(z.string().regex(/^\+?\d{7,15}$/, err("phone")));

/** Five digits, an optional space after the third: "12345" or "123 45". */
const zip = z
  .string(err("required"))
  .trim()
  .min(1, err("required"))
  .regex(/^\d{3}\s?\d{2}$/, err("zip"));

/** YYYY-MM-DD, today or later (Stockholm time). */
const preferredDate = z
  .string(err("required"))
  .min(1, err("required"))
  .regex(/^\d{4}-\d{2}-\d{2}$/, err("date"))
  .refine((d) => d >= todayInStockholm(), err("datePast"));

const locale = z.enum(routing.locales);

/* ---------- Home request (wizard), one schema per step ---------- */

export const homeServiceStep = z.object({
  service: z.enum(SERVICE_IDS, err("choose")),
});

const size = intInRange(LIMITS.size);

export const homeDetailsStep = z.discriminatedUnion("service", [
  z.object({
    service: z.literal("hem"),
    size,
    frequency: z.enum(FREQUENCY_IDS, err("choose")),
  }),
  z.object({ service: z.literal("flytt"), size }),
  z.object({ service: z.literal("stor"), size }),
  z.object({
    service: z.literal("fonster"),
    windows: intInRange(LIMITS.windows),
  }),
]);

export const homeTimePlaceStep = z.object({
  date: preferredDate,
  slot: z.enum(SLOT_IDS, err("choose")),
  street: text(MAX.street),
  zip,
  city: text(MAX.city),
  notes: optionalText(MAX.notes),
});

export const homeContactStep = z.object({
  name: text(MAX.name),
  email,
  phone,
});

export const homeRequestSchema = z
  .object({ kind: z.literal("home"), locale })
  .and(homeDetailsStep)
  .and(homeTimePlaceStep)
  .and(homeContactStep);

export type HomeRequest = z.infer<typeof homeRequestSchema>;

/* ---------- Business request (quote form) ---------- */

export const businessFields = z.object({
  premises: z.enum(PREMISES_IDS, err("choose")),
  area: intInRange(LIMITS.area),
  frequency: z.enum(QUOTE_FREQUENCY_IDS, err("choose")),
  company: text(MAX.company),
  contactName: text(MAX.name),
  email,
  phone,
  message: optionalText(MAX.message),
});

export const businessRequestSchema = z
  .object({ kind: z.literal("business"), locale })
  .and(businessFields);

export type BusinessRequest = z.infer<typeof businessRequestSchema>;

/* ---------- Either, as posted to /api/request ---------- */

export const requestSchema = z.union([
  homeRequestSchema,
  businessRequestSchema,
]);

export type RequestPayload = z.infer<typeof requestSchema>;

/* ---------- Spam protection (sent alongside the form fields) ---------- */

/** Reject requests sent faster than this after the form appeared. */
export const MIN_FILL_MS = 3000;

/** Name of the hidden honeypot field. People leave it empty; bots fill it. */
export const HONEYPOT_FIELD = "website";

export const spamGuardSchema = z.object({
  [HONEYPOT_FIELD]: z.string().max(500).optional().default(""),
  /** Milliseconds between the form appearing and the request being sent. */
  fillMs: z.number().int().nonnegative(),
});

export type SpamGuard = z.infer<typeof spamGuardSchema>;

/** True if the request looks automated. */
export function looksLikeSpam(guard: z.infer<typeof spamGuardSchema>) {
  return guard[HONEYPOT_FIELD] !== "" || guard.fillMs < MIN_FILL_MS;
}

/** Field name → first error key, for showing inline errors. */
export function fieldErrors(error: z.ZodError): Record<string, ErrorKey> {
  const out: Record<string, ErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in out)) out[field] = issue.message as ErrorKey;
  }
  return out;
}
