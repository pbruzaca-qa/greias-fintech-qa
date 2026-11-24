# GRÉIAS — Simulated Digital Bank for Fintech QA

> Educational QA environment. All accounts, credentials, balances, and transactions are 100% fictional.

A full-stack simulated digital bank built with **Next.js 14 (App Router)**, **React 18**, **TypeScript (strict)**, **Tailwind CSS**, and **REST API Route Handlers** for manual, exploratory, API, and E2E QA practice.

**Live Environment (Vercel):** [`https://greias-fintech-qa.vercel.app`](https://greias-fintech-qa.vercel.app)

> **Important Runtime Note (Local vs. Vercel):** Account, card, ledger, and Chaos Monkey state lives in server memory via a `globalThis` singleton (`src/lib/store.ts`) with integer-cents financial math. Locally (`npm run dev`), state persists across requests in the running Node.js process until reset or restart. On Vercel Serverless, state is ephemeral across cold starts or separate serverless instances.

---

## Implemented Capabilities

### Banking & Core SUT
- **Official Landing Page (`/`)**: Monochrome obsidian, ivory, and surgical sage identity (`"Banking, stripped to pure precision."`), vector `GreiasCardVisual` (`PERSEU B.`, `•••• 4821`, Perseus constellation), and direct module entry points (`01 Instant Transfers`, `02 Smart Card Control`, `03 Live Statement`).
- **Digital Onboarding (`/open-account`, `POST /api/accounts`)**: Client & server validation (`HTTP 422`), Tax ID format enforcement (rejecting repeated-digit patterns such as `111.111.111-11`), deposit boundaries (`$0.00` to `$100,000.00`), integer-cents arithmetic, `Idempotency-Key` support, and quick entry with the default `Perseu B.` account.
- **Account Workspace (`/workspace`)**: Tabbed banking cockpit synchronized with query string (`?module=overview|transfers|card|statement`), live available balance, and daily transfer limit progress bar.
- **01 Instant Transfers (`POST /api/transfers/pix`, `POST /api/transfers/wire`)**:
  - Pix (`$0.00` fee) across `EMAIL`, `TAX_ID`, and `EVP` keys with sandbox recipient directory lookup.
  - Wire (`$2.50` fee included in balance sufficiency checks).
  - Self-transfer prevention, `$5,000.00` per-transaction and `$10,000.00` daily cumulative limits, idempotency protection, and detailed receipts.
- **02 Smart Card Control (`/api/card/*`)**:
  - On-demand credential reveal (`POST /api/card/credentials`) so full PAN/CVV never leak on `GET /api/account`.
  - Freeze / Unfreeze (`PATCH /api/card/status`), invoice limit adjustments between `$100.00` and `$25,000.00` (`PATCH /api/card/limit`), simulated purchases (`POST /api/card/purchase`) logging `DECLINED` attempts, and invoice payment from checking balance (`POST /api/card/pay-invoice`).
- **03 Live Statement (`GET /api/statement`)**: Server-side filtering (`type`, `status`, `q`), accessible Transaction Inspector modal with raw JSON payload (`Esc` closes and restores focus), and CSV/JSON export.

### QA Practice Tooling & Platform Polish
- **Persistent QA Utility Bar (`QaUtilityBar`)**: Top bar available across all routes with quick access to `QA // Study Hub`, `QA // Chaos`, and deterministic `Reset environment` (`POST /api/reset`).
- **QA Study Hub (`StudyHubDrawer`)**: 7 built-in modules (`01 ABOUT & HOW TO USE`, `02 BUSINESS RULES` with one-click **Postman Collection `.json`** export covering all 13 API routes, `03 STUDY TRACKS` 13-item progress checklist persisted in `localStorage` under `"greias-lab-study-tracks-v1"`, `04 QA GUIDE`, `05 QA BOARD`, `06 DESIGN SPECS`, and `07 LAB COMMS` reacting dynamically when Chaos Monkey is active).
- **Chaos Monkey (`GET / PUT /api/chaos`, `ChaosMonkeyDrawer`)**: Master switch, artificial latency (`0` / `+1500 ms` / `+3500 ms`), forced `HTTP 500`, forced `HTTP 504`, forced `HTTP 429` (`Retry-After: 5`), `Bypass Client Validation`, `Disable Idempotency` (race-condition simulation), and intentional `Stale Balance UI Desync` bug-hunting mode.
- **Visual Identity & Editorial Details**: Fixed pure-SVG Perseus constellation backdrop (`ConstellationBackdrop`) and matching card constellation (`GreiasCardVisual`), custom `404` page (`src/app/not-found.tsx`) with `data-testid` hooks, and minimalist `SiteFooter`.
- **Technical SEO & Social Previews**: `src/app/sitemap.ts`, `src/app/robots.ts` (blocking `/api/`), and `src/app/opengraph-image.tsx` (`1200×630` PNG using `export const runtime = "edge"` to work around the Next.js `14.2.18` Windows `ImageResponse` font-path issue).

---

## Verified Production Baseline (Vercel)

- **Cross-device / Locale Smoke Check**: Validated on desktop and mobile devices (English & Portuguese browser locales, including Chrome manual translation resilience).
- **Chrome DevTools Network (Production `/`)**: 19 requests, `281 kB` transferred, `715 kB` resources, Finish `1.51 s`, `DOMContentLoaded` `439 ms`, Load `987 ms`.
- **Lighthouse (Production `/`)**: Performance `100`, Accessibility `95`, Best Practices `100`.

---

## Running Locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

*(On Windows PowerShell, use `npm.cmd` — e.g., `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run dev`.)*

Open `http://localhost:3000`.

---

## QA Documentation & Artifacts

- [`QA_PLAYBOOK.md`](./QA_PLAYBOOK.md) — Seed credentials, REST API surface, Study Hub / Postman workflow, and curated test scenarios (EN)
- [`docs/TEST_CATALOG.md`](./docs/TEST_CATALOG.md) — Formal traceable test case catalog covering core banking, Chaos Monkey, and platform UX/SEO checks (PT-BR)
- [`docs/bugs/bugs-log.md`](./docs/bugs/bugs-log.md) — Triage log separating real defects (`BUG-GRE-001` to `BUG-GRE-003`) from controlled Chaos Monkey fault injections (PT-BR)
- [`docs/STUDY_LOG.md`](./docs/STUDY_LOG.md) — Incremental study journal, engineering trade-offs, and verified milestones (PT-BR)