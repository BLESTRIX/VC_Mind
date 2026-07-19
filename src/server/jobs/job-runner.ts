import { getEnv } from '../../lib/env.js';
import { log } from '../../lib/logger.js';
import type { Json, ProcessingJobRow } from '../../types/database.js';
import { DocumentService } from '../documents/document.service.js';
import { ClaimExtractionService } from '../diligence/claim-extraction.service.js';
import { ThesisScreeningService } from '../diligence/thesis-screening.service.js';
import { DimensionDiligenceService } from '../diligence/dimension-diligence.service.js';
import { calculateDealEconomics } from '../diligence/deal-economics.service.js';
import { ClaimVerificationService } from '../diligence/claim-verification.service.js';
import { EvidenceService } from '../evidence/evidence.service.js';
import { EvidenceIntegrityService } from '../evidence/evidence-integrity.service.js';
import { CitationValidationService } from '../memos/citation-validation.service.js';
import { InformationRequestService } from '../memos/information-request.service.js';
import { MemoService } from '../memos/memo.service.js';
import { SkepticService } from '../memos/skeptic.service.js';
import { refreshDeterministicDecisionState } from '../scoring/decision-state.service.js';
import { getServiceClient } from '../supabase.js';
import { JobRepository } from './job.repository.js';
import type { JobType } from './job.types.js';
import { isRetryable } from './retry-policy.js';

export class JobRunner {
  constructor(private readonly repository = new JobRepository()) {}

  async nextPendingDelayMs(): Promise<number | null> { return this.repository.nextPendingDelayMs(); }

  async runNext(): Promise<ProcessingJobRow | null> {
    const job = await this.repository.claim();
    if (!job) return null;
    const started = Date.now();
    try {
      const result = await this.execute(job);
      await this.repository.complete(job.id, result as Json);
      await this.schedule(job.application_id, job.job_type as JobType);
      log('info', 'Job completed', { jobId: job.id, applicationId: job.application_id, service: 'job-runner', durationMs: Date.now() - started, status: 'completed' });
      return { ...job, status: 'completed', result: result as Json };
    } catch (error) {
      const failureStatus = await this.repository.fail(job, error, getEnv().MAX_JOB_RETRIES, isRetryable(error));
      if (failureStatus === 'failed') await getServiceClient().rpc('set_application_stage', { p_application_id: job.application_id, p_new_stage: 'failed', p_status: 'failed', p_error_message: error instanceof Error ? error.message : 'Job failed', p_metadata: { jobId: job.id } });
      log('error', 'Job failed', { jobId: job.id, applicationId: job.application_id, errorCode: error instanceof Error ? error.name : 'unknown', status: 'failed' });
      throw error;
    }
  }

