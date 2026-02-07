# CLAW:FE SPOT — Project Plan

**Brand:** CLAW:FE SPOT  
**Code name / repo slug:** CLAW-FE  
**Tagline:** *One table. One truth. Audited outcomes.*

## Product goal
Create a modern, beautiful (Apple iOS-inspired), easy-to-use web app that acts as a **Single Point Of Truth + Spotlight** for multi-agent execution:
- Users create **Tables** (workrooms) to solve real tasks.
- Multiple agents collaborate with clear roles.
- An **Auditor** produces a structured pass/fail report.
- The system preserves a trustworthy record: artifacts, decisions, run logs.

## Guiding principles
1. **Artifacts > chat.** Conversation exists, but outcomes are king.
2. **Audit gate.** Nothing is “Done” without an audit pass (or explicit user override).
3. **Local-first execution.** Agents run on the user’s own machine via a local runner.
4. **Privacy by default.** Minimal upload; explicit sharing.
5. **Premium UI.** Calm, high-contrast, spacious layout; subtle motion; crisp typography.

## Architecture (target)
### Components
1. **CLAW-FE Web (Next.js App Router)** — UI + orchestration + storage
2. **CLAW-FE Runner (local)** — connects from user machine, executes runs via OpenClaw
3. **Data store** — TBD (Supabase recommended for speed, or Postgres/SQLite)
4. **Artifact store** — object storage (Supabase storage / S3-compatible)

### Execution model
- Web creates a **Run** with role prompts + permissions.
- Runner pulls run instructions, executes via OpenClaw sessions, streams logs/artifacts.
- Auditor role runs last, produces a structured report.

## Full feature set (target)
### Tables (core)
- Create/edit/archive tables
- Goal + acceptance criteria + constraints
- Role assignment (Driver/Writer/Editor/Researcher/Auditor)
- Task checklist inside table
- Table status flow: Draft → Running → Needs Review → Fix Required → Done

### Runs + Orchestration
- Start run, cancel run, re-run
- Iteration loop: audit findings → fixes → re-audit
- Run log timeline
- Role-based contributions

### Artifacts
- Artifact manifest (type, file, link, text)
- Upload/download, versioned artifacts
- Export bundle (ZIP/MD/PDF) per run or per table

### Audit
- Structured audit report: PASS/FAIL, issues, severity, fix instructions
- Compare run outputs vs acceptance criteria
- “Override and mark done” with user reason

### Recipes / Templates
- Recipe library (private + shareable later)
- Create recipe from a table
- Versioning + changelog
- Suggested roles, prompts, and audit checklist per recipe

### Devices / Runner
- Register devices
- Online/offline health and capabilities
- Per-device permission presets

### Permissions + Privacy
- Per-table permission profile:
  - filesystem allowed paths
  - network allowed domains
  - browser allowlist
- Data handling modes:
  - local-only artifacts (cloud stores metadata)
  - selective upload
  - full sync

### UI/UX (Apple iOS-inspired)
- Clean typography, soft cards, subtle shadows
- Segmented controls for status filters
- Timeline view for runs
- Spotlight cards: “what changed”, “wins”, “next action”
- Beautiful empty states + guided onboarding

## Phased delivery (execute one-by-one)
### Phase 0 — Foundations (now)
- Project skeleton, branding, baseline UI kit

### Phase 1 — Tables MVP (usable)
- Tables CRUD, statuses, table detail view, tasks checklist

### Phase 2 — Runs + Logs
- Create run objects, run timeline, manual status updates

### Phase 3 — Audit gate
- Audit report model + UI, fix loop flow

### Phase 4 — Recipes
- Recipes CRUD, apply recipe to new table

### Phase 5 — Devices/Runner integration
- Device registration, runner heartbeat, run dispatch protocol

### Phase 6 — Real “Write 20 X posts” recipe
- Writer + Editor + Auditor prompt templates + artifact export

### Phase 7 — Polish + benchmark UI
- Motion, icons, responsive, dark mode perfection

## Decisions needed (when you’re ready)
1. Backend choice: **Supabase** (fast) vs local SQLite first.
2. Auth scope: personal-only vs multi-user.
3. Artifact privacy mode defaults.
