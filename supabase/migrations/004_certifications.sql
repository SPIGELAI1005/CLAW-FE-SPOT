-- Migration: 004_certifications
-- Purpose: Add the certifications table for blockchain-anchored audit certificates.
-- Each row stores the full certification package JSON, cryptographic fingerprint,
-- platform signature, on-chain transaction metadata, and lifecycle status.
--
-- Privacy: The package_json contains NO PII, prompts, chat logs, or user content.
-- Only cryptographic fingerprints, aggregate counts, and structural metadata.

-- ============================================================
-- 1. certifications table
-- ============================================================

create table if not exists public.certifications (
  id              uuid primary key default gen_random_uuid(),
  spot_id         uuid not null references public.tables(id) on delete cascade,
  l2_report_id    uuid not null references public.l2_reports(id),
  fingerprint     text not null unique,
  package_json    jsonb not null,
  platform_sig    text not null,
  auditor_sig     text,                          -- Phase B: auditor signature
  chain_id        integer not null,
  contract_addr   text not null,
  tx_hash         text,                          -- null until on-chain tx confirmed
  block_number    bigint,                        -- null until on-chain tx confirmed
  status          text not null default 'valid'
                    check (status in ('valid', 'revoked', 'superseded')),
  superseded_by   uuid references public.certifications(id),
  revocation_reason text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 2. Indexes
-- ============================================================

create index if not exists idx_certifications_spot_id
  on public.certifications(spot_id);

create index if not exists idx_certifications_fingerprint
  on public.certifications(fingerprint);

create index if not exists idx_certifications_status
  on public.certifications(status);

-- ============================================================
-- 3. Row Level Security
-- ============================================================

alter table public.certifications enable row level security;

-- SELECT: SPOT owner or SPOT participants can view certifications
create policy "certifications_select"
  on public.certifications for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = certifications.spot_id
        and t.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.spot_participants sp
      where sp.spot_id = certifications.spot_id
        and sp.user_id = auth.uid()
    )
  );

-- INSERT: Only via service role (API routes use SUPABASE_SERVICE_ROLE_KEY)
-- No direct user INSERT policy — the API route handles authorization.
-- If using service role, RLS is bypassed. This is intentional.

-- UPDATE: Only status, superseded_by, revocation_reason, tx_hash, block_number
-- can be updated, and only via service role.
-- No direct user UPDATE policy for same reason as INSERT.

-- DELETE: NEVER. Certifications are permanent records.
-- No DELETE policy at all.

-- ============================================================
-- 4. Comment
-- ============================================================

comment on table public.certifications is
  'Blockchain-anchored certification records. Append-only for inserts. '
  'Status updates (revoke/supersede) only via service role API. No deletes.';
