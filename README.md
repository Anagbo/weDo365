# WeDo365 – wedo365ab.se

The website for WeDo 365 AB, a cleaning company in Stockholm. Swedish at `/`, English at `/en`. Customers send **requests** (never bookings) for home cleaning or a business quote; the site emails them to the owner and sends the customer a copy. Nothing is stored on the site.

Built with Next.js 16 (App Router), Tailwind CSS v4, next-intl, zod and Resend. Hosted on Vercel.

**Hard rules for the site:** no prices, no RUT and no personnummer anywhere, on the site or in the forms. Every customer action is a request. The company talks price and RUT through with each customer by phone or email after a request arrives.

**Contents:** [Quick start](#quick-start) · [Environment variables](#environment-variables) · [How the project is organised](#how-the-project-is-organised) · [Company details](#company-details) · [Editing text](#editing-text) · [Text to review by a native Swedish speaker](#text-to-review-by-a-native-swedish-speaker) · [Placeholders to fill in](#placeholders-to-fill-in) · [Deploying](#deploying-vercel-and-resend) · [Before launch](#before-launch) · [Tests](#tests) · [Good to know](#good-to-know)

---

## Quick start

You need Node.js 22.12 or newer in the 22 line, or Node.js 24 (recommended), and npm.

```bash
npm install
cp .env.example .env.local     # then fill it in, see below
npm run dev                    # http://localhost:3000
```

The site runs without the email settings, but the forms then show their error message (with the phone number), because nothing can be sent.

| Script                 | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Development server                                          |
| `npm run build`        | Production build (every page is built as static HTML)       |
| `npm start`            | Serves the production build                                 |
| `npm run lint`         | ESLint                                                      |
| `npm run typecheck`    | Generates route types, then `tsc --noEmit`                  |
| `npm test`             | Unit tests (Vitest). `npm run test:watch` re-runs on change |
| `npm run format`       | Prettier, with Tailwind class sorting                       |
| `npm run format:check` | Prettier check only                                         |

Before every commit, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` should all pass.

## Environment variables

Copy `.env.example` to `.env.local` for local work. On Vercel, set the same variables under _Project Settings → Environment Variables_.

| Variable               | Needed | What it is                                                                                                                                                                                                                       |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`       | yes    | API key from Resend ("sending access" is enough).                                                                                                                                                                                |
| `MAIL_FROM`            | yes    | Sender of both emails, e.g. `WeDo365 <noreply@send.wedo365ab.se>`. The domain must be verified in Resend.                                                                                                                        |
| `MAIL_TO_OWNER`        | yes    | The inbox where new requests arrive. Customers' replies to their confirmation also go here.                                                                                                                                      |
| `NEXT_PUBLIC_SITE_URL` | yes    | The public address, no trailing slash. Used for canonical links, the sitemap, robots.txt and structured data. **Read at build time**, so set it before deploying and redeploy if it changes. Defaults to `https://wedo365ab.se`. |

If any of the three email variables is missing, the API answers with an error and writes `[request] Email is not configured …` to the server log (never any form contents).

## How the project is organised

```
src/
  app/
    [locale]/            Every page. One folder per route, named with the internal
                         Swedish path (boka, offert, foretag …). layout.tsx is the root layout.
    api/request/         POST /api/request: validates, then sends the two emails
    global-not-found.tsx The 404 page
    sitemap.ts, robots.ts
  components/            layout (header, footer), sections (reusable page blocks),
                         forms (wizard, quote form), service-page, legal, ui
  config/                company.ts (company facts), site.ts (site URL, service ids),
                         service-pages.ts
  i18n/                  routing.ts: languages and the translated URLs
  lib/
    forms/               zod schemas shared by the browser and the server
    email/               email templates and the Resend call
    seo.ts               titles, canonical links, hreflang, Open Graph
  messages/              sv.json, en.json: ALL text on the site; index.ts fills in
                         the company details
docs/
  BUILD_PROMPT.md        the original brief
  messages/              the copy as approved in the prototype (reference only)
  prototype/             static HTML export of the approved design (visual reference)
```

**URLs** are defined once in `src/i18n/routing.ts`. For example `/hemstadning` in Swedish is `/en/home-cleaning` in English, and the language switch always goes to the same page in the other language.

**Adding another service page** (e.g. Flyttstädning): the steps are listed at the top of `src/config/service-pages.ts`. It reuses the same template as home cleaning, so it takes a new text block in both messages files plus a few lines of config.

## Company details

All company facts are in **`src/config/company.ts`**: name, domain, org.nr, VAT number, email, phone, postal address, insurer, number of employees and Bankgiro. Change a value there and it changes everywhere: the footer, the legal pages, the trust points, the structured data (JSON-LD) and the emails.

The messages files refer to these values with tokens, e.g. `"Org.nr {orgNr} · Godkänd för F-skatt"`. `src/messages/index.ts` fills them in when the text is loaded. The tokens are `{company}`, `{orgNr}`, `{vatId}`, `{email}`, `{phone}`, `{phoneHref}`, `{insurer}`, `{employees}` and `{postalAddress}`, and they can be used in any text in either language.

- **Postal address** is shown only in the footer and on the legal pages, labelled "Postadress" / "Postal address". It is not a visiting address.
- **VAT number** is used only in the structured data.
- **Bankgiro** is kept in the config but not shown anywhere, because the site has no text about payment yet.
- **Email domain:** the contact address is `info@wedo365.se`, while the website is `wedo365ab.se`. That is as given by the owner; confirm it is intended.

## Editing text

All text on the site is in `src/messages/sv.json` and `src/messages/en.json`.

- **Both files must keep the same keys.** `npm test` fails if one language is missing a key, has an empty text, or uses different `{placeholders}`.
- Lists such as the FAQ, the trust points and the privacy sections are arrays. You can add or remove items.
- Some lists are matched to form options **by position** (`quote.types`, `quote.freqs`, `book.services` …). Don't reorder or remove items in those; the tests check it.
- Text such as `{phone}` or `{name}` is filled in by the site. Keep it as it is.
- **The phone number, email and other company details** are not written in the messages files; change them in `src/config/company.ts` (see above).
- **The privacy policy and terms** are the `legal` section: a list of `{ title, text }` per page.
- **The owner email** is always Swedish. Its few extra labels ("Typ av förfrågan", "Mottagen" …) are in `src/lib/email/templates.ts`; everything else reuses the forms' own labels.
- **Photos:** every grey box with a "Foto: …" caption is a placeholder. See the comment at the top of `src/components/sections/PhotoPlaceholder.tsx` for how to put in a real photo with `next/image`. No stock photos.
- **Logo:** `src/components/Logo.tsx` is a placeholder (a green "W" and the wordmark). Replace it when the real logo exists.

After editing, run `npm test` and `npm run build`.

## Text to review by a native Swedish speaker

These strings were not in the approved copy and were added by the developer. Please check the Swedish (and English) wording.

| Key                    | Swedish                                                                  | English                                                                          | Where                                                |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ui.skipLink`          | Hoppa till innehållet                                                    | Skip to content                                                                  | Skip link, visible on keyboard focus                 |
| `ui.menu`              | Meny                                                                     | Menu                                                                             | Menu button in the header on mobile                  |
| `ui.breadcrumb`        | Brödsmulor                                                               | Breadcrumb                                                                       | Screen-reader name of the breadcrumb (service pages) |
| `ui.sending`           | Skickar …                                                                | Sending …                                                                        | Submit button while sending                          |
| `ui.choose`            | Välj …                                                                   | Choose …                                                                         | Empty first option of the quote form's selects       |
| `errors.required`      | Fyll i det här fältet.                                                   | Please fill in this field.                                                       | Inline form error                                    |
| `errors.choose`        | Välj ett alternativ.                                                     | Please choose an option.                                                         | Inline form error                                    |
| `errors.email`         | Ange en giltig e-postadress.                                             | Enter a valid email address.                                                     | Inline form error                                    |
| `errors.phone`         | Ange ett giltigt telefonnummer.                                          | Enter a valid phone number.                                                      | Inline form error                                    |
| `errors.range`         | Ange ett heltal mellan {min} och {max}.                                  | Enter a whole number between {min} and {max}.                                    | Inline form error                                    |
| `errors.zip`           | Ange fem siffror, t.ex. 123 45.                                          | Enter five digits, e.g. 123 45.                                                  | Inline form error                                    |
| `errors.date`          | Ange ett giltigt datum.                                                  | Enter a valid date.                                                              | Inline form error                                    |
| `errors.datePast`      | Välj dagens datum eller ett senare.                                      | Choose today or a later date.                                                    | Inline form error                                    |
| `errors.tooLong`       | Texten är för lång.                                                      | The text is too long.                                                            | Inline form error                                    |
| `errors.submitFailed`  | Det gick inte att skicka just nu. Försök igen eller ring oss på {phone}. | We could not send your request just now. Please try again or call us on {phone}. | Form alert when sending fails                        |
| `email.subject`        | Vi har fått din förfrågan – WeDo365                                      | We have received your request – WeDo365                                          | Customer email: subject                              |
| `email.greeting`       | Hej {name}!                                                              | Hi {name},                                                                       | Customer email: greeting                             |
| `email.summaryTitle`   | Det här skickade du                                                      | What you sent us                                                                 | Customer email: heading above the summary            |
| `email.signoff`        | Vänliga hälsningar,                                                      | Kind regards,                                                                    | Customer email: sign-off                             |
| `email.why`            | Du får det här mejlet eftersom du skickade en förfrågan på {site}.       | You are receiving this email because you sent a request on {site}.               | Customer email: why you got this email               |
| `notFound.h1`          | Sidan hittades inte                                                      | Page not found                                                                   | 404 page: heading                                    |
| `notFound.text`        | Länken kan vara felaktig, eller så har sidan flyttats.                   | The link may be wrong, or the page may have moved.                               | 404 page: explanation                                |
| `notFound.home`        | Till startsidan                                                          | Back to home page                                                                | 404 page: button to the start page                   |
| `footer.postalAddress` | Postadress                                                               | Postal address                                                                   | Label above the postal address (footer, legal pages) |
| `legal.company`        | {company}, org.nr {orgNr}                                                | {company}, org. no. {orgNr}                                                      | Contact block on the legal pages                     |
| `footer.about` (end)   | · {employees} anställda.                                                 | · {employees} employees.                                                         | Footer "Om oss" line; added to the approved text     |

**Privacy policy and terms (`legal.*`): must be reviewed before launch.** All of this text was written by the developer. The first five privacy sections (what we receive, why, what is stored, Vercel as host, Resend as email service) describe how the site works today and should be checked for accuracy. They name Vercel and Resend as data processors and say that Vercel keeps standard hosting logs. The data controller section names the company, org.nr, postal address and email (from `src/config/company.ts`). Retention and rights are `[TEXT FRÅN WEDO365]` placeholders, and so is most of the terms. The policy does not yet cover the delivery log Resend keeps of sent emails, or cookies (the site sets none). **Have a lawyer review both pages (`/integritetspolicy` and `/villkor`) before launch.**

### Taken from the prototype

This text was in the approved prototype (`docs/prototype/`) but missing from the messages files, so it was copied over as is:

| Key                              | Swedish                              | English                            | Where                                    |
| -------------------------------- | ------------------------------------ | ---------------------------------- | ---------------------------------------- |
| `home.businessPhotoAlt`          | Foto: städning av kontor (egen bild) | Photo: office cleaning (own photo) | Photo caption, business band             |
| `homeCleaning.breadcrumbCurrent` | Hemstädning                          | Home cleaning                      | Last breadcrumb item, home-cleaning page |

## Placeholders to fill in

Text in square brackets is a placeholder for the owner. The brackets are kept exactly as written until the real text is in. This is the complete list (find them with a text search for `[`):

| Placeholder (Swedish / English)                                                                                                     | Where it shows                      | What goes there                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| `[BETYG]` / `[RATING]`, `[ANTAL]` / `[COUNT]`                                                                                       | Home trust list, reviews heading    | Reco.se rating and number of reviews                      |
| `[Kundomdöme hämtat från Reco eller Google]`, `[Förnamn]`, `[Område]` (and English)                                                 | Three review cards on the home page | Real reviews, with permission                             |
| `[Svar från WeDo365, t.ex. hur nyckelhantering fungerar]`, `[Checklista för flyttstädning …]`, `[Avbokningsregler …]` (and English) | Home page FAQ                       | The answers                                               |
| `[Svar från WeDo365]`, `[Svar från WeDo365, t.ex. om ni tar med städmaterial]` (and English)                                        | Home-cleaning page FAQ              | The answers                                               |
| `[TEXT FRÅN WEDO365]`                                                                                                               | Privacy policy and terms            | Retention and rights; all terms                           |
| `[OG-BILD]`                                                                                                                         | A comment in `src/lib/seo.ts`       | A share image (1200×630) for links shared on social media |

**Claims in the approved copy to confirm are true before launch:** "Godkänd för F-skatt" (see the checklist), the liability insurance with If, the Reco.se rating, "365 dagar om året", and that WeDo365 can offer the services on the site (including the checklist under "Det här ingår").

## Deploying (Vercel and Resend)

All accounts (GitHub, Vercel, Resend, the domain registrar) should belong to WeDo 365 AB, with the developer added as a member.

1. **GitHub.** Push this repository to a repository owned by the company.
2. **Vercel.** Import the repository. **Use a Pro plan:** the free Hobby plan is for non-commercial use only. The framework (Next.js) and build settings are detected automatically. `vercel.json` pins the server function (`/api/request`) to Stockholm (`arn1`); every page is static and is served from Vercel's network.
3. **Environment variables.** Add the four variables above, for Production (and Preview if you want preview deployments to send email). Set `NEXT_PUBLIC_SITE_URL` to the final public address.
4. **Domain.** Add `wedo365ab.se` in Vercel and set the DNS records it shows. Choose whether the main address is `wedo365ab.se` or `www.wedo365ab.se`, make the other one redirect to it (in Vercel's domain settings), and use the main one in `NEXT_PUBLIC_SITE_URL`.
5. **Resend.** Add the sending domain as a **subdomain**, `send.wedo365ab.se`, and choose the **EU region** when adding it. Add the DNS records Resend lists (SPF, DKIM) **without touching the MX records of the main domain**, so normal email keeps working. Wait until Resend shows the domain as verified, then create an API key and set `MAIL_FROM`.
6. **First test in production.** Send one request through each form (`/boka` and `/offert`, and the English versions). Check that the owner inbox gets the email in Swedish, that the customer copy arrives (also look in spam), and that replying to each email goes to the other party.
7. **Google Search Console.** Add the property and submit `https://wedo365ab.se/sitemap.xml`. (Vercel marks preview deployments as `noindex` by default.)

## Before launch

- [ ] **Fill in every placeholder** (see the list above), and confirm the claims in the copy are true
- [ ] **Owner to confirm F-skatt status (check at skatteverket.se).** "Godkänd för F-skatt" / "Approved for F-tax" is on the site (footer, home and business trust lists) but has not been verified.
- [ ] **Kollektivavtal (collective agreement): owner to confirm.** The "[Kollektivavtal: bekräftas]" line was taken off the business page. If there is one, add a trust point for it in `business.trust` (both files).
- [ ] **Native Swedish proofread** of all Swedish text, including the strings in the review table
- [ ] **Lawyer review of the privacy policy and terms** (`/integritetspolicy`, `/villkor`), with the policy updated for anything missing (see the note above)
- [ ] **Real Resend key test** on the live site: send one request through each form, in both languages. Both emails must arrive (also check spam). The owner email must have the customer as Reply-To, and the customer copy must have the owner as Reply-To.
- [ ] **Vercel Pro** on the WeDo 365 AB account (the free Hobby plan is for non-commercial use only)
- [ ] **Domain records added without touching MX:** the site records for `wedo365ab.se` in Vercel, and the SPF/DKIM records for `send.wedo365ab.se` in Resend. Normal email on the main domain must keep working.
- [ ] **Lighthouse check on mobile** for the live home page. The target is 95 or more for Performance, Accessibility, Best Practices and SEO. (Not measured yet; it needs the live site.)
- [ ] Real photos instead of the grey boxes, the real logo, and a share image (`[OG-BILD]`)

## Tests

`npm test` runs the unit tests (a few seconds):

- **Form schemas** (valid and invalid home and business requests, date rules in Stockholm time, the spam guard)
- **Email builders** (the owner email has every field and is in Swedish; the customer email is in the customer's language; HTML in input is escaped; no price, RUT or personnummer words)
- **Sending** with the Resend SDK replaced by a stand-in (recipients, reply-to, what happens when each email fails, no form contents in the log)
- **The messages files** (same keys in both languages, no empty text, lists that line up with the form options)
- **Company details** (`src/config/company.ts`: every token in the messages is filled in, the old placeholders are gone, the structured data has the legal ids and postal address)

The pages and forms themselves are not covered by automated browser tests. During development they were checked by hand and with scripts in a real browser at 375 px and 1440 px wide, in both languages.

## Good to know

- **This is a recent Next.js with breaking changes.** `AGENTS.md` tells coding agents to read `node_modules/next/dist/docs/` first; do the same before changing framework-level things.
- **Every page is static**, and the build fails if one stops being static (`ensureStatic` in `src/app/[locale]/layout.tsx`). Cache Components are on. Because of that, `/api/request` must not export a `runtime` setting (it already runs on Node.js).
- **No language detection and no cookies.** `/` is always Swedish, `/en` is English, and the language switch is a plain link.
- **The 404 page is bilingual** (one page showing both languages). **Uses Next's experimental global-not-found. Re-check after every Next.js upgrade.** A `notFound()` from a page would give only a client-rendered shell under Cache Components, and a static page can't know the visitor's language. A rewrite in `next.config.ts` sends unknown URLs containing a dot (like `/index.html`) to the same page.
- **Spam protection** is a hidden honeypot field plus a minimum fill time of 3 seconds. There is no rate limiting. If spam gets through after launch, add rules in Vercel's firewall; no code change is needed.
- **The thank-you page** always says a copy was sent to the customer. If only that copy fails (the owner email went through), the request still counts as received.
- **The org.nr is deliberately not collected** in the quote form. The owner asks for it when writing the contract.
