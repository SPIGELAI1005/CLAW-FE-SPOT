# Memory Bank — CLAW:FE SPOT (Project 02)

This is the curated memory for **Project 02**.

Goal: make it easy for someone (e.g., **Ewald**) to understand:
- what the product is,
- how the system works,
- what decisions were made,
- what is finished vs in progress,
- and how to safely continue development.

---

## Identity / naming
- **Project code:** 02
- **Brand:** CLAW:FE SPOT
- **Code slug:** CLAW-FE (`claw-fe`)
- **Tagline:** *One table. One truth. Audited outcomes.*

## Product intent (why this exists)
CLAW:FE SPOT is a Single Point Of Truth for multi-agent execution.

The product is not “a chat UI”. It is:
- **Tables** (workrooms with goal + acceptance criteria)
- **Runs** (execution attempts)
- **Artifacts** (exportable outcomes)
- **Audit Reports** (PASS/FAIL gate)

## Current implementation architecture
### Frontend
- Next.js App Router (Turbopack)
- Primary routes:
  - `/tables` (list)
  - `/tables/new` (create)
  - `/tables/[id]` (detail: runs + tasks)
  - `/login` (Supabase magic link)
  - `/recipes`, `/devices` (shell routes)

### Backend
- Supabase for:
  - authentication
  - Postgres DB
  - RLS policies to enforce owner-only access

### Server client pattern
- API routes call `createSupabaseServerClient()` and then `supabase.auth.getUser()`.
- All tables use an explicit `owner_id` and RLS policies using `auth.uid() = owner_id`.

## Database schema (canonical)
Schema is defined in: `OPENCLAW_CAFE/claw-fe/supabase/schema.sql`

### `tables`
- `id` uuid pk
- `owner_id` uuid
- `status` text (draft, running, needs_review, fix_required, done)
- `title` text
- `goal` text
- `acceptance_criteria` jsonb array of strings
- `constraints` jsonb array of strings
- timestamps + updated_at trigger

### `table_tasks` (checklist)
- `id` uuid pk
- `owner_id` uuid
- `table_id` uuid fk → tables
- `title` text
- `done` bool
- created_at

### `runs`
- `id` uuid pk
- `owner_id` uuid
- `table_id` uuid fk → tables
- `status` text (queued/running/needs_review/fix_required/done/canceled)
- `title` text
- `log` jsonb (timeline events)
- timestamps + updated_at trigger

### `audit_reports`
- `id` uuid pk
- `owner_id` uuid
- `table_id` uuid fk → tables
- `run_id` uuid fk → runs
- `passed` bool
- `summary` text
- `issues` jsonb (array of {title,severity,details,fix})
- created_at

### `artifacts` (planned)
- references `table_id` and optionally `run_id`

## Current feature status (as of 2026-02-06)
### Phase 1 — Tables MVP (DONE)
- `/tables` list loads from Supabase
- `/tables/new` creates a table
- `/tables/[id]` shows table detail
- Tasks checklist is interactive:
  - add tasks
  - toggle done/open

### Phase 2 — Runs + Logs (DONE)
- Runs list UI exists in table detail
- Runs API exists: `/api/tables/[id]/runs` (GET/POST)
- Orchestrator stub exists:
  - `PATCH /api/tables/[id]/runs { action: "simulate" }`
  - sets status to `needs_review`
  - appends log timeline events

### Phase 3 — Audit gate (IN PROGRESS)
- AuditReport foundation exists:
  - DB table `audit_reports`
  - API `GET/POST /api/tables/[id]/runs/[runId]/audit`
- Missing:
  - Audit UI
  - Fix loop and status transitions
  - Override done w/ reason

## Known issues / gotchas
- Supabase schema changes require manual apply via Supabase SQL editor.
- Next.js warnings:
  - `middleware.ts` convention deprecated (should switch to `proxy`)
  - Turbopack root inference warning due to multiple lockfiles
- ESLint warnings exist in `src/components/ui/Button.tsx` (unused vars) — not breaking.

## Developer workflow expectations
- For Project 02, George requested: **local commits only** until a dedicated GitHub repo is created.
- When a new [02] GitHub repo exists, migrate by exporting `OPENCLAW_CAFE/claw-fe` into it.

## Next execution plan (recommended)
1. Phase 3: implement Audit UI in `/tables/[id]` (view/create audit)
2. On audit FAIL → set run/table status `fix_required`
3. On audit PASS → set status `done`
4. Add override done with reason logging
