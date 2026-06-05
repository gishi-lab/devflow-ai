-- ============================================================
--  DevFlow AI — Chat tables
--  Run this in: Supabase Dashboard → SQL Editor → New query
--
--  NOTE: Run supabase/schema.sql (Tasks) first — it creates the
--        handle_updated_at() function used here.
--        If you skipped that, the CREATE OR REPLACE at the bottom
--        of this file will create it for you.
-- ============================================================

-- 1. chat_sessions — one row per conversation
create table if not exists chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null default 'New Chat',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. chat_messages — every message in every conversation
create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now() not null
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
--   Every query automatically filters to the current user's rows.
--   A logged-in user can NEVER read or modify another user's sessions/messages.

alter table chat_sessions enable row level security;
alter table chat_messages  enable row level security;

-- chat_sessions policies
create policy "select_own_sessions"
  on chat_sessions for select  using (auth.uid() = user_id);

create policy "insert_own_sessions"
  on chat_sessions for insert  with check (auth.uid() = user_id);

create policy "update_own_sessions"
  on chat_sessions for update  using (auth.uid() = user_id);

create policy "delete_own_sessions"
  on chat_sessions for delete  using (auth.uid() = user_id);

-- chat_messages policies
create policy "select_own_messages"
  on chat_messages for select  using (auth.uid() = user_id);

create policy "insert_own_messages"
  on chat_messages for insert  with check (auth.uid() = user_id);

create policy "delete_own_messages"
  on chat_messages for delete  using (auth.uid() = user_id);

-- ─── Auto-update trigger ─────────────────────────────────────────────────────
--   handle_updated_at() was created by schema.sql (Tasks).
--   The CREATE OR REPLACE here is a safe no-op if it already exists.

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chat_sessions_updated_at
  before update on chat_sessions
  for each row execute procedure handle_updated_at();
