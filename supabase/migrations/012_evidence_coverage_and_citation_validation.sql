alter table public.memos
  add column if not exists validation_flags jsonb not null default '[]'::jsonb;

alter table public.memos
  drop constraint if exists memos_validation_flags_is_array;
alter table public.memos
  add constraint memos_validation_flags_is_array
  check (jsonb_typeof(validation_flags) = 'array');

create or replace function public.application_evidence_coverage(p_application_id uuid)
returns numeric
language sql stable
set search_path = public
as $$
  select coalesce(
    round(
      100.0 * sum(weight) filter (where verification_status <> 'unverified')
      / nullif(sum(weight), 0),
      2
    ),
    0::numeric
  )
  from (
    select c.verification_status,
      case c.importance
        when 'high' then 3
        when 'critical' then 3
        when 'medium' then 2
        else 1
      end::numeric as weight
    from public.claims c
    where c.application_id = p_application_id
      and c.checkable
  ) coverage_claims;
$$;

-- Memo history remains immutable except for appending deterministic validation
-- findings to the current memo immediately before it becomes ready.
create or replace function public.protect_memo_history()
returns trigger language plpgsql as $$
begin
  if old.is_current and not new.is_current
     and (to_jsonb(new) - 'is_current') = (to_jsonb(old) - 'is_current') then
    return new;
  end if;

  if old.is_current and new.is_current
     and (to_jsonb(new) - 'validation_flags') = (to_jsonb(old) - 'validation_flags')
     and new.validation_flags @> old.validation_flags then
    return new;
  end if;

  raise exception 'memos history is immutable; insert a new version instead';
end;
$$;

drop trigger if exists memos_protect_history on public.memos;
create trigger memos_protect_history
before update on public.memos
for each row execute function public.protect_memo_history();
