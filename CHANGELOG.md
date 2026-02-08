# CLAW:FE SPOT — CHANGELOG (Project 02)

This changelog is meant to help a new contributor (e.g. **Ewald**) understand **what exists**, **what changed**, and **what is still missing**.

Format inspired by Keep a Changelog.

---

## [2026-02-08] GDPR Compliance, Login UX, Footer Social Links & Security Hardening

### Added
- **Privacy Policy page** (`/privacy`)
  - Full GDPR-compliant privacy policy covering all 14 required sections
  - Data controller identification, data categories, legal bases (Art. 6(1)), cookie policy, data retention, all GDPR rights (Arts. 15-21), data transfers and safeguards (SCCs), third-party services, data security, children's privacy, supervisory authority, and contact
  - Glass card styling consistent with the rest of the app
  - Responsive layout with header, dark mode toggle, and branded footer

- **Terms of Service page** (`/terms`)
  - Comprehensive ToS covering: acceptance, service description, user accounts, acceptable use, IP rights, certifications and immutability, AI agent interactions, privacy reference, limitation of liability, termination, modification, governing law (EU), and contact
  - Same glass card styling and branded footer

- **Cookie consent banner** (`src/components/gdpr/CookieConsent.tsx`)
  - GDPR-compliant cookie consent dialog shown on first visit
  - Three actions: "Accept all", "Essential only", "Customize preferences"
  - Expandable preferences panel with three cookie categories: Essential (always on), Analytics (opt-in), Functional (opt-in)
  - Persists choices in `localStorage`, dispatches `cookie-consent-update` event
  - Renders as fixed bottom dialog (`z-[9999]`), styled for both light and dark modes
  - Added to root `layout.tsx` — shows on every page

- **Footer social icons** across all 8 public pages
  - X (Twitter) icon linking to https://x.com/CO_FE_X (opens in new tab, `noopener noreferrer`)
  - Email icon linking to `mailto:spigelai@gmail.com`
  - Styled as 32x32 rounded buttons with hover effects matching design system

- **Footer legal links** across all 8 public pages (Landing, About, Features, How It Works, Security, Login, Privacy, Terms)
  - "Privacy Policy" and "Terms of Service" underlined links below copyright

- **Login page improvements**
  - Magic link instructions box: step-by-step guide (enter email → check inbox → click link), plus note about expiry and single-use
  - Legal consent line below form: "By signing in, you agree to our Terms of Service and Privacy Policy"
  - Email placeholder changed from `you@company.com` to `Write your email address`

### Changed
- **AppShell** — added `/privacy` and `/terms` to `BARE_ROUTES` (renders without app chrome)
- **Middleware** — added `/privacy` and `/terms` to `PUBLIC_ROUTES` (no auth required)

### Security Fixes (7 issues)
- **IDOR in inbox route** (HIGH) — `owner_id` no longer accepted from client body; derived from authenticated `user.id`
- **Missing L2 auditor authorization** (HIGH) — `/api/spots/[id]/certify` now verifies caller has `l2_meta_auditor` role via `spot_participants`
- **Missing L1 auditor authorization** (HIGH) — `/api/spots/[id]/verdicts` now verifies caller has `l1_auditor` role via `spot_participants`
- **AddParticipantBody validation** (MEDIUM) — Zod `.refine()` now requires at least one of `agent_id` or `user_id`
- **Vault 500 → 404** (MEDIUM) — `/api/vault/[id]` now returns 404 with generic message when spot not found (was leaking Supabase errors as 500)
- **Certifications UUID validation** (MEDIUM) — `GET /api/certifications?spot_id=` now validates UUID format before querying
- **Error message sanitization** (MEDIUM) — All critical API routes now return generic error messages to clients; full Supabase errors logged server-side only (inbox, certify, verdicts, certifications, participants)

---

## [2026-02-08] Mobile Responsiveness & Dark Mode Contrast Audit

