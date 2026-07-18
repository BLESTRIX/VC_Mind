create table public.applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete restrict,
  thesis_config_id uuid not null references public.thesis_configs (id) on delete restrict,
  submitted_by uuid references public.profiles (id) on delete set null,
  current_stage public.application_stage not null default 'submitted',
  recommendation public.recommendation,
  investment_score numeric check (investment_score between 0 and 10),
  evidence_coverage numeric check (evidence_coverage between 0 and 100),
  funding_ask_usd bigint check (funding_ask_usd >= 0),
  valuation_cap_usd bigint check (valuation_cap_usd >= 0),
  pre_money_valuation_usd bigint check (pre_money_valuation_usd >= 0),
  post_money_valuation_usd bigint check (post_money_valuation_usd >= 0),
  implied_ownership_percentage numeric check (implied_ownership_percentage between 0 and 100),
  decision_deadline timestamptz not null,
  submitted_at timestamptz not null default now(),
  claims_ready_at timestamptz,
  screened_at timestamptz,
  evidence_ready_at timestamptz,
  memo_ready_at timestamptz,
  decided_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (decision_deadline is null or decision_deadline > submitted_at)
);
create index applications_company_id_idx on public.applications (company_id);
create index applications_thesis_config_id_idx on public.applications (thesis_config_id);
create index applications_current_stage_idx on public.applications (current_stage);
create index applications_recommendation_idx on public.applications (recommendation);
create index applications_decision_deadline_idx on public.applications (decision_deadline);
create index applications_submitted_at_idx on public.applications (submitted_at);

create table public.application_founders (
  application_id uuid not null references public.applications (id) on delete cascade,
  founder_id uuid not null references public.founders (id) on delete restrict,
  role_at_submission text,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (application_id, founder_id)
);
create index application_founders_founder_id_idx on public.application_founders (founder_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  document_type text not null check (document_type in ('pitch_deck', 'cap_table', 'bank_statement', 'revenue_export', 'customer_contract', 'incorporation_document', 'safe_agreement', 'financial_model', 'product_analytics', 'identity_document', 'other')),
  storage_bucket text not null,
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes >= 0),
  sha256_hash text,
  version integer not null default 1 check (version >= 1),
  is_current boolean not null default true,
  processing_status text not null default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  page_count integer check (page_count >= 0),
  extracted_text jsonb,
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);
create index documents_application_id_idx on public.documents (application_id);
create index documents_document_type_idx on public.documents (document_type);
create index documents_sha256_hash_idx on public.documents (sha256_hash);

create table public.document_pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  page_number integer not null check (page_number > 0),
  page_text text,
  text_hash text,
  created_at timestamptz not null default now(),
  unique (document_id, page_number)
);
