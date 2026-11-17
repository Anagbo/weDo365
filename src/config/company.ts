/**
 * Company facts, kept in one place. Change a value here and it changes on
 * every page, in the structured data and in the emails.
 *
 * The messages files refer to these values with tokens such as {orgNr} or
 * {insurer}; `withCompany` (src/messages/index.ts) fills them in when the
 * messages are loaded. See COMPANY_TOKENS below for the full list.
 */
export const COMPANY = {
  /** Legal name. */
  name: "WeDo 365 AB",
  /** Main domain of the website (the default for NEXT_PUBLIC_SITE_URL). */
  domain: "wedo365ab.se",
  orgNr: "559564-8022",
  /** Momsregistreringsnummer. */
  vatId: "SE559564802201",
  email: "info@wedo365.se",
  phone: {
    /** As shown on the site. */
    display: "076-178 09 02",
    /** International format, for tel: links and structured data. */
    e164: "+46761780902",
  },
  /** Postal address only; not a visiting address. */
  postalAddress: {
    careOf: "c/o Aikins Owusu",
    street: "Storevretsvägen 19, LGH 1302",
    postalCode: "147 54",
    locality: "Tumba",
    country: "SE",
  },
  /** Liability insurer, as named on the site. */
  insurer: "If",
  /** Number of employees, as shown on the site ("30–50 anställda"). */
  employees: "30–50",
  /** Not shown on the site yet: the copy has no payment text. */
  bankgiro: "5253-4021",
} as const;

/** The postal address as lines: name, c/o, street, postcode and town. */
export const POSTAL_ADDRESS_LINES = [
  COMPANY.name,
  COMPANY.postalAddress.careOf,
  COMPANY.postalAddress.street,
  `${COMPANY.postalAddress.postalCode} ${COMPANY.postalAddress.locality}`,
] as const;

/** Tokens available in the messages files, e.g. "Org.nr {orgNr}". */
export const COMPANY_TOKENS = {
  company: COMPANY.name,
  orgNr: COMPANY.orgNr,
  vatId: COMPANY.vatId,
  email: COMPANY.email,
  phone: COMPANY.phone.display,
  phoneHref: `tel:${COMPANY.phone.e164}`,
  insurer: COMPANY.insurer,
  employees: COMPANY.employees,
  postalAddress: POSTAL_ADDRESS_LINES.join(", "),
} as const satisfies Record<string, string>;

/** Structured data (schema.org) describing the company. */
export function companyJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.name,
    legalName: COMPANY.name,
    vatID: COMPANY.vatId,
    taxID: COMPANY.orgNr,
    telephone: COMPANY.phone.e164,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${COMPANY.postalAddress.careOf}, ${COMPANY.postalAddress.street}`,
      postalCode: COMPANY.postalAddress.postalCode,
      addressLocality: COMPANY.postalAddress.locality,
      addressCountry: COMPANY.postalAddress.country,
    },
    areaServed: "Stockholm",
    url: siteUrl,
  };
}
