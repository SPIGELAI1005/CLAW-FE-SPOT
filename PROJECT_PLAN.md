# CLAW:FE SPOT — Project Plan

**Brand:** CLAW:FE SPOT  
**Code name / repo slug:** CLAW-FE  
**Tagline:** *Where teams and AI Agents meet to get things done.*  
**Social:** https://x.com/CO_FE_X  
**Contact:** spigelai@gmail.com

## Product goal
Create a modern, beautiful web app that acts as a **supervised collaboration platform** for human-AI teams:
- Users create **SPOTs** (Single Point Of Truth) to discuss and execute tasks.
- AI agents collaborate within defined contracts and policy boundaries.
- A **two-layer audit** (L1 + L2) provides independent certification.
- The system preserves an immutable, cryptographically certified audit trail.

## Guiding principles
1. **Supervised AI collaboration** — humans always in the loop.
2. **Audit gate** — nothing is certified without an independent review.
3. **Immutable records** — audit trail cannot be altered after the fact.
4. **Privacy by design** — minimal data collection, GDPR compliance, no PII on-chain.
5. **Premium UI** — glass-morphism, animated gradients, responsive mobile-first design.

## Architecture (current)
### Components
1. **CLAW-FE Web (Next.js 16 App Router)** — UI + API + orchestration
2. **Supabase** — Auth (magic link) + Postgres + RLS
3. **Hardhat + Solidity** — CertificationRegistry smart contract on Base
4. **Vercel** — Deployment target

### Execution model
- User creates a SPOT with a goal and contract.
- Team members and AI agents collaborate (DISCUSS mode or EXECUTE mode).
- L1 Auditor gates every tool call in real-time (approve/block).
- L2 Meta-Auditor reviews the full execution log and issues certification.
- Certified outcomes are SHA-256 fingerprinted and optionally anchored on-chain.

## Phased delivery
### Phase 0 — Foundations (DONE)
- Project skeleton, branding, baseline UI kit

### Phase 1 — Tables MVP (DONE)
- Tables CRUD, statuses, table detail view, tasks checklist

### Phase 2 — Runs + Logs (DONE)
- Create run objects, run timeline, manual status updates

### Phase 3 — Audit gate (DONE)
- Audit report model + UI, fix loop flow

### Phase 4 — SPOT model redesign (DONE)
- Full UI/UX redesign: SPOT workspace, 3-panel layout, agent directory, inbox, vault
- Two modes (DISCUSS/EXECUTE), three roles (Member/Pilot/Agent)
- Certification pipeline: L1 verdicts, L2 reports, blockchain anchoring

### Phase 5 — Security + GDPR (DONE)
- Security hardening: headers, rate limiting, auth, Zod validation
- GDPR compliance: cookie consent, privacy policy, terms of service
- Accessibility: WCAG AA contrast, responsive mobile design

### Phase 6 — Production readiness (IN PROGRESS)
- Supabase data integration (agents, inbox, vault)
- L1/L2 agent integration
- E2E testing (Playwright)
- Deploy to Vercel + Base mainnet

### Phase 7 — Advanced features (PLANNED)
- Real-time subscriptions for live message updates
- Recipe/template system
- Device/runner integration
- Redis-backed rate limiting

## Decisions made
1. **Backend**: Supabase (Auth + Postgres + RLS)
2. **Auth**: Magic link OTP via Supabase, personal accounts
3. **Blockchain**: Base (Sepolia testnet), CertificationRegistry.sol
4. **GDPR**: Cookie consent banner, privacy policy, terms of service
5. **Dev server**: Webpack mode on port 4848 (avoids Turbopack root inference issues)
6. **Deployment target**: Vercel
