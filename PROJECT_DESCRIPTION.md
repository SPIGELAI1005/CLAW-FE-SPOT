# CLAW:FE SPOT — Project Description (Project 02)

**Brand:** CLAW:FE SPOT  
**Code / repo slug:** `claw-fe`  
**Project code:** **02**  
**Tagline:** *One table. One truth. Audited outcomes.*

## 1) What this product is
CLAW:FE SPOT is an iOS-inspired web app that provides a **Single Point Of Truth + Spotlight** for multi‑agent execution.

It’s built to solve a common failure mode in agent workflows:
- chat logs are messy,
- artifacts are scattered,
- nobody knows what “done” means,
- and there’s no reliable audit trail.

CLAW:FE SPOT makes the *unit of work* explicit and auditable.

## 2) Core concepts (mental model)
### Table
A **Table** is a “workroom” for one goal.
- **title**: human label
- **goal**: what outcome we want
- **acceptance criteria**: the checklist the Auditor will score against
- **constraints**: non‑negotiables (tone, privacy, limits)
- **status**: lifecycle state (draft → running → needs_review → fix_required → done)

### Task checklist
Inside a Table: lightweight checklist items (not a full task manager). This keeps the Table practical.

### Run
A **Run** is an execution attempt on a Table.
- Runs are the spine of the audit trail.
- Each Run has a **status** and a **log timeline**.

### Run log (timeline)
A chronological list of events (stored as `jsonb`) used to show progress and preserve “what happened”.

### Audit Report
An **Audit Report** is a structured verdict:
- **PASS/FAIL**
- **issues[]** (severity + fix instructions)
- optional **summary**

This is the “audit gate”: nothing is truly “Done” unless the audit passes (or the user explicitly overrides with a reason).

## 3) Product principles
1. **Artifacts > chat** — outcomes are the product.
2. **Audit gate** — done requires an audit pass (or explicit override with reason).
3. **Local-first execution** — runner will connect to OpenClaw on the user’s machine.
4. **Privacy by default** — minimal upload; explicit sharing.
5. **Premium UI** — calm, clean, Apple-ish.

## 4) Current architecture (as implemented)
### Frontend
- **Next.js App Router** (Turbopack)
- Pages:
  - `/tables` list
  - `/tables/new` create
  - `/tables/[id]` detail (tasks + runs)
  - `/recipes`, `/devices` (shell routes exist)
  - `/login` (Supabase magic link)

### Backend
- **Supabase Auth + Postgres + RLS**
- Server access uses `createSupabaseServerClient()` (cookies/session).

### Database entities (current)
- `tables` — Table metadata
- `table_tasks` — checklist items (per table)
- `runs` — execution attempts (per table) + `log` timeline
- `audit_reports` — PASS/FAIL + issues per run (Phase 3 foundation)
- `artifacts` — placeholder for future exportable outputs

## 5) Where the code lives (workspace)
- Project root (monorepo/workspace): `C:\Users\georg\.openclaw\workspace`
- CLAW-FE app: `OPENCLAW_CAFE\claw-fe\`

## 6) What is done vs in progress
### Completed
- **Phase 1 — Tables MVP**
  - tables list, create, detail
  - interactive checklist (add + toggle done)

- **Phase 2 — Runs + Logs**
  - runs API + runs UI
  - orchestration stub: “Simulate” run generates timeline log and moves to `needs_review`

- **Phase 3 — Audit gate (foundation)**
  - audit report DB model + API endpoints exist

### In progress / next
- **Phase 3 — Audit UI + fix loop flow**
  - UI to view audit report
  - ability to create audit (manual for now)
  - set `fix_required` when audit fails
  - set `done` when audit passes
  - “Override done” + reason logging

## 7) How to run locally
```bash
cd OPENCLAW_CAFE\claw-fe
npm install
npm run dev
```
- Login: `http://localhost:3000/login`
- Tables: `http://localhost:3000/tables`

## 8) Operational notes
- Supabase schema updates are in `supabase/schema.sql` and must be applied manually in Supabase SQL editor.
- Next.js currently warns about `middleware.ts` convention deprecation (should move to `proxy`).
- Build warning about multiple lockfiles can be fixed via `turbopack.root` or lockfile cleanup.
