/**
 * Supabase database types for VC Brain.
 * Regenerate after schema changes with: supabase gen types typescript --local > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'admin' | 'investment_manager' | 'analyst' | 'viewer';
export type ApplicationStage = 'submitted' | 'extracting' | 'claims_ready' | 'screened' | 'diligence_running' | 'evidence_ready' | 'memo_draft' | 'memo_ready' | 'approved' | 'passed' | 'needs_more_info' | 'failed';
export type Recommendation = 'invest' | 'pass' | 'needs_more_info';
export type HumanDecision = 'approved' | 'passed' | 'needs_more_info' | 'conditional_approval';
export type ClaimCategory = 'founder' | 'market' | 'traction' | 'product' | 'competition' | 'business_model' | 'deal_terms' | 'financial' | 'legal' | 'other';
export type ClaimImportance = 'low' | 'medium' | 'high' | 'critical';
export type ClaimVerificationStatus = 'unverified' | 'partially_verified' | 'verified' | 'contradicted' | 'not_checkable';
export type EvidenceRelationship = 'supports' | 'partially_supports' | 'contradicts' | 'context_only';
export type EvidenceSourceType = 'founder_submitted' | 'company_website' | 'government' | 'financial_document' | 'customer_document' | 'news' | 'research' | 'database' | 'social_profile' | 'github' | 'search_result' | 'other';
export type ScoreDimension = 'founder' | 'market' | 'traction' | 'product' | 'thesis_fit' | 'deal_economics' | 'risk_resilience' | 'overall';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type InformationRequestStatus = 'requested' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'cancelled';

type Table<Row, RequiredInsert extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, RequiredInsert> & Partial<Omit<Row, RequiredInsert>>;
  Update: Partial<Row>;
  Relationships: [];
};
type Audit = { created_at: string; updated_at: string };

export type ProfileRow = Audit & { id: string; full_name: string | null; role: UserRole; organization_name: string | null };
export type ThesisConfigRow = Audit & { id: string; owner_id: string | null; name: string; description: string | null; sectors: string[]; stages: string[]; geographies: string[]; minimum_check_size_usd: number | null; maximum_check_size_usd: number | null; default_check_size_usd: number; ownership_target_percentage: number | null; risk_appetite: string; focus_note: string | null; version: number; is_active: boolean };
export type CompanyRow = Audit & { id: string; created_by: string | null; name: string; normalized_name: string | null; website_url: string | null; domain: string | null; sector: string | null; stage: string | null; geography: string | null; product_description: string | null; legal_name: string | null; incorporation_country: string | null; incorporation_date: string | null; external_reference: string | null };
export type FounderRow = Audit & { id: string; created_by: string | null; full_name: string; email: string | null; linkedin_url: string | null; github_url: string | null; personal_website_url: string | null; location: string | null; background_summary: string | null };
export type CompanyFounderRow = { company_id: string; founder_id: string; role: string | null; ownership_percentage: number | null; is_primary: boolean; joined_at: string | null; left_at: string | null; created_at: string };
export type ApplicationRow = Audit & { id: string; company_id: string; thesis_config_id: string; submitted_by: string | null; current_stage: ApplicationStage; recommendation: Recommendation | null; investment_score: number | null; evidence_coverage: number | null; funding_ask_usd: number | null; valuation_cap_usd: number | null; pre_money_valuation_usd: number | null; post_money_valuation_usd: number | null; implied_ownership_percentage: number | null; decision_deadline: string; submitted_at: string; claims_ready_at: string | null; screened_at: string | null; evidence_ready_at: string | null; memo_ready_at: string | null; decided_at: string | null; failure_reason: string | null };
export type ApplicationFounderRow = { application_id: string; founder_id: string; role_at_submission: string | null; is_primary_contact: boolean; created_at: string };
export type DocumentRow = Audit & { id: string; application_id: string; uploaded_by: string | null; document_type: string; storage_bucket: string; storage_path: string; original_filename: string | null; mime_type: string | null; file_size_bytes: number | null; sha256_hash: string | null; version: number; is_current: boolean; processing_status: string; page_count: number | null; extracted_text: Json | null; uploaded_at: string; processed_at: string | null };
export type DocumentPageRow = { id: string; document_id: string; page_number: number; page_text: string | null; text_hash: string | null; created_at: string };
export type ClaimRow = Audit & { id: string; application_id: string; document_id: string | null; document_page_id: string | null; claim_text: string; category: ClaimCategory; importance: ClaimImportance; source_type: string; source_excerpt: string | null; source_start_offset: number | null; source_end_offset: number | null; checkable: boolean; verification_status: ClaimVerificationStatus; evidence_confidence: number | null };
export type SearchQueryRow = { id: string; application_id: string; claim_id: string | null; provider: string; query_text: string; requested_at: string; completed_at: string | null; result_count: number | null; status: JobStatus; error_message: string | null; created_at: string };
export type EvidenceSourceRow = Audit & { id: string; canonical_url: string; source_title: string | null; source_domain: string | null; source_type: EvidenceSourceType; publisher_name: string | null; published_at: string | null; retrieved_at: string; content_hash: string | null; snapshot_text: string | null; snapshot_storage_path: string | null; founder_controlled: boolean; authoritative_source: boolean; independence_cluster: string | null };
export type EvidenceRow = Audit & { id: string; claim_id: string; evidence_source_id: string; search_query_id: string | null; relationship: EvidenceRelationship; excerpt: string; excerpt_hash: string | null; source_quality: number | null; entity_match: number | null; freshness: number | null; evidence_completeness: number | null; model_confidence: number | null; human_review_status: string | null; human_reviewed_by: string | null; human_reviewed_at: string | null };
export type ClaimVerificationRunRow = { id: string; claim_id: string; status: ClaimVerificationStatus; confidence: number | null; reason: string | null; evidence_count: number; model_run_id: string | null; is_current: boolean; created_at: string };
export type ScoreRow = { id: string; application_id: string; dimension: ScoreDimension; score: number; weight: number; weighted_score: number; explanation: string | null; evidence_count: number; scoring_version: string; is_current: boolean; created_at: string };
export type DealEconomicsRow = Audit & { id: string; application_id: string; proposed_check_size_usd: number | null; pre_money_valuation_usd: number | null; post_money_valuation_usd: number | null; implied_ownership_percentage: number | null; expected_future_dilution_percentage: number | null; expected_exit_valuation_usd: number | null; expected_return_multiple: number | null; minimum_required_return_multiple: number | null; follow_on_capital_required_usd: number | null; terms_summary: string | null; calculation_inputs: Json | null };
export type MemoRow = { id: string; application_id: string; version: number; previous_memo_id: string | null; investment_hypothesis: string | null; thesis_alignment: string | null; strengths: Json; weaknesses: Json; opportunities: Json; threats: Json; verified_claims: Json; unverified_claims: Json; contradicted_claims: Json; key_questions: Json; strongest_reason_to_pass: string | null; recommendation: Recommendation; recommendation_reason: string | null; confidence: number | null; is_current: boolean; created_by_model_run_id: string | null; created_at: string };
export type SkepticReviewRow = { id: string; application_id: string; memo_id: string; issues: Json; strongest_reason_to_pass: string | null; recommended_changes: Json; model_run_id: string | null; created_at: string };
export type InformationRequestRow = Audit & { id: string; application_id: string; claim_id: string | null; requested_by: string | null; title: string; description: string | null; requested_document_type: string | null; status: InformationRequestStatus; due_at: string | null; submitted_document_id: string | null; reviewed_by: string | null; reviewed_at: string | null };
export type DecisionRow = { id: string; application_id: string; memo_id: string | null; decision: HumanDecision; decision_reason: string | null; decided_by: string; supersedes_decision_id: string | null; is_current: boolean; created_at: string };
export type ApplicationStageEventRow = { id: string; application_id: string; stage: ApplicationStage; attempt_number: number; status: JobStatus; started_at: string | null; completed_at: string | null; duration_ms: number | null; error_message: string | null; triggered_by: string | null; metadata: Json | null; created_at: string };
export type ProcessingJobRow = Audit & { id: string; application_id: string; job_type: string; stage: ApplicationStage | null; status: JobStatus; attempt_number: number; retry_count: number; idempotency_key: string | null; started_at: string | null; completed_at: string | null; error_message: string | null; payload: Json | null; result: Json | null };
export type ModelRunRow = { id: string; application_id: string | null; claim_id: string | null; run_type: string; provider: string; model_name: string; model_version: string | null; prompt_version: string; schema_version: string | null; input_hash: string | null; output_hash: string | null; temperature: number | null; input_tokens: number | null; output_tokens: number | null; estimated_cost_usd: number | null; latency_ms: number | null; status: JobStatus; error_message: string | null; request_metadata: Json | null; response_metadata: Json | null; created_at: string; completed_at: string | null };
export type SignalRow = { id: string; company_id: string | null; application_id: string | null; signal_type: string; title: string; payload: Json | null; occurred_at: string; created_at: string };

export type ApplicationSummary = { application_id: string; company_name: string; current_stage: ApplicationStage; recommendation: Recommendation | null; investment_score: number | null; calculated_evidence_coverage: number; submitted_at: string; decision_deadline: string; remaining_sla_time: string; current_memo_id: string | null; current_decision: HumanDecision | null; total_claims: number; verified_claims: number; contradicted_claims: number; open_information_requests: number };
export type ClaimWithEvidenceSummary = { claim_id: string; application_id: string; claim_text: string; category: ClaimCategory; importance: ClaimImportance; verification_status: ClaimVerificationStatus; evidence_confidence: number | null; evidence_source_count: number; supporting_source_count: number; contradicting_source_count: number; independent_source_cluster_count: number };
export type CurrentScore = ScoreRow & { is_current: true };
export type CurrentMemo = MemoRow & { is_current: true };

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id'>; thesis_configs: Table<ThesisConfigRow, 'name'>;
      companies: Table<CompanyRow, 'name'>; founders: Table<FounderRow, 'full_name'>;
      company_founders: Table<CompanyFounderRow, 'company_id' | 'founder_id'>;
      applications: Table<ApplicationRow, 'company_id' | 'thesis_config_id'>;
      application_founders: Table<ApplicationFounderRow, 'application_id' | 'founder_id'>;
      documents: Table<DocumentRow, 'application_id' | 'document_type' | 'storage_bucket' | 'storage_path'>;
      document_pages: Table<DocumentPageRow, 'document_id' | 'page_number'>;
      claims: Table<ClaimRow, 'application_id' | 'claim_text' | 'category' | 'source_type'>;
      search_queries: Table<SearchQueryRow, 'application_id' | 'provider' | 'query_text'>;
      evidence_sources: Table<EvidenceSourceRow, 'canonical_url' | 'source_type'>;
      evidence: Table<EvidenceRow, 'claim_id' | 'evidence_source_id' | 'relationship' | 'excerpt'>;
      claim_verification_runs: Table<ClaimVerificationRunRow, 'claim_id' | 'status'>;
      scores: Table<ScoreRow, 'application_id' | 'dimension' | 'score' | 'weight' | 'weighted_score' | 'scoring_version'>;
      deal_economics: Table<DealEconomicsRow, 'application_id'>; memos: Table<MemoRow, 'application_id' | 'recommendation'>;
      skeptic_reviews: Table<SkepticReviewRow, 'application_id' | 'memo_id'>;
      information_requests: Table<InformationRequestRow, 'application_id' | 'title'>;
      decisions: Table<DecisionRow, 'application_id' | 'decision' | 'decided_by'>;
      application_stage_events: Table<ApplicationStageEventRow, 'application_id' | 'stage' | 'status'>;
      processing_jobs: Table<ProcessingJobRow, 'application_id' | 'job_type'>;
      model_runs: Table<ModelRunRow, 'run_type' | 'provider' | 'model_name' | 'prompt_version' | 'status'>;
      signals: Table<SignalRow, 'signal_type' | 'title' | 'occurred_at'>;
    };
    Views: {
      application_summary_view: { Row: ApplicationSummary; Relationships: [] };
      claim_evidence_summary_view: { Row: ClaimWithEvidenceSummary; Relationships: [] };
      current_application_scores_view: { Row: ScoreRow; Relationships: [] };
    };
    Functions: {
      application_evidence_coverage: { Args: { p_application_id: string }; Returns: number };
      claim_next_processing_job: { Args: Record<never, never>; Returns: ProcessingJobRow | null };
      create_vc_application: { Args: { p_input: Json; p_user_id: string }; Returns: string };
      set_application_stage: { Args: { p_application_id: string; p_new_stage: ApplicationStage; p_status?: JobStatus; p_error_message?: string | null; p_metadata?: Json | null }; Returns: ApplicationRow };
    };
    Enums: {
      user_role: UserRole; application_stage: ApplicationStage; recommendation: Recommendation;
      human_decision: HumanDecision; claim_category: ClaimCategory; claim_importance: ClaimImportance;
      claim_verification_status: ClaimVerificationStatus; evidence_relationship: EvidenceRelationship;
      evidence_source_type: EvidenceSourceType; score_dimension: ScoreDimension; job_status: JobStatus;
      information_request_status: InformationRequestStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
