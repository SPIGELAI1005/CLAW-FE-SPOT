# HOLD — Supabase-dependent actions

This repo is prepared local-first. The following items require Supabase Dashboard actions and are currently on hold.

## HOLD-1: Apply schema/migrations
- Run `supabase/MIGRATIONS_BUNDLE_001_006.sql` in **Supabase SQL Editor**.

## HOLD-2: Apply Auth email templates
Supabase Dashboard → Authentication → Email Templates:
- Magic Link
- Confirm signup
- Reset password

Templates live in:
- `supabase/email-templates/`

## HOLD-3: Smoke test after apply
After HOLD-1/2, run:
- cf-110a create SPOT → join → discuss → execute → L1 → L2 certify
- cf-110b verify all routes with auth

## Notes
- Until HOLD is cleared, some pages will show placeholder/empty states.
