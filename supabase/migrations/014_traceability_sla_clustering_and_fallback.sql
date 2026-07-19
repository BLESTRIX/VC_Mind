-- Traceable scoring, recommendation-policy audit, SLA telemetry, source
-- independence, and provider-fallback audit. All changes are additive.

alter table public.applications
  add column if not exists recommendation_policy_version text,
  add column if not exists recommendation_policy_calibrated boolean;

alter table public.memos
  add column if not exists recommendation_policy_version text,
  add column if not exists recommendation_policy_calibrated boolean;

alter table public.application_stage_events
  add column if not exists budget_seconds integer check (budget_seconds is null or budget_seconds > 0),
  add column if not exists fallback_actions jsonb not null default '[]'::jsonb;
alter table public.application_stage_events
  add constraint application_stage_events_fallback_actions_array
  check (jsonb_typeof(fallback_actions) = 'array');

create or replace function public.application_stage_budget_seconds(p_stage public.application_stage)
returns integer language sql immutable as $$
  select case p_stage
    when 'submitted' then 300 when 'extracting' then 600 when 'claims_ready' then 900
    when 'screened' then 300 when 'diligence_running' then 2700 when 'evidence_ready' then 900
    when 'memo_draft' then 1200 when 'needs_more_info' then 64800 else 14400 end;
$$;
create or replace function public.set_stage_event_budget()
returns trigger language plpgsql as $$ begin
  new.budget_seconds=coalesce(new.budget_seconds,public.application_stage_budget_seconds(new.stage));
  return new;
end; $$;
create trigger application_stage_events_set_budget before insert on public.application_stage_events
for each row execute function public.set_stage_event_budget();

alter table public.evidence_sources
  add column if not exists cluster_reason text,
  add column if not exists cluster_similarity numeric,
  add column if not exists canonical_source_id uuid references public.evidence_sources(id) on delete set null,
  add column if not exists original_publisher text,
  add column if not exists counts_as_independent boolean not null default true;
alter table public.evidence_sources
  add constraint evidence_sources_cluster_reason_check check (cluster_reason is null or cluster_reason in (
    'exact_content_match','near_duplicate_content','same_press_release','same_original_publisher',
    'same_corporate_owner','founder_controlled','manual_grouping','unique_source'
  )),
  add constraint evidence_sources_cluster_similarity_check
    check (cluster_similarity is null or cluster_similarity between 0 and 1);
create index if not exists evidence_sources_canonical_source_idx on public.evidence_sources(canonical_source_id);
-- Canonical URL variants may legitimately collapse to the same normalized URL
-- and content hash. canonical_source_id now records the surviving identity.
drop index if exists public.evidence_sources_url_hash_unique;
create index if not exists evidence_sources_url_hash_idx on public.evidence_sources(canonical_url, content_hash);

alter table public.model_runs
  add column if not exists is_fallback boolean not null default false,
  add column if not exists fallback_reason text,
  add column if not exists fallback_from_run_id uuid references public.model_runs(id) on delete set null,
  add column if not exists validation_result jsonb;
create index if not exists model_runs_fallback_from_idx on public.model_runs(fallback_from_run_id);

create table public.score_factors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  score_id uuid references public.scores(id) on delete set null,
  dimension public.score_dimension not null check (dimension <> 'overall'),
  factor_key text not null,
  factor_label text not null,
  assessment_level text not null check (assessment_level in ('none','weak','moderate','strong','exceptional')),
  score numeric not null check (score >= 0),
  maximum_score numeric not null check (maximum_score > 0),
  explanation text not null,
  supporting_claim_ids uuid[] not null default '{}',
  supporting_evidence_ids uuid[] not null default '{}',
  missing_data boolean not null default false,
  rubric_version text not null,
  model_run_id uuid references public.model_runs(id) on delete set null,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  check (score <= maximum_score),
  constraint score_factors_deterministic_score_check check (
    score = maximum_score * case assessment_level
      when 'none' then 0 when 'weak' then 0.25 when 'moderate' then 0.5
      when 'strong' then 0.75 when 'exceptional' then 1 end
  )
);
create unique index score_factors_one_current
  on public.score_factors(application_id, dimension, factor_key) where is_current;
create index score_factors_application_idx on public.score_factors(application_id, dimension, created_at desc);

create or replace function public.validate_score_factor_links()
returns trigger language plpgsql set search_path=public as $$
begin
  if exists (
    select 1 from unnest(new.supporting_claim_ids) claim_id
    left join public.claims c on c.id=claim_id and c.application_id=new.application_id
    where c.id is null
  ) then raise exception 'Score-factor claims must belong to the application'; end if;

  if exists (
    select 1 from unnest(new.supporting_evidence_ids) evidence_id
    left join public.evidence e on e.id=evidence_id and e.validation_status='valid'
    left join public.claims c on c.id=e.claim_id and c.application_id=new.application_id
    where e.id is null or c.id is null or not (e.claim_id = any(new.supporting_claim_ids))
  ) then raise exception 'Score-factor evidence must be valid and belong to a supporting application claim'; end if;
  return new;
end; $$;
create trigger score_factors_validate_links before insert or update on public.score_factors
for each row execute function public.validate_score_factor_links();

create or replace function public.rotate_current_score_factor()
returns trigger language plpgsql as $$
begin
  if new.is_current then
    update public.score_factors set is_current=false
    where application_id=new.application_id and dimension=new.dimension
      and factor_key=new.factor_key and is_current;
  end if;
  return new;
end; $$;
create trigger score_factors_rotate_current before insert on public.score_factors
for each row execute function public.rotate_current_score_factor();
create trigger score_factors_protect_history before update on public.score_factors
for each row execute function public.protect_historical_row();

alter table public.score_factors enable row level security;
create policy score_factors_admin_all on public.score_factors for all
  using (public.is_admin()) with check (public.is_admin());
create policy score_factors_org_read on public.score_factors for select
  using (public.can_access_application(application_id));
grant select, insert, update on public.score_factors to authenticated;
