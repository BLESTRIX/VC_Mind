create table public.application_stage_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  stage public.application_stage not null,
  attempt_number integer not null default 1 check (attempt_number >= 1),
  status public.job_status not null,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms bigint check (duration_ms >= 0),
  error_message text,
  triggered_by uuid references public.profiles (id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  unique (application_id, stage, attempt_number)
);
create index application_stage_events_application_idx on public.application_stage_events (application_id, created_at);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  job_type text not null,
  stage public.application_stage,
  status public.job_status not null default 'pending',
  attempt_number integer not null default 1 check (attempt_number >= 1),
  retry_count integer not null default 0 check (retry_count >= 0),
  idempotency_key text unique,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  payload jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);
create index processing_jobs_status_idx on public.processing_jobs (status);
create index processing_jobs_application_id_idx on public.processing_jobs (application_id);
create index processing_jobs_job_type_idx on public.processing_jobs (job_type);

create table public.model_runs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications (id) on delete cascade,
  claim_id uuid references public.claims (id) on delete cascade,
  run_type text not null,
  provider text not null,
  model_name text not null,
  model_version text,
  prompt_version text not null,
  schema_version text,
  input_hash text,
  output_hash text,
  temperature numeric check (temperature >= 0),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  estimated_cost_usd numeric check (estimated_cost_usd >= 0),
  latency_ms bigint check (latency_ms >= 0),
  status public.job_status not null,
  error_message text,
  request_metadata jsonb,
  response_metadata jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (completed_at is null or completed_at >= created_at)
);
create index model_runs_application_id_idx on public.model_runs (application_id);
create index model_runs_run_type_idx on public.model_runs (run_type);
create index model_runs_model_name_idx on public.model_runs (model_name);
create index model_runs_created_at_idx on public.model_runs (created_at);

alter table public.claim_verification_runs
  add constraint claim_verification_runs_model_run_fk foreign key (model_run_id) references public.model_runs (id) on delete set null;
alter table public.memos
  add constraint memos_model_run_fk foreign key (created_by_model_run_id) references public.model_runs (id) on delete set null;
alter table public.skeptic_reviews
  add constraint skeptic_reviews_model_run_fk foreign key (model_run_id) references public.model_runs (id) on delete set null;

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  signal_type text not null,
  title text not null,
  payload jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (company_id is not null or application_id is not null)
);
create index signals_application_id_idx on public.signals (application_id);
create index signals_company_id_idx on public.signals (company_id);
create index signals_signal_type_idx on public.signals (signal_type);
create index signals_occurred_at_idx on public.signals (occurred_at);
