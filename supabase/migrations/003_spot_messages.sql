-- Migration: 003_spot_messages
-- Purpose: Create dedicated spot_messages table to replace JSONB storage in tables.log

-- ============================================================
-- 1. spot_messages table
-- ============================================================

create table if not exists public.spot_messages (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.tables(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_name text not null default '',
  content text not null,
  type text not null default 'human' check (type in ('human', 'agent', 'system')),
  created_at timestamptz not null default now()
);

alter table public.spot_messages enable row level security;

-- Anyone who is a participant or owner can read messages
create policy "spot_messages_select"
  on public.spot_messages for select
  using (
    exists (
      select 1 from public.tables t
      where t.id = spot_messages.spot_id
        and t.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.spot_participants sp
      where sp.spot_id = spot_messages.spot_id
        and sp.user_id = auth.uid()
    )
    or sender_id = auth.uid()
  );

-- Authenticated users can insert messages into spots they participate in or own
create policy "spot_messages_insert"
  on public.spot_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.tables t
        where t.id = spot_messages.spot_id
          and t.owner_id = auth.uid()
      )
      or exists (
        select 1 from public.spot_participants sp
        where sp.spot_id = spot_messages.spot_id
          and sp.user_id = auth.uid()
      )
    )
  );

-- Messages are immutable (no UPDATE or DELETE policies)

-- ============================================================
-- 2. Indexes
-- ============================================================

create index if not exists idx_spot_messages_spot_id on public.spot_messages(spot_id);
create index if not exists idx_spot_messages_created_at on public.spot_messages(spot_id, created_at);

-- ============================================================
-- 3. Add missing FK for spot_participants.agent_id
-- ============================================================

-- Only add if not already present (safe to re-run)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'spot_participants_agent_id_fkey'
      and table_name = 'spot_participants'
  ) then
    alter table public.spot_participants
      add constraint spot_participants_agent_id_fkey
      foreign key (agent_id) references public.agents(id) on delete set null;
  end if;
end $$;

-- ============================================================
-- 4. Additional performance indexes
-- ============================================================

create index if not exists idx_spot_participants_user_id on public.spot_participants(user_id);
create index if not exists idx_inbox_items_status on public.inbox_items(status);
create index if not exists idx_tables_owner_id on public.tables(owner_id);
