create table if not exists public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null,
  resource_type text not null default 'curated',
  title text,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

alter table public.saved_resources enable row level security;

drop policy if exists "sr_select_own" on public.saved_resources;
create policy "sr_select_own" on public.saved_resources
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "sr_insert_own" on public.saved_resources;
create policy "sr_insert_own" on public.saved_resources
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "sr_delete_own" on public.saved_resources;
create policy "sr_delete_own" on public.saved_resources
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists saved_resources_user_idx on public.saved_resources(user_id);