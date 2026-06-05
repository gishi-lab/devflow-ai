-- ============================================================
--  DevFlow AI — Notes table
--  Run this in: Supabase Dashboard → SQL Editor → New query
--
--  Prerequisite: supabase/schema.sql must have been run first
--  (it creates the handle_updated_at() trigger function).
--  The CREATE OR REPLACE below is a safe fallback if it hasn't.
-- ============================================================

-- 1. Create the notes table
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  content    text not null,
  category   text not null default 'other'
               check (category in ('concept', 'snippet', 'glossary', 'other')),
  tags       text[] not null default '{}',   -- native Postgres array
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Enable Row Level Security
alter table notes enable row level security;

-- 3. RLS policies — users can only access their own notes
create policy "select_own_notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "insert_own_notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "update_own_notes"
  on notes for update
  using (auth.uid() = user_id);

create policy "delete_own_notes"
  on notes for delete
  using (auth.uid() = user_id);

-- 4. Auto-update updated_at on every row change
--    (safe no-op if handle_updated_at already exists from schema.sql)
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_updated_at
  before update on notes
  for each row execute procedure handle_updated_at();
