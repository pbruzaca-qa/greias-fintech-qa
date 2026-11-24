# GRÉIAS — QA Practice Playbook

> Educational environment. All operations, accounts, and credentials are fictional.

**Production URL:** [`https://greias-fintech-qa.vercel.app`](https://greias-fintech-qa.vercel.app)

> **Environment Note (Local vs. Vercel):** State is stored in server memory via `globalThis` (`src/lib/store.ts`). When practicing multi-step flows or Chaos Monkey drills, local execution (`npm run dev` / `npm.cmd run dev`) provides a single continuous Node.js process, whereas Vercel Serverless may reset state across cold starts or separate instances.

---

## 1. Default Seed Account (`Reset environment`)

- **Holder:** `Perseu B.` (Cardholder: `PERSEU B.`)
- **Email:** `perseu.b@greias.fintech.test`
- **Fictional Tax ID:** `394.812.059-42`
- **Branch / Account:** `0001-9` / `48210-7`
- **Initial Balance:** `$12,500.00` (`1250000` cents)
- **Card:** `•••• 4821` (`ACTIVE`), Invoice Limit `$5,000.00`, Current Invoice `$1,240.00`
- **Transfer Limits:** `$5,000.00` per transaction / `$10,000.00` daily cumulative

---

## 2. Sandbox Pix Directory

| Key Type | Value | Resolved Recipient |
| --- | --- | --- |
| `EMAIL` | `kinetic@sandbox.greias.test` | Kinetic Sandbox Merchant |
| `TAX_ID` | `987.654.321-10` | Artemis Clearing House |
| `EVP` | `550e8400-e29b-41d4-a716-446655440000` | Athena Treasury Node |

---

## 3. REST API Surface (13 Endpoints)

- `GET /api/health` — Service health & Chaos status
- `GET /api/account` — Active account, masked card summary, limits, recent entries
- `POST /api/accounts` — Create fictional account (`201`, `422`, `400`)
- `POST /api/transfers/pix` — Execute Pix transfer (`201`, `422`, `400`)
- `POST /api/transfers/wire` — Execute Wire transfer with `$2.50` fee (`201`, `422`, `400`)
- `POST /api/card/credentials` — Reveal fictional PAN & CVV (`200`)
- `PATCH /api/card/status` — Set `ACTIVE` or `FROZEN` (`200`, `422`)
- `PATCH /api/card/limit` — Update invoice limit `$100–$25,000` (`200`, `422`)
- `POST /api/card/purchase` — Simulate card authorization (`201`, `422` + `DECLINED` ledger entry)
- `POST /api/card/pay-invoice` — Pay current invoice from checking balance (`200`, `422`)
- `GET /api/statement?type=&status=&q=` — Query filtered ledger entries (`200`)
- `POST /api/reset` — Deterministic reset to `Perseu B.` seed (`200`)
- `GET / PUT /api/chaos` — Inspect or configure Chaos Monkey faults (`200`)

> **Postman Quick Start:** Open `QA // Study Hub` from the top bar → `02 BUSINESS RULES` → download the generated **Postman Collection (`.json`)** containing all 13 endpoints pre-structured for API testing.

---

## 4. QA Utility Bar & Study Hub (`QA // Study Hub`)

Accessible across all routes (`/`, `/open-account`, `/workspace`, and `404`):

- **`QA // Study Hub`**: Opens the 7-module study & specification drawer (`01 ABOUT & HOW TO USE`, `02 BUSINESS RULES`, `03 STUDY TRACKS` saved in `localStorage` under `greias-lab-study-tracks-v1`, `04 QA GUIDE`, `05 QA BOARD`, `06 DESIGN SPECS`, `07 LAB COMMS`).
- **`QA // Chaos`**: Opens the Chaos Monkey fault-injection panel (`Latency`, `HTTP 500`, `HTTP 504`, `HTTP 429`, `Bypass Client Validation`, `Stale Balance UI Desync`, `Disable Idempotency`).
- **`Reset environment`**: Deterministically restores the `Perseu B.` seed account and ledger state.

---

## 5. Curated QA Test Scenarios

1. **Client vs. Server Defense (`HTTP 422`)**: Enable `Bypass Client Validation` in Chaos Monkey, submit `111.111.111-11` Tax ID on `/open-account` or `-10` on Pix, and verify server `422` response in DevTools Network.
2. **Wire Fee Boundary**: Reset environment (`$12,500.00`), drain balance down to `$5,000.00` (e.g., via transfers), then attempt a `$4,999.00` Wire (`$4,999.00 + $2.50 = $5,001.50` → must fail with `INSUFFICIENT_FUNDS`).
3. **Self-Transfer Block**: Attempt Pix to `perseu.b@greias.fintech.test` or `394.812.059-42` → must return `422 SELF_TRANSFER_NOT_ALLOWED`.
4. **Idempotency Under Latency & Race Condition**: Enable `+3500 ms` latency in Chaos Monkey and verify double-submission protection with `Idempotency-Key`; then toggle `Disable Idempotency` to observe duplicate execution (`race_condition` drill).
5. **Atomic Failure Under Outage (`HTTP 500` / `HTTP 504`)**: Enable `Force HTTP 500 Outage` or `Force HTTP 504 Timeout`, submit a Pix transfer, and verify balance and ledger remain untouched.
6. **Rate Limit Handling (`HTTP 429`)**: Enable `Force HTTP 429 Rate Limit`, inspect `Retry-After: 5` response header in Network, and verify graceful UI error banner.
7. **Card Security Boundary**: Confirm `GET /api/account` never leaks PAN/CVV; only `POST /api/card/credentials` returns them, and toggling reveal/hide never duplicates the CVV mask (`BUG-GRE-003` regression).
8. **Frozen Card Decline Trail**: Freeze card, attempt `$18.50` purchase, confirm `422 CARD_FROZEN` and `DECLINED` entry in `Live Statement`.
9. **Invoice Cap Enforcement**: Lower invoice limit below `$1,240.00`, confirm `Available` becomes `$0.00`, and verify new purchases decline with `INVOICE_LIMIT_EXCEEDED`.
10. **UI-vs-API Bug Hunting (`Stale Balance UI Desync`)**: Enable `Stale Balance UI Desync`, execute a `$100.00` Pix transfer, observe header balance staying stale while receipt, statement, and `GET /api/account` hold the true updated balance.
11. **Server-Side Statement Filtering & Export**: Filter by `DECLINED` and search `Frozen`, inspect JSON details in the modal (`Esc` returns focus), and verify exported CSV/JSON accuracy.
12. **Browser Translation & Accessibility (`BUG-GRE-001` regression)**: Test keyboard navigation (`Tab`, `Enter`, `Esc`) across drawers, modals, and footer links, and test toggling Pix/Wire with Chrome page translation active.
13. **Chaos State Sync Across Reload (`BUG-GRE-002` regression)**: Enable `Force HTTP 500 Outage`, reload `/workspace`, and verify the `QA // Chaos Active` indicator remains active via `GET /api/chaos` even when `/api/account` fails.
14. **Custom 404 & Navigation Resilience**: Visit an unknown path (e.g., `/non-existent-route`), verify the editorial `404` page (`"This route does not exist."`), `Return to Home →`, `Open Workspace`, and `SiteFooter` (`GitHub` link with `rel="noopener noreferrer"`).
15. **Study Hub & Postman Collection Workflow**: Download the `.json` collection from `02 BUSINESS RULES`, import into Postman, exercise the 13 routes, and verify `03 STUDY TRACKS` progress persists in `localStorage` across reloads.
16. **SEO, Open Graph & Performance Baseline**: Verify `/sitemap.xml`, `/robots.txt` (disallowing `/api/`), `/opengraph-image` (`1200×630` PNG), and compare Network/Lighthouse runs against the production baseline (`19` requests, `281 kB` transferred, Performance `100`, Accessibility `95`, Best Practices `100`).