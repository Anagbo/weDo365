# WeDo365 – wedo365.se

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

| Variable               | Needed | What it is                                                                                                                                                                                                                     |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`       | yes    | API key from Resend ("sending access" is enough).                                                                                                                                                                              |
| `MAIL_FROM`            | yes    | Sender of both emails, e.g. `WeDo365 <noreply@send.wedo365.se>`. The domain must be verified in Resend.                                                                                                                        |
| `MAIL_TO_OWNER`        | yes    | The inbox where new requests arrive (`info@wedo365.se`, a Loopia mailbox). The owner email has the customer as Reply-To.                                                                                                       |
| `MAIL_REPLY_TO`        | no     | Reply-To of the customer's confirmation email (`info@wedo365.se`), so a reply lands in the owner's inbox. Falls back to `MAIL_TO_OWNER` if left out.                                                                           |
| `NEXT_PUBLIC_SITE_URL` | yes    | The public address, no trailing slash. Used for canonical links, the sitemap, robots.txt and structured data. **Read at build time**, so set it before deploying and redeploy if it changes. Defaults to `https://wedo365.se`. |

`SHOW_REVIEWS` is optional (`true` shows the reviews section and the Reco.se rating; leave it out until there are real reviews). Also read at build time.

If any of `RESEND_API_KEY`, `MAIL_FROM` or `MAIL_TO_OWNER` is missing, the API answers with an error and writes `[request] Email is not configured …` to the server log (never any form contents).

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
- **Domain:** the website and the contact mailbox share one domain, `wedo365.se` (not `wedo365ab.se`). The mailbox `info@wedo365.se` is hosted at Loopia; mail is sent through Resend from the subdomain `send.wedo365.se` (`noreply@send.wedo365.se`).

## Editing text

All text on the site is in `src/messages/sv.json` and `src/messages/en.json`.

- **Both files must keep the same keys.** `npm test` fails if one language is missing a key, has an empty text, or uses different `{placeholders}`.
- Lists such as the FAQ, the trust points and the privacy sections are arrays. You can add or remove items.
- Some lists are matched to form options **by position** (`quote.types`, `quote.freqs`, `book.services` …). Don't reorder or remove items in those; the tests check it.
- Text such as `{phone}` or `{name}` is filled in by the site. Keep it as it is.
- **The phone number, email and other company details** are not written in the messages files; change them in `src/config/company.ts` (see above).
- **The privacy policy and terms** are the `legal` section: a list of `{ title, text }` per page.
- **The owner email** is always Swedish. Its few extra labels ("Typ av förfrågan", "Mottagen" …) are in `src/lib/email/templates.ts`; everything else reuses the forms' own labels.
- **Photos:** the files in `public/images/` are made from the originals in `design-assets/` (kept out of git: they show client premises) by `node scripts/process-images.mjs` (4:5 crop, 1200×1500, JPEG quality 80, all metadata removed, blur placeholder written to `src/config/image-blur.ts`; Next.js serves AVIF/WebP). To change one, edit the list in that script, run it, and point the slot in `src/config/images.ts` (`hero`, `businessBand`, `business`, `about`, `homeCleaning`) at the file. A slot set to `null` shows nothing (no box, no caption); `homeCleaning` is empty on purpose, because the photos we have show a gym and staff rooms, not a private home. The alt text is in the messages files (`home.heroPhotoAlt`, `home.businessPhotoAlt`, `home.aboutPhotoAlt`, `business.photoAlt`, `homeCleaning.photoAlt`); describe only what is visible. Only the hero photo is preloaded; the others load lazily. No stock photos. Before adding any photo, check it for client names, logos, phone numbers and notes on walls or whiteboards, and crop or leave it out.
- **Reviews:** the reviews section and the "[BETYG] av 5 på Reco.se" trust point are hidden. The texts stay in the messages (`home.reviews*`, `home.trustReviews`). Build with `SHOW_REVIEWS=true` once there are real reviews and the `[...]` texts are replaced.
- **FAQ answers** that are still `[bracketed]` are left out automatically, and a FAQ with no ready answer is not shown at all. Write the answer (without brackets) and the question appears.
- **Logo:** the header keeps the placeholder green "W" and wordmark (`src/components/Logo.tsx`). The real logo (`public/images/wedo365-logo.jpg`, 439×262, low resolution) is used only in the footer and the "Om oss" section on the home page, at 200–240 px wide, never enlarged. **Ask the owner for the original/vector logo (SVG/PNG ≥ 1000px)** and then use it in the header too. The logo's blue is not used on the site (it does not fit the green/terracotta palette).

