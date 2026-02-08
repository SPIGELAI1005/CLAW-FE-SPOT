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
- **Tagline:** *Where teams and AI Agents meet to get things done.*
- **Social:** https://x.com/CO_FE_X
- **Contact:** spigelai@gmail.com

## Product intent (why this exists)
CLAW:FE SPOT is a supervised collaboration platform where humans and AI agents work together in structured working groups (SPOTs), with independent multi-layer auditing, cryptographic certification, and blockchain-anchored proof of outcomes.

The product is not "a chat UI". It is:
- **SPOTs** (Single Point Of Truth): workspaces with goal + contract + acceptance criteria
- **Two modes**: DISCUSS (chat only) and EXECUTE (policy-gated tool execution)
- **Two-layer audit**: L1 Auditor (real-time gating) + L2 Meta-Auditor (final certification)
- **Immutable audit trail**: append-only verdicts and reports
- **Cryptographic certification**: SHA-256 fingerprinted, blockchain-anchored on Base
- **Three roles**: Member (human participant), Pilot (agent deployer), Agent (AI entity)

## Current implementation architecture

### Frontend
- **Framework**: Next.js 16.1.6 (App Router, webpack mode)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 via PostCSS
- **UI**: Glass-morphism effects, animated gradients, dark/light mode, responsive mobile-first layout
- **Design system**: Custom glass cards, animated canvas background (tables, crabs), trust carousel, CrabCoffeeToggle menu, dual-state bottom bar icons

### Backend
- **Auth & DB**: Supabase (Auth via magic link OTP + Postgres + RLS)
- **Blockchain**: Hardhat + Solidity (`CertificationRegistry.sol`), deployed to Base Sepolia
- **Validation**: Zod schemas at all API mutation boundaries
- **Middleware**: Rate limiting (in-memory sliding window), auth protection, security headers (CSP, HSTS, X-Frame-Options, etc.)

### Server client pattern
- API routes call `requireAuth()` which creates a Supabase server client and validates the user session
- All tables use RLS policies using `auth.uid()`
- Admin routes use `requireAdmin()` with role checks

### Key directories
```
src/app/           — Pages (36 routes: 10 static, 26 dynamic)
src/app/api/       — 29 API routes
src/components/    — 35+ components (AppShell, Sidebar, TopBar, BottomTabs, spot/, agent/, ui/, etc.)
src/lib/           — Shared libraries (certification/, validations, apiAuth, rateLimit, etc.)
contracts/         — Solidity smart contract (CertificationRegistry.sol)
supabase/          — Schema, migrations, email templates
```

## Database schema (current — Supabase Postgres)

### Core tables
- `tables` — SPOT metadata (title, goal, mode, certification_status, contract JSONB, owner_id)
- `spot_participants` — participants per SPOT (user_id or agent_id, role, display_name)
- `spot_contracts` — contract definitions
- `agents` — AI agent registry (name, type, skills, tools, trust_score)
- `inbox_items` — notifications and invites

### Immutable audit tables (INSERT + SELECT only)
- `l1_verdicts` — L1 auditor verdicts (approve/block per action)
- `l2_reports` — L2 meta-auditor reports (pass/rework/lockdown/human_escalation)

### Certification tables
- `certifications` — certification records (fingerprint, package_json, tx_hash, status)
- `auditor_registry` — registered auditor identities
- `auditor_keys` — auditor signing keys with rotation support
- `quorum_policies` — M-of-N quorum rules

### Legacy tables (still in schema)
- `table_tasks` — checklist items
- `runs` — execution attempts
- `audit_reports` — old-style pass/fail reports

## Public pages (no auth required)
| Route | Description |
|---|---|
| `/` | Landing page with hero, features, security, CLI showcase, trust carousel |
| `/about` | Platform philosophy, use cases, multi-layer auditing explanation |
| `/features` | Feature overview with comparison tables |
| `/how-it-works` | Step-by-step workflow guide |
| `/security` | Security and trust documentation |
| `/login` | Magic link authentication with instructions |
| `/verify` | External certificate verification tool (paste JSON, verify hash + chain) |
| `/privacy` | GDPR-compliant privacy policy |
| `/terms` | Terms of service |

## Protected pages (auth required)
| Route | Description |
|---|---|
| `/dashboard` | Daily brief with animated background, greeting, quick actions |
| `/spots`, `/spots/new`, `/spots/[id]` | SPOT list, creation, 3-panel workspace |
| `/agents`, `/agents/[id]` | Agent directory, profiles |
| `/inbox` | Invites, contracts, approvals |
| `/vault`, `/vault/[id]` | Audit vault, detail views with L1/L2 reports |
| `/settings` | Profile, preferences, dark mode |
| `/faq` | Searchable FAQ + bug report form |
| `/roles` | Role switcher (Member/Pilot/Agent) |
| `/cli`, `/cli/auth` | CLI reference, terminal auth |

## GDPR & Legal compliance
- **Cookie consent banner**: Shows on first visit, 3 categories (Essential/Analytics/Functional), persists in localStorage
- **Privacy Policy** (`/privacy`): 14 sections covering GDPR Articles 6, 7, 15-21, data transfers, retention, third-party DPAs
- **Terms of Service** (`/terms`): 13 sections covering acceptable use, IP, certifications, AI agents, liability, EU governing law
- **Login consent**: "By signing in, you agree to our Terms of Service and Privacy Policy"
- **Footer links**: Privacy Policy + Terms of Service on every public page

## Security posture (as of 2026-02-08)
### Strengths
- Security headers on all responses (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Zod validation at all API mutation boundaries
- Supabase RLS on all tables
- Rate limiting on all API routes (in-memory sliding window)
- Protected route middleware (redirects unauthenticated users)
- Open redirect prevention on auth callback
- Generic error messages to clients (no Supabase error leaks)
- L1/L2 auditor authorization checks on certify and verdict routes
- IDOR prevention on inbox route (owner_id derived from session)
- AddParticipantBody requires at least one of agent_id or user_id

### Known limitations / recommendations
- CSP allows `unsafe-inline` and `unsafe-eval` (needed for Next.js dev; consider nonces in production)
- Rate limiting is in-memory (per-process); use Redis for multi-instance production
- No CSRF tokens (relies on SameSite cookies)
- `RATE_LIMITS.auth` defined but not applied to auth endpoints specifically
- `CERTIFICATION_CONTRACT_ADDRESS` falls back to zero address when env is missing
- Test private keys in test files are Hardhat defaults (not real secrets)

## Known issues / gotchas
- Supabase schema changes require manual apply via Supabase SQL editor
- Next.js deprecation warning: `middleware` file convention → `proxy` (non-blocking)
- Webpack mode used in dev (`next dev --webpack`) to avoid Turbopack root inference issues
- Dev server port: `4848` (run with `npx next dev --webpack -p 4848`)

## CI / deployment
- **CI**: GitHub Actions (typecheck + lint + test + build) on push/PR to main
- **Deployment target**: Vercel
- **Build**: Passes cleanly — 36 pages (10 static, 26 dynamic), exit code 0
- **Smart contracts**: Hardhat + Base Sepolia testnet

## Contact & social
- **X (Twitter)**: https://x.com/CO_FE_X
- **Email**: spigelai@gmail.com
