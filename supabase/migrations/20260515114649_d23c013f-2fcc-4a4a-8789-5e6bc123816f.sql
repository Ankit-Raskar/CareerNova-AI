
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
do $$ begin
  create policy "p_select_own" on public.profiles for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "p_update_own" on public.profiles for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "p_insert_own" on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  recommendations jsonb,
  created_at timestamptz not null default now()
);
alter table public.quiz_results enable row level security;
do $$ begin create policy "qr_select_own" on public.quiz_results for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "qr_insert_own" on public.quiz_results for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "qr_delete_own" on public.quiz_results for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
create index if not exists quiz_results_user_id_idx on public.quiz_results(user_id, created_at desc);

create table if not exists public.saved_careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_key text not null,
  title text not null,
  payload jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, career_key)
);
alter table public.saved_careers enable row level security;
do $$ begin create policy "sc_select_own" on public.saved_careers for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "sc_insert_own" on public.saved_careers for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "sc_delete_own" on public.saved_careers for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

create table if not exists public.roadmap_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_key text not null,
  step_key text not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, career_key, step_key)
);
alter table public.roadmap_progress enable row level security;
do $$ begin create policy "rp_select_own" on public.roadmap_progress for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "rp_insert_own" on public.roadmap_progress for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "rp_update_own" on public.roadmap_progress for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "rp_delete_own" on public.roadmap_progress for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
do $$ begin create policy "cm_select_own" on public.chat_messages for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "cm_insert_own" on public.chat_messages for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "cm_delete_own" on public.chat_messages for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
create index if not exists chat_messages_user_id_idx on public.chat_messages(user_id, created_at);

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text,
  score int,
  summary text,
  feedback jsonb,
  created_at timestamptz not null default now()
);
alter table public.resume_analyses enable row level security;
do $$ begin create policy "ra_select_own" on public.resume_analyses for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "ra_insert_own" on public.resume_analyses for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "ra_delete_own" on public.resume_analyses for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

create table if not exists public.learning_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  label text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table public.learning_activity enable row level security;
do $$ begin create policy "la_select_own" on public.learning_activity for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "la_insert_own" on public.learning_activity for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
create index if not exists learning_activity_user_id_idx on public.learning_activity(user_id, created_at desc);

create table if not exists public.saved_jobs (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null,
  title text not null,
  company text not null,
  apply_url text,
  payload jsonb,
  status text not null default 'saved',
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);
alter table public.saved_jobs enable row level security;
do $$ begin create policy "sj_select_own" on public.saved_jobs for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "sj_insert_own" on public.saved_jobs for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "sj_update_own" on public.saved_jobs for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "sj_delete_own" on public.saved_jobs for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
