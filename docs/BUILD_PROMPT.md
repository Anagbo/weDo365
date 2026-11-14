# Build brief: WeDo365 website (Next.js + Tailwind)

You are building the production website for **WeDo 365 AB**, a cleaning company in Stockholm. The design and all copy were approved in a clickable prototype. This file is the full spec. The copy lives in `docs/messages/sv.json` and `docs/messages/en.json` — use it verbatim, never invent new marketing text.

Work in small phases (listed at the end). After each phase: run lint, typecheck and build, fix anything that fails, then make one git commit with a clear message. Ask me before adding any dependency not listed here.

---

## 1. Hard rules

- **No prices, no RUT, no personnummer anywhere on the site or in the forms.** The company discusses price and RUT with each customer by phone or email after a request arrives.
- Every customer action is a **request** ("förfrågan"), never a confirmed booking.
- **Swedish is the default language** at the root; **English** lives under `/en`.
- Domain: **`wedo365ab.se`** (keep it in one config constant, `SITE_URL`, so it is easy to change).
- Text in square brackets, e.g. `[ORG.NR]`, `[BETYG]`, `[E-POST]`, is a placeholder the owner will fill in. Keep the brackets exactly as written, and list every placeholder in the README.
- No stock photos. Where the design has a photo, render a neutral placeholder box with the caption from the messages file (`…PhotoAlt` keys), sized so a real photo can drop in later via `next/image`.

## 2. Stack

- Next.js (latest stable), App Router, TypeScript strict, `src/` directory.
- Tailwind CSS (latest stable, v4 CSS-first config with `@theme`).
- `next-intl` for i18n, with localized pathnames and `localePrefix: 'as-needed'` (sv has no prefix, en has `/en`).
- `zod` for validation (shared between client and server).
- `resend` for sending email.
- Fonts via `next/font/google`: **Manrope** (600, 700, 800) for headings, **Inter** (400, 500, 600) for body.
- Package manager: npm. ESLint (Next config) + Prettier.

Scaffold with `create-next-app` in the current folder (TypeScript, Tailwind, ESLint, App Router, `src/`, import alias `@/*`). Then copy `docs/messages/*.json` to `src/messages/`.

## 3. Routes

| Page                             | Swedish path         | English path        | Messages namespace |
| -------------------------------- | -------------------- | ------------------- | ------------------ |
| Home                             | `/`                  | `/en`               | `home`             |
| Home cleaning (service template) | `/hemstadning`       | `/en/home-cleaning` | `homeCleaning`     |
| Business                         | `/foretag`           | `/en/business`      | `business`         |
| Request form for homes (wizard)  | `/boka`              | `/en/book`          | `book`             |
| Quote form for businesses        | `/offert`            | `/en/quote`         | `quote`            |
| Thank you                        | `/tack`              | `/en/thanks`        | `thanks`           |
| Privacy policy                   | `/integritetspolicy` | `/en/privacy`       | placeholder page   |
| Terms                            | `/villkor`           | `/en/terms`         | placeholder page   |

- Implement with `next-intl` `pathnames` so the language switch in the header goes to **the same page** in the other language.
- Navigation items "Så går det till / How it works", "Om oss / About" and "Kontakt / Contact" link to sections for now: `/#hur` (the "how" section on the home page), `/#om` (footer company block), `/#kontakt` (footer contact block). Add the matching `id`s.
- Flyttstädning, Storstädning and Fönsterputs do not have their own pages yet: their links go to the wizard with the service preselected (`/boka?tjanst=flytt`, `/en/book?service=flytt`, and so on). Build the home-cleaning page as a reusable service-page component so the other three can be added later from data.
- Custom 404 page in both languages with a link home.

## 4. Design system

Calm Scandinavian minimalism with warmth: lots of white space, one soft green, one warm accent for primary actions only.

Tailwind theme tokens:

| Token    | Hex       | Use                               |
| -------- | --------- | --------------------------------- |
| `ink`    | `#1E2A24` | Text, footer background           |
| `muted`  | `#4F5D55` | Secondary text                    |
| `ground` | `#FAFAF7` | Page background                   |
| `tint`   | `#E8EEE3` | Section bands, summary panels     |
| `green`  | `#2F5D4A` | Brand, links, icons, step markers |
| `accent` | `#B4532A` | Primary buttons only (white text) |
| `line`   | `#DDE2D8` | Card borders, dividers            |
| `field`  | `#7D8A82` | Form field borders (meets 3:1)    |

