/**
 * Open questions for the owner. Nothing here is rendered: the site text was
 * written without these statements, and each one can be added to the messages
 * files (`legal.*`, both languages) once answered. Delete an entry when done.
 *
 * `npm run build` fails (scripts/check-markers.mjs) if an owner placeholder
 * ever ends up in the messages or the source, so questions go here instead.
 */
export const OWNER_TODO = [
  // --- Privacy policy (legal.privacy) ---
  {
    where: "legal.privacy, Överföring utanför EU/EES",
    todo: "Confirm the data processing agreements with Vercel and Resend are accepted in each account panel and rely on standard contractual clauses. Then add that sentence back.",
  },
  {
    where: "legal.privacy, Hur länge vi sparar uppgifterna",
    todo: "How long are requests that do not lead to a job kept in the inbox (suggestion: 12 months)? Add it as a sentence.",
  },
  {
    where: "legal.privacy, Länkar och kakor",
    todo: "Update the 'no analytics' statement if analytics is ever added.",
  },
  // --- Terms (legal.terms) ---
  {
    where: "legal.terms, Om villkoren",
    todo: "Confirm the terms also apply to business customers (draft: the written quote wins if it differs).",
  },
  {
    where: "legal.terms, Avbokning",
    todo: "Free cancellation up to how many hours before the job, and the fee for late cancellation.",
  },
  {
    where: "legal.terms, Reklamation",
    todo: "Complaint period after the work, and how defects are remedied (e.g. a re-clean).",
  },
  {
    where: "legal.terms, Ansvar och försäkring",
    todo: "What the insurance at If covers, any excess, and whether a certificate can be given on request. The policy number is never published.",
  },
  {
    where: "legal.terms, Betalning",
    todo: "Payment terms (e.g. 10 or 14 days) and whether Bankgiro (see COMPANY.bankgiro) should be shown.",
  },
  {
    where: "legal.terms, Tvist",
    todo: "Confirm the company agrees to have private customer disputes reviewed by ARN.",
  },
  // --- FAQ and about (hidden until answered; the TODO text sits in messages) ---
  {
    where: "home.faq (sv + en)",
    todo: "Answers for supplies/equipment and cancellation. The whole FAQ section stays hidden until no answer starts with TODO.",
  },
  {
    where: "homeCleaning.faq and the other service pages (sv + en)",
    todo: "Answers for same cleaner, what to have at home, binding period, and the service-specific questions. Section hidden until all are filled.",
  },
  {
    where: "about.areas (sv + en)",
    todo: "The list of areas around Stockholm you serve. Hidden until filled.",
  },
] as const;
