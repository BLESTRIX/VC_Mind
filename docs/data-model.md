# VC Brain data model

## Purpose

This Supabase PostgreSQL model provides the traceable storage layer for an investment screening process. It separates source documents, atomic claims, reproducible evidence, verification history, scoring history, memo revisions, and immutable human decisions. It contains no API, AI execution, document parsing, search integration, or workflow orchestration.

## Entities and relationships

- `profiles` maps application users to `auth.users` and records an MVP role and organization label.
- `thesis_configs` versions investment strategies. A thesis is referenced by every application, preserving the strategy used at submission time.
- `companies`, `founders`, and `company_founders` represent the reusable company team. `application_founders` snapshots the team for a specific evaluation.
- `applications` is the root of an evaluation. Documents, claims, scores, memos, decisions, jobs, events, and signals attach to it.
- `documents` stores private Storage object metadata, never file bytes. `document_pages` stores optional page-level extracted text.
- `claims` stores checkable assertions with source location. A trigger prevents document or page references from crossing applications.
- `search_queries`, `evidence_sources`, and `evidence` retain query history, reproducible source snapshots, and claim-to-source relationships. Source independence is derived from `independence_cluster`, not asserted on an evidence row.
- `claim_verification_runs`, `scores`, and `memos` retain version history with one current row per parent/dimension.
- `deal_economics` separates return assumptions from qualitative scores. `risk_resilience` is scored so a higher value means better-managed risk; risk is not a positive bonus.
- `skeptic_reviews` stores memo critiques. `information_requests` supports unresolved diligence.
- `decisions` stores human decisions as an immutable supersession chain. A recommendation is never treated as approval.
- `application_stage_events`, `processing_jobs`, and `model_runs` provide audit and reproducibility metadata without implementing orchestration.
- `signals` records domain events for future consumers without implementing a stream.

```mermaid
erDiagram
  profiles ||--o{ thesis_configs : owns
  profiles ||--o{ companies : creates
  profiles ||--o{ founders : creates
  companies ||--o{ company_founders : has
  founders ||--o{ company_founders : joins
  companies ||--o{ applications : submits
  thesis_configs ||--o{ applications : evaluates_under
  applications ||--o{ application_founders : snapshots
  founders ||--o{ application_founders : participates
  applications ||--o{ documents : contains
  documents ||--o{ document_pages : splits_into
  applications ||--o{ claims : asserts
  documents ||--o{ claims : sources
  document_pages ||--o{ claims : locates
  claims ||--o{ search_queries : prompts
  claims ||--o{ evidence : evaluated_by
  evidence_sources ||--o{ evidence : supplies
  search_queries ||--o{ evidence : discovers
  claims ||--o{ claim_verification_runs : verifies
  model_runs ||--o{ claim_verification_runs : produces
  applications ||--o{ scores : scores
  applications ||--o| deal_economics : models
  applications ||--o{ memos : revises
  memos ||--o{ skeptic_reviews : reviewed_by
  applications ||--o{ information_requests : requests
  applications ||--o{ decisions : decides
  memos ||--o{ decisions : informs
  decisions o|--o{ decisions : supersedes
  applications ||--o{ application_stage_events : audits
  applications ||--o{ processing_jobs : processes
  applications ||--o{ model_runs : records
  applications ||--o{ signals : emits
  companies ||--o{ signals : emits
```

## Claim-to-decision traceability

The traceability path is `application → document/page → claim → evidence → evidence_source → claim_verification_run → score/memo → decision`. Evidence excerpts and hashes point to retained snapshot text or private snapshot storage. Model metadata may explain a verification or memo, while the final decision always identifies a human profile. The summary views are read models only and do not replace normalized records.

## Versioning and immutability

Partial unique indexes enforce one current memo per application, one current score per application/dimension, one current verification run per claim, and one current decision per application. Before-insert triggers lock and rotate the previous current row without deleting it. History rows permit only the trigger-driven `is_current: true → false` transition; changed meaning requires a new row. Memo versions are also unique within an application, and decisions automatically link to the row they supersede.

