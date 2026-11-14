import type { Locale } from "@/i18n/routing";
import { PREMISES_IDS, QUOTE_FREQUENCY_IDS } from "@/lib/forms/constants";
import type { BusinessRequest, HomeRequest } from "@/lib/forms/schemas";
import { MESSAGES } from "./text";

/** One line in an email's summary table. */
export type Row = { label: string; value: string };

/** "fredag 20 november 2026" / "Friday 20 November 2026". */
export function formatDateLong(isoDate: string, locale: Locale): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Name of the home service, e.g. "Fönsterputs". */
export function serviceName(req: HomeRequest, locale: Locale): string {
  const book = MESSAGES[locale].book;
  return book.services.find((s) => s.id === req.service)?.name ?? req.service;
}

/** Label of the premises type, e.g. "Kontor". */
export function premisesName(req: BusinessRequest, locale: Locale): string {
  return MESSAGES[locale].quote.types[PREMISES_IDS.indexOf(req.premises)];
}

/**
 * Every field of a home request as label/value rows, using the wizard's own
 * labels in the given language. `includeEmpty` keeps optional empty fields
 * (shown as "–") so the owner always sees the full form.
 */
export function homeRows(
  req: HomeRequest,
  locale: Locale,
  includeEmpty = false,
): Row[] {
  const book = MESSAGES[locale].book;
  const slot = book.slots.find((s) => s.id === req.slot);
  const rows: Row[] = [
    { label: book.summaryService, value: serviceName(req, locale) },
  ];

  if (req.service === "fonster") {
    rows.push({
      label: book.windowsLabel,
      value: `${req.windows} ${book.unitPcs}`,
    });
  } else {
    rows.push({ label: book.sizeLabel, value: `${req.size} ${book.unitM2}` });
  }
  if (req.service === "hem") {
    const freq = book.freqs.find((f) => f.id === req.frequency);
    rows.push({ label: book.freqLabel, value: freq?.label ?? req.frequency });
  }

  rows.push(
    { label: book.dateLabel, value: formatDateLong(req.date, locale) },
    {
      label: book.slotLabel,
      value: slot ? `${slot.label} ${slot.time}` : req.slot,
    },
    { label: book.streetLabel, value: req.street },
    { label: book.zipLabel, value: req.zip },
    { label: book.cityLabel, value: req.city },
  );
  if (req.notes || includeEmpty) {
    rows.push({ label: book.notesLabel, value: req.notes || "–" });
  }
  rows.push(
    { label: book.nameLabel, value: req.name },
    { label: book.emailLabel, value: req.email },
    { label: book.phoneLabel, value: req.phone },
  );
  return rows;
}

/** Every field of a business request, with the quote form's labels. */
export function businessRows(
  req: BusinessRequest,
  locale: Locale,
  includeEmpty = false,
): Row[] {
  const quote = MESSAGES[locale].quote;
  const rows: Row[] = [
    { label: quote.typeLabel, value: premisesName(req, locale) },
    { label: quote.sizeLabel, value: String(req.area) },
    {
      label: quote.freqLabel,
      value: quote.freqs[QUOTE_FREQUENCY_IDS.indexOf(req.frequency)],
    },
    { label: quote.companyLabel, value: req.company },
    { label: quote.personLabel, value: req.contactName },
    { label: quote.emailLabel, value: req.email },
    { label: quote.phoneLabel, value: req.phone },
  ];
  if (req.message || includeEmpty) {
    rows.push({ label: quote.messageLabel, value: req.message || "–" });
  }
  return rows;
}
