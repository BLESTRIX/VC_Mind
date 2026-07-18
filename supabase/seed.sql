-- Development-only, fictional data. Reserved .invalid URLs are deliberately non-production.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
  'dev.manager@vcbrain.invalid', crypt('development-only', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', ''
) on conflict (id) do nothing;

insert into public.profiles (id, full_name, role, organization_name)
values ('10000000-0000-4000-8000-000000000001', 'Development Manager', 'investment_manager', 'Northstar Fictional Ventures')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, organization_name = excluded.organization_name;

insert into public.thesis_configs (
  id, owner_id, name, description, sectors, stages, geographies,
  minimum_check_size_usd, maximum_check_size_usd, default_check_size_usd,
  ownership_target_percentage, risk_appetite, focus_note
) values (
  '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
  'Responsible B2B Software', 'Fictional seed thesis for capital-efficient software.',
  array['B2B SaaS','Climate software'], array['pre-seed','seed'], array['US','Canada'],
  50000, 500000, 100000, 7.5, 'medium', 'Prefer auditable customer value and disciplined growth.'
) on conflict (id) do update set description = excluded.description, updated_at = now();

insert into public.companies (
  id, created_by, name, normalized_name, website_url, domain, sector, stage, geography,
  product_description, legal_name, incorporation_country, incorporation_date
) values (
  '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
  'Lumen Orchard Labs', 'lumen orchard labs', 'https://lumen-orchard.example.invalid',
  'lumen-orchard.example.invalid', 'Climate software', 'seed', 'Canada',
  'Fictional energy-monitoring software for cold-storage operators.', 'Lumen Orchard Labs Inc.', 'Canada', '2024-03-14'
) on conflict (id) do update set product_description = excluded.product_description, updated_at = now();

insert into public.founders (id, created_by, full_name, email, location, background_summary) values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Avery Rowan', 'avery@lumen-orchard.example.invalid', 'Toronto, Canada', 'Fictional product and energy-systems background.'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Jordan Vale', 'jordan@lumen-orchard.example.invalid', 'Vancouver, Canada', 'Fictional software engineering and operations background.')
on conflict (id) do update set background_summary = excluded.background_summary, updated_at = now();

insert into public.company_founders (company_id, founder_id, role, ownership_percentage, is_primary, joined_at) values
  ('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'CEO', 42, true, '2024-03-14'),
  ('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'CTO', 38, false, '2024-03-14')
on conflict (company_id, founder_id) do update set role = excluded.role, ownership_percentage = excluded.ownership_percentage;

insert into public.applications (
  id, company_id, thesis_config_id, submitted_by, current_stage, funding_ask_usd,
  pre_money_valuation_usd, submitted_at, decision_deadline
) values (
  '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
  'submitted', 400000, 3600000, '2026-01-15 12:00:00+00', '2026-01-16 12:00:00+00'
) on conflict (id) do update set funding_ask_usd = excluded.funding_ask_usd, updated_at = now();

insert into public.application_founders (application_id, founder_id, role_at_submission, is_primary_contact) values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'CEO', true),
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'CTO', false)
on conflict (application_id, founder_id) do update set role_at_submission = excluded.role_at_submission;

insert into public.documents (
  id, application_id, uploaded_by, document_type, storage_bucket, storage_path,
  original_filename, mime_type, file_size_bytes, sha256_hash, processing_status, page_count
) values (
  '60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001', 'pitch_deck', 'diligence-private',
  'seed/lumen-orchard/pitch-deck-v1.pdf', 'lumen-orchard-pitch-deck.pdf', 'application/pdf',
  245760, repeat('a', 64), 'completed', 12
) on conflict (id) do update set processing_status = excluded.processing_status, updated_at = now();

