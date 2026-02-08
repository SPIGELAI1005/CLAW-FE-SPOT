# CLAW:FE SPOT — Project Status

_Last updated: 2026-02-08_

## TL;DR
- Full Next.js 16 app with 19 page routes and 15 API routes.
- Supabase schema + RLS policies exist (`supabase/schema.sql`).
- Dev server runs with **webpack** (`npm run dev` uses `next dev --webpack`).
- Build passes cleanly (`npm run build` — 24 static/dynamic pages).

## What works
- **Public pages**: `/` (landing page), `/login` (magic link auth)
- **Protected pages** (require authentication):
  - `/dashboard` — daily brief with animated background, greeting, quick actions
  - `/spots`, `/spots/new`, `/spots/[id]` — SPOT list, creation, workspace
  - `/agents`, `/agents/[id]` — agent directory, profiles
  - `/inbox` — invites, contracts, approvals
  - `/vault`, `/vault/[id]` — audit vault, detail views
  - `/settings` — profile, preferences, dark mode
  - `/faq` — searchable FAQ + bug report form
  - `/roles`, `/roles/member`, `/roles/pilot`, `/roles/agent/new` — role switcher
  - `/cli`, `/cli/auth` — CLI reference, terminal auth
- **Custom 404 page** — branded design for any non-existent route
- **API routes**: `/api/spots`, `/api/agents`, `/api/inbox`, `/api/vault`, `/api/profile`
- **Middleware**: rate limiting, auth protection, security headers (CSP, HSTS, etc.)
- **Design system**: glass effects, animated gradients, dark/light mode, responsive mobile layout
- **Mobile**: bottom tab bar with brand-themed dual-state icons, top bar with glass effect
- **Desktop**: collapsible sidebar with crab icon, animated background canvas

## Architecture highlights
- **Three roles**: Member (human participant), Pilot (agent deployer), Agent (AI entity)
- **Two modes**: DISCUSS (chat only) and EXECUTE (policy-gated tool execution)
- **Two-layer audit**: L1 real-time gating + L2 final certification
- **Immutable audit trail**: append-only tables for verdicts and reports

## Current blockers / needs confirmation
- Supabase SQL schema must be applied in the Supabase SQL editor.
- Need an authenticated browser session to fully smoke-test CRUD flows.
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be set for auth.

## Next actions
1. Apply `supabase/schema.sql` + migrations in Supabase SQL editor
2. Login via `/login` and confirm all routes load correctly
3. End-to-end smoke test: create SPOT → join → discuss → switch to execute → certify
4. Connect real Supabase data for agents, inbox, vault (currently using demo data)
5. Implement actual L1/L2 agent gating logic (currently UI placeholders)
6. Add Playwright E2E tests
7. Real-time subscriptions for live message updates in SPOT workspace
