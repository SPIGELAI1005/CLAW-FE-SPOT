-- Migration: 002_spot_model
-- Purpose: Extend the data model to support SPOTs, contracts, agents, inbox, and L1/L2 audit flows.
-- This migration adds new columns to the existing "tables" table and creates new tables
-- for the SPOT collaboration model.

-- ============================================================
-- 1. Extend the "tables" table with SPOT fields
-- ============================================================

-- Add mode column (discuss or execute)
alter table public.tables
  add column if not exists mode text not null default 'discuss'
  check (mode in ('discuss', 'execute'));

-- Add certification status
alter table public.tables
  add column if not exists certification_status text not null default 'uncertified'
  check (certification_status in ('uncertified', 'certified', 'rework', 'lockdown', 'human_escalation'));

-- Add contract as JSONB (scope, allowed_tools, allowed_data, acceptance_criteria, termination_conditions)
alter table public.tables
  add column if not exists contract jsonb default '{}'::jsonb;


-- ============================================================
-- 2. spot_participants - who is in each SPOT and their role
-- ============================================================

create table if not exists public.spot_participants (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.tables(id) on delete cascade,
  user_id uuid references auth.users(id),
  agent_id uuid,
  role text not null check (role in ('owner', 'worker', 'l1_auditor', 'l2_meta_auditor')),
  display_name text not null,
  avatar_url text,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.spot_participants enable row level security;

create policy "spot_participants_select"
  on public.spot_participants for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = spot_participants.spot_id
        and t.owner_id = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "spot_participants_insert"
  on public.spot_participants for insert
  with check (
    exists (
      select 1 from public.tables t
      where t.id = spot_participants.spot_id
        and t.owner_id = auth.uid()
    )
  );


-- ============================================================
-- 3. spot_contracts - signed contracts per SPOT
-- ============================================================

create table if not exists public.spot_contracts (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.tables(id) on delete cascade,
  scope text not null default '',
  allowed_tools text[] not null default '{}',
  allowed_data text[] not null default '{}',
  acceptance_criteria text[] not null default '{}',
  termination_conditions text not null default '',
  signed_at timestamptz,
  signed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.spot_contracts enable row level security;

create policy "spot_contracts_select"
  on public.spot_contracts for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = spot_contracts.spot_id
        and t.owner_id = auth.uid()
    )
  );

create policy "spot_contracts_insert"
  on public.spot_contracts for insert
  with check (
    exists (
      select 1 from public.tables t
      where t.id = spot_contracts.spot_id
        and t.owner_id = auth.uid()
    )
  );

-- Contracts are immutable once signed (no UPDATE/DELETE policies)


-- ============================================================
-- 4. agents - AI agent directory
-- ============================================================

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null,
  type text not null check (type in ('worker', 'l1_auditor', 'l2_meta_auditor')),
  description text,
  skills text[] not null default '{}',
  tools text[] not null default '{}',
  trust_level integer not null default 0 check (trust_level >= 0 and trust_level <= 100),
  certified_outcomes integer not null default 0,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents enable row level security;

create policy "agents_select_all"
  on public.agents for select
  using (true);  -- all authenticated users can browse agents

create policy "agents_insert_own"
  on public.agents for insert
  with check (auth.uid() = owner_id);

create policy "agents_update_own"
  on public.agents for update
  using (auth.uid() = owner_id);


-- ============================================================
-- 5. inbox_items - notifications, invites, contract proposals, approval tasks
-- ============================================================

create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  type text not null check (type in ('spot_invite', 'contract_proposal', 'l1_approval', 'l2_certification')),
  spot_id uuid references public.tables(id) on delete cascade,
  title text not null,
  description text,
  payload jsonb default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inbox_items enable row level security;

create policy "inbox_items_select_own"
  on public.inbox_items for select
  using (auth.uid() = owner_id);

create policy "inbox_items_insert_own"
  on public.inbox_items for insert
  with check (auth.uid() = owner_id);

create policy "inbox_items_update_own"
  on public.inbox_items for update
  using (auth.uid() = owner_id);


-- ============================================================
-- 6. l1_verdicts - L1 Auditor decisions (IMMUTABLE)
-- ============================================================

create table if not exists public.l1_verdicts (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.tables(id) on delete cascade,
  action_id text not null,
  verdict text not null check (verdict in ('approve', 'block')),
  rationale text not null,
  auditor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.l1_verdicts enable row level security;

-- Immutable: SELECT + INSERT only. No UPDATE or DELETE.
create policy "l1_verdicts_select"
  on public.l1_verdicts for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = l1_verdicts.spot_id
        and t.owner_id = auth.uid()
    )
    or auditor_id = auth.uid()
  );

create policy "l1_verdicts_insert"
  on public.l1_verdicts for insert
  with check (auth.uid() = auditor_id);


-- ============================================================
-- 7. l2_reports - L2 Meta-Auditor certification reports (IMMUTABLE)
-- ============================================================

create table if not exists public.l2_reports (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.tables(id) on delete cascade,
  verdict text not null check (verdict in ('pass', 'rework', 'lockdown', 'human_escalation')),
  report text not null,
  auditor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.l2_reports enable row level security;

-- Immutable: SELECT + INSERT only. No UPDATE or DELETE.
create policy "l2_reports_select"
  on public.l2_reports for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = l2_reports.spot_id
        and t.owner_id = auth.uid()
    )
    or auditor_id = auth.uid()
  );

create policy "l2_reports_insert"
  on public.l2_reports for insert
  with check (auth.uid() = auditor_id);


-- ============================================================
-- 8. Indexes for performance
-- ============================================================

create index if not exists idx_spot_participants_spot_id on public.spot_participants(spot_id);
create index if not exists idx_spot_contracts_spot_id on public.spot_contracts(spot_id);
create index if not exists idx_inbox_items_owner_id on public.inbox_items(owner_id);
create index if not exists idx_l1_verdicts_spot_id on public.l1_verdicts(spot_id);
create index if not exists idx_l2_reports_spot_id on public.l2_reports(spot_id);
