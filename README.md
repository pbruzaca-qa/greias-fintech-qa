# GRÉIAS — Simulated Digital Bank for Fintech QA

> Educational environment. All operations are fictional.

A full-stack simulated digital bank built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **REST API routes** for manual, exploratory, E2E, and API QA practice.

## Implemented Capabilities (Blocks 1–4)

- **Official Landing Page (`/`)**: Monochrome obsidian, ivory, and surgical sage identity, accessible navigation, disabled `← Back to the cliff` placeholder, and vector Greias Card (`PERSEU B.`).
- **Digital Onboarding (`/open-account`, `POST /api/accounts`)**: Client & server validation (`HTTP 422`), Tax ID format enforcement (rejecting repeated digits), integer-cents arithmetic, and `Idempotency-Key` support.
- **Account Workspace (`/workspace`)**: Pre-loaded default seed account (`Perseu B.`, `$12,500.00`) plus newly created accounts.
- **01 Instant Transfers (`POST /api/transfers/pix`, `POST /api/transfers/wire`)**:
  - Pix (`$0.00` fee) across Email, Tax ID, and EVP keys with sandbox recipient lookup.
  - Wire (`$2.50` fee) with balance + fee sufficiency validation.
  - Self-transfer prevention, `$5,000.00` per-transaction and `$10,000.00` daily limit tracking, and idempotency protection.
- **02 Smart Card Control (`/api/card/*`)**:
  - On-demand credential reveal (`POST /api/card/credentials`) so PAN/CVV never leak on `GET /api/account`.
  - Freeze / Unfreeze (`PATCH /api/card/status`), invoice limit adjustments (`PATCH /api/card/limit`), simulated purchases (`POST /api/card/purchase`) logging `DECLINED` attempts, and invoice payment (`POST /api/card/pay-invoice`).
- **03 Live Statement (`GET /api/statement`)**: Server-side filtering (`type`, `status`, `q`), accessible Transaction Inspector modal, and CSV/JSON export.
- **Deterministic QA Reset (`POST /api/reset`)**: Restores the `Perseu B.` seed state cleanly at any time.
- **Chaos Monkey (`GET/PUT /api/chaos`)**: Artificial latency (`+1500ms` / `+3500ms`), forced `HTTP 500`, forced `HTTP 429` (`Retry-After`), forced `HTTP 504`, Disable Idempotency (Race Condition), client validation bypass, and intentional stale-balance UI desync training mode.

## Running Locally

```bash
npm install
npm run typecheck
npm run dev
```

Open `http://localhost:3000`.

## QA Documentation & Artifacts

- [`QA_PLAYBOOK.md`](./QA_PLAYBOOK.md) — Seed credentials, REST API reference, and quick test scenarios (EN)
- [`docs/TEST_CATALOG.md`](./docs/TEST_CATALOG.md) — Formal test case catalog `GRE-001`–`GRE-016` (PT-BR)
- [`docs/bugs/bugs-log.md`](./docs/bugs/bugs-log.md) — Triage log separating real defects (`BUG-GRE-001` to `BUG-GRE-003`) from controlled Chaos Monkey fault injections (PT-BR)
- [`docs/STUDY_LOG.md`](./docs/STUDY_LOG.md) — Incremental study and engineering decisions log (PT-BR)