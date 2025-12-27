-- Profiles
create table if not exists public.profiles (
  user_id uuid references auth.users on delete cascade primary key,
  email text not null unique
);

-- Guidelines
create table if not exists public.guidelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null default 'General',
  tags text[] not null default '{}',
  notes text,
  source_url text,
  file_path text not null,
  file_type text not null check (file_type in ('pdf','image')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists guidelines_user_id_idx on public.guidelines (user_id);
create index if not exists guidelines_title_trgm on public.guidelines using gin (title gin_trgm_ops);
create index if not exists guidelines_tags_gin on public.guidelines using gin (tags);

-- RLS
alter table public.guidelines enable row level security;
alter table public.profiles enable row level security;

create policy "Guidelines are readable by owner"
  on public.guidelines for select using (auth.uid() = user_id);

create policy "Guidelines are insertable by owner"
  on public.guidelines for insert with check (auth.uid() = user_id);

create policy "Guidelines are updatable by owner"
  on public.guidelines for update using (auth.uid() = user_id);

create policy "Profiles readable by owner"
  on public.profiles for select using (auth.uid() = user_id);

create policy "Profiles insertable by owner"
  on public.profiles for insert with check (auth.uid() = user_id);

