import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { GroqProvider } from '../../ai/client.js';
import { thesisScreeningSchema } from '../../ai/schemas.js';
import { prompts } from '../../ai/prompt-registry.js';
import { getServiceClient } from '../supabase.js';
import { transitionApplicationStage } from '../jobs/stage-runner.js';
type Failure = { rule: string; reason: string };

export class ThesisScreeningService {
  constructor(private readonly ai = new ModelRunRecorder(new GroqProvider())) {}
  async screen(applicationId: string) {
    const db = getServiceClient();
    const { data } = await db.from('applications').select('*,companies(*),thesis_configs(*)').eq('id', applicationId).single();
    if (!data) throw new AppError('NOT_FOUND', 'Application not found', 404);
    const application = data;
    const company = (data as unknown as { companies: Record<string, unknown> }).companies;
    const thesis = (data as unknown as { thesis_configs: Record<string, unknown> }).thesis_configs;
    const failures: Failure[] = [];
    const allow = (field: string, listKey: string) => { const value = String(company[field] ?? '').toLowerCase(); const list = ((thesis[listKey] as string[] | undefined) ?? []).map((item) => item.toLowerCase()); if (list.length && (!value || !list.includes(value))) failures.push({ rule: `${field}_allowlist`, reason: `${String(company[field] ?? 'Missing value')} is outside configured ${listKey}.` }); };
    allow('sector', 'sectors'); allow('stage', 'stages'); allow('geography', 'geographies');
    if (application.funding_ask_usd === null) failures.push({ rule: 'missing_funding_ask', reason: 'Funding ask is required for thesis screening.' });
    if (application.funding_ask_usd !== null && thesis.minimum_check_size_usd !== null && application.funding_ask_usd < Number(thesis.minimum_check_size_usd)) failures.push({ rule: 'minimum_check_size', reason: 'Funding ask is below the configured minimum.' });
    if (application.funding_ask_usd !== null && thesis.maximum_check_size_usd !== null && application.funding_ask_usd > Number(thesis.maximum_check_size_usd)) failures.push({ rule: 'maximum_check_size', reason: 'Funding ask exceeds the configured maximum.' });
    const semantic = await this.ai.generate({ applicationId, runType: 'thesis_screening', model: getEnv().AI_MODEL_FAST, prompt: prompts.thesisScreening, userPrompt: JSON.stringify({ company, thesis, hardFailures: failures }), schema: thesisScreeningSchema, schemaName: 'thesis_screening', maxCompletionTokens: 800 });
    const score = failures.length ? Math.min(semantic.thesisFitScore, 4.9) : semantic.thesisFitScore;
    await db.from('scores').insert({ application_id: applicationId, dimension: 'thesis_fit', score, weight: .1, weighted_score: score * .1, explanation: semantic.explanation, evidence_count: 0, scoring_version: 'v1' });
    await transitionApplicationStage(applicationId, 'screened', 'completed', null, { hardFailures: failures });
    return { eligible: failures.length === 0, hardFailures: failures, softMismatches: semantic.softMismatches, matchedCriteria: semantic.matchedCriteria, thesisFitScore: score, explanation: semantic.explanation };
  }
}