After editing, run `npm test` and `npm run build`.

## Text to review by a native Swedish speaker

These strings were not in the approved copy and were added by the developer. Please check the Swedish (and English) wording.

| Key                                                                                                         | Swedish                                                                                                                                                     | English                                                                                                                                                                   | Where                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ui.skipLink`                                                                                               | Hoppa till innehållet                                                                                                                                       | Skip to content                                                                                                                                                           | Skip link, visible on keyboard focus                                                        |
| `ui.menu`                                                                                                   | Meny                                                                                                                                                        | Menu                                                                                                                                                                      | Menu button in the header on mobile                                                         |
| `ui.breadcrumb`                                                                                             | Brödsmulor                                                                                                                                                  | Breadcrumb                                                                                                                                                                | Screen-reader name of the breadcrumb (service pages)                                        |
| `ui.sending`                                                                                                | Skickar …                                                                                                                                                   | Sending …                                                                                                                                                                 | Submit button while sending                                                                 |
| `ui.choose`                                                                                                 | Välj …                                                                                                                                                      | Choose …                                                                                                                                                                  | Empty first option of the quote form's selects                                              |
| `errors.required`                                                                                           | Fyll i det här fältet.                                                                                                                                      | Please fill in this field.                                                                                                                                                | Inline form error                                                                           |
| `errors.choose`                                                                                             | Välj ett alternativ.                                                                                                                                        | Please choose an option.                                                                                                                                                  | Inline form error                                                                           |
| `errors.email`                                                                                              | Ange en giltig e-postadress.                                                                                                                                | Enter a valid email address.                                                                                                                                              | Inline form error                                                                           |
| `errors.phone`                                                                                              | Ange ett giltigt telefonnummer.                                                                                                                             | Enter a valid phone number.                                                                                                                                               | Inline form error                                                                           |
| `errors.range`                                                                                              | Ange ett heltal mellan {min} och {max}.                                                                                                                     | Enter a whole number between {min} and {max}.                                                                                                                             | Inline form error                                                                           |
| `errors.zip`                                                                                                | Ange fem siffror, t.ex. 123 45.                                                                                                                             | Enter five digits, e.g. 123 45.                                                                                                                                           | Inline form error                                                                           |
| `errors.date`                                                                                               | Ange ett giltigt datum.                                                                                                                                     | Enter a valid date.                                                                                                                                                       | Inline form error                                                                           |
| `errors.datePast`                                                                                           | Välj dagens datum eller ett senare.                                                                                                                         | Choose today or a later date.                                                                                                                                             | Inline form error                                                                           |
| `errors.tooLong`                                                                                            | Texten är för lång.                                                                                                                                         | The text is too long.                                                                                                                                                     | Inline form error                                                                           |
| `errors.submitFailed`                                                                                       | Det gick inte att skicka just nu. Försök igen eller ring oss på {phone}.                                                                                    | We could not send your request just now. Please try again or call us on {phone}.                                                                                          | Form alert when sending fails                                                               |
| `email.subject`                                                                                             | Vi har fått din förfrågan – WeDo365                                                                                                                         | We have received your request – WeDo365                                                                                                                                   | Customer email: subject                                                                     |
| `email.greeting`                                                                                            | Hej {name}!                                                                                                                                                 | Hi {name},                                                                                                                                                                | Customer email: greeting                                                                    |
| `email.summaryTitle`                                                                                        | Det här skickade du                                                                                                                                         | What you sent us                                                                                                                                                          | Customer email: heading above the summary                                                   |
| `email.signoff`                                                                                             | Vänliga hälsningar,                                                                                                                                         | Kind regards,                                                                                                                                                             | Customer email: sign-off                                                                    |
| `email.why`                                                                                                 | Du får det här mejlet eftersom du skickade en förfrågan på {site}.                                                                                          | You are receiving this email because you sent a request on {site}.                                                                                                        | Customer email: why you got this email                                                      |
| `notFound.h1`                                                                                               | Sidan hittades inte                                                                                                                                         | Page not found                                                                                                                                                            | 404 page: heading                                                                           |
| `notFound.text`                                                                                             | Länken kan vara felaktig, eller så har sidan flyttats.                                                                                                      | The link may be wrong, or the page may have moved.                                                                                                                        | 404 page: explanation                                                                       |
| `notFound.home`                                                                                             | Till startsidan                                                                                                                                             | Back to home page                                                                                                                                                         | 404 page: button to the start page                                                          |
| `nav.about`                                                                                                 | Om oss                                                                                                                                                      | About us                                                                                                                                                                  | Header link to the "Om oss" section (`#om`)                                                 |
| `footer.postalAddress`                                                                                      | Postadress                                                                                                                                                  | Postal address                                                                                                                                                            | Label above the postal address (footer, legal pages)                                        |
| `legal.company`                                                                                             | {company}, org.nr {orgNr}                                                                                                                                   | {company}, org. no. {orgNr}                                                                                                                                               | Contact block on the legal pages                                                            |
| `nav.cta` (changed)                                                                                         | Skicka förfrågan                                                                                                                                            | Send request                                                                                                                                                              | Header button and mobile bottom bar (was "Boka städning"); the form page is titled the same |
| `home.howTitle` (changed)                                                                                   | Så enkelt skickar du en förfrågan                                                                                                                           | Sending a request is simple                                                                                                                                               | Home page, steps heading (was "Så enkelt bokar du")                                         |
| `about.eyebrow`, `about.title`, `about.text`, `about.facts`                                                 | Om oss; Städfirman bakom WeDo365; Vi städar hem, kontor, gym och fastigheter i Stockholm, 365 dagar om året.; {company} · {employees} anställda · Stockholm | About us; The cleaning company behind WeDo365; We clean homes, offices, gyms and properties in Stockholm, 365 days a year.; {company} · {employees} employees · Stockholm | Home page, "Om oss" section (`#om`)                                                         |
| `about.logoAlt`                                                                                             | WeDo 365 AB, Expert Cleaning Squad                                                                                                                          | WeDo 365 AB, Expert Cleaning Squad                                                                                                                                        | Alt text of the logo (footer and Om oss)                                                    |
| `footer.instagramAria`, `footer.facebookAria`                                                               | WeDo 365 AB på Instagram / på Facebook                                                                                                                      | WeDo 365 AB on Instagram / on Facebook                                                                                                                                    | Screen-reader names of the footer social links                                              |
| `home.heroPhotoAlt`, `home.businessPhotoAlt` (changed), `home.aboutPhotoAlt`, `business.photoAlt` (changed) | Descriptions of what the four photos show                                                                                                                   | The same in English                                                                                                                                                       | Alt text of the photos                                                                      |
| `footer.about` (end)                                                                                        | · {employees} anställda.                                                                                                                                    | · {employees} employees.                                                                                                                                                  | Footer "Om oss" line; added to the approved text                                            |

