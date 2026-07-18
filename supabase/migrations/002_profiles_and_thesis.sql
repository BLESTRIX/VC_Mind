create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'viewer',
  organization_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.thesis_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete restrict,
  name text not null,
  description text,
  sectors text[] not null default '{}'::text[],
  stages text[] not null default '{}'::text[],
  geographies text[] not null default '{}'::text[],
  minimum_check_size_usd bigint check (minimum_check_size_usd >= 0),
  maximum_check_size_usd bigint check (maximum_check_size_usd >= 0),
  default_check_size_usd bigint not null default 100000 check (default_check_size_usd >= 0),
  ownership_target_percentage numeric check (ownership_target_percentage between 0 and 100),
  risk_appetite text not null default 'medium' check (risk_appetite in ('low', 'medium', 'high')),
  focus_note text,
  version integer not null default 1 check (version >= 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint thesis_check_size_range check (
    minimum_check_size_usd is null or maximum_check_size_usd is null
    or minimum_check_size_usd <= maximum_check_size_usd
  ),
  unique (owner_id, name, version)
);

create unique index thesis_configs_one_active_name
  on public.thesis_configs (owner_id, lower(name)) where is_active;
create index thesis_configs_owner_id_idx on public.thesis_configs (owner_id);

