-- ============================================================
--  DevFlow AI — Tasks table
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the tasks table
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text,
  priority    text not null default 'medium'
                check (priority in ('low', 'medium', 'high')),
  status      text not null default 'todo'
                check (status in ('todo', 'in-progress', 'done')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- 2. Enable Row Level Security (RLS)
--    This makes every query run as if it had WHERE user_id = auth.uid()
alter table tasks enable row level security;

-- 3. RLS Policies — users can ONLY touch their own rows
create policy "select_own_tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "insert_own_tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "update_own_tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "delete_own_tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- 4. Auto-update the updated_at column whenever a row is changed
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure handle_updated_at();
