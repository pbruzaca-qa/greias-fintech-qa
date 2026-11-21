# GRÉIAS — Simulated Digital Bank for Fintech QA

> Educational environment. All operations are fictional.

A full-stack simulated digital bank built with Next.js (App Router), TypeScript, Tailwind CSS, and REST API routes for manual, E2E, and API QA practice.

## Current Scope (Block 1)

- **Official Landing Page** (`/`) aligned with the Gréias monochrome obsidian, ivory, and surgical sage palette
- **Simulated Digital Onboarding** (`/open-account`, `POST /api/accounts`) with client/server validation, integer-cents money handling, and `Idempotency-Key` support
- **Default Seed Account (`Perseu B.`) & Workspace** (`/workspace`, `GET /api/account`)
- **Deterministic QA Reset** (`POST /api/reset`) restoring the baseline `Perseu B.` seed state
- **Chaos Monkey Fault Injection** (`GET/PUT /api/chaos`) supporting artificial latency, simulated HTTP 500 outages, and client-validation bypass to verify HTTP 422 server enforcement

### Planned Next Blocks
- **Block 2:** Instant Transfers (Pix & Wire) + real-time Statement integration
- **Block 3:** Smart Card Control (freeze/unfreeze, reveal credentials, invoice limit & card purchase simulator)
- **Block 4:** Statement filtering, receipt details, export, and expanded Chaos Monkey scenarios

## Running Locally

```bash
npm install
npm run typecheck
npm run dev