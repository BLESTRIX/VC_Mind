create table public.companies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles (id) on delete set null,
  name text not null,
  normalized_name text,
  website_url text,
  domain text,
  sector text,
  stage text,
  geography text,
  product_description text,
  legal_name text,
  incorporation_country text,
  incorporation_date date,
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_normalized_name_idx on public.companies (normalized_name);
create index companies_domain_idx on public.companies (domain);
create index companies_created_by_idx on public.companies (created_by);

create table public.founders (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text,
  linkedin_url text,
  github_url text,
  personal_website_url text,
  location text,
  background_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index founders_email_lower_idx on public.founders (lower(email)) where email is not null;
create index founders_created_by_idx on public.founders (created_by);

create table public.company_founders (
  company_id uuid not null references public.companies (id) on delete cascade,
  founder_id uuid not null references public.founders (id) on delete cascade,
  role text,
  ownership_percentage numeric check (ownership_percentage between 0 and 100),
  is_primary boolean not null default false,
  joined_at date,
  left_at date,
  created_at timestamptz not null default now(),
  primary key (company_id, founder_id),
  check (left_at is null or joined_at is null or left_at >= joined_at)
);
create index company_founders_founder_id_idx on public.company_founders (founder_id);

