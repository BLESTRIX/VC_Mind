create table public.claims (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  document_page_id uuid references public.document_pages (id) on delete set null,
  claim_text text not null,
  category public.claim_category not null,
  importance public.claim_importance not null default 'medium',
  source_type text not null,
  source_excerpt text,
  source_start_offset integer check (source_start_offset >= 0),
  source_end_offset integer check (source_end_offset >= 0),
  checkable boolean not null default true,
  verification_status public.claim_verification_status not null default 'unverified',
  evidence_confidence numeric check (evidence_confidence between 0 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_end_offset is null or source_start_offset is null or source_end_offset >= source_start_offset)
);
create index claims_application_id_idx on public.claims (application_id);
create index claims_category_idx on public.claims (category);
create index claims_importance_idx on public.claims (importance);
create index claims_verification_status_idx on public.claims (verification_status);
create index claims_application_verification_idx on public.claims (application_id, verification_status);

create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  claim_id uuid references public.claims (id) on delete cascade,
  provider text not null,
  query_text text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  result_count integer check (result_count >= 0),
  status public.job_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= requested_at)
);
create index search_queries_application_id_idx on public.search_queries (application_id);
create index search_queries_claim_id_idx on public.search_queries (claim_id);

create table public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null,
  source_title text,
  source_domain text,
  source_type public.evidence_source_type not null,
  publisher_name text,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  content_hash text,
  snapshot_text text,
  snapshot_storage_path text,
  founder_controlled boolean not null default false,
  authoritative_source boolean not null default false,
  independence_cluster text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (snapshot_text is not null or snapshot_storage_path is not null)
);
create unique index evidence_sources_url_hash_unique
  on public.evidence_sources (canonical_url, content_hash) where content_hash is not null;
create index evidence_sources_domain_idx on public.evidence_sources (source_domain);
create index evidence_sources_published_at_idx on public.evidence_sources (published_at);
create index evidence_sources_independence_cluster_idx on public.evidence_sources (independence_cluster);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  evidence_source_id uuid not null references public.evidence_sources (id) on delete restrict,
  search_query_id uuid references public.search_queries (id) on delete set null,
  relationship public.evidence_relationship not null,
  excerpt text not null,
  excerpt_hash text,
  source_quality numeric check (source_quality between 0 and 1),
  entity_match numeric check (entity_match between 0 and 1),
  freshness numeric check (freshness between 0 and 1),
  evidence_completeness numeric check (evidence_completeness between 0 and 1),
  model_confidence numeric check (model_confidence between 0 and 1),
  human_review_status text check (human_review_status is null or human_review_status in ('pending', 'accepted', 'rejected')),
  human_reviewed_by uuid references public.profiles (id) on delete set null,
  human_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index evidence_exact_duplicate_unique
  on public.evidence (claim_id, evidence_source_id, relationship, excerpt_hash)
  where excerpt_hash is not null;
create index evidence_claim_id_idx on public.evidence (claim_id);
create index evidence_source_id_idx on public.evidence (evidence_source_id);
create index evidence_relationship_idx on public.evidence (relationship);
create index evidence_claim_relationship_idx on public.evidence (claim_id, relationship);

create table public.claim_verification_runs (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  status public.claim_verification_status not null,
  confidence numeric check (confidence between 0 and 1),
  reason text,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  model_run_id uuid,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index claim_verification_runs_one_current
  on public.claim_verification_runs (claim_id) where is_current;
create index claim_verification_runs_claim_id_idx on public.claim_verification_runs (claim_id);
