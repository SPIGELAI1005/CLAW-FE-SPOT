# CLAW:FE SPOT — CHANGELOG (Project 02)

This changelog is meant to help a new contributor (e.g. **Ewald**) understand **what exists**, **what changed**, and **what is still missing**.

Format inspired by Keep a Changelog.

---

## [2026-02-07] Landing Page Polish — Unified Visual Identity

### Added
- **Reusable `Logo` component** (`src/components/ui/Logo.tsx`)
  - Text-based logo replacing SVG image logos across all pages
  - "CLAW" rendered in animated orange-rose gradient, ":FE SPOT" in standard text color
  - Used in: landing page header/footer, sidebar, login page

- **Animated gradient text** (`globals.css` → `.gradient-text-animated`)
  - Smooth 8-second shimmer animation cycling amber → orange → rose
  - Applied to all section heading highlights and the Logo component
  - Matches existing `gradient-shift` animation pattern used by buttons

### Changed
- **Landing page section headings** — unified style across all sections
  - "Everything you need for supervised AI execution" → bold `<h2>` with gradient highlight on "supervised AI execution"
  - "Security is not a feature — It's the foundation" → rewritten as "Security is not a feature. It's the foundation." with gradient on "Security" and "foundation"
  - "Command Your Workspace" → small uppercase label style (matching "Quick Start")
  - Added gradient highlight to subtitle text: "Powerful as an enterprise audit", "Independence at every layer…", "Clear boundaries"
  - Added gradient highlight to CTA: "collaborate with confidence?"

- **Frosted glass consistency** — unified card transparency across all sections
  - "Talk freely" (DISCUSS) and "Act with confidence" (EXECUTE) mode cards now use the same `bg-white/[0.07]` + `backdrop-blur-[6px]` glass style as other cards
  - CTA section ("Ready to collaborate with confidence?") switched from opaque dark background to glass transparency
  - Removed section-level frosted glass from Features and Security sections (kept on cards only)
  - Updated text colors in mode cards and CTA to `white/90`, `white/60`, `white/70` for consistency

- **"Two modes. Clear boundaries."** — split to two lines with gradient on "Clear boundaries"

- **Removed** subtitle paragraph "From discussion to certification…" from Features section

---

## [2026-02-07] Complete UI/UX Redesign — SPOT Collaboration Model

### Added
- **New AppShell** (`src/components/AppShell.tsx`, `Sidebar.tsx`, `BottomTabs.tsx`)
  - Desktop: Left sidebar with 6 nav items (Home, SPOTs, Agents, Inbox, Audit Vault, Settings), active state highlighting, user avatar + sign out
  - Mobile: Bottom tab bar with 5 items (Home, SPOTs, Inbox, Vault, More)
  - Clean, professional layout with proper content area

- **New Type System** (`src/lib/spotTypes.ts`)
  - `Spot`, `SpotContract`, `SpotParticipant`, `SpotMessage`, `ToolCall`
  - `Agent`, `InboxItem`, `L1VerdictRecord`, `L2Report`
  - `SpotMode` (discuss/execute), `CertificationStatus`, `ParticipantRole`
  - Zod schemas for runtime validation of all types

- **New Routes + Pages**
  - `/` — Home ("Coffee Brief"): greeting, active SPOTs, pending approvals, notifications
  - `/spots` — SPOT List: filterable (All/Discuss/Execute/Certified/Needs Action), searchable
  - `/spots/new` — Create SPOT: title + goal + mode selection
  - `/spots/[id]` — SPOT Workspace: 3-panel layout (conversation + contract + timeline)
  - `/agents` — Agent directory: searchable grid of agent cards
  - `/agents/[id]` — Agent profile: skills, tools, trust level, certified outcomes
  - `/inbox` — Inbox: tabs (All/Invites/Contracts/Approvals), action buttons
  - `/vault` — Audit Vault: browse immutable logs, export JSON/PDF
  - `/vault/[id]` — SPOT Audit Detail: L1/L2 summaries, certification view, immutable log
  - `/settings` — Settings: profile, preferences, API keys, danger zone

- **SPOT Workspace Components**
  - `ConversationPanel` — message list with human/agent/system bubble variants + input
  - `ContractPanel` — contract display (scope, tools, data, criteria) + roles + status actions
  - `ActionTimeline` — chronological tool call cards with L1 decisions + outcomes

- **Gating Logic** (`src/lib/spotGating.ts`)
  - `checkExecuteGating()` — enforces contract + L1 requirement for DISCUSS→EXECUTE
  - `checkCertificationGating()` — enforces EXECUTE mode + L2 for certification
  - `checkToolExecution()` — enforces EXECUTE mode + allowed tools list

- **New UI Components**
  - `ModeBadge` (DISCUSS blue / EXECUTE amber)
  - `CertBadge` (Uncertified/Certified/Rework/Lockdown/Human Escalation)
  - `SpotCard` — spot summary card with mode + cert badges
  - `AgentCard` — agent card with trust bar + skills + actions
  - `CertificateView` — final certificate for non-technical users
  - `Avatar` — user/agent avatar with initials fallback + online indicator
  - `EmptyState` — icon + message + CTA for empty lists
  - `Tabs` — horizontal tab navigation with count badges
  - `Input` / `Textarea` — form primitives with labels + error states
  - `PageHeader` — title + subtitle + action buttons
  - `Badge` — extended with `info` + `certified` tones

