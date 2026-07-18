create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'thesis_configs', 'companies', 'founders', 'applications', 'documents',
    'claims', 'evidence_sources', 'evidence', 'deal_economics', 'information_requests',
    'processing_jobs'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at', table_name
    );
  end loop;
end;
$$;

create or replace function public.set_application_deadline()
returns trigger language plpgsql as $$
begin
  if new.decision_deadline is null then
    new.decision_deadline = new.submitted_at + interval '24 hours';
  end if;
  return new;
end;
$$;
create trigger applications_set_deadline
before insert on public.applications
for each row execute function public.set_application_deadline();

create or replace function public.validate_claim_source_links()
returns trigger language plpgsql as $$
declare
  source_application_id uuid;
  page_document_id uuid;
begin
  if new.document_id is not null then
    select application_id into source_application_id from public.documents where id = new.document_id;
    if source_application_id is distinct from new.application_id then
      raise exception 'Claim document must belong to the same application';
    end if;
  end if;
  if new.document_page_id is not null then
    select document_id into page_document_id from public.document_pages where id = new.document_page_id;
    if page_document_id is null then raise exception 'Referenced document page does not exist'; end if;
    select application_id into source_application_id from public.documents where id = page_document_id;
    if source_application_id is distinct from new.application_id then
      raise exception 'Claim document page must belong to the same application';
    end if;
    if new.document_id is not null and page_document_id <> new.document_id then
      raise exception 'Claim page must belong to the referenced document';
    end if;
  end if;
  return new;
end;
$$;
create trigger claims_validate_source_links
before insert or update of application_id, document_id, document_page_id on public.claims
for each row execute function public.validate_claim_source_links();

create or replace function public.validate_application_scoped_links()
returns trigger language plpgsql as $$
declare
  linked_application_id uuid;
  linked_claim_id uuid;
  row_data jsonb := to_jsonb(new);
  row_application_id uuid;
  row_claim_id uuid;
  row_company_id uuid;
  row_document_id uuid;
  row_memo_id uuid;
  row_search_query_id uuid;
begin
  row_application_id := nullif(row_data ->> 'application_id', '')::uuid;
  row_claim_id := nullif(row_data ->> 'claim_id', '')::uuid;
  row_company_id := nullif(row_data ->> 'company_id', '')::uuid;
  row_document_id := nullif(row_data ->> 'submitted_document_id', '')::uuid;
  row_memo_id := nullif(row_data ->> 'memo_id', '')::uuid;
  row_search_query_id := nullif(row_data ->> 'search_query_id', '')::uuid;

  if tg_table_name = 'search_queries' and row_claim_id is not null then
    select application_id into linked_application_id from public.claims where id = row_claim_id;
    if linked_application_id is distinct from row_application_id then raise exception 'Search query claim must belong to the same application'; end if;
  elsif tg_table_name = 'evidence' and row_search_query_id is not null then
    select q.application_id, q.claim_id into linked_application_id, linked_claim_id
    from public.search_queries q where q.id = row_search_query_id;
    if linked_application_id is distinct from (select application_id from public.claims where id = row_claim_id)
       or (linked_claim_id is not null and linked_claim_id <> row_claim_id) then
      raise exception 'Evidence search query must match the evidence claim application';
    end if;
  elsif tg_table_name = 'skeptic_reviews' then
    select application_id into linked_application_id from public.memos where id = row_memo_id;
    if linked_application_id is distinct from row_application_id then raise exception 'Skeptic review memo must belong to the same application'; end if;
  elsif tg_table_name = 'information_requests' then
    if row_claim_id is not null then
      select application_id into linked_application_id from public.claims where id = row_claim_id;
      if linked_application_id is distinct from row_application_id then raise exception 'Information-request claim must belong to the same application'; end if;
    end if;
    if row_document_id is not null then
      select application_id into linked_application_id from public.documents where id = row_document_id;
      if linked_application_id is distinct from row_application_id then raise exception 'Submitted document must belong to the same application'; end if;
    end if;
  elsif tg_table_name = 'model_runs' and row_claim_id is not null then
    select application_id into linked_application_id from public.claims where id = row_claim_id;
    if row_application_id is not null and linked_application_id is distinct from row_application_id then raise exception 'Model-run claim must belong to the same application'; end if;
  elsif tg_table_name = 'signals' and row_company_id is not null and row_application_id is not null then
    select company_id into linked_application_id from public.applications where id = row_application_id;
    if linked_application_id is distinct from row_company_id then raise exception 'Signal company must match its application company'; end if;
  end if;
  return new;