Thesis versions have a unique `(owner_id, name, version)` identity. Only one active version of a case-insensitive thesis name is allowed per owner. Create a new version instead of overwriting the strategy used by an existing application.

## Evidence coverage

Evidence coverage is calculated in application code across every checkable claim and mirrored by `application_evidence_coverage(application_id)` for database read models. Critical, high, medium, and low claims weigh 4, 3, 2, and 1 respectively. Only `verified`, `partially_verified`, and `contradicted` count in the numerator. Zero checkable claims returns 0 with `hasCheckableClaims = false` and forces `needs_more_info`.

Evidence rows retain deterministic integrity state in `validation_status` (`pending`, `valid`, or `invalid`) plus an optional validation error. Invalid rows remain available for audit but are excluded from claim recalculation, confidence, scoring, and memo support. Current memos retain structured citation findings in the array-only `validation_flags` field.

## Row Level Security assumptions

All 24 sensitive tables have RLS enabled. Admins have full policy access. Investment managers can manage strategies, applications, evidence review, information requests, and insert decisions. Analysts can read in-scope applications and contribute diligence artifacts but cannot insert decisions. Viewers are read-only.

MVP tenancy uses `profiles.organization_name` equality plus record ownership (`submitted_by`, `created_by`, or thesis owner). Null organization labels do not create shared access. This is deliberately conservative, but organization names are not durable tenant identifiers. A future schema should add immutable organization and membership tables, migrate ownership to `organization_id`, and update policy helpers. Backend processing should use Supabase's service role, which bypasses RLS; it must never be exposed to clients.

## Local migrations and seed

Prerequisites are Docker and the Supabase CLI. From the repository root:

```bash
supabase start
supabase db reset
```

`supabase db reset` rebuilds only the local database, applies migrations in filename order, and then applies `supabase/seed.sql`. To apply the seed manually to a running local stack:

```bash
supabase db reset --no-seed
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

Never run reset against a linked remote project. Review migrations before any remote `supabase db push`.

Migration order:

1. `001_extensions_and_enums.sql`
2. `002_profiles_and_thesis.sql`
3. `003_companies_and_founders.sql`
4. `004_applications_and_documents.sql`
5. `005_claims_and_evidence.sql`
6. `006_scores_memos_and_decisions.sql`
7. `007_jobs_audit_and_model_runs.sql`
8. `008_functions_triggers_and_views.sql`
9. `009_rls_policies.sql`
10. `010_fix_scoped_link_trigger.sql`
11. `011_backend_atomic_operations.sql`
12. `012_evidence_coverage_and_citation_validation.sql`

## Validation and type generation

After `supabase db reset`, run the rollback-only validation suite:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/database_validation.sql
```

The suite checks the 24-hour deadline, checks and cascades, current-version rotation/history preservation, decision supersession, stage synchronization, views, timestamps, founder survival, and RLS enablement. Generate canonical TypeScript definitions whenever the schema changes:

```bash
supabase gen types typescript --local > src/types/database.ts
```

The checked-in file also exports enum unions and helper types for application summaries, claim/evidence summaries, current scores, and the current memo. PostgreSQL `bigint` is represented as TypeScript `number` by Supabase generation; consumers requiring values beyond JavaScript's safe integer range should serialize those fields as strings at their boundary.

## Known MVP limitations

- Organization tenancy is label/owner based rather than membership-table based.
- Evidence coverage is intentionally simple and does not assess claim truth.
- Document type and processing status use checked text to remain extensible; core workflow states use enums.
- `deal_economics` is single-current-row only and is not versioned in this MVP.
- Source snapshot retention, Storage access policies, content canonicalization, and legal retention periods require deployment-specific controls.
- Stage transition legality is enforced by the backend; `set_application_stage` provides atomic database synchronization and remains intentionally orchestration-neutral.
- `model_runs` stores metadata, not prompts or AI implementation.
