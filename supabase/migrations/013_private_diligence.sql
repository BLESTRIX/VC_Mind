-- Secure, application-scoped private diligence. All changes are additive.

create type public.reconciliation_result as enum ('matched', 'approximately_matched', 'mismatched', 'insufficient_data', 'not_applicable');
create type public.reconciliation_severity as enum ('low', 'medium', 'high', 'critical');
create type public.closing_check_status as enum ('not_started', 'in_progress', 'completed', 'waived', 'blocked');

alter table public.documents drop constraint if exists documents_document_type_check;
alter table public.documents add constraint documents_document_type_check check (document_type in (
  'pitch_deck','cap_table','safe_agreement','term_sheet','revenue_export','bank_statement',
  'customer_contract','customer_list','retention_report','product_analytics','financial_model',
  'incorporation_document','identity_document','debt_schedule','other'
));
alter table public.documents
  add column if not exists information_request_id uuid references public.information_requests(id) on delete set null,
  add column if not exists document_date date,
  add column if not exists source_system text,
  add column if not exists authenticity_status text not null default 'unreviewed',
  add column if not exists manual_review_status text not null default 'pending';
alter table public.documents add constraint documents_authenticity_status_check check (authenticity_status in ('unreviewed','authentic','questionable','rejected'));
alter table public.documents add constraint documents_manual_review_status_check check (manual_review_status in ('pending','accepted','rejected'));
create unique index documents_private_hash_unique on public.documents(application_id, sha256_hash) where sha256_hash is not null and document_type <> 'pitch_deck';

create table public.diligence_access_tokens (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);
create index diligence_access_tokens_application_idx on public.diligence_access_tokens(application_id);
create index diligence_access_tokens_active_idx on public.diligence_access_tokens(token_hash, expires_at) where revoked_at is null;

create table public.document_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  extractor_type text not null,
  extractor_version text not null,
  status text not null check (status in ('pending','processing','completed','failed')),
  structured_data jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  confidence numeric check (confidence between 0 and 1),
  model_run_id uuid references public.model_runs(id) on delete set null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index document_extractions_one_current on public.document_extractions(document_id) where is_current;
create index document_extractions_document_idx on public.document_extractions(document_id, created_at desc);

alter table public.evidence
  add column if not exists document_id uuid references public.documents(id) on delete set null,
  add column if not exists document_extraction_id uuid references public.document_extractions(id) on delete set null,
  add column if not exists observed_value jsonb,
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists source_reference text,
  add column if not exists authenticity_status text not null default 'unreviewed';
alter table public.evidence add constraint evidence_authenticity_status_check check (authenticity_status in ('unreviewed','authentic','questionable','rejected'));
create index evidence_document_idx on public.evidence(document_id) where document_id is not null;

create table public.claim_reconciliations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  claim_id uuid not null references public.claims(id) on delete cascade,
  claimed_value jsonb,
  observed_value jsonb,
  unit text,
  period_start date,
  period_end date,
  result public.reconciliation_result not null,
  variance_percentage numeric check (variance_percentage is null or variance_percentage >= 0),
  material boolean not null default false,
  severity public.reconciliation_severity not null,
  explanation text not null,
  supporting_document_ids uuid[] not null default '{}',
  reconciliation_version text not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index claim_reconciliations_one_current on public.claim_reconciliations(claim_id) where is_current;
create index claim_reconciliations_application_idx on public.claim_reconciliations(application_id, material, severity);

create table public.closing_checklist_items (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  check_type text not null,
  status public.closing_check_status not null default 'not_started',
  blocking boolean not null default true,
  evidence_document_id uuid references public.documents(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(application_id, check_type)
);
create index closing_checklist_application_idx on public.closing_checklist_items(application_id, status, blocking);

create table public.diligence_responses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  information_request_id uuid not null references public.information_requests(id) on delete cascade,
  response_text text not null check (char_length(response_text) between 1 and 10000),
  created_at timestamptz not null default now(),
  unique(information_request_id)
);

create table public.diligence_audit_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_type text not null check (actor_type in ('founder_token','staff','worker')),
  actor_id uuid,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index diligence_audit_application_idx on public.diligence_audit_events(application_id, created_at desc);

create or replace function public.rotate_private_diligence_current() returns trigger language plpgsql as $$
begin
  if tg_table_name = 'document_extractions' then update public.document_extractions set is_current=false where document_id=new.document_id and is_current;
  elsif tg_table_name = 'claim_reconciliations' then update public.claim_reconciliations set is_current=false where claim_id=new.claim_id and is_current;
  end if;
  return new;
end; $$;
create trigger document_extractions_rotate_current before insert on public.document_extractions for each row execute function public.rotate_private_diligence_current();
create trigger claim_reconciliations_rotate_current before insert on public.claim_reconciliations for each row execute function public.rotate_private_diligence_current();
create trigger closing_checklist_set_updated_at before update on public.closing_checklist_items for each row execute function public.set_updated_at();

do $$ declare table_name text; begin
  foreach table_name in array array['diligence_access_tokens','claim_reconciliations','closing_checklist_items','diligence_responses','diligence_audit_events'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', table_name || '_admin_all', table_name);
    execute format('create policy %I on public.%I for select using (public.can_access_application(application_id))', table_name || '_org_read', table_name);
  end loop;
end $$;
alter table public.document_extractions enable row level security;
create policy document_extractions_admin_all on public.document_extractions for all using (public.is_admin()) with check (public.is_admin());
create policy document_extractions_org_read on public.document_extractions for select using (exists(select 1 from public.documents d where d.id=document_id and public.can_access_application(d.application_id)));

create policy diligence_tokens_staff_write on public.diligence_access_tokens for all using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id)) with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy reconciliations_staff_write on public.claim_reconciliations for all using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id)) with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy checklist_staff_write on public.closing_checklist_items for all using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id)) with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and public.can_access_application(application_id));
create policy audit_staff_read on public.diligence_audit_events for select using (public.can_access_application(application_id));
create policy extraction_staff_write on public.document_extractions for all using (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists(select 1 from public.documents d where d.id=document_id and public.can_access_application(d.application_id))) with check (public.is_staff(array['investment_manager','analyst']::public.user_role[]) and exists(select 1 from public.documents d where d.id=document_id and public.can_access_application(d.application_id)));

grant select, insert, update, delete on public.diligence_access_tokens, public.document_extractions, public.claim_reconciliations, public.closing_checklist_items, public.diligence_responses, public.diligence_audit_events to authenticated;

-- Bucket remains non-public. Service-role backend issues short-lived signed URLs.
insert into storage.buckets(id, name, public) values ('diligence-private','diligence-private',false) on conflict(id) do update set public=false;