- **API Routes**
  - `GET /api/spots` — list all spots
  - `POST /api/spots` — create spot (validated with Zod)
  - `GET /api/spots/[id]` — get spot details
  - `PATCH /api/spots/[id]` — update spot (mode, cert status, contract)

- **Zod Validation Schemas** (`src/lib/validations.ts`)
  - `CreateSpotBody`, `PatchSpotBody`

- **Supabase Migration** (`supabase/migrations/002_spot_model.sql`)
  - Extended `tables` with `mode`, `certification_status`, `contract` JSONB
  - New tables: `spot_participants`, `spot_contracts`, `agents`, `inbox_items`
  - New immutable tables: `l1_verdicts`, `l2_reports` (SELECT + INSERT only)
  - RLS policies for all new tables
  - Performance indexes

- **Tests** (60 total, all passing)
  - `spot-validations.test.ts` — 11 tests for CreateSpotBody/PatchSpotBody
  - `spot-gating.test.ts` — 13 tests for execute gating, certification gating, tool execution
  - Updated `auth-redirect.test.ts` — redirect fallback updated to `/`

### Changed
- `AppShell` — rewritten with sidebar + bottom tabs layout
- `globals.css` — new design tokens for sidebar, bottom tabs, scrollbar styling
- `middleware.ts` — protected routes updated to include `/spots`, `/agents`, `/inbox`, `/vault`, `/settings`
- `auth/callback/route.ts` — default redirect changed from `/tables` to `/`
- `AuthGate` — updated copy for SPOT terminology
- `Badge` component — added `info` and `certified` tone variants
- `Button` component — added `danger` variant

### Removed
- `/tables` pages (TablesClient, NewTableClient, TableRunsClient, TableTasksClient, OverrideDoneClient)
- `/recipes` pages (RecipesClient, NewRecipeClient, RecipeDetailClient)
- `/devices` page
- Old marketing homepage

---

## [2026-02-07] Security Hardening & Engineering Quality

### Added
- **Active middleware** (`src/middleware.ts`)
  - Session refresh on every request (Supabase cookie sync)
  - Route protection: `/tables`, `/recipes`, `/devices`, `/cli` require authentication
  - Redirects unauthenticated users to `/login?next=...`
- **Security headers** (applied in middleware to every response)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (camera, mic, geo disabled)
  - `Content-Security-Policy` (self + Supabase domain)
  - `Strict-Transport-Security` (HSTS)
- **Zod validation** at all API mutation boundaries (`src/lib/validations.ts`)
  - Every POST/PATCH API route now validates request bodies with Zod
  - Schemas: `CreateTableBody`, `CreateTaskBody`, `PatchTaskBody`, `CreateRunBody`, `PatchRunBody`, `CreateAuditBody`, `CreateOverrideBody`, `CreateRecipeBody`, `UpdateRecipeBody`
  - `parseBody()` helper returns structured `ParseResult<T>` with type-safe narrowing
- **Open redirect fix** in auth callback (`src/app/auth/callback/route.ts`)
  - `next` parameter validated to be relative path only (no protocol, no host)
- **AuthGate** wrapping on all protected list pages
  - `/tables`, `/tables/new`, `/recipes`, `/recipes/new`
- **CI pipeline** (`.github/workflows/ci.yml`)
  - TypeScript typecheck, ESLint, Vitest tests, Next.js build
  - Runs on push/PR to main
- **Test suite** (Vitest, 36 tests)
  - `src/lib/__tests__/validations.test.ts` — 26 tests for all Zod schemas + `parseBody`
  - `src/lib/__tests__/auth-redirect.test.ts` — 10 tests for open-redirect prevention
- **RLS audit trail lockdown** (`supabase/migrations/001_lock_immutable_tables.sql`)
  - Removed UPDATE/DELETE policies from `audit_reports`, `status_overrides`, `recipe_versions`
  - These tables are now append-only (immutable records)

### Changed
- `proxy.ts` → `src/middleware.ts` (properly activated for Next.js)
- `package.json`: added `test` and `typecheck` scripts
- `supabase/schema.sql`: removed UPDATE/DELETE policies from immutable tables

### Removed
- `proxy.ts` (replaced by `src/middleware.ts`)
- `src/middleware.legacy.ts` (superseded)

### Still missing (work to do)
- Loading skeletons for list pages
- Rate limiting on API routes
- Real-time subscriptions for live updates
- Comprehensive E2E tests (Playwright)
- Full Supabase integration for all new tables (currently using demo data for agents, inbox, vault)
- Actual L1/L2 agent integration (currently UI placeholders)

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
- Dev server defaults to **webpack** (`next dev --webpack`) to avoid Turbopack root/lockfile inference issues in the larger workspace.

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
