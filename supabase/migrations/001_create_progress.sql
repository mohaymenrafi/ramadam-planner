-- Progress table for Ramadan tracker
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  statuses jsonb not null default '{}',
  selected_day integer not null default 21,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS: users can only read/write their own progress
alter table public.progress enable row level security;

create policy "Users can read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
