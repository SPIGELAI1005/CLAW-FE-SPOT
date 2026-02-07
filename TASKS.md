# CLAW-FE — TASKS

Legend: **NOW** / NEXT / LATER / DONE

## NOW (Phase 0–1: Foundation + Tables MVP)

### cf-000 Setup & branding
- [x] cf-000a Confirm backend strategy (Supabase vs local SQLite) (decision)
- [x] cf-000b Update branding: CLAW-FE (code) + CLAW:FE SPOT (brand) + tagline
- [x] cf-000c Add minimal navigation shell (Top bar + sidebar) with iOS-inspired styling
- [x] cf-000d Add routes that exist: /tables /recipes /devices (no 404)

### cf-010 Data model (Tables)
- [x] cf-010a Define Table types (zod + TS): status, title, goal, acceptanceCriteria, constraints, createdAt
- [x] cf-010b Define Task checklist item type (within Table)
- [x] cf-010c Define Artifact manifest type (placeholder for now)

### cf-020 Tables UI
- [x] cf-020a /tables list page (filters by status, search)
- [x] cf-020b Create Table flow (modal or page)
- [x] cf-020c /tables/[id] detail: Overview + Tasks sections
- [x] cf-020d iOS-style components: Button, Card, SegmentedControl, Badge, EmptyState
- [x] cf-020e Interactive Tasks checklist (add + toggle done)

## NEXT (Phase 2–4: Runs, Audit, Recipes)

### cf-030 Runs + logs
- [x] cf-030a Run model + status machine (queued/running/needs-review/fix-required/done)
- [x] cf-030b Run timeline UI in table detail
- [x] cf-030c Basic orchestrator stub (no runner yet): create run + simulate steps

### cf-040 Audit gate
- [x] cf-040a AuditReport model (PASS/FAIL + issues[])
- [x] cf-040b Audit UI tab + “Fix required” flow
- [x] cf-040c “Override done” with reason logging

### cf-050 Recipes
- [x] cf-050a Recipes list/create/edit
- [x] cf-050b Create table from recipe
- [x] cf-050c Version recipes

## LATER (Phase 5+ Runner, permissions, X posts recipe)

### cf-060 Devices + runner protocol
- [ ] cf-060a Device registration + token
- [ ] cf-060b Runner heartbeat + capability reporting
- [ ] cf-060c Run dispatch: runner pulls run payload
- [ ] cf-060d Artifact upload pipeline + selective upload modes

### cf-070 Permissions & privacy
- [ ] cf-070a Permission profile schema (FS allowlist, network allowlist, browser allowlist)
- [ ] cf-070b Permission prompts in UI

### cf-080 X posts recipe (Write 20 posts)
- [ ] cf-080a Prompt templates: Driver/Writer/Editor/Auditor
- [ ] cf-080b Artifact export: posts.md + schedule.md
- [ ] cf-080c Audit checks: uniqueness, length, CTA, claim hygiene

## DONE
- [x] Project scaffold created (Next.js + Tailwind)
- [x] App renamed to claw-fe (package + folder)
- [x] Homepage updated with tagline + basic product hero
