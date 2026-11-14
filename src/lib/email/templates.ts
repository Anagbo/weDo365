import type { Locale } from "@/i18n/routing";
import type { RequestPayload } from "@/lib/forms/schemas";
import {
  businessRows,
  homeRows,
  premisesName,
  serviceName,
  type Row,
} from "./rows";
import { escapeHtml, fill, MESSAGES, oneLine } from "./text";

export type Email = { subject: string; html: string; text: string };

// Brand colours (same values as the theme tokens in globals.css).
const C = {
  ink: "#1E2A24",
  muted: "#4F5D55",
  ground: "#FAFAF7",
  line: "#DDE2D8",
  green: "#2F5D4A",
};
const FONT = "Inter, Arial, Helvetica, sans-serif";

/** Owner-only labels. The owner email is always in Swedish. */
const OWNER = {
  heading: "Ny förfrågan från webbplatsen",
  kind: "Typ av förfrågan",
  kindHome: "Hem",
  kindBusiness: "Företag (offert)",
  subjectBusiness: "Företag",
  language: "Språk på webbplatsen",
  languages: { sv: "Svenska", en: "Engelska" } as Record<Locale, string>,
  received: "Mottagen",
  replyHint: "Svara på det här mejlet för att svara kunden direkt.",
};

/** "14 november 2026 kl. 21:05" in Stockholm time. */
export function formatReceived(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

/* ---------- Building blocks ---------- */

function layout(lang: Locale, title: string, body: string): string {
  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ground};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ground};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid ${C.line};border-radius:16px;">
<tr><td style="padding:28px;font-family:${FONT};font-size:16px;line-height:1.55;color:${C.ink};">
<p style="margin:0 0 20px;font-weight:800;font-size:18px;color:${C.green};">WeDo365</p>
${body}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.ink};">${escapeHtml(text)}</h1>`;

const p = (text: string, style = "") =>
  `<p style="margin:0 0 16px;${style}">${escapeHtml(text)}</p>`;

function table(rows: Row[]): string {
  const trs = rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${C.line};color:${C.muted};vertical-align:top;width:40%;">${escapeHtml(r.label)}</td>` +
        `<td style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:600;vertical-align:top;white-space:pre-wrap;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;font-size:15px;">\n${trs}\n</table>`;
}

const textTable = (rows: Row[]) =>
  rows
    .map((r) => `${r.label}${r.label.endsWith("?") ? "" : ":"} ${r.value}`)
    .join("\n");

/* ---------- Owner email (always Swedish) ---------- */

export function buildOwnerEmail(req: RequestPayload, receivedAt: Date): Email {
  const isHome = req.kind === "home";
  const what = isHome
    ? serviceName(req, "sv")
    : `${OWNER.subjectBusiness} (${premisesName(req, "sv")})`;
  const who = isHome ? req.name : req.company;
  const subject = oneLine(`Ny förfrågan: ${what} – ${who}`);

  const rows: Row[] = [
    { label: OWNER.kind, value: isHome ? OWNER.kindHome : OWNER.kindBusiness },
    ...(isHome ? homeRows(req, "sv", true) : businessRows(req, "sv", true)),
    { label: OWNER.language, value: OWNER.languages[req.locale] },
    { label: OWNER.received, value: formatReceived(receivedAt) },
  ];

  const html = layout(
    "sv",
    subject,
    h1(OWNER.heading) +
      table(rows) +
      p(OWNER.replyHint, `color:${C.muted};font-size:14px;margin:0;`),
  );
  const text = [OWNER.heading, "", textTable(rows), "", OWNER.replyHint].join(
    "\n",
  );
  return { subject, html, text };
}

/* ---------- Customer email (their language) ---------- */

export function buildCustomerEmail(
  req: RequestPayload,
  siteHost: string,
): Email {
  const m = MESSAGES[req.locale];
  const isHome = req.kind === "home";
  const name = isHome ? req.name : req.contactName;
  const rows = isHome
    ? homeRows(req, req.locale)
    : businessRows(req, req.locale);

  // "We will contact you by phone or email with price and time."
  const contact = isHome ? m.book.summaryNote : m.quote.side[1];
  const subject = m.email.subject;
  const greeting = fill(m.email.greeting, { name: oneLine(name) });
  const why = fill(m.email.why, { site: siteHost });
  const phone = m.meta.phone;
  const phoneHref = m.meta.phoneHref;

  const html = layout(
    req.locale,
    subject,
    h1(m.thanks.h1) +
      p(greeting) +
      p(contact) +
      `<h2 style="margin:24px 0 8px;font-size:17px;color:${C.ink};">${escapeHtml(m.email.summaryTitle)}</h2>` +
      table(rows) +
      `<p style="margin:0 0 16px;">${escapeHtml(m.thanks.questions)} <a href="${escapeHtml(phoneHref)}" style="color:${C.green};font-weight:600;">${escapeHtml(phone)}</a></p>` +
      `<p style="margin:0 0 24px;">${escapeHtml(m.email.signoff)}<br>WeDo365</p>` +
      p(why, `color:${C.muted};font-size:13px;margin:0;`),
  );

  const text = [
    m.thanks.h1,
    "",
    greeting,
    "",
    contact,
    "",
    `${m.email.summaryTitle}:`,
    textTable(rows),
    "",
    `${m.thanks.questions} ${phone}`,
    "",
    m.email.signoff,
    "WeDo365",
    "",
    why,
  ].join("\n");

  return { subject, html, text };
}