- Headings: Manrope 800, letter-spacing −0.02em. H1 54–58px desktop, ~36px mobile. H2 ~40px desktop.
- Body: Inter, 16–19px, line-height 1.55–1.6.
- Content max width 1200px, 24px side padding.
- Cards: white, 1px `line` border, 20px radius, 28px padding.
- Primary button: pill (fully rounded), min height 48px, `accent` background, white 600 text. Secondary button: pill, transparent, 1.5px `ink` border.
- Inputs: min height 48px, 1.5px `field` border, 10px radius, 16px text.
- Icons: inline stroke SVG (a single check icon in `green` is used for all trust and feature lists). No emoji.
- Logo: a 38px rounded square in `green` with a white "W", next to the wordmark "WeDo365" (Manrope 800). This is a placeholder until a real logo arrives — make it one `Logo` component.
- Mobile first. Header: on small screens, collapse the nav into a menu button (real `<button>` with `aria-expanded`); keep the "Ring" and primary CTA reachable.

## 5. Page content and layout

Use the messages files for every string. Layouts:

**Header (all pages):** logo → nav (Homes, Business, How it works, About, Contact; current page bold with a 2px green underline and `aria-current="page"`) → language switch pill ("EN"/"SV", with `lang` and `aria-label`) → "Ring 076-178 09 02" secondary pill (`tel:` link) → primary CTA to the wizard.

**Footer (all pages):** dark `ink` background, four columns: company (about, org line), services links, contact (phone, email, area), legal links. Copyright line below.

**Home:**

1. Hero: two columns — eyebrow, H1, lead | photo placeholder.
2. Two large "door" cards side by side: Homes (primary style, 2px green border, primary button → wizard) and Business (secondary button → quote form). Each shows title, text, note, CTA.
3. Trust bar: 4 check items between two thin rules.
4. "Our services for homes": 4 cards (name, text, link).
5. "How it works" (`id="hur"`): 3 numbered steps (green circles).
6. Business band: photo placeholder | eyebrow, H2, text, two buttons (quote, business page).
7. Reviews: title, subline, 3 placeholder review cards with five accent stars (stars `aria-hidden`).
8. FAQ: `<details>`/`<summary>` accordion.
9. End CTA band on `tint`.

**Home cleaning:** breadcrumb → two columns: H1, lead, request card (2px green border: title, text, checks, CTA → wizard with `hem` preselected) | photo placeholder → "What's included": 3 cards with check lists + note → FAQ → end CTA band.

**Business:** hero (eyebrow, H1, lead, primary CTA → quote, call button, trust checks | photo) → sectors grid (6 cards) → "How it works" on `tint` (3 steps) → end CTA band → quote.

**Quote form:** H1, lead, form card | side panel on `tint` ("What happens next?" numbered list, call link). Fields: type of premises (select), approximate area m² (number), frequency (select), company, org.nr, contact person, email, phone, message (optional textarea), consent text, submit.

**Wizard (`/boka`)** — one client component, 4 steps with a step indicator (`aria-current="step"`):

1. Service: 4 toggle cards (`aria-pressed`), default `hem`, or the value from the query string.
2. Details: size in m² (or number of windows for `fonster`); frequency toggles only for `hem` (default "every other week").
3. Time and place: preferred date (`type="date"`, not in the past), time slot toggles (morning 08–12 / afternoon 12–17), street, postcode (5 digits, a space allowed), city, notes.
4. Contact: name, email, mobile, consent text, submit.

- Side summary panel on `tint`: service, size or windows, frequency (hem only), preferred time, and the "we'll contact you" note. **No price.**
- Validate each step before "Next" (zod), show inline errors linked with `aria-describedby`, move focus to the step heading on step change. Keep the state if the user goes back.

**Thank you:** check icon, H1, text, "what happens now" numbered card, call link, button home.

**Privacy and terms:** simple placeholder pages with headings and `[TEXT FRÅN WEDO365]` placeholders. Privacy must cover at minimum: what the forms collect, why (to answer the request), that nothing is stored on the website (only sent by email), email provider (Resend, EU region), retention, rights, contact.

