# CLAW:FE SPOT — CHANGELOG (Project 02)

This changelog is meant to help a new contributor (e.g. **Ewald**) understand **what exists**, **what changed**, and **what is still missing**.

Format inspired by Keep a Changelog.

---

## [Unreleased]

### Added (Phase 3 foundation)
- **Audit reports DB model** (`audit_reports`)
  - Owner-only RLS policies
  - Fields: passed, summary, issues(jsonb)
- **Audit types** (`src/lib/auditTypes.ts`)
  - `AuditReport`, `AuditIssue` with severity
- **Audit API**
  - `GET /api/tables/[id]/runs/[runId]/audit` (latest report)
  - `POST /api/tables/[id]/runs/[runId]/audit` (create report)

### Changed
- Runs API now includes `log` in selections.

### Still missing (work to do)
- (Optional polish) Show audit history (not just latest report)
- (Optional polish) Show status override history + exportable audit trail

---

## [2026-02-06]

### Added — Phase 1: Tables MVP
- Tables list (Supabase-backed)
  - `GET /api/tables`
  - `/tables` list page with status filter + search
- Create table flow
  - `/tables/new` UI
  - `POST /api/tables`
- Table detail (Supabase-backed)
  - `/tables/[id]` shows title/status/goal + acceptance criteria + constraints

### Added — Interactive tasks checklist
- Tasks API
  - `GET /api/tables/[id]/tasks`
  - `POST /api/tables/[id]/tasks`
  - `PATCH /api/tables/[id]/tasks` (toggle done)
- Tasks UI
  - Add task
  - Toggle done/open

### Added — Phase 2: Runs + Logs
- Runs model (DB)
  - `runs` table with `status`, `title`, `log` jsonb
- Runs API
  - `GET/POST /api/tables/[id]/runs`
- Runs UI
  - Runs list on `/tables/[id]`
  - Create run button

### Added — Orchestrator stub (simulation)
- `PATCH /api/tables/[id]/runs` action `simulate`
  - appends timeline events to `log`
  - moves run status to `needs_review`
- Runs UI shows the timeline log and includes “Simulate” for queued runs

### Notes
- Supabase schema updates live in `OPENCLAW_CAFE/claw-fe/supabase/schema.sql` and must be applied manually.
- `npm run build` is green after these changes.
- Next.js warnings exist (middleware/proxy + turbopack root inference) but do not block development.
