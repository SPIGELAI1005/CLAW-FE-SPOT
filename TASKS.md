# CLAW-FE — TASKS

Legend: **NOW** / NEXT / LATER / DONE

## DONE

### cf-000 Setup & branding
- [x] cf-000a Confirm backend strategy (Supabase)
- [x] cf-000b Update branding: CLAW-FE (code) + CLAW:FE SPOT (brand)
- [x] cf-000c Add navigation shell (sidebar + bottom tabs + top bar)
- [x] cf-000d Add all core routes

### cf-010 Data model (SPOTs)
- [x] cf-010a Define SPOT types (Zod + TS): mode, certification_status, contract
- [x] cf-010b Define participant, agent, inbox types
- [x] cf-010c Define certification types and Zod schemas

### cf-020 UI — Pages
- [x] cf-020a Landing page with hero, features, security, CLI showcase, trust carousel
- [x] cf-020b About, Features, How It Works, Security pages
- [x] cf-020c Login page with magic link auth + instructions
- [x] cf-020d Dashboard with animated background, greeting, quick actions
- [x] cf-020e SPOT list, create, and 3-panel workspace
- [x] cf-020f Agent directory and profile pages
- [x] cf-020g Inbox with tabs and action buttons
- [x] cf-020h Vault list and detail views with L1/L2 reports
- [x] cf-020i Settings with profile, preferences, dark mode
- [x] cf-020j FAQ with search, categories, and bug report form
- [x] cf-020k Role switcher (Member/Pilot/Agent)
- [x] cf-020l CLI reference and auth pages
- [x] cf-020m External certificate verifier (/verify)
- [x] cf-020n Custom 404 page

### cf-030 API routes
- [x] cf-030a SPOT CRUD (GET/POST/PATCH spots, messages, participants, verdicts)
- [x] cf-030b Agent CRUD (GET/POST/PATCH agents)
- [x] cf-030c Inbox (GET/POST/PATCH inbox items)
- [x] cf-030d Vault (GET vault, vault detail)
- [x] cf-030e Profile (GET/PATCH profile)
- [x] cf-030f Certifications (list, create, verify, revoke, export, public verify)
- [x] cf-030g Admin (auditors, keys, rotation, quorum policies, purge)

### cf-040 Security
- [x] cf-040a Middleware with auth protection and security headers
- [x] cf-040b Rate limiting on API routes
- [x] cf-040c Zod validation at all API boundaries
- [x] cf-040d Open redirect prevention on auth callback
- [x] cf-040e L1/L2 auditor authorization on certify and verdict routes
- [x] cf-040f IDOR fix on inbox route
- [x] cf-040g Error message sanitization (no Supabase leaks)
- [x] cf-040h WCAG AA dark mode contrast audit

### cf-050 GDPR & Legal
- [x] cf-050a Cookie consent banner (3 categories, localStorage persistence)
- [x] cf-050b Privacy Policy page (/privacy, 14 sections, GDPR compliant)
- [x] cf-050c Terms of Service page (/terms, 13 sections, EU governing law)
- [x] cf-050d Legal consent on login form
- [x] cf-050e Footer links on all public pages

### cf-060 Blockchain
- [x] cf-060a CertificationRegistry.sol smart contract
- [x] cf-060b Hardhat test suite (39 tests)
- [x] cf-060c Deploy scripts (local + Base Sepolia)
- [x] cf-060d ABI export script
- [x] cf-060e Certification package builder + on-chain anchoring

### cf-070 Design system
- [x] cf-070a Glass-morphism effects + animated gradients
- [x] cf-070b Dark/light mode with localStorage toggle
- [x] cf-070c Responsive mobile-first layout
- [x] cf-070d Mobile bottom tab bar with dual-state brand icons
- [x] cf-070e Desktop sidebar with collapsible mode
- [x] cf-070f Animated canvas background (tables, crabs)
- [x] cf-070g CrabCoffeeToggle mobile menu
- [x] cf-070h Social media icons in footer (X + email)

### cf-080 Email templates
- [x] cf-080a Magic link template (branded, dark mode, Outlook compatible)
- [x] cf-080b Confirm signup template
- [x] cf-080c Reset password template

### cf-090 CI
- [x] cf-090a GitHub Actions workflow (typecheck + lint + test + build)

## NOW

### cf-100 Supabase data integration
- [ ] cf-100a Connect real Supabase data for agents (currently demo data)
- [ ] cf-100b Connect real Supabase data for inbox
- [ ] cf-100c Connect real Supabase data for vault
- [ ] cf-100d Apply schema + migrations to Supabase SQL editor
- [ ] cf-100e Apply email templates in Supabase Dashboard

### cf-110 Smoke testing
- [ ] cf-110a End-to-end: create SPOT → join → discuss → switch to execute → L1 audit → L2 certify
- [ ] cf-110b Verify all routes load correctly with auth

## NEXT

### cf-120 L1/L2 Agent integration
- [ ] cf-120a Implement actual L1 auditor gating logic (currently UI placeholder)
- [ ] cf-120b Implement actual L2 meta-auditor certification flow
- [ ] cf-120c Real-time subscriptions for live message updates

### cf-130 Testing
- [ ] cf-130a Playwright E2E test suite
- [ ] cf-130b Expand Vitest coverage for new API routes

## LATER

### cf-140 Production readiness
- [ ] cf-140a Deploy to Vercel
- [ ] cf-140b Deploy CertificationRegistry to Base mainnet
- [ ] cf-140c Redis-backed rate limiting
- [ ] cf-140d Remove CSP unsafe-inline/unsafe-eval (use nonces)
- [ ] cf-140e CSRF token strategy or documentation
- [ ] cf-140f Apply RATE_LIMITS.auth to auth endpoints specifically
