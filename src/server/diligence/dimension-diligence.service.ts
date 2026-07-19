import { GroqProvider } from '../../ai/client.js';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { prompts } from '../../ai/prompt-registry.js';
import { diligenceSchema, type DiligenceOutput } from '../../ai/schemas.js';
import { getEnv } from '../../lib/env.js';
import { getServiceClient } from '../supabase.js';
import { RUBRICS, type RubricDimension } from './diligence.types.js';

const promptByDimension = { founder: prompts.founderDiligence, market: prompts.marketDiligence, traction: prompts.tractionDiligence, product: prompts.productDiligence };

export class DimensionDiligenceService {
  constructor(private readonly ai = new ModelRunRecorder(new GroqProvider())) {}
  async run(applicationId: string, dimension: RubricDimension): Promise<DiligenceOutput> {
    const db = getServiceClient();
    const [{ data: claims }, { data: evidence }] = await Promise.all([
      db.from('claims').select('*').eq('application_id', applicationId).eq('category', dimension),
      db.from('evidence').select('*,claims!inner(application_id),evidence_sources(*)').eq('claims.application_id', applicationId)
    ]);
    const output = await this.ai.generate({ applicationId, runType: `${dimension}_diligence`, model: getEnv().AI_MODEL_FAST, prompt: promptByDimension[dimension], userPrompt: serializeContextWithinBudget({ rubric: RUBRICS[dimension], claims: claims ?? [], evidence: evidence ?? [] }, 10_000), schema: diligenceSchema, schemaName: `${dimension}_diligence`, maxCompletionTokens: 1_200 });
    for (const key of RUBRICS[dimension]) if (output.rubricScores[key] === undefined) output.rubricScores[key] = 0;
    return output;
  }
}
