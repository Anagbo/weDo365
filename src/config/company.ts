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
  /** Registrable domain of the website (the default site URL is www. + this). */
  domain: "wedo365.se",
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
  /** Liability insurer, as named on the site. */
  insurer: "If",
  /** Number of employees, as shown on the site ("30–50 anställda"). */
  employees: "30–50",
  /** Not shown on the site yet: the copy has no payment text. */
  bankgiro: "5253-4021",
} as const;

/**
 * Social media pages. A link is shown (footer) and listed in the structured
 * data only while its value is not empty. Plain links only: nothing is embedded.
 */
export const INSTAGRAM_URL: string = "https://www.instagram.com/wedo365ab/";
export const FACEBOOK_URL: string =
  "https://www.facebook.com/profile.php?id=61595583265899";

/** The social pages that are set, in the order they are shown. */
export function socialLinks() {
  return [
    { id: "instagram", url: INSTAGRAM_URL },
    { id: "facebook", url: FACEBOOK_URL },
  ].filter((link) => link.url.trim() !== "") as {
    id: "instagram" | "facebook";
    url: string;
  }[];
}

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
} as const satisfies Record<string, string>;

/** Structured data (schema.org) describing the company. */
export function companyJsonLd(siteUrl: string) {
  const sameAs = socialLinks().map((link) => link.url);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.name,
    legalName: COMPANY.name,
    vatID: COMPANY.vatId,
    taxID: COMPANY.orgNr,
    telephone: COMPANY.phone.e164,
    email: COMPANY.email,
    areaServed: "Stockholm",
    url: siteUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
