create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'investment_manager', 'analyst', 'viewer');
create type public.application_stage as enum ('submitted', 'extracting', 'claims_ready', 'screened', 'diligence_running', 'evidence_ready', 'memo_draft', 'memo_ready', 'approved', 'passed', 'needs_more_info', 'failed');
create type public.recommendation as enum ('invest', 'pass', 'needs_more_info');
create type public.human_decision as enum ('approved', 'passed', 'needs_more_info', 'conditional_approval');
create type public.claim_category as enum ('founder', 'market', 'traction', 'product', 'competition', 'business_model', 'deal_terms', 'financial', 'legal', 'other');
create type public.claim_importance as enum ('low', 'medium', 'high', 'critical');
create type public.claim_verification_status as enum ('unverified', 'partially_verified', 'verified', 'contradicted', 'not_checkable');
create type public.evidence_relationship as enum ('supports', 'partially_supports', 'contradicts', 'context_only');
create type public.evidence_source_type as enum ('founder_submitted', 'company_website', 'government', 'financial_document', 'customer_document', 'news', 'research', 'database', 'social_profile', 'github', 'search_result', 'other');
create type public.score_dimension as enum ('founder', 'market', 'traction', 'product', 'thesis_fit', 'deal_economics', 'risk_resilience', 'overall');
create type public.job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');
create type public.information_request_status as enum ('requested', 'submitted', 'under_review', 'accepted', 'rejected', 'cancelled');