## 6. Form handling (no database)

- One Route Handler: `POST /api/request`. Body: `{ kind: 'home' | 'business', locale: 'sv' | 'en', ...fields }`. Validate with the same zod schemas as the client.
- Spam protection: a hidden honeypot field plus a minimum fill time (reject if submitted < 3 s after load). No CAPTCHA for now.
- On success, send two emails with Resend and return `{ ok: true }`; the client then routes to the thank-you page in the right language.
  1. **To the owner** (`MAIL_TO_OWNER`), always in Swedish, `reply_to` = customer email. Subject: `Ny förfrågan: <service> – <name or company>`. Body: a clean table of every field, plus locale and timestamp (Europe/Stockholm).
  2. **To the customer**, in their language: thank you, a summary of what they sent, "we will contact you by phone or email with price and time", the phone number. Never more personal data than they entered.
- Plain, inline-styled HTML email templates plus a text version; no extra email libraries.
- On failure: return a 4xx/5xx with a safe message; the form shows an error with the phone number as a fallback. Never log form contents.
- Env vars (document in `.env.example`): `RESEND_API_KEY`, `MAIL_FROM` (e.g. `WeDo365 <noreply@send.wedo365ab.se>`), `MAIL_TO_OWNER`, `NEXT_PUBLIC_SITE_URL`.
- Mark the Route Handler `runtime = 'nodejs'`. Everything else is statically rendered.

## 7. SEO

- Per-page `generateMetadata`: title (from messages `title`), description (lead text), canonical, and `alternates.languages` for `sv`, `en` and `x-default` (→ sv).
- `sitemap.ts` listing both languages with alternates; `robots.ts` allowing all and pointing to the sitemap.
- JSON-LD `LocalBusiness` on the home page: name WeDo 365 AB, telephone +46761780902, areaServed Stockholm, url `SITE_URL`.
- Semantic HTML, one H1 per page, descriptive link text, `lang` set per locale on `<html>`.
- Open Graph title and description; leave an `[OG-BILD]` TODO for an image.

## 8. Accessibility and performance

- WCAG 2.1 AA: contrast as per tokens, visible focus rings (2px `green` outline with offset), skip link to `<main>`, real buttons and labels, touch targets ≥ 44px, `prefers-reduced-motion` respected.
- Client JavaScript only where needed: wizard, quote form, mobile menu, language switch. All other components are server components.
- Target Lighthouse ≥ 95 on Performance, Accessibility, Best Practices and SEO for the home page on mobile.

## 9. Hosting notes (for the README)

- Deploy on Vercel. Pin functions to Stockholm with `vercel.json` → `{ "regions": ["arn1"] }`. The free Hobby plan is for non-commercial use, so a business site needs the Pro plan.
- In Resend, add the sending domain as a subdomain (`send.wedo365ab.se`) and pick the EU region when adding it. Add its DNS records (SPF, DKIM) without touching the domain's MX records.
- All accounts (GitHub, Vercel, Resend, domain) belong to WeDo 365 AB, with the developer added as a member.

## 10. Quality gates

- `npm run lint`, `npm run typecheck` (add the script: `tsc --noEmit`) and `npm run build` must pass after every phase.
- Add Vitest with a few unit tests for the zod schemas (valid and invalid home and business payloads) and for the email builders (owner email contains every field; customer email is in the right language). Ask before adding Vitest.
- Manually check both languages at 375px and 1440px widths.

## 11. Phases (one commit each)

1. Scaffold, Tailwind theme tokens, fonts, `next-intl` with pathnames and both message files, base layout (skip link, header, footer, language switch, mobile menu), placeholder pages for every route.
2. Home page.
3. Home-cleaning page (reusable service-page component) and business page.
4. Quote form (client) and wizard (client) with zod validation — still posting to a stub.
5. `/api/request` with Resend, email templates, honeypot and timing check, thank-you redirect, error state.
6. SEO (metadata, hreflang, sitemap, robots, JSON-LD), 404, privacy and terms placeholders.
7. Tests, `.env.example`, `vercel.json`, and a README for handover: how to run, env vars, how to edit text (the messages files), the placeholder list, and deploy steps.

Start with phase 1. Before writing code, reply with a short plan for phase 1 and any questions.
