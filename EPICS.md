# CLAW:FE SPOT — Epics

This file groups the work in `TASKS.md` into product epics so we can derive next steps cleanly.

## EPIC 0 — Setup & Branding (cf-000) ✅
- Branding, navigation shell, core routes.

## EPIC 1 — Domain Model & Types (cf-010) ✅
- Zod + TypeScript schemas for SPOTs, participants, inbox, agents, certifications.

## EPIC 2 — UI Pages (cf-020) ✅
- Public marketing pages + protected app pages (SPOT workspace, Inbox, Vault, Agents, Settings, Verify, etc.).

## EPIC 3 — API Routes (cf-030) ✅
- REST-style API routes for SPOTs, agents, inbox, vault, profile, certifications, and admin endpoints.

## EPIC 4 — Security Baseline (cf-040) ✅
- Middleware auth protection + security headers
- Zod validation at boundaries
- Rate limiting
- IDOR fixes + error sanitization

## EPIC 5 — GDPR & Legal (cf-050) ✅
- Cookie consent
- Privacy policy + terms
- Legal consent on login

## EPIC 6 — Blockchain Certification (cf-060) ✅
- Smart contract + tests
- Deploy scripts + ABI export

## EPIC 7 — Design System (cf-070) ✅
- Glass UI, responsive layout, mobile tab bar, theme toggle, animations.

## EPIC 8 — Email Templates (cf-080) ✅ (content ready)
- Templates are implemented in repo, but applying them in Supabase is **HOLD**.

## EPIC 9 — CI (cf-090) ✅
- GitHub Actions: typecheck + lint + test + build.

## EPIC 10 — Supabase Integration (cf-100) 🚧 (PARTIAL)
- Agents / Inbox / Vault are wired to real Supabase tables ✅
- **HOLD:** applying schema/migrations and templates in Supabase Dashboard.

## EPIC 11 — Smoke Testing (cf-110) ⛔ depends on EPIC 10
- Golden path: create SPOT → join → discuss → execute → L1 verdict → L2 certify.

## EPIC 12 — L1/L2 “Real” Agent Integration (cf-120) 🔜
- Replace UI placeholders with real gating + flows.
- Add realtime subscriptions.

## EPIC 13 — Test Expansion (cf-130) 🔜
- Expand Playwright E2E beyond basic route coverage.
- Expand Vitest for API routes.

## EPIC 14 — Production Readiness (cf-140) 🕒
- Vercel deploy
- Stronger rate limiting (Redis)
- CSP hardening (remove unsafe-inline/eval)
- CSRF strategy or documentation

---

## How we derive next steps
- If Supabase is on HOLD → focus on EPIC 12 + EPIC 13 + documentation.
- Once Supabase is applied → run EPIC 11 smoke tests and close EPIC 10/11.
