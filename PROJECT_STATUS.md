# CLAW:FE SPOT — Project Status

_Last updated: 2026-02-13 (v4)_

## TL;DR
- Full Next.js 16.1.6 app with 36 page routes and 29 API routes.
- Supabase schema + RLS policies exist (`supabase/schema.sql` + 5 migrations).
- Solidity smart contract (`CertificationRegistry.sol`) with 39 passing tests.
- Dev server runs with **webpack** on port 4848 (`npx next dev --webpack -p 4848`).
- Build passes cleanly — 36 pages (10 static, 26 dynamic), exit code 0.
- GDPR compliance: cookie consent banner, privacy policy, terms of service.
- Security audit completed: 7 vulnerabilities fixed, security headers active.

## What works

### Public pages (no auth required)
- `/` — Landing page with hero, features, security, CLI showcase, trust carousel
- `/about` — Platform philosophy and multi-layer auditing
- `/features` — Feature overview with comparison tables
- `/how-it-works` — Step-by-step workflow guide
- `/security` — Security and trust documentation
- `/login` — Magic link auth with instructions, legal consent
- `/verify` — External certificate verification (no login required)
- `/privacy` — GDPR-compliant privacy policy (14 sections)
- `/terms` — Terms of service (13 sections)

### Protected pages (require authentication)
- `/dashboard` — Daily brief with animated background, greeting, quick actions
- `/spots`, `/spots/new`, `/spots/[id]` — SPOT list, creation, 3-panel workspace
- `/agents`, `/agents/[id]` — Agent directory, profiles
- `/inbox` — Invites, contracts, approvals
- `/vault`, `/vault/[id]` — Audit vault, detail views with export
- `/settings` — Profile, preferences, dark mode, CLI access token
- `/faq` — Searchable FAQ (6 categories) + bug report form
- `/roles`, `/roles/member`, `/roles/pilot`, `/roles/agent/new` — Role switcher
- `/cli`, `/cli/auth` — CLI reference, terminal auth

### Infrastructure
- **29 API routes**: SPOT CRUD, agents, inbox, vault, profile, certifications (CRUD + verify + revoke + export), admin (auditors, keys, quorum policies)
- **Middleware**: Rate limiting, auth protection, security headers (CSP, HSTS, etc.)
- **Custom 404 page** — Branded design for any non-existent route
- **Custom email templates** — Magic link, signup confirmation, password reset (dark mode, Outlook compatible)
- **Cookie consent banner** — GDPR-compliant, 3 categories, persists in localStorage
- **Footer social links** — X (@CO_FE_X) and email (spigelai@gmail.com) on all public pages
- **Smart contract** — `CertificationRegistry.sol` deployed to Base Sepolia, 39 tests passing
- **CI** — GitHub Actions (typecheck + lint + test + build)

### Design system
- Glass effects (frosted glass cards, scroll-responsive reflections)
- Animated gradients (logo, section headings, buttons)
- Dark/light mode with localStorage persistence
- Responsive mobile-first layout
- Mobile: bottom tab bar with dual-state brand-themed icons, top bar with glass effect
- Desktop: collapsible sidebar with crab icon, animated background canvas

## Security (audited 2026-02-08)
- 7 security vulnerabilities identified and fixed (3 HIGH, 4 MEDIUM)
- WCAG AA contrast compliance in dark mode across all public pages
- Generic error messages on all API routes (no Supabase error leaks)
- L1/L2 auditor authorization enforced on certify and verdict routes
- IDOR prevention on inbox route

## Architecture highlights
- **Three roles**: Member (human participant), Pilot (agent deployer), Agent (AI entity)
- **Two modes**: DISCUSS (chat only) and EXECUTE (policy-gated tool execution)
- **Two-layer audit**: L1 real-time gating + L2 final certification
- **Immutable audit trail**: Append-only tables for verdicts and reports
- **Blockchain certification**: SHA-256 fingerprinted, anchored on Base (Sepolia testnet)

## Current blockers / needs confirmation
- Supabase SQL schema must be applied in the Supabase SQL editor
- Need an authenticated browser session to fully smoke-test CRUD flows
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be set for auth
- `CERTIFICATION_CONTRACT_ADDRESS` and `DEPLOYER_PRIVATE_KEY` needed for blockchain anchoring

## Next actions (Supabase on HOLD)
Supabase-dependent items are tracked in `HOLD.md`.

Immediate next actions that do **not** require Supabase Dashboard:
1. Implement actual L1 auditor gating logic (currently UI placeholder)
2. Implement actual L2 meta-auditor certification flow
3. Add realtime subscriptions for live message updates in SPOT workspace (code-only; will work once Supabase is applied)
4. Expand Playwright E2E coverage (public + protected route smoke + redirect assertions)
5. Expand Vitest coverage for API routes
6. Production hardening follow-ups:
   - remove CSP unsafe-inline/unsafe-eval (nonces)
   - document CSRF strategy
   - consider Redis-backed rate limiting