### Fixed
- **Dark mode contrast** — systematic fix across all public pages
  - Replaced `dark:text-white/60` (~4:1 ratio) with `dark:text-stone-400` (6.6:1 — WCAG AA compliant) on 8 pages
  - Replaced `dark:text-white/55` with `dark:text-stone-400`
  - Replaced `dark:text-white/80` with `dark:text-stone-200` for heading subtext
  - Replaced `dark:text-white/70` with `dark:text-stone-300`
  - Fixed footer `dark:text-stone-500` → `dark:text-stone-400` on all public pages
  - Fixed `dark:text-stone-500` → `dark:text-stone-400` on content labels in SecurityClient and VerifyClient
  - Retained `dark:text-white/90` on headings (17.5:1 ratio — excellent)

- **Mobile responsiveness**
  - `VaultClient` — search input now full-width on small screens (`w-full flex-1 sm:max-w-xs`)
  - `VaultDetailClient` — export buttons wrapped in `flex flex-wrap gap-2` for mobile
  - `PageHeader` — children container now supports `flex-wrap` for button wrapping

### Verified
- Production build passes cleanly (36 pages, exit code 0, no 404s)
- Navigation components (Sidebar, TopBar, BottomTabs) confirmed mobile-responsive

---

## [2026-02-08] Supabase Email Templates

### Added
- **Custom email templates** (`supabase/email-templates/`)
  - `magic-link.html` — branded magic link sign-in email
  - `confirm-signup.html` — welcome & email confirmation email with feature highlights and quick-start guide
  - `reset-password.html` — password reset email
  - `README.md` — setup instructions (Supabase Dashboard, `config.toml`, Management API), template variables, and design tokens
  - All templates feature: CLAW:FE SPOT logo with amber "CLAW" accent, three-role badges (Member / Pilot / Agent), dark mode support via `@media (prefers-color-scheme: dark)`, Outlook MSO compatibility, and consistent design tokens matching the app

### Fixed
- **Email logo rendering** — replaced CSS `background-clip: text` gradient (not supported by email clients) with solid amber color (`#d97706`) for "CLAW" text across all templates
- **Broken lock icon** — replaced base64-encoded SVG `<img>` in magic-link template with Unicode lock character (`&#128274;`) for universal email client compatibility

---

## [2026-02-08] Help & FAQ, Custom 404, Mobile Bar Redesign & Dashboard Refinements

### Added
- **Help & FAQ page** (`src/app/faq/`)
  - Comprehensive FAQ with 6 categorized sections: Getting Started, Roles & Personas, Security & Certification, Inbox & Approvals, CLI & Terminal, Account & Settings
  - Real-time search filtering across all questions and answers
  - Expand all / Collapse all controls with smooth CSS grid-template-rows accordion animation
  - Bug report form with subject, category dropdown (9 categories), description, steps to reproduce, and submission feedback
  - Added to sidebar navigation below Settings with question-mark icon
  - Includes `loading.tsx` and `error.tsx` for proper loading/error states

- **Custom 404 page** (`src/app/not-found.tsx`)
  - Branded design with animated gradient "404" badge
  - Glass-styled navigation buttons (Go to Dashboard, Back to Home)
  - Quick navigation links section (SPOTs, Agents, Inbox, Vault, Settings, Help & FAQ)
  - Replaces Next.js default unstyled 404 page

- **Help & FAQ in TopBar dropdown** — added "Help & FAQ" link to the user menu dropdown with separator

### Changed
- **Mobile bottom tab bar** (`BottomTabs.tsx`) — completely redesigned
  - **Dual-state icons**: outline when inactive, filled with translucent background when active
  - **Home icon**: house with coffee steam wisps rising from chimney (active state)
  - **SPOTs icon**: workspace table with dashed coffee-ring "spot" accent (active state)
  - **Inbox icon**: tray with notification dot accent (active state)
  - **Vault icon**: shield with checkmark + subtle certified glow ring (active state)
  - **More icon**: custom crab with claws, body, eyes, and legs (CLAW brand motif)
  - **Active state**: persona-colored glow backdrop, 110% icon scale, bold label, gradient indicator pill
  - **Tab bar**: frosted glass with `backdrop-blur-2xl`, soft top shadow, safe-area bottom padding for notched devices
  - "More" tab now highlights for `/faq`, `/cli`, `/roles`, `/agents` in addition to `/settings`

