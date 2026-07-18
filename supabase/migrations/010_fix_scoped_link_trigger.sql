-- Forward fix for databases that applied migration 008 before the generic
-- trigger was made record-safe. Direct NEW.field access is invalid when the
-- same trigger function is attached to tables with different row shapes.
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
    if linked_application_id is distinct from row_application_id then
      raise exception 'Search query claim must belong to the same application';
    end if;
  elsif tg_table_name = 'evidence' and row_search_query_id is not null then
    select q.application_id, q.claim_id into linked_application_id, linked_claim_id
    from public.search_queries q where q.id = row_search_query_id;
    if linked_application_id is distinct from (select application_id from public.claims where id = row_claim_id)
       or (linked_claim_id is not null and linked_claim_id <> row_claim_id) then
      raise exception 'Evidence search query must match the evidence claim application';
    end if;
  elsif tg_table_name = 'skeptic_reviews' then
    select application_id into linked_application_id from public.memos where id = row_memo_id;
    if linked_application_id is distinct from row_application_id then
      raise exception 'Skeptic review memo must belong to the same application';
    end if;
  elsif tg_table_name = 'information_requests' then
    if row_claim_id is not null then
      select application_id into linked_application_id from public.claims where id = row_claim_id;
      if linked_application_id is distinct from row_application_id then
        raise exception 'Information-request claim must belong to the same application';
      end if;
    end if;
    if row_document_id is not null then
      select application_id into linked_application_id from public.documents where id = row_document_id;
      if linked_application_id is distinct from row_application_id then
        raise exception 'Submitted document must belong to the same application';
      end if;
    end if;
  elsif tg_table_name = 'model_runs' and row_claim_id is not null then
    select application_id into linked_application_id from public.claims where id = row_claim_id;
    if row_application_id is not null and linked_application_id is distinct from row_application_id then
      raise exception 'Model-run claim must belong to the same application';
    end if;
  elsif tg_table_name = 'signals' and row_company_id is not null and row_application_id is not null then
    select company_id into linked_application_id from public.applications where id = row_application_id;
    if linked_application_id is distinct from row_company_id then
      raise exception 'Signal company must match its application company';
    end if;
  end if;
  return new;
end;
$$;