**Privacy policy and terms (`legal.*`): drafted by the developer, must be reviewed by a lawyer before launch.** The text is plain-language and states only what the site does today; every statement that depends on an owner decision is a `[ÄGARE BEKRÄFTAR: …]` placeholder (full list under "Owner decisions still open"). Points for the lawyer: the legal bases (GDPR art. 6.1.b, 6.1.c and 6.1.f); the transfer statement (Vercel and Resend are US companies; the text says transfers rely on standard contractual clauses "as the providers state in their DPAs", which has **not** been checked against the actual agreements); the retention wording; the withdrawal-right text (14 days, early start at the customer's request); and the complaints wording, which must not limit consumer rights under konsumenttjänstlagen. The policy still does not cover the delivery log Resend keeps of sent emails.

### Taken from the prototype

This text was in the approved prototype (`docs/prototype/`) but missing from the messages files, so it was copied over as is:

| Key                              | Swedish            | English         | Where                                                |
| -------------------------------- | ------------------ | --------------- | ---------------------------------------------------- |
| `home.businessPhotoAlt`          | städning av kontor | office cleaning | Alt text of the business-band photo (once it exists) |
| `homeCleaning.breadcrumbCurrent` | Hemstädning        | Home cleaning   | Last breadcrumb item, home-cleaning page             |

## Placeholders to fill in

Text in square brackets is a placeholder for the owner. The brackets are kept exactly as written until the real text is in. **`npm run check:placeholders` lists them** (see "Before launch"). Only the privacy policy and terms show them on the live site today; the rest are hidden until the owner fills them in. This is the complete list:

| Placeholder (Swedish / English)                                                                                                     | Where it shows                | What goes there                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------- |
| `[BETYG]` / `[RATING]`, `[ANTAL]` / `[COUNT]`                                                                                       | Hidden (SHOW_REVIEWS off)     | Reco.se rating and number of reviews                      |
| `[Kundomdöme hämtat från Reco eller Google]`, `[Förnamn]`, `[Område]` (and English)                                                 | Hidden (SHOW_REVIEWS off)     | Real reviews, with permission                             |
| `[Svar från WeDo365, t.ex. hur nyckelhantering fungerar]`, `[Checklista för flyttstädning …]`, `[Avbokningsregler …]` (and English) | Hidden until answered         | The answers                                               |
| `[Svar från WeDo365]`, `[Svar från WeDo365, t.ex. om ni tar med städmaterial]` (and English)                                        | Hidden until answered         | The answers                                               |
| `[ÄGARE BEKRÄFTAR: …]`                                                                                                              | Privacy policy and terms      | The owner's decisions; see "Owner decisions still open"   |
| `[OG-BILD]`                                                                                                                         | A comment in `src/lib/seo.ts` | A share image (1200×630) for links shared on social media |

**Claims in the approved copy to confirm are true before launch:** "Godkänd för F-skatt" (see the checklist), the liability insurance with If, the Reco.se rating, "365 dagar om året", and that WeDo365 can offer the services on the site (including the checklist under "Det här ingår").

### Owner decisions still open (`[ÄGARE BEKRÄFTAR: …]`)

Each of these is a placeholder in the privacy policy or terms (both languages). Replace the whole bracket with the final text.

**Privacy policy (`legal.privacy`)**

1. **Mail provider:** the policy says requests arrive in a mailbox hosted by Loopia (Sweden). Confirm that Loopia is the provider.
2. **Transfers outside the EU/EEA:** confirm that the data processing agreements with Vercel and Resend are accepted in each account, and that they rely on standard contractual clauses.
3. **Retention:** how long requests that do not lead to a job stay in the inbox (suggested 12 months).
4. ~~Facebook and Instagram links~~ are now on the site (header and footer), so that sentence is settled.
5. **Analytics:** the policy says there is none. Update the policy if analytics is ever added.

**Terms (`legal.terms`)**

6. Whether the terms also apply to business customers (the draft says the written quote wins if it differs).
7. **Cancellation:** the notice period (e.g. 24 or 48 hours) and the fee for late cancellation.
8. **Complaints:** the complaint period, and how defects are put right (e.g. a re-clean). The text already says consumer rights under konsumenttjänstlagen are not limited.
9. **Insurance:** what the policy at If covers and any excess, and whether a certificate can be given on request. The policy number is never published.
10. **Payment:** payment terms (e.g. 10 or 14 days), and whether Bankgiro 5253-4021 should be stated. It is not shown until the owner confirms.
11. **Disputes:** that the company agrees to have consumer disputes reviewed by Allmänna reklamationsnämnden (ARN).

## Deploying (Vercel and Resend)

All accounts (GitHub, Vercel, Resend, the domain registrar) should belong to WeDo 365 AB, with the developer added as a member.

1. **GitHub.** Push this repository to a repository owned by the company.
2. **Vercel.** Import the repository. **Use a Pro plan:** the free Hobby plan is for non-commercial use only. The framework (Next.js) and build settings are detected automatically. `vercel.json` pins the server function (`/api/request`) to Stockholm (`arn1`); every page is static and is served from Vercel's network.
3. **Environment variables.** Add the variables above (`RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO_OWNER`, `MAIL_REPLY_TO`, `NEXT_PUBLIC_SITE_URL`), for Production (and Preview if you want preview deployments to send email). Set `NEXT_PUBLIC_SITE_URL` to the final public address.
4. **Domain.** Add `wedo365.se` in Vercel and set the DNS records it shows. Choose whether the main address is `wedo365.se` or `www.wedo365.se`, make the other one redirect to it (in Vercel's domain settings), and use the main one in `NEXT_PUBLIC_SITE_URL`.
5. **Resend.** Add the sending domain as a **subdomain**, `send.wedo365.se`, and choose the **EU region** when adding it. Add the DNS records Resend lists (SPF, DKIM) **without touching the MX records of the main domain**, so normal email keeps working. Wait until Resend shows the domain as verified, then create an API key and set `MAIL_FROM`.
6. **First test in production.** Send one request through each form (`/boka` and `/offert`, and the English versions). Check that the owner inbox gets the email in Swedish, that the customer copy arrives (also look in spam), and that replying to each email goes to the other party (the owner for the customer copy, the customer for the owner email).
7. **Google Search Console.** Add the property and submit `https://wedo365.se/sitemap.xml`. (Vercel marks preview deployments as `noindex` by default.)

## Before launch

- [ ] **Fill in every placeholder** (see the list above), and confirm the claims in the copy are true
- [ ] **Owner to confirm F-skatt status (check at skatteverket.se).** "Godkänd för F-skatt" / "Approved for F-tax" is on the site (footer, home and business trust lists) but has not been verified.
- [ ] **Kollektivavtal (collective agreement): owner to confirm.** The "[Kollektivavtal: bekräftas]" line was taken off the business page. If there is one, add a trust point for it in `business.trust` (both files).
- [ ] **Native Swedish proofread** of all Swedish text, including the strings in the review table
- [ ] **Lawyer review of the privacy policy and terms before launch** (`/integritetspolicy`, `/villkor`, both languages), after the owner has answered every `[ÄGARE BEKRÄFTAR: …]` item (see "Owner decisions still open")
- [ ] **Owner decisions:** answer the remaining `[ÄGARE BEKRÄFTAR: …]` items (see "Owner decisions still open")
- [ ] **Real Resend key test** on the live site: send one request through each form, in both languages. Both emails must arrive (also check spam). The owner email must have the customer as Reply-To, and the customer copy must have `MAIL_REPLY_TO` (`info@wedo365.se`) as Reply-To.
- [ ] **Vercel Pro** on the WeDo 365 AB account (the free Hobby plan is for non-commercial use only)
- [ ] **DNS switch at Loopia** (do these in order; the owner or the designer with Loopia access does it)
  - [ ] First **take a screenshot of every existing DNS record** (so anything can be put back).
  - [ ] Today the root (`@`) and `www` **A records point to Canva (103.169.142.0)**. Replace **only those two** with the values Vercel shows for `wedo365.se` and `www.wedo365.se`.
  - [ ] **Delete the Canva TXT record `_canva-domain-verify`** if it is there.
  - [ ] Add the Resend records on the **send subdomain only**: TXT `resend._domainkey.send` (DKIM, the value Resend shows); CNAME `rsend.send` → `rsend-euw1.forge.rmta.net`; CNAME `send.send` → `send.forge.rmta.net`. (Resend's own page is the final word if its values differ.) Wait until Resend shows the domain as verified (EU region).
  - [ ] **Never edit the MX records** (`mailcluster.loopia.se`, `mail2.loopia.se`) **or the root SPF record.** Normal email on `info@wedo365.se` must keep working: send and receive a test mail afterwards. TTL is already 3600, so a change can take up to an hour to show.
  - [ ] After the switch, **ask the designer (owner of the Canva account) to unpublish the Canva site.**
- [ ] **Handover:** the Resend account, the Vercel Pro team, the Loopia login and the GitHub repository are owned by WeDo 365 AB. The Resend API key is **rotated after handover** (and `RESEND_API_KEY` updated in Vercel). The designer's Loopia access is removed.
- [ ] **Lighthouse check on mobile** for the live home page. The target is 95 or more for Performance, Accessibility, Best Practices and SEO. (Not measured yet; it needs the live site.)
- [ ] **Logo:** ask the owner for the original/vector logo (SVG/PNG ≥ 1000px). The current file is a 439×262 raster.
- [ ] A share image (`[OG-BILD]`)
- [ ] **Photos: owner to confirm written consent from every person shown, and that clients agree to premises being shown.** The photos in use show a gym (home hero and `/foretag`), a room with a mirror and an orchid, and a washroom. Replace or remove any photo the client or the person shown does not accept.
- [ ] **Facebook: owner to confirm the Facebook page is public (open it in a private window) and to set a custom page name; update `FACEBOOK_URL` in `src/config/company.ts` if the address changes.** Instagram: check `INSTAGRAM_URL` works the same way.
- [ ] **Home-cleaning checklist ("Det här ingår"): owner to confirm what is included.** The three groups (all rooms, kitchen, bathroom) are a draft and must match WeDo365's own service description. The note on the page that said so was removed.
- [ ] **Reviews:** when there are real reviews, replace the `[...]` texts in `home.reviews*` and `home.trustReviews`, then build with `SHOW_REVIEWS=true`
- [ ] **Run `npm run build`, then `LAUNCH_CHECK=1 npm run check:placeholders`.** It must pass: no `[`, `Foto:`/`Photo:` or `TODO` on any rendered page. Without `LAUNCH_CHECK=1` it only warns. It also lists written-but-hidden text in the messages files; that does not fail the check.

## Tests

`npm test` runs the unit tests (a few seconds):

- **Form schemas** (valid and invalid home and business requests, date rules in Stockholm time, the spam guard)
- **Email builders** (the owner email has every field and is in Swedish; the customer email is in the customer's language; HTML in input is escaped; no price, RUT or personnummer words)
- **Sending** with the Resend SDK replaced by a stand-in (recipients, reply-to, what happens when each email fails, no form contents in the log)
- **The messages files** (same keys in both languages, no empty text, lists that line up with the form options)
- **Spam guard end to end** (`/api/request`: a normal fill is accepted, a filled honeypot or a too-fast send is silently dropped) and the honeypot field's markup
- **Company details** (`src/config/company.ts`: every token in the messages is filled in, the old placeholders are gone, the structured data has the legal ids and postal address)

The pages and forms themselves are not covered by automated browser tests. During development they were checked by hand and with scripts in a real browser at 375 px and 1440 px wide, in both languages.

## Good to know

- **This is a recent Next.js with breaking changes.** `AGENTS.md` tells coding agents to read `node_modules/next/dist/docs/` first; do the same before changing framework-level things.
- **Every page is static**, and the build fails if one stops being static (`ensureStatic` in `src/app/[locale]/layout.tsx`). Cache Components are on. Because of that, `/api/request` must not export a `runtime` setting (it already runs on Node.js).
- **Mobile bar:** on small screens a sticky bar with "Ring" and the request button sits at the bottom (`MobileActionBar`). It is the last element of the page, so at the very bottom it sits below the footer, not over it. It is hidden on `/boka` and `/offert`.
- **No language detection and no cookies.** `/` is always Swedish, `/en` is English, and the language switch is a plain link.
- **The 404 page has the full header and footer and shows only the language of the URL** (Swedish at the root, English under `/en`). **Uses Next's experimental global-not-found. Re-check after every Next.js upgrade.** A `notFound()` from a page would give only a client-rendered shell under Cache Components. The 404 page instead reads the language from the `x-next-intl-locale` header the proxy sets, so it is rendered per request (`export const instant = false`); this is why `src/i18n/request.ts` falls back to `requestLocale`. A rewrite in `next.config.ts` sends unknown URLs containing a dot (like `/index.html`) to the same page.
- **Spam protection** is a hidden honeypot field (off-screen, `aria-hidden`, `inert`, not focusable, autofill switched off) plus a minimum fill time of 3 seconds. There is no rate limiting. If spam gets through after launch, add rules in Vercel's firewall; no code change is needed.
- **The thank-you page** always says a copy was sent to the customer. If only that copy fails (the owner email went through), the request still counts as received.
- **The org.nr is deliberately not collected** in the quote form. The owner asks for it when writing the contract.