  private async execute(job: ProcessingJobRow): Promise<unknown> {
    const payload = (job.payload ?? {}) as Record<string, unknown>;
    switch (job.job_type as JobType) {
      case 'extract_document':
        await getServiceClient().rpc('set_application_stage', { p_application_id: job.application_id, p_new_stage: 'extracting', p_status: 'running', p_error_message: null, p_metadata: { jobId: job.id } });
        return new DocumentService().extract(String(payload.documentId));
      case 'extract_claims': return new ClaimExtractionService().extract(job.application_id);
      case 'screen_thesis': return new ThesisScreeningService().screen(job.application_id);
      case 'run_founder_diligence':
      case 'run_market_diligence':
      case 'run_traction_diligence':
      case 'run_product_diligence':
        return new DimensionDiligenceService().run(job.application_id, job.job_type.replace('run_', '').replace('_diligence', '') as 'founder' | 'market' | 'traction' | 'product');
      case 'calculate_deal_economics': {
        const db = getServiceClient();
        const { data: application } = await db.from('applications').select('*').eq('id', job.application_id).single();
        const result = calculateDealEconomics({ checkSizeUsd: application?.funding_ask_usd ?? undefined, preMoneyValuationUsd: application?.pre_money_valuation_usd ?? undefined, postMoneyValuationUsd: application?.post_money_valuation_usd ?? undefined });
        await db.from('deal_economics').upsert({ application_id: job.application_id, proposed_check_size_usd: result.checkSizeUsd ?? null, pre_money_valuation_usd: result.preMoneyValuationUsd ?? null, post_money_valuation_usd: result.postMoneyValuationUsd ?? null, implied_ownership_percentage: result.impliedOwnershipPercentage ?? null, expected_return_multiple: result.expectedReturnMultiple ?? null, calculation_inputs: result as unknown as Json }, { onConflict: 'application_id' });
        return result;
      }
      case 'verify_claims': {
        const collected = await new EvidenceService().collect(job.application_id);
        const verified = [];
        for (const item of collected) verified.push(await new ClaimVerificationService().verify(job.application_id, item.claim.id, item.queryId, item.sources.map((source) => source.id)));
        return { verified };
      }
      case 'validate_evidence': {
        const result = await new EvidenceIntegrityService().validateApplication(job.application_id);
        await getServiceClient().rpc('set_application_stage', { p_application_id: job.application_id, p_new_stage: 'evidence_ready', p_status: 'completed', p_error_message: null, p_metadata: { changedClaims: result.changedClaimIds.length, evidenceCoverage: result.coverage.coveragePercentage } });
        return result;
      }
      case 'calculate_scores': return refreshDeterministicDecisionState(job.application_id);
      case 'generate_memo':
        await getServiceClient().rpc('set_application_stage', { p_application_id: job.application_id, p_new_stage: 'memo_draft', p_status: 'completed', p_error_message: null, p_metadata: { jobId: job.id } });
        return new MemoService().generate(job.application_id);
      case 'run_skeptic_review': {
        const { data: memoJob } = await getServiceClient().from('processing_jobs').select('result').eq('application_id', job.application_id).eq('job_type', 'generate_memo').eq('status', 'completed').single();
        const result = memoJob?.result as { record: { id: string }; output: unknown };
        return new SkepticService().review(job.application_id, result.record.id, result.output);
      }
      case 'revise_memo': {
        const db = getServiceClient();
        const [{ data: memoJob }, { data: skepticJob }] = await Promise.all([
          db.from('processing_jobs').select('result').eq('application_id', job.application_id).eq('job_type', 'generate_memo').eq('status', 'completed').single(),
          db.from('processing_jobs').select('result').eq('application_id', job.application_id).eq('job_type', 'run_skeptic_review').eq('status', 'completed').single()
        ]);
        const memo = memoJob?.result as { record: { id: string }; output: any };
        return new MemoService().generate(job.application_id, { previous: memo.output, skeptic: skepticJob?.result, previousMemoId: memo.record.id });
      }
      case 'validate_citations': return new CitationValidationService().validate(job.application_id);
      case 'generate_information_requests': {
        const { data: application } = await getServiceClient().from('applications').select('submitted_by').eq('id', job.application_id).single();
        return new InformationRequestService().generate(job.application_id, application?.submitted_by ?? undefined);
      }
      case 'finalize_diligence':
        await getServiceClient().rpc('set_application_stage', { p_application_id: job.application_id, p_new_stage: 'memo_ready', p_status: 'completed', p_error_message: null, p_metadata: { jobId: job.id } });
        return { finalized: true };
      default: throw new Error(`Unknown job type ${job.job_type}`);
    }
  }

  private async schedule(applicationId: string, completed: JobType): Promise<void> {
    const next: Partial<Record<JobType, JobType>> = { extract_document: 'extract_claims', extract_claims: 'screen_thesis', verify_claims: 'validate_evidence', validate_evidence: 'calculate_scores', calculate_scores: 'generate_memo', generate_memo: 'run_skeptic_review', run_skeptic_review: 'revise_memo', revise_memo: 'validate_citations', validate_citations: 'generate_information_requests', generate_information_requests: 'finalize_diligence' };
    if (completed === 'screen_thesis') {
      const db = getServiceClient();
      const [{ data: score }, { count: checkableClaimCount }] = await Promise.all([
        db.from('scores').select('score').eq('application_id', applicationId).eq('dimension', 'thesis_fit').eq('is_current', true).single(),
        db.from('claims').select('id', { count: 'exact', head: true }).eq('application_id', applicationId).eq('checkable', true)
      ]);
      if (Number(score?.score) < 5) {
        await db.from('applications').update({ recommendation: (checkableClaimCount ?? 0) === 0 ? 'needs_more_info' : 'pass', investment_score: Number(score?.score), evidence_coverage: 0 }).eq('id', applicationId);
        await this.repository.create(applicationId, 'generate_memo', {}, 'fast-pass-v1');
        return;
      }
      await getServiceClient().rpc('set_application_stage', { p_application_id: applicationId, p_new_stage: 'diligence_running', p_status: 'running', p_error_message: null, p_metadata: { parallel: true } });
      for (const type of ['run_founder_diligence', 'run_market_diligence', 'run_traction_diligence', 'run_product_diligence', 'calculate_deal_economics'] as JobType[]) await this.repository.create(applicationId, type);
      return;
    }
    if (['run_founder_diligence', 'run_market_diligence', 'run_traction_diligence', 'run_product_diligence', 'calculate_deal_economics'].includes(completed)) {
      const { data: pending } = await getServiceClient().from('processing_jobs').select('id').eq('application_id', applicationId).in('job_type', ['run_founder_diligence', 'run_market_diligence', 'run_traction_diligence', 'run_product_diligence', 'calculate_deal_economics']).neq('status', 'completed');
      if (!pending?.length) await this.repository.create(applicationId, 'verify_claims');
      return;
    }
    const type = next[completed];
    if (type) await this.repository.create(applicationId, type);
  }
}
