# CLAW:FE SPOT — Project Status

_Last updated: 2026-02-07_

## TL;DR
- Next.js app skeleton is in place (routes + API).
- Supabase schema + RLS policies exist (`supabase/schema.sql`).
- Dev server currently runs best with **webpack** (`npm run dev` uses `next dev --webpack`).

## What works
- Pages: `/login`, `/tables`, `/tables/new`, `/recipes`, `/devices`
- API routes present:
  - `/api/tables`
  - `/api/tables/[id]`
  - `/api/tables/[id]/tasks`
  - `/api/tables/[id]/runs`
  - `/api/tables/[id]/runs/[runId]/audit`
  - `/api/tables/[id]/override`

## Current blockers / needs confirmation
- Supabase SQL schema must be applied in the Supabase SQL editor.
- Need an authenticated browser session to fully smoke-test the CRUD flows.
- OpenClaw gateway restart is currently disabled; enabling it will let the agent recover browser automation issues.

## Next actions
1) Apply `supabase/schema.sql` (Supabase SQL editor)
2) Login once via `/login` and confirm `/tables` works
3) Run end-to-end smoke test: create table → tasks → run simulate → audit → override
4) Add zod validation for API POST/PATCH bodies
