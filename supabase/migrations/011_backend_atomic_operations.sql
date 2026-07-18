-- Backend integration helpers. No existing tables or historical records are changed.
create or replace function public.create_vc_application(p_input jsonb, p_user_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  company_input jsonb := p_input->'company';
  founder_input jsonb;
  company_id_value uuid;
  founder_id_value uuid;
  application_id_value uuid := gen_random_uuid();
  domain_value text := nullif(lower(p_input#>>'{company,domain}'),'');
begin
  if not exists (select 1 from public.profiles where id=p_user_id) then raise exception 'Profile not found'; end if;
  if not exists (select 1 from public.thesis_configs where id=(p_input->>'thesisConfigId')::uuid) then raise exception 'Thesis not found'; end if;
  if domain_value is not null then select id into company_id_value from public.companies where domain=domain_value and created_by=p_user_id order by created_at limit 1; end if;
  if company_id_value is null then
    insert into public.companies(created_by,name,normalized_name,website_url,domain,sector,stage,geography,product_description)
    values(p_user_id,company_input->>'name',lower(trim(company_input->>'name')),nullif(company_input->>'websiteUrl',''),domain_value,nullif(company_input->>'sector',''),nullif(company_input->>'stage',''),nullif(company_input->>'geography',''),nullif(company_input->>'productDescription','')) returning id into company_id_value;
  end if;
  insert into public.applications(id,company_id,thesis_config_id,submitted_by,funding_ask_usd,valuation_cap_usd,pre_money_valuation_usd)
  values(application_id_value,company_id_value,(p_input->>'thesisConfigId')::uuid,p_user_id,(p_input->>'fundingAskUsd')::bigint,(p_input->>'valuationCapUsd')::bigint,(p_input->>'preMoneyValuationUsd')::bigint);
  for founder_input in select value from jsonb_array_elements(p_input->'founders') loop
    founder_id_value := null;
    if nullif(founder_input->>'email','') is not null then select id into founder_id_value from public.founders where created_by=p_user_id and lower(email)=lower(founder_input->>'email') order by created_at limit 1; end if;
    if founder_id_value is null then insert into public.founders(created_by,full_name,email,linkedin_url,github_url) values(p_user_id,founder_input->>'fullName',nullif(founder_input->>'email',''),nullif(founder_input->>'linkedinUrl',''),nullif(founder_input->>'githubUrl','')) returning id into founder_id_value; end if;
    insert into public.company_founders(company_id,founder_id,role,is_primary) values(company_id_value,founder_id_value,nullif(founder_input->>'role',''),coalesce((founder_input->>'isPrimaryContact')::boolean,false)) on conflict(company_id,founder_id) do update set role=coalesce(excluded.role,public.company_founders.role);
    insert into public.application_founders(application_id,founder_id,role_at_submission,is_primary_contact) values(application_id_value,founder_id_value,nullif(founder_input->>'role',''),coalesce((founder_input->>'isPrimaryContact')::boolean,false));
  end loop;
  insert into public.application_stage_events(application_id,stage,status,started_at,completed_at,duration_ms,triggered_by,metadata) values(application_id_value,'submitted','completed',now(),now(),0,p_user_id,'{"source":"application_service"}');
  insert into public.signals(company_id,application_id,signal_type,title,payload,occurred_at) values(company_id_value,application_id_value,'application_submitted','Application submitted','{}',now());
  return application_id_value;
end; $$;

create or replace function public.claim_next_processing_job()
returns public.processing_jobs language plpgsql security definer set search_path=public as $$
declare selected public.processing_jobs;
begin
  select * into selected from public.processing_jobs
  where status='pending' and coalesce((payload->>'next_attempt_at')::timestamptz,'-infinity')<=now()
  order by created_at for update skip locked limit 1;
  if selected.id is null then return null; end if;
  update public.processing_jobs set status='running',started_at=now(),attempt_number=attempt_number+case when retry_count>0 then 1 else 0 end where id=selected.id returning * into selected;
  return selected;
end; $$;

revoke all on function public.create_vc_application(jsonb,uuid) from public,anon,authenticated;
revoke all on function public.claim_next_processing_job() from public,anon,authenticated;
grant execute on function public.create_vc_application(jsonb,uuid) to service_role;
grant execute on function public.claim_next_processing_job() to service_role;
