import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { GroqProvider } from '../../ai/client.js';
import { prompts } from '../../ai/prompt-registry.js';
import { skepticSchema } from '../../ai/schemas.js';
import { getServiceClient } from '../supabase.js';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';
import { compactClaim, compactEvidence, compactScore } from './memo-context.js';

export class SkepticService {
  constructor(private readonly ai = new ModelRunRecorder(new GroqProvider())) {}
  async review(applicationId: string, memoId: string, memoOutput: unknown) {
    const db = getServiceClient();
    const [{ data: claims }, { data: scores }, { data: evidence }] = await Promise.all([
      db.from('claims').select('*').eq('application_id', applicationId),
      db.from('scores').select('*').eq('application_id', applicationId).eq('is_current', true),
      db.from('evidence').select('*,claims!inner(application_id)').eq('claims.application_id', applicationId).eq('validation_status', 'valid')
    ]);
    const context = { memo: memoOutput, claims: (claims ?? []).map((claim) => compactClaim(claim)), scores: (scores ?? []).map((score) => compactScore(score)), evidence: (evidence ?? []).map((item) => compactEvidence(item as unknown as Record<string, unknown>)) };
    const output = await this.ai.generate({ applicationId, runType: 'skeptic_review', model: getEnv().AI_MODEL_STRONG, prompt: prompts.skepticReview, userPrompt: serializeContextWithinBudget(context, getEnv().MAX_MEMO_INPUT_CHARS), schema: skepticSchema, schemaName: 'skeptic_review', maxCompletionTokens: 1_200 });
    const { data, error } = await db.from('skeptic_reviews').insert({ application_id: applicationId, memo_id: memoId, issues: output.issues, strongest_reason_to_pass: output.strongestReasonToPass, recommended_changes: output.issues.map((issue) => issue.recommendedChange) }).select('*').single();
    if (error) throw new AppError('INTERNAL_ERROR', 'Skeptic review could not be stored', 500);
    return { record: data, output };
  }
}