- **Top bar** (`TopBar.tsx`) — refined icon design
  - All icons extracted into named components for clarity and consistency
  - Terminal icon with subtle coffee steam curls (brand accent)
  - Moon icon with tiny star accent for dark mode
  - Dark/light toggle hover glows amber instead of generic grey
  - Button text ("New SPOT", "Terminal") hides on very narrow mobile screens (<380px)
  - Dropdown hover states use amber tones matching brand palette

- **Middleware** (`src/middleware.ts`)
  - Added `/faq` to `PROTECTED_PREFIXES` — unauthenticated users now properly redirect to login

- **Settings page** (`src/app/settings/SettingsClient.tsx`)
  - Added `catch` clauses to both load and save `fetch` calls — prevents unhandled promise rejection errors during dev server HMR restarts

- **Dashboard refinements** (from previous session)
  - Animated background (tables and crabs) in "Your daily brief" section
  - Gradient fade transition on animation container
  - Collapsible sidebar with crab icon in collapsed state
  - Professional coffee icons (espresso, latte, cappuccino) in greeting
  - Summary message starts with "You have..."
  - Discuss and Execute cards equal height

---

## [2026-02-07] Responsive Design, Mobile Menu & Login Page Redesign

### Added
- **CrabCoffeeToggle component** (`src/components/ui/CrabCoffeeToggle.tsx`)
  - Animated SVG menu toggle that morphs between a crab (closed, representing CLAW) and a coffee cup (open, representing SPOT)
  - Smooth 500ms CSS transitions with scale + rotation; uses the brand gradient
  - Includes animated steam curls on the coffee cup state

- **Mobile navigation menu** (landing page)
  - Dropdown menu triggered by the CrabCoffeeToggle, visible on screens below `md:` breakpoint
  - Slide-in animation (`animate-mobile-menu-in`), body scroll lock when open
  - Auto-closes on resize to desktop; nav links close menu on click
  - Includes "Sign in" and "Get Started" CTAs for mobile

- **Login page redesign** (`src/app/login/page.tsx`)
  - Added `AnimatedBackground` canvas matching the landing page
  - "Back to home" pill button with frosted glass styling and arrow icon
  - Login form wrapped in a hero-style frosted glass container
  - "CLAW Federation : Coffee Spot" subtitle under the logo with gradient highlights
  - Input field updated to translucent glass style

- **CSS animations** (`globals.css`)
  - `steam-rise` keyframes for coffee cup steam animation
  - `mobile-menu-in` keyframes for mobile menu slide-in

### Changed
- **Responsive typography across all landing page sections**
  - Hero: `text-3xl` base → `sm:5xl → md:6xl → lg:7xl`; smaller padding/margins on mobile
  - All section headings: `text-2xl` base → `sm:3xl → md:4xl`
  - Section padding: `py-16` mobile → `sm:py-24` → `md:py-32`; `px-4` mobile → `sm:px-6`
  - Cards: `rounded-2xl p-6` mobile → `sm:rounded-3xl sm:p-10`
  - Buttons: full-width on mobile, auto-width on `sm:`
  - Header: `h-14` mobile → `sm:h-16`; Sign in/Get Started hidden on mobile (in menu)
  - Three Roles subtitle: responsive text sizing for long gradient line
  - Trust bar: smaller text and padding on mobile

- **Footer** — added "CLAW Federation : Coffee Spot" subtitle under logo with gradient on "CLAW" and "Coffee"

- **PageHeader component** — title scales `text-lg → sm:xl → md:2xl` for better mobile readability

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
- Runs UI shows the timeline log and includes "Simulate" for queued runs

### Notes
- Supabase schema updates live in `OPENCLAW_CAFE/claw-fe/supabase/schema.sql` and must be applied manually.
- `npm run build` is green after these changes.
- Next.js warnings exist (middleware/proxy + turbopack root inference) but do not block development.
