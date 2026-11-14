# WeDo365 – wedo365ab.se

Website for WeDo 365 AB, a cleaning company in Stockholm. Next.js (App Router) + Tailwind CSS v4 + next-intl. Swedish at `/`, English at `/en`.

> A full handover README (env vars, deploy steps, editing guide) comes in phase 7. This file grows with each phase.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run lint`         | ESLint                                     |
| `npm run typecheck`    | Generates route types, then `tsc --noEmit` |
| `npm run build`        | Production build (every page is static)    |
| `npm run format`       | Prettier (with Tailwind class sorting)     |
| `npm run format:check` | Prettier check only                        |

## Editing text

All text is in `src/messages/sv.json` and `src/messages/en.json`. Both files must keep the same keys. `docs/messages/` holds the copy as approved in the prototype, for reference.

## Text to review by a native Swedish speaker

These functional strings were not in the approved copy and were added by the developer. Please check the Swedish (and English) wording.

| Key                   | Swedish                                                                  | English                                                                          | Where                                                |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ui.skipLink`         | Hoppa till innehållet                                                    | Skip to content                                                                  | Skip link, visible on keyboard focus                 |
| `ui.menu`             | Meny                                                                     | Menu                                                                             | Menu button in the header on mobile                  |
| `ui.breadcrumb`       | Brödsmulor                                                               | Breadcrumb                                                                       | Screen-reader name of the breadcrumb (service pages) |
| `ui.sending`          | Skickar …                                                                | Sending …                                                                        | Submit button while sending                          |
| `ui.choose`           | Välj …                                                                   | Choose …                                                                         | Empty first option of the quote form's selects       |
| `errors.required`     | Fyll i det här fältet.                                                   | Please fill in this field.                                                       | Inline form error                                    |
| `errors.choose`       | Välj ett alternativ.                                                     | Please choose an option.                                                         | Inline form error                                    |
| `errors.email`        | Ange en giltig e-postadress.                                             | Enter a valid email address.                                                     | Inline form error                                    |
| `errors.phone`        | Ange ett giltigt telefonnummer.                                          | Enter a valid phone number.                                                      | Inline form error                                    |
| `errors.range`        | Ange ett heltal mellan {min} och {max}.                                  | Enter a whole number between {min} and {max}.                                    | Inline form error                                    |
| `errors.zip`          | Ange fem siffror, t.ex. 123 45.                                          | Enter five digits, e.g. 123 45.                                                  | Inline form error                                    |
| `errors.date`         | Ange ett giltigt datum.                                                  | Enter a valid date.                                                              | Inline form error                                    |
| `errors.datePast`     | Välj dagens datum eller ett senare.                                      | Choose today or a later date.                                                    | Inline form error                                    |
| `errors.tooLong`      | Texten är för lång.                                                      | The text is too long.                                                            | Inline form error                                    |
| `errors.submitFailed` | Det gick inte att skicka just nu. Försök igen eller ring oss på {phone}. | We could not send your request just now. Please try again or call us on {phone}. | Form alert when sending fails                        |

`{min}`, `{max}` and `{phone}` are filled in by the site; keep them as they are.

### Taken from the prototype

This text was in the approved prototype (`docs/prototype/`) but missing from the messages files, so it was copied over as is:

| Key                              | Swedish                              | English                            | Where                                    |
| -------------------------------- | ------------------------------------ | ---------------------------------- | ---------------------------------------- |
| `home.businessPhotoAlt`          | Foto: städning av kontor (egen bild) | Photo: office cleaning (own photo) | Photo caption, business band             |
| `homeCleaning.breadcrumbCurrent` | Hemstädning                          | Home cleaning                      | Last breadcrumb item, home-cleaning page |

## Placeholders to fill in

Text in square brackets is a placeholder for the owner. Used so far:

- `[ORG.NR]` – organisation number (footer)
- `[E-POST]` / `[EMAIL]` – the part before `@wedo365ab.se` (footer)
- `[TEXT FRÅN WEDO365]` – privacy policy and terms pages
- `[FÖRSÄKRINGSBOLAG]` / `[INSURER]` – insurance company (home trust bar)
- `[BETYG]` / `[RATING]` and `[ANTAL]` / `[COUNT]` – Reco.se rating and number of reviews (home trust bar, reviews)
- `[Kundomdöme …]`, `[Förnamn]`, `[Område]` – the three review cards (home)
- `[Svar från WeDo365 …]`, `[Checklista …]`, `[Avbokningsregler …]` – FAQ answers (home)
- `[Kollektivavtal: bekräftas]` / `[Collective agreement: to confirm]` – business page trust list
- `[Svar från WeDo365]` (and variants) – FAQ answers (home cleaning)

Photos: every grey box with a "Foto: …" caption is a placeholder for an own photo (no stock photos). See `src/components/sections/PhotoPlaceholder.tsx` for how to drop one in.

The complete list follows in phase 7.
