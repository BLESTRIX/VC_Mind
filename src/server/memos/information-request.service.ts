import { GroqProvider } from '../../ai/client.js';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { prompts } from '../../ai/prompt-registry.js';
import { informationRequestsSchema } from '../../ai/schemas.js';
import { getEnv } from '../../lib/env.js';
import { getServiceClient } from '../supabase.js';
import { compactClaim } from './memo-context.js';

export class InformationRequestService {
  constructor(private readonly ai = new ModelRunRecorder(new GroqProvider())) {}
  async generate(applicationId: string, requestedBy?: string) {
    const db = getServiceClient();
    const [{ data: application }, { data: claims }] = await Promise.all([
      db.from('applications').select('recommendation').eq('id', applicationId).single(),
      db.from('claims').select('*').eq('application_id', applicationId).in('verification_status', ['unverified', 'partially_verified', 'contradicted'])
    ]);
    if (application?.recommendation !== 'needs_more_info') return [];
    const userPrompt = serializeContextWithinBudget({ claims: (claims ?? []).map((claim) => compactClaim(claim)) }, 8_000);
    const output = await this.ai.generate({ applicationId, runType: 'information_requests', model: getEnv().AI_MODEL_FAST, prompt: prompts.informationRequests, userPrompt, schema: informationRequestsSchema, schemaName: 'information_requests', maxCompletionTokens: 1_000 });
    const rows = output.requests.map((request) => ({ application_id: applicationId, claim_id: request.relatedClaimId ?? null, requested_by: requestedBy ?? null, title: request.title, description: `[${request.priority}] ${request.description}`, requested_document_type: request.requestedDocumentType ?? null, status: 'requested' as const }));
    if (!rows.length) return [];
    const { data } = await db.from('information_requests').insert(rows).select('*');
    return data ?? [];
  }
}
