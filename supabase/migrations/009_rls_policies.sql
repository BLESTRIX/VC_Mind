create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select coalesce(public.current_user_role() = 'admin', false) $$;

create or replace function public.is_staff(allowed_roles public.user_role[])
returns boolean
language sql stable security definer
set search_path = public
as $$ select coalesce(public.current_user_role() = any(allowed_roles), false) $$;

create or replace function public.same_organization(profile_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    profile_id = auth.uid() or exists (
      select 1 from public.profiles me join public.profiles target on target.id = profile_id
      where me.id = auth.uid() and me.organization_name is not null
        and me.organization_name = target.organization_name
    ), false
  )
$$;

create or replace function public.can_access_application(target_application_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.applications a
    join public.companies c on c.id = a.company_id
    join public.thesis_configs t on t.id = a.thesis_config_id
    where a.id = target_application_id
      and (public.same_organization(a.submitted_by)
        or public.same_organization(c.created_by)
        or public.same_organization(t.owner_id))
  )
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','thesis_configs','companies','founders','company_founders','applications',
    'application_founders','documents','document_pages','claims','search_queries','evidence_sources',
    'evidence','claim_verification_runs','scores','deal_economics','memos','skeptic_reviews',
    'information_requests','decisions','application_stage_events','processing_jobs','model_runs','signals'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      table_name || '_admin_all', table_name
    );
  end loop;
end;
$$;

create policy profiles_org_read on public.profiles for select
using (public.same_organization(id));

create policy thesis_org_read on public.thesis_configs for select
using (public.same_organization(owner_id));
create policy thesis_manager_insert on public.thesis_configs for insert
with check (public.is_staff(array['investment_manager']::public.user_role[]) and public.same_organization(owner_id));
create policy thesis_manager_update on public.thesis_configs for update
using (public.is_staff(array['investment_manager']::public.user_role[]) and public.same_organization(owner_id))
with check (public.is_staff(array['investment_manager']::public.user_role[]) and public.same_organization(owner_id));

create policy companies_org_read on public.companies for select using (public.same_organization(created_by));
create policy companies_staff_insert on public.companies for insert
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and created_by = auth.uid());
create policy companies_manager_update on public.companies for update
using (public.is_staff(array['investment_manager']::public.user_role[]) and public.same_organization(created_by))
with check (public.is_staff(array['investment_manager']::public.user_role[]) and public.same_organization(created_by));

create policy founders_org_read on public.founders for select using (public.same_organization(created_by));
create policy founders_staff_insert on public.founders for insert
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and created_by = auth.uid());
create policy founders_staff_update on public.founders for update
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.same_organization(created_by))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.same_organization(created_by));

create policy company_founders_org_read on public.company_founders for select
using (exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by)));
create policy company_founders_staff_write on public.company_founders for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by)))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by)));

create policy applications_org_read on public.applications for select using (public.can_access_application(id));
create policy applications_manager_insert on public.applications for insert
with check (
  public.is_staff(array['investment_manager']::public.user_role[]) and submitted_by = auth.uid()
  and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by))
  and exists (select 1 from public.thesis_configs t where t.id = thesis_config_id and public.same_organization(t.owner_id))
);
create policy applications_manager_update on public.applications for update
using (public.is_staff(array['investment_manager']::public.user_role[]) and public.can_access_application(id))
with check (public.is_staff(array['investment_manager']::public.user_role[]) and public.can_access_application(id));

-- Application-scoped tables share the same organization access rule. Service-role jobs bypass RLS.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'application_founders','documents','claims','search_queries','scores','deal_economics','memos',
    'skeptic_reviews','information_requests','application_stage_events','processing_jobs','model_runs'
  ] loop
    execute format(
      'create policy %I on public.%I for select using (public.can_access_application(application_id))',
      table_name || '_org_read', table_name
    );
  end loop;
end;
$$;

create policy application_founders_staff_write on public.application_founders for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy documents_staff_write on public.documents for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy claims_staff_write on public.claims for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy search_queries_staff_write on public.search_queries for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy scores_staff_write on public.scores for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy deal_economics_staff_write on public.deal_economics for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy memos_staff_write on public.memos for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy skeptic_reviews_staff_write on public.skeptic_reviews for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy information_requests_staff_write on public.information_requests for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy stage_events_manager_write on public.application_stage_events for all
using (public.is_staff(array['investment_manager']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager']::public.user_role[]) and public.can_access_application(application_id));
create policy jobs_staff_write on public.processing_jobs for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy model_runs_staff_write on public.model_runs for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and (application_id is null or public.can_access_application(application_id)))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and application_id is not null and public.can_access_application(application_id));

create policy document_pages_org_read on public.document_pages for select
using (exists (select 1 from public.documents d where d.id = document_id and public.can_access_application(d.application_id)));
create policy document_pages_staff_write on public.document_pages for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.documents d where d.id = document_id and public.can_access_application(d.application_id)))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.documents d where d.id = document_id and public.can_access_application(d.application_id)));

create policy evidence_sources_staff_read on public.evidence_sources for select
using (public.is_staff(array['investment_manager','analyst','viewer']::public.user_role[]));
create policy evidence_sources_staff_write on public.evidence_sources for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]));

create policy evidence_org_read on public.evidence for select
using (exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)));
create policy evidence_staff_write on public.evidence for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)));

create policy verification_runs_org_read on public.claim_verification_runs for select
using (exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)));
create policy verification_runs_staff_write on public.claim_verification_runs for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists (select 1 from public.claims c where c.id = claim_id and public.can_access_application(c.application_id)));

create policy decisions_org_read on public.decisions for select using (public.can_access_application(application_id));
create policy decisions_manager_insert on public.decisions for insert
with check (public.is_staff(array['investment_manager']::public.user_role[]) and decided_by = auth.uid() and public.can_access_application(application_id));

create policy signals_org_read on public.signals for select
using ((application_id is not null and public.can_access_application(application_id)) or
  (company_id is not null and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by))));
create policy signals_staff_write on public.signals for all
using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and ((application_id is not null and public.can_access_application(application_id)) or (company_id is not null and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by)))))
with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and ((application_id is not null and public.can_access_application(application_id)) or (company_id is not null and exists (select 1 from public.companies c where c.id = company_id and public.same_organization(c.created_by)))));

grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.set_application_stage(uuid, public.application_stage, public.job_status, text, jsonb) to authenticated;
grant execute on function public.application_evidence_coverage(uuid) to authenticated;