insert into public.document_pages (id, document_id, page_number, page_text, text_hash) values
  ('61000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 3, 'Fictional traction and customer claims.', repeat('b', 64)),
  ('61000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 7, 'Fictional market and product claims.', repeat('c', 64))
on conflict (document_id, page_number) do update set page_text = excluded.page_text;

insert into public.claims (
  id, application_id, document_id, document_page_id, claim_text, category, importance,
  source_type, source_excerpt, checkable, verification_status, evidence_confidence
) values
  ('70000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000001','The company has 18 paying locations.','traction','critical','pitch_deck','18 paying locations',true,'partially_verified',0.78),
  ('70000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000001','Annual recurring revenue is USD 216,000.','financial','critical','pitch_deck','216k ARR',true,'contradicted',0.82),
  ('70000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002','The addressable regional market exceeds USD 900 million.','market','high','pitch_deck','900m regional market',true,'partially_verified',0.61),
  ('70000000-0000-4000-8000-000000000004','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002','Deployments reduce electricity consumption by 12 percent on average.','product','high','pitch_deck','12% average reduction',true,'verified',0.87),
  ('70000000-0000-4000-8000-000000000005','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',null,'Both founders are working full time.','founder','medium','pitch_deck','full-time founders',true,'unverified',null),
  ('70000000-0000-4000-8000-000000000006','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',null,'Gross margin is 81 percent.','business_model','high','pitch_deck','81% gross margin',true,'unverified',null),
  ('70000000-0000-4000-8000-000000000007','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',null,'The proposed round uses a post-money SAFE.','deal_terms','medium','pitch_deck','post-money SAFE',true,'verified',0.95),
  ('70000000-0000-4000-8000-000000000008','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',null,'No material litigation is pending.','legal','high','pitch_deck','no material litigation',true,'not_checkable',0.30)
on conflict (id) do update set claim_text = excluded.claim_text, updated_at = now();

insert into public.evidence_sources (
  id, canonical_url, source_title, source_domain, source_type, publisher_name, content_hash,
  snapshot_text, founder_controlled, authoritative_source, independence_cluster
) values
  ('80000000-0000-4000-8000-000000000001','https://registry.example.invalid/lumen-orchard','Fictional corporate registry extract','registry.example.invalid','government','Example Registry',repeat('1',64),'Development fixture: incorporation record.',false,true,'example-registry'),
  ('80000000-0000-4000-8000-000000000002','https://customer-a.example.invalid/case-study','Fictional customer A confirmation','customer-a.example.invalid','customer_document','Customer A',repeat('2',64),'Development fixture: six deployed locations.',false,false,'customer-a'),
  ('80000000-0000-4000-8000-000000000003','https://customer-b.example.invalid/energy-report','Fictional customer B energy report','customer-b.example.invalid','customer_document','Customer B',repeat('3',64),'Development fixture: measured energy reduction.',false,false,'customer-b'),
  ('80000000-0000-4000-8000-000000000004','https://market-research.example.invalid/cold-storage','Fictional cold-storage market study','market-research.example.invalid','research','Example Research',repeat('4',64),'Development fixture: regional market estimate.',false,false,'example-research'),
  ('80000000-0000-4000-8000-000000000005','https://accounting.example.invalid/revenue-review','Fictional accounting review','accounting.example.invalid','financial_document','Example Accounting',repeat('5',64),'Development fixture: annualized recurring revenue was lower than claimed.',false,true,'example-accounting')
on conflict (id) do update set snapshot_text = excluded.snapshot_text, updated_at = now();

insert into public.evidence (
  id, claim_id, evidence_source_id, relationship, excerpt, excerpt_hash,
  source_quality, entity_match, freshness, evidence_completeness, model_confidence, human_review_status
) values
  ('90000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000002','partially_supports','Customer A confirms six locations.',repeat('6',64),0.8,0.95,0.9,0.6,0.85,'accepted'),
  ('90000000-0000-4000-8000-000000000002','70000000-0000-4000-8000-000000000002','80000000-0000-4000-8000-000000000005','contradicts','Review annualizes recurring revenue at USD 168,000.',repeat('7',64),0.95,0.98,0.92,0.9,0.9,'accepted'),
  ('90000000-0000-4000-8000-000000000003','70000000-0000-4000-8000-000000000003','80000000-0000-4000-8000-000000000004','partially_supports','Study estimates a USD 710 million regional segment.',repeat('8',64),0.75,0.8,0.75,0.7,0.72,'accepted'),
  ('90000000-0000-4000-8000-000000000004','70000000-0000-4000-8000-000000000004','80000000-0000-4000-8000-000000000003','supports','Customer B measured a 12.4 percent reduction.',repeat('9',64),0.88,0.96,0.9,0.88,0.91,'accepted'),
  ('90000000-0000-4000-8000-000000000005','70000000-0000-4000-8000-000000000004','80000000-0000-4000-8000-000000000002','supports','Customer A measured an 11.7 percent reduction.',repeat('0',64),0.8,0.95,0.85,0.82,0.87,'accepted')
on conflict (id) do nothing;

insert into public.claim_verification_runs (id, claim_id, status, confidence, reason, evidence_count) values
  ('91000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000004','verified',0.87,'Two independent fictional customer fixtures support the claim.',2)
on conflict (id) do nothing;

insert into public.scores (id, application_id, dimension, score, weight, weighted_score, explanation, evidence_count, scoring_version) values
  ('a0000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','founder',7.4,0.15,1.11,'Complementary fictional team.',0,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000001','market',6.5,0.15,0.975,'Market evidence supports a smaller estimate.',1,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000001','traction',6.8,0.15,1.02,'Some customer footprint is independently supported.',1,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000004','50000000-0000-4000-8000-000000000001','product',8.1,0.15,1.215,'Energy outcome has two source clusters.',2,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000005','50000000-0000-4000-8000-000000000001','thesis_fit',8.0,0.10,0.8,'Fits the fictional seed thesis.',0,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000006','50000000-0000-4000-8000-000000000001','deal_economics',6.9,0.10,0.69,'Seed terms are plausible but incomplete.',0,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000007','50000000-0000-4000-8000-000000000001','risk_resilience',5.6,0.10,0.56,'Revenue discrepancy remains unresolved.',1,'seed-v1'),
  ('a0000000-0000-4000-8000-000000000008','50000000-0000-4000-8000-000000000001','overall',6.9,1.00,6.9,'Promising product with diligence gaps.',5,'seed-v1')
on conflict (id) do nothing;

insert into public.memos (
  id, application_id, version, investment_hypothesis, thesis_alignment, strengths, weaknesses,
  opportunities, threats, verified_claims, unverified_claims, contradicted_claims, key_questions,
  strongest_reason_to_pass, recommendation, recommendation_reason, confidence
) values (
  'b0000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001',1,
  'A fictional operational-efficiency product may produce measurable customer savings.',
  'Aligned with climate software and seed-stage criteria.',
  '["Measured energy outcome","Complementary team"]','["Revenue discrepancy"]','["Cold-storage expansion"]',
  '["Long enterprise sales cycle"]','["Energy reduction"]','["Gross margin"]','["ARR"]',
  '["Provide a reconciled recurring-revenue schedule"]','Unreconciled revenue quality.','needs_more_info',
  'Resolve revenue and customer-count evidence before a human decision.',0.72
) on conflict (id) do nothing;

insert into public.information_requests (
  id, application_id, claim_id, requested_by, title, description, requested_document_type, status, due_at
) values (
  'c0000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',
  'Reconcile recurring revenue','Provide customer-level MRR and cancellations for the last twelve months.',
  'revenue_export','requested','2026-01-20 12:00:00+00'
) on conflict (id) do update set description = excluded.description, updated_at = now();

insert into public.processing_jobs (id, application_id, job_type, stage, status, idempotency_key, payload) values
  ('d0000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','document_extraction','extracting','completed','seed-extraction-job-1','{"document_id":"60000000-0000-4000-8000-000000000001"}')
on conflict (id) do update set status = excluded.status, updated_at = now();

insert into public.application_stage_events (id, application_id, stage, attempt_number, status, started_at, completed_at, duration_ms, metadata) values
  ('e0000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','submitted',1,'completed','2026-01-15 12:00:00+00','2026-01-15 12:00:00+00',0,'{"source":"seed"}'),
  ('e0000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000001','extracting',1,'completed','2026-01-15 12:01:00+00','2026-01-15 12:03:00+00',120000,'{"source":"seed"}'),
  ('e0000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000001','claims_ready',1,'completed','2026-01-15 12:04:00+00','2026-01-15 12:05:00+00',60000,'{"source":"seed"}')
on conflict (id) do nothing;

insert into public.signals (id, company_id, application_id, signal_type, title, payload, occurred_at) values
  ('f0000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','application_submitted','Fictional application submitted','{"source":"seed"}','2026-01-15 12:00:00+00'),
  ('f0000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','evidence_conflict','Revenue evidence conflicts with pitch deck','{"claim_id":"70000000-0000-4000-8000-000000000002"}','2026-01-15 13:00:00+00'),
  ('f0000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','information_requested','Revenue reconciliation requested','{"request_id":"c0000000-0000-4000-8000-000000000001"}','2026-01-15 14:00:00+00')
on conflict (id) do nothing;
