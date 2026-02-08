-- Migration: 005_auditor_registry
-- Purpose: Auditor identity registry with key lifecycle management.
--
-- Design rationale: off-chain first.
--   Storing the auditor registry in Supabase gives us instant updates,
--   full query flexibility, zero gas cost, and simpler rotation logic.
--   An on-chain Merkle root of the registry can be anchored periodically
--   as a future upgrade (no schema changes required, just a new cron job
--   that computes root + calls a new contract function).
--
-- Privacy: No PII is stored. display_alias is operator-chosen, not a real name.
-- The key_fingerprint is a SHA-256 of the public key hex, not the key itself.
--
-- ACCEPTED RISK: The user_id FK in the auditors table creates a direct link
-- between auditor pseudonyms and Supabase auth users. This is needed for
-- login-based auditor identification. If stronger pseudonymization is
-- required, replace user_id with SHA-256(user_id) in a future migration.

-- ============================================================
-- 1. auditors table
-- ============================================================

create table if not exists public.auditors (
  id              uuid primary key default gen_random_uuid(),
  -- Optional link to a Supabase auth user (nullable for external auditors)
  user_id         uuid references auth.users(id) on delete set null,
  display_alias   text not null,
  role            text not null check (role in ('l1', 'l2')),
  status          text not null default 'active'
                    check (status in ('active', 'suspended', 'revoked')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_auditors_role on public.auditors(role);
create index if not exists idx_auditors_status on public.auditors(status);
create index if not exists idx_auditors_user_id on public.auditors(user_id);

-- ============================================================
-- 2. auditor_keys table (supports rotation history)
-- ============================================================

create table if not exists public.auditor_keys (
  id              uuid primary key default gen_random_uuid(),
  auditor_id      uuid not null references public.auditors(id) on delete cascade,
  public_key_hex  text not null,
  -- SHA-256 of the canonical public_key_hex; used in cert packages
  key_fingerprint text not null,
  algorithm       text not null default 'ECDSA-secp256k1'
                    check (algorithm in ('ECDSA-secp256k1')),
  status          text not null default 'active'
                    check (status in ('active', 'revoked')),
  -- Validity window: a key is valid for signing only within this range.
  -- Old certs remain verifiable because the window covers their issuedAt.
  valid_from      timestamptz not null default now(),
  valid_until     timestamptz, -- null means "still active, no expiry"
  rotation_reason text,        -- human-readable reason if rotated/revoked
  created_at      timestamptz not null default now()
);

create index if not exists idx_auditor_keys_auditor_id on public.auditor_keys(auditor_id);
create index if not exists idx_auditor_keys_fingerprint on public.auditor_keys(key_fingerprint);
create index if not exists idx_auditor_keys_status on public.auditor_keys(status);

-- ============================================================
-- 3. quorum_policies table
-- ============================================================
-- Defines the M-of-N requirement for a given audit policy version.
-- The verifier reads the active policy to determine required signature counts.

create table if not exists public.quorum_policies (
  id                    uuid primary key default gen_random_uuid(),
  policy_version        text not null unique,
  min_l1_signatures     integer not null default 1
                          check (min_l1_signatures >= 0),
  require_l2_signature  boolean not null default false,
  description           text,
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Seed a default policy: 1-of-N L1 + L2 required
insert into public.quorum_policies (policy_version, min_l1_signatures, require_l2_signature, description)
values ('1.0.0', 1, true, 'Default: at least 1 L1 approval signature plus L2 meta-auditor signature')
on conflict (policy_version) do nothing;

-- ============================================================
-- 4. RLS
-- ============================================================

alter table public.auditors enable row level security;
alter table public.auditor_keys enable row level security;
alter table public.quorum_policies enable row level security;

-- Auditors: any authenticated user can SELECT (needed for verification)
create policy "auditors_select_authenticated"
  on public.auditors for select
  using (auth.uid() is not null);

-- Auditor keys: any authenticated user can SELECT
create policy "auditor_keys_select_authenticated"
  on public.auditor_keys for select
  using (auth.uid() is not null);

-- Quorum policies: any authenticated user can SELECT
create policy "quorum_policies_select_authenticated"
  on public.quorum_policies for select
  using (auth.uid() is not null);

-- INSERT/UPDATE/DELETE: only via service role (admin API).
-- No direct user write policies. This is intentional.

-- ============================================================
-- 5. Updated_at trigger for auditors
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_auditors_updated_at on public.auditors;
create trigger set_auditors_updated_at
before update on public.auditors
for each row execute function public.set_updated_at();

-- ============================================================
-- 6. Comments
-- ============================================================

comment on table public.auditors is
  'Auditor identity registry. No PII: display_alias is operator-chosen.';

comment on table public.auditor_keys is
  'Auditor key lifecycle. Each row is a key with a validity window. '
  'Rotation creates a new row; old rows keep their valid_until timestamp '
  'so that historical cert verification still works.';

comment on table public.quorum_policies is
  'Defines M-of-N signature requirements per audit policy version.';
