-- Profiles
create table if not exists public.profiles (
  user_id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  upload_count integer not null default 0,
  subscription_status text check (subscription_status in ('active', 'inactive', 'trialing', 'canceled', 'past_due')),
  subscription_plan text check (subscription_plan in ('free', 'monthly', 'yearly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null check (status in ('active', 'inactive', 'trialing', 'canceled', 'past_due')),
  plan_type text not null check (plan_type in ('monthly', 'yearly')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);

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
  file_type text not null check (file_type in ('pdf','image','word')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists guidelines_user_id_idx on public.guidelines (user_id);
create index if not exists guidelines_title_trgm on public.guidelines using gin (title gin_trgm_ops);
create index if not exists guidelines_tags_gin on public.guidelines using gin (tags);

-- RLS
alter table public.guidelines enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;

create policy "Guidelines are readable by owner"
  on public.guidelines for select using (auth.uid() = user_id);

create policy "Guidelines are insertable by owner"
  on public.guidelines for insert with check (auth.uid() = user_id);

create policy "Guidelines are updatable by owner"
  on public.guidelines for update using (auth.uid() = user_id);

create policy "Guidelines are deletable by owner"
  on public.guidelines for delete using (auth.uid() = user_id);

create policy "Profiles readable by owner"
  on public.profiles for select using (auth.uid() = user_id);

create policy "Profiles insertable by owner"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "Profiles updatable by owner"
  on public.profiles for update using (auth.uid() = user_id);

create policy "Subscriptions readable by owner"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Subscriptions insertable by owner"
  on public.subscriptions for insert with check (auth.uid() = user_id);

create policy "Subscriptions updatable by owner"
  on public.subscriptions for update using (auth.uid() = user_id);

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, subscription_status, subscription_plan)
  values (new.id, new.email, 'inactive', 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

