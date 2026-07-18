begin;

do $$
declare
  test_app uuid := '50000000-0000-4000-8000-000000000099';
  deadline timestamptz;
  submitted timestamptz;
  count_value integer;
  first_memo uuid := 'b0000000-0000-4000-8000-000000000098';
  second_memo uuid := 'b0000000-0000-4000-8000-000000000099';
begin
  insert into public.applications (id, company_id, thesis_config_id, submitted_by, submitted_at)
  values (test_app, '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00');

  select decision_deadline, submitted_at into deadline, submitted from public.applications where id = test_app;
  if deadline <> submitted + interval '24 hours' then raise exception 'Deadline trigger validation failed'; end if;

  begin
    insert into public.applications (company_id, thesis_config_id, funding_ask_usd)
    values ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', -1);
    raise exception 'Negative-money constraint did not fire';
  exception when check_violation then null;
  end;

  insert into public.scores (application_id, dimension, score, weight, weighted_score, scoring_version)
  values (test_app, 'overall', 5, 1, 5, 'validation-v1');
  insert into public.scores (application_id, dimension, score, weight, weighted_score, scoring_version)
  values (test_app, 'overall', 6, 1, 6, 'validation-v2');
  select count(*) into count_value from public.scores where application_id = test_app;
  if count_value <> 2 then raise exception 'Score history was not preserved'; end if;
  select count(*) into count_value from public.scores where application_id = test_app and dimension = 'overall' and is_current;
  if count_value <> 1 then raise exception 'Current-score rotation failed'; end if;

  insert into public.memos (id, application_id, version, recommendation)
  values (first_memo, test_app, 1, 'needs_more_info');
  insert into public.memos (id, application_id, version, previous_memo_id, recommendation)
  values (second_memo, test_app, 2, first_memo, 'invest');
  select count(*) into count_value from public.memos where application_id = test_app;
  if count_value <> 2 then raise exception 'Memo history was not preserved'; end if;
  select count(*) into count_value from public.memos where application_id = test_app and is_current;
  if count_value <> 1 then raise exception 'Current-memo rotation failed'; end if;

  update public.applications set recommendation = 'invest' where id = test_app;
  update public.memos set validation_flags = '[{"type":"invalid_excerpt"}]'::jsonb where id = second_memo;
  if jsonb_array_length((select validation_flags from public.memos where id = second_memo)) <> 1
    then raise exception 'Memo validation flags were not appended'; end if;
  begin
    update public.memos set validation_flags = '{}'::jsonb where id = second_memo;
    raise exception 'Memo validation_flags array constraint did not fire';
  exception when check_violation or raise_exception then null;
  end;

  update public.evidence set validation_status = 'valid' where id = '90000000-0000-4000-8000-000000000001';
  begin
    update public.evidence set validation_status = 'unknown' where id = '90000000-0000-4000-8000-000000000001';
    raise exception 'Evidence validation status constraint did not fire';
  exception when check_violation then null;
  end;

  insert into public.decisions (application_id, memo_id, decision, decided_by)
  values (test_app, second_memo, 'conditional_approval', '10000000-0000-4000-8000-000000000001');
  insert into public.decisions (application_id, memo_id, decision, decided_by)
  values (test_app, second_memo, 'approved', '10000000-0000-4000-8000-000000000001');
  select count(*) into count_value from public.decisions where application_id = test_app and is_current;
  if count_value <> 1 then raise exception 'Current-decision rotation failed'; end if;
  if not exists (select 1 from public.decisions where application_id = test_app and supersedes_decision_id is not null)
    then raise exception 'Decision supersession link was not created'; end if;

  perform public.set_application_stage(test_app, 'claims_ready', 'completed', null, '{"validation":true}'::jsonb);
  if not exists (select 1 from public.application_stage_events where application_id = test_app and stage = 'claims_ready')
    then raise exception 'Atomic stage event was not created'; end if;

  perform * from public.application_summary_view where application_id = test_app;
  perform * from public.claim_evidence_summary_view limit 1;
  perform * from public.current_application_scores_view where application_id = test_app;

  update public.applications set updated_at = '2000-01-01 00:00:00+00' where id = test_app;
  update public.applications set failure_reason = 'timestamp validation' where id = test_app;
  if (select updated_at <= '2000-01-01 00:00:00+00' from public.applications where id = test_app)
    then raise exception 'updated_at trigger failed'; end if;

  delete from public.applications where id = test_app;
  if exists (select 1 from public.scores where application_id = test_app)
    then raise exception 'Application dependent records did not cascade'; end if;
  if not exists (select 1 from public.founders where id = '40000000-0000-4000-8000-000000000001')
    then raise exception 'Unrelated founder was deleted'; end if;
end;
$$;

do $$
declare missing_rls integer;
begin
  select count(*) into missing_rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    and c.relname in ('profiles','thesis_configs','companies','founders','company_founders','applications','application_founders','documents','document_pages','claims','search_queries','evidence_sources','evidence','claim_verification_runs','scores','deal_economics','memos','skeptic_reviews','information_requests','decisions','application_stage_events','processing_jobs','model_runs','signals');
  if missing_rls <> 0 then raise exception '% sensitive tables are missing RLS', missing_rls; end if;
end;
$$;

rollback;
