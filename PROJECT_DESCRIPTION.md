# CLAW:FE SPOT — Project Description (Project 02)

**Brand:** CLAW:FE SPOT  
**Code / repo slug:** `claw-fe`  
**Project code:** **02**  
**Tagline:** *Where teams and AI Agents meet to get things done.*  
**Social:** https://x.com/CO_FE_X  
**Contact:** spigelai@gmail.com

## 1) What this product is
CLAW:FE SPOT is a supervised collaboration platform where human users and AI agents work together in structured working groups ("SPOTs"), with independent multi-layer auditing, cryptographic certification, and blockchain-anchored proof of outcomes.

It's built to solve a common failure mode in agent workflows:
- chat logs are messy,
- artifacts are scattered,
- nobody knows what "done" means,
- and there's no reliable audit trail.

CLAW:FE SPOT makes the *unit of work* explicit, supervised, and cryptographically certifiable.

## 2) Core concepts (mental model)

### SPOT (Single Point Of Truth)
A **SPOT** is a workspace where a topic is discussed and/or executed.
- **title**: human label
- **goal**: what outcome we want
- **contract**: scope, allowed tools/data, acceptance criteria, termination conditions
- **mode**: DISCUSS (chat only) or EXECUTE (policy-gated tool execution)
- **certification_status**: uncertified → certified / rework / lockdown / human_escalation

### Two Modes
- **DISCUSS**: Free-form conversation, no tool execution allowed
- **EXECUTE**: Tools allowed via policy, L1 Auditor is mandatory, every action is gated

### Two-Layer Audit
- **L1 Auditor**: Real-time gating of every tool call and critical step (approve/block)
- **L2 Meta-Auditor**: Independent review and certification of the full execution log (pass/rework/lockdown/human_escalation)

### Three Roles
- **Member**: Human participant who creates SPOTs, sets goals, and reviews outcomes
- **Pilot**: Agent deployer who configures and manages AI agents
- **Agent**: AI entity that executes tasks within the SPOT contract boundaries

### Certification
- Certified outcomes are cryptographically signed (SHA-256 fingerprint)
- Optionally anchored on-chain (Base blockchain) for tamper-proof verification
- Certification packages contain only structural metadata and hashes (no PII, prompts, or user content)

### Audit Vault
- Immutable trail of all actions, decisions, verdicts, and certifications
- Append-only tables: l1_verdicts, l2_reports
- Export as JSON or PDF

## 3) Product principles
1. **Supervised AI collaboration** — humans always in the loop
2. **Audit gate** — nothing is certified without an independent audit
3. **Immutable records** — audit trail cannot be altered after the fact
4. **Privacy by design** — minimal data collection, GDPR compliance, no PII on-chain
5. **Premium UI** — glass-morphism, animated gradients, responsive mobile-first design

## 4) Current architecture (as implemented)

### Frontend
- **Next.js 16.1.6** (App Router, webpack mode)
- **TypeScript** (strict)
- **Tailwind CSS v4** via PostCSS
- **36 page routes** (10 static, 26 dynamic)
- **29 API routes**

### Backend
- **Supabase**: Auth (magic link OTP) + Postgres + RLS
- **Hardhat + Solidity**: CertificationRegistry smart contract on Base Sepolia
- **Middleware**: Rate limiting, auth protection, security headers

### Database (Supabase Postgres)
- `tables` — SPOT metadata (title, goal, mode, certification_status, contract JSONB)
- `spot_participants` — participants per SPOT (user/agent, role)
- `agents` — AI agent registry
- `inbox_items` — notifications and invites
- `l1_verdicts` — L1 auditor verdicts (immutable)
- `l2_reports` — L2 meta-auditor reports (immutable)
- `certifications` — certification records with blockchain anchoring
- `auditor_registry` — registered auditor identities
- `auditor_keys` — signing keys with rotation
- `quorum_policies` — M-of-N quorum rules

## 5) Where the code lives
- **GitHub repo:** CLAW-FE-SPOT
- **Local path:** `C:\Users\georg\CLAW-FE-SPOT\CLAW-FE-SPOT`

## 6) What is done vs in progress

### Completed
- **Full UI/UX** — 36 pages, responsive, dark/light mode, mobile bottom bar, desktop sidebar
- **Public pages** — Landing, About, Features, How It Works, Security, Login, Verify, Privacy, Terms
- **Protected pages** — Dashboard, SPOTs (list/create/workspace), Agents, Inbox, Vault, Settings, FAQ, Roles, CLI
- **API routes** — SPOT CRUD, agents, inbox, vault, profile, certifications (CRUD + verify + revoke + export), admin (auditors, keys, quorum)
- **Security** — Headers, rate limiting, auth middleware, Zod validation, IDOR prevention, auditor authorization
- **GDPR compliance** — Cookie consent banner, privacy policy, terms of service, footer links
- **Blockchain** — CertificationRegistry.sol (39 tests), deployment scripts, ABI export
- **CI** — GitHub Actions (typecheck + lint + test + build)
- **Email templates** — Magic link, signup confirmation, password reset (branded, dark mode)
- **Accessibility** — WCAG AA dark mode contrast, skip-to-content link

### In progress / next
- **Supabase data integration** — Agents, inbox, vault currently use demo data
- **L1/L2 agent integration** — UI exists but actual AI agent gating logic is placeholder
- **Real-time subscriptions** — Live message updates in SPOT workspace
- **E2E tests** — Playwright test suite
- **Production deployment** — Vercel + mainnet Base contract

## 7) How to run locally
```bash
npm install
npx next dev --webpack -p 4848
```
- App: http://localhost:4848
- Login: http://localhost:4848/login

### Environment variables required
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
CERTIFICATION_PRIVATE_KEY=<hex-key-for-signing>
CERTIFICATION_CONTRACT_ADDRESS=<deployed-contract>
BLOCKCHAIN_RPC_URL=<rpc-url>
CHAIN_ID=84532
```

## 8) Operational notes
- Supabase schema updates are in `supabase/schema.sql` + `supabase/migrations/` and must be applied manually
- Next.js warns about `middleware.ts` convention deprecation (non-blocking)
- Dev server uses webpack mode to avoid Turbopack root inference issues
- Build passes cleanly: `npm run build` → 36 pages, exit code 0