end;
$$;
create trigger search_queries_validate_links before insert or update on public.search_queries for each row execute function public.validate_application_scoped_links();
create trigger evidence_validate_links before insert or update on public.evidence for each row execute function public.validate_application_scoped_links();
create trigger skeptic_reviews_validate_links before insert or update on public.skeptic_reviews for each row execute function public.validate_application_scoped_links();
create trigger information_requests_validate_links before insert or update on public.information_requests for each row execute function public.validate_application_scoped_links();
create trigger model_runs_validate_links before insert or update on public.model_runs for each row execute function public.validate_application_scoped_links();
create trigger signals_validate_links before insert or update on public.signals for each row execute function public.validate_application_scoped_links();

create or replace function public.rotate_current_memo()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.memos where id = new.id) then return new; end if;
  if new.is_current then
    update public.memos set is_current = false
    where application_id = new.application_id and is_current;
  end if;
  return new;
end;
$$;
create trigger memos_rotate_current before insert on public.memos
for each row execute function public.rotate_current_memo();

create or replace function public.rotate_current_score()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.scores where id = new.id) then return new; end if;
  if new.is_current then
    update public.scores set is_current = false
    where application_id = new.application_id and dimension = new.dimension and is_current;
  end if;
  return new;
end;
$$;
create trigger scores_rotate_current before insert on public.scores
for each row execute function public.rotate_current_score();

create or replace function public.rotate_current_verification_run()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.claim_verification_runs where id = new.id) then return new; end if;
  if new.is_current then
    update public.claim_verification_runs set is_current = false
    where claim_id = new.claim_id and is_current;
  end if;
  return new;
end;
$$;
create trigger claim_verification_runs_rotate_current before insert on public.claim_verification_runs
for each row execute function public.rotate_current_verification_run();

create or replace function public.rotate_current_decision()
returns trigger language plpgsql as $$
declare
  prior_id uuid;
begin
  if exists (select 1 from public.decisions where id = new.id) then return new; end if;
  if new.is_current then
    select id into prior_id from public.decisions
    where application_id = new.application_id and is_current for update;
    if prior_id is not null then
      if new.supersedes_decision_id is null then new.supersedes_decision_id = prior_id; end if;
      if new.supersedes_decision_id <> prior_id then
        raise exception 'New decision must supersede the current decision';
      end if;
      update public.decisions set is_current = false where id = prior_id;
    elsif new.supersedes_decision_id is not null then
      raise exception 'No current decision exists to supersede';
    end if;
  end if;
  return new;
end;
$$;
create trigger decisions_rotate_current before insert on public.decisions
for each row execute function public.rotate_current_decision();

create or replace function public.protect_historical_row()
returns trigger language plpgsql as $$
begin
  if old.is_current and not new.is_current
     and (to_jsonb(new) - 'is_current') = (to_jsonb(old) - 'is_current') then
    return new;
  end if;
  raise exception '% history is immutable; insert a new version instead', tg_table_name;
end;
$$;
create trigger memos_protect_history before update on public.memos for each row execute function public.protect_historical_row();
create trigger scores_protect_history before update on public.scores for each row execute function public.protect_historical_row();
create trigger claim_verification_runs_protect_history before update on public.claim_verification_runs for each row execute function public.protect_historical_row();
create trigger decisions_protect_history before update on public.decisions for each row execute function public.protect_historical_row();

create or replace function public.protect_stage_event_history()
returns trigger language plpgsql as $$
begin
  if old.status in ('completed', 'failed', 'cancelled') then
    raise exception 'Completed stage events are immutable';
  end if;
  if new.id <> old.id or new.application_id <> old.application_id or new.stage <> old.stage
     or new.attempt_number <> old.attempt_number or new.created_at <> old.created_at then
    raise exception 'Stage-event identity fields are immutable';
  end if;
  return new;
end;
$$;
create trigger application_stage_events_protect_history
before update on public.application_stage_events
for each row execute function public.protect_stage_event_history();

create or replace function public.set_application_stage(
  p_application_id uuid,
  p_new_stage public.application_stage,
  p_status public.job_status default 'completed',
  p_error_message text default null,
  p_metadata jsonb default null
)
returns public.applications
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.applications;
  next_attempt integer;
  event_time timestamptz := now();
