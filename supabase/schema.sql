-- CLAW-FE (CLAW:FE SPOT) — initial schema
-- Apply in Supabase SQL editor.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists public.tables (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  title text not null,
  goal text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.table_tasks (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Runs
create table if not exists public.runs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete cascade,
  status text not null default 'queued',
  title text not null,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (placeholder) Artifacts
create table if not exists public.artifacts (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete cascade,
  run_id uuid null references public.runs(id) on delete set null,
  type text not null,
  title text not null,
  uri text null,
  content text null,
  created_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tables_updated_at on public.tables;
create trigger set_tables_updated_at
before update on public.tables
for each row execute function public.set_updated_at();

drop trigger if exists set_runs_updated_at on public.runs;
create trigger set_runs_updated_at
before update on public.runs
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.tables enable row level security;
alter table public.table_tasks enable row level security;
alter table public.runs enable row level security;
alter table public.artifacts enable row level security;

-- Policies
-- Tables: owner can CRUD
create policy "tables_select_own" on public.tables
for select using (auth.uid() = owner_id);

create policy "tables_insert_own" on public.tables
for insert with check (auth.uid() = owner_id);

create policy "tables_update_own" on public.tables
for update using (auth.uid() = owner_id);

create policy "tables_delete_own" on public.tables
for delete using (auth.uid() = owner_id);

-- Tasks: owner can CRUD
create policy "table_tasks_select_own" on public.table_tasks
for select using (auth.uid() = owner_id);

create policy "table_tasks_insert_own" on public.table_tasks
for insert with check (auth.uid() = owner_id);

create policy "table_tasks_update_own" on public.table_tasks
for update using (auth.uid() = owner_id);

create policy "table_tasks_delete_own" on public.table_tasks
for delete using (auth.uid() = owner_id);

-- Runs: owner can CRUD
create policy "runs_select_own" on public.runs
for select using (auth.uid() = owner_id);

create policy "runs_insert_own" on public.runs
for insert with check (auth.uid() = owner_id);

create policy "runs_update_own" on public.runs
for update using (auth.uid() = owner_id);

create policy "runs_delete_own" on public.runs
for delete using (auth.uid() = owner_id);

-- Audit reports (Phase 3)
create table if not exists public.audit_reports (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  passed boolean not null,
  summary text null,
  issues jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_reports enable row level security;

create policy "audit_reports_select_own" on public.audit_reports
for select using (auth.uid() = owner_id);

create policy "audit_reports_insert_own" on public.audit_reports
for insert with check (auth.uid() = owner_id);

-- NOTE: No UPDATE or DELETE policies on audit_reports.
-- Audit reports are immutable for audit trail integrity.

-- Recipes (Phase 4)
create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipe_versions (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  version int not null,
  template jsonb not null,
  created_at timestamptz not null default now(),
  unique (recipe_id, version)
);

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

alter table public.recipes enable row level security;
alter table public.recipe_versions enable row level security;

create policy "recipes_select_own" on public.recipes
for select using (auth.uid() = owner_id);
create policy "recipes_insert_own" on public.recipes
for insert with check (auth.uid() = owner_id);
create policy "recipes_update_own" on public.recipes
for update using (auth.uid() = owner_id);
create policy "recipes_delete_own" on public.recipes
for delete using (auth.uid() = owner_id);

create policy "recipe_versions_select_own" on public.recipe_versions
for select using (auth.uid() = owner_id);
create policy "recipe_versions_insert_own" on public.recipe_versions
for insert with check (auth.uid() = owner_id);

-- NOTE: No UPDATE or DELETE policies on recipe_versions.
-- Versions are immutable — create a new version instead.

-- Status overrides (Phase 3)
create table if not exists public.status_overrides (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete cascade,
  run_id uuid null references public.runs(id) on delete set null,
  from_status text null,
  to_status text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.status_overrides enable row level security;

create policy "status_overrides_select_own" on public.status_overrides
for select using (auth.uid() = owner_id);

create policy "status_overrides_insert_own" on public.status_overrides
for insert with check (auth.uid() = owner_id);

-- NOTE: No UPDATE or DELETE policies on status_overrides.
-- Override records are immutable for audit trail integrity.

-- Artifacts: owner can CRUD
create policy "artifacts_select_own" on public.artifacts
for select using (auth.uid() = owner_id);

create policy "artifacts_insert_own" on public.artifacts
for insert with check (auth.uid() = owner_id);

create policy "artifacts_update_own" on public.artifacts
for update using (auth.uid() = owner_id);

create policy "artifacts_delete_own" on public.artifacts
for delete using (auth.uid() = owner_id);
