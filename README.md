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

| Key           | Swedish               | English         | Where                                |
| ------------- | --------------------- | --------------- | ------------------------------------ |
| `ui.skipLink` | Hoppa till innehållet | Skip to content | Skip link, visible on keyboard focus |
| `ui.menu`     | Meny                  | Menu            | Menu button in the header on mobile  |

## Placeholders to fill in

Text in square brackets is a placeholder for the owner. Used so far:

- `[ORG.NR]` – organisation number (footer)
- `[E-POST]` / `[EMAIL]` – the part before `@wedo365ab.se` (footer)
- `[TEXT FRÅN WEDO365]` – privacy policy and terms pages

The complete list follows in phase 7.
