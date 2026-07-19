import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { GroqProvider } from '../../ai/client.js';
import { memoSchema, type MemoOutput } from '../../ai/schemas.js';
import { prompts } from '../../ai/prompt-registry.js';
import { getServiceClient } from '../supabase.js';
import { validateMemoSafety } from './memo-safety.js';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';
import { compactApplication, compactClaim, compactDeal, compactEvidence, compactScore } from './memo-context.js';

export class MemoService {
  constructor(private readonly ai = new ModelRunRecorder(new GroqProvider())) {}
  async generate(applicationId: string, revision?: { previous: MemoOutput; skeptic: unknown; previousMemoId: string }) {
    const db = getServiceClient();
    const [{ data: application }, { data: claims }, { data: evidence }, { data: scores }, { data: deal }] = await Promise.all([
      db.from('applications').select('*,companies(*),thesis_configs(*)').eq('id', applicationId).single(),
      db.from('claims').select('*').eq('application_id', applicationId),
      db.from('evidence').select('*,claims!inner(application_id),evidence_sources(*)').eq('claims.application_id', applicationId).eq('validation_status', 'valid'),
      db.from('scores').select('*').eq('application_id', applicationId).eq('is_current', true),
      db.from('deal_economics').select('*').eq('application_id', applicationId).maybeSingle()
    ]);
    if (!application || !application.recommendation) throw new AppError('CONFLICT', 'Official recommendation must be calculated before memo generation', 409);
    const structured = {
      application: compactApplication(application as unknown as Record<string, unknown>),
      claims: (claims ?? []).map((claim) => compactClaim(claim)),
      evidence: (evidence ?? []).map((item) => compactEvidence(item as unknown as Record<string, unknown>)),
      scores: (scores ?? []).map((score) => compactScore(score)),
      deal: compactDeal(deal),
      ...(revision ? { draftMemo: revision.previous, skepticReview: revision.skeptic } : {})
    };
    const prompt = revision ? prompts.memoRevision : prompts.memoGeneration;
    let output: MemoOutput | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        output = await this.ai.generate({ applicationId, runType: revision ? 'memo_revision' : 'memo_generation', model: getEnv().AI_MODEL_STRONG, prompt, userPrompt: serializeContextWithinBudget(structured, getEnv().MAX_MEMO_INPUT_CHARS), schema: memoSchema, schemaName: revision ? 'memo_revision' : 'investment_memo', maxCompletionTokens: 2_500 });
        validateMemoSafety(output, structured, application.recommendation, new Set((claims ?? []).map((claim) => claim.id)));
        break;
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && error.details?.kind === 'rate_limit') break;
      }
    }
    if (!output) throw lastError;
    const { data, error } = await db.from('memos').insert({ application_id: applicationId, version: revision ? 2 : 1, previous_memo_id: revision?.previousMemoId ?? null, investment_hypothesis: output.investmentHypothesis, thesis_alignment: output.thesisAlignment, strengths: output.strengths, weaknesses: [...output.weaknesses, ...output.keyRisks], opportunities: output.opportunities, threats: output.threats, verified_claims: output.verifiedClaims, unverified_claims: [...output.partiallyVerifiedClaims, ...output.unverifiedClaims], contradicted_claims: output.contradictedClaims, key_questions: output.keyQuestions, strongest_reason_to_pass: output.keyRisks[0] ?? null, recommendation: application.recommendation, recommendation_reason: output.recommendationReason, confidence: output.confidence }).select('*').single();
    if (error) throw new AppError('INTERNAL_ERROR', 'Memo could not be stored', 500, { database: error.message });
    return { record: data, output };
  }
}
