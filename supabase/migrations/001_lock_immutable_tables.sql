-- Migration: Lock down immutable tables
-- Purpose: Remove UPDATE and DELETE RLS policies from audit trail tables
--          to enforce append-only semantics for security/integrity.
--
-- Apply in Supabase SQL editor after the initial schema.sql.

-- ── audit_reports: immutable (no update, no delete) ─────────────────
drop policy if exists "audit_reports_update_own" on public.audit_reports;
drop policy if exists "audit_reports_delete_own" on public.audit_reports;

-- ── status_overrides: immutable (no update, no delete) ──────────────
drop policy if exists "status_overrides_update_own" on public.status_overrides;
drop policy if exists "status_overrides_delete_own" on public.status_overrides;

-- ── recipe_versions: immutable (no update, no delete) ───────────────
drop policy if exists "recipe_versions_update_own" on public.recipe_versions;
drop policy if exists "recipe_versions_delete_own" on public.recipe_versions;