begin
  select coalesce(max(attempt_number), 0) + 1 into next_attempt
  from public.application_stage_events
  where application_id = p_application_id and stage = p_new_stage;

  update public.applications
  set current_stage = p_new_stage,
      claims_ready_at = case when p_new_stage = 'claims_ready' and p_status = 'completed' then event_time else claims_ready_at end,
      screened_at = case when p_new_stage = 'screened' and p_status = 'completed' then event_time else screened_at end,
      evidence_ready_at = case when p_new_stage = 'evidence_ready' and p_status = 'completed' then event_time else evidence_ready_at end,
      memo_ready_at = case when p_new_stage = 'memo_ready' and p_status = 'completed' then event_time else memo_ready_at end,
      decided_at = case when p_new_stage in ('approved', 'passed') and p_status = 'completed' then event_time else decided_at end,
      failure_reason = case when p_status = 'failed' then p_error_message else failure_reason end
  where id = p_application_id
  returning * into result;

  if result.id is null then raise exception 'Application % not found or inaccessible', p_application_id; end if;

  insert into public.application_stage_events (
    application_id, stage, attempt_number, status, started_at, completed_at,
    duration_ms, error_message, triggered_by, metadata
  ) values (
    p_application_id, p_new_stage, next_attempt, p_status, event_time,
    case when p_status in ('completed', 'failed', 'cancelled') then event_time end,
    case when p_status in ('completed', 'failed', 'cancelled') then 0 end,
    p_error_message, auth.uid(), p_metadata
  );
  return result;
end;
$$;

create or replace function public.application_evidence_coverage(p_application_id uuid)
returns numeric
language sql stable
set search_path = public
as $$
  select case when count(*) = 0 then 0::numeric
    else round(100.0 * count(*) filter (where has_evidence) / count(*), 2) end
  from (
    select c.id, exists (
      select 1 from public.evidence e
      where e.claim_id = c.id
        and e.relationship in ('supports', 'partially_supports', 'contradicts')
    ) as has_evidence
    from public.claims c
    where c.application_id = p_application_id
      and c.checkable and c.importance in ('high', 'critical')
  ) coverage_claims;
$$;

create view public.claim_evidence_summary_view
with (security_invoker = true) as
select c.id as claim_id, c.application_id, c.claim_text, c.category, c.importance,
  c.verification_status, c.evidence_confidence,
  count(distinct e.evidence_source_id)::integer as evidence_source_count,
  count(distinct e.evidence_source_id) filter (where e.relationship in ('supports', 'partially_supports'))::integer as supporting_source_count,
  count(distinct e.evidence_source_id) filter (where e.relationship = 'contradicts')::integer as contradicting_source_count,
  count(distinct es.independence_cluster) filter (where es.independence_cluster is not null)::integer as independent_source_cluster_count
from public.claims c
left join public.evidence e on e.claim_id = c.id
left join public.evidence_sources es on es.id = e.evidence_source_id
group by c.id;

create view public.current_application_scores_view
with (security_invoker = true) as
select * from public.scores where is_current;

create view public.application_summary_view
with (security_invoker = true) as
select a.id as application_id, co.name as company_name, a.current_stage, a.recommendation,
  a.investment_score, public.application_evidence_coverage(a.id) as calculated_evidence_coverage,
  a.submitted_at, a.decision_deadline,
  greatest(a.decision_deadline - now(), interval '0 seconds') as remaining_sla_time,
  memo.id as current_memo_id, decision_row.decision as current_decision,
  claims.total_claims, claims.verified_claims, claims.contradicted_claims,
  requests.open_information_requests
from public.applications a
join public.companies co on co.id = a.company_id
left join lateral (select id from public.memos m where m.application_id = a.id and m.is_current limit 1) memo on true
left join lateral (select decision from public.decisions d where d.application_id = a.id and d.is_current limit 1) decision_row on true
left join lateral (
  select count(*)::integer total_claims,
    count(*) filter (where verification_status = 'verified')::integer verified_claims,
    count(*) filter (where verification_status = 'contradicted')::integer contradicted_claims
  from public.claims c where c.application_id = a.id
) claims on true
left join lateral (
  select count(*) filter (where status in ('requested', 'submitted', 'under_review'))::integer open_information_requests
  from public.information_requests ir where ir.application_id = a.id
) requests on true;
