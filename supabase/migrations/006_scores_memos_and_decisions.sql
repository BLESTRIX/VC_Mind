create table public.scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  dimension public.score_dimension not null,
  score numeric not null check (score between 0 and 10),
  weight numeric not null check (weight between 0 and 1),
  weighted_score numeric not null check (weighted_score >= 0),
  explanation text,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  scoring_version text not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index scores_one_current_dimension
  on public.scores (application_id, dimension) where is_current;
create index scores_application_id_idx on public.scores (application_id);

create table public.deal_economics (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  proposed_check_size_usd bigint check (proposed_check_size_usd >= 0),
  pre_money_valuation_usd bigint check (pre_money_valuation_usd >= 0),
  post_money_valuation_usd bigint check (post_money_valuation_usd >= 0),
  implied_ownership_percentage numeric check (implied_ownership_percentage between 0 and 100),
  expected_future_dilution_percentage numeric check (expected_future_dilution_percentage between 0 and 100),
  expected_exit_valuation_usd bigint check (expected_exit_valuation_usd >= 0),
  expected_return_multiple numeric check (expected_return_multiple >= 0),
  minimum_required_return_multiple numeric check (minimum_required_return_multiple >= 0),
  follow_on_capital_required_usd bigint check (follow_on_capital_required_usd >= 0),
  terms_summary text,
  calculation_inputs jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memos (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  previous_memo_id uuid references public.memos (id) on delete set null,
  investment_hypothesis text,
  thesis_alignment text,
  strengths jsonb not null default '[]'::jsonb check (jsonb_typeof(strengths) = 'array'),
  weaknesses jsonb not null default '[]'::jsonb check (jsonb_typeof(weaknesses) = 'array'),
  opportunities jsonb not null default '[]'::jsonb check (jsonb_typeof(opportunities) = 'array'),
  threats jsonb not null default '[]'::jsonb check (jsonb_typeof(threats) = 'array'),
  verified_claims jsonb not null default '[]'::jsonb check (jsonb_typeof(verified_claims) = 'array'),
  unverified_claims jsonb not null default '[]'::jsonb check (jsonb_typeof(unverified_claims) = 'array'),
  contradicted_claims jsonb not null default '[]'::jsonb check (jsonb_typeof(contradicted_claims) = 'array'),
  validation_flags jsonb not null default '[]'::jsonb check (jsonb_typeof(validation_flags) = 'array'),
  key_questions jsonb not null default '[]'::jsonb check (jsonb_typeof(key_questions) = 'array'),
  strongest_reason_to_pass text,
  recommendation public.recommendation not null,
  recommendation_reason text,
  confidence numeric check (confidence between 0 and 1),
  is_current boolean not null default true,
  created_by_model_run_id uuid,
  created_at timestamptz not null default now(),
  unique (application_id, version)
);
create unique index memos_one_current on public.memos (application_id) where is_current;
create index memos_application_id_idx on public.memos (application_id);

create table public.skeptic_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  memo_id uuid not null references public.memos (id) on delete cascade,
  issues jsonb not null default '[]'::jsonb check (jsonb_typeof(issues) = 'array'),
  strongest_reason_to_pass text,
  recommended_changes jsonb not null default '[]'::jsonb check (jsonb_typeof(recommended_changes) = 'array'),
  model_run_id uuid,
  created_at timestamptz not null default now()
);

create table public.information_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  claim_id uuid references public.claims (id) on delete set null,
  requested_by uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  requested_document_type text,
  status public.information_request_status not null default 'requested',
  due_at timestamptz,
  submitted_document_id uuid references public.documents (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index information_requests_application_id_idx on public.information_requests (application_id);
create index information_requests_status_idx on public.information_requests (status);
create index information_requests_due_at_idx on public.information_requests (due_at);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  memo_id uuid references public.memos (id) on delete set null,
  decision public.human_decision not null,
  decision_reason text,
  decided_by uuid not null references public.profiles (id) on delete restrict,
  supersedes_decision_id uuid references public.decisions (id) on delete restrict,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index decisions_one_current on public.decisions (application_id) where is_current;
create index decisions_application_current_idx on public.decisions (application_id, is_current);
