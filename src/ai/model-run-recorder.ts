import type { z } from 'zod';
import { sha256 } from '../lib/hashing.js';
import { getServiceClient } from '../server/supabase.js';
import type { Json } from '../types/database.js';
import type { AIProvider } from './provider.js';
import type { PromptDefinition } from './prompt-registry.js';
export class ModelRunRecorder {
  constructor(private readonly provider: AIProvider) {}
  async generate<T>(input: { applicationId?: string; claimId?: string; runType: string; model: string; prompt: PromptDefinition; userPrompt: string; schema: z.ZodType<T>; schemaName: string; metadata?: Record<string, unknown> }): Promise<T> {
    const db = getServiceClient(); const inputHash = sha256(`${input.prompt.systemPrompt}\n${input.userPrompt}`); const started = Date.now();
    try {
      const result = await this.provider.generateStructured({ model: input.model, systemPrompt: input.prompt.systemPrompt, userPrompt: input.userPrompt, schema: input.schema, schemaName: input.schemaName, temperature: 0.1, ...(input.metadata ? { metadata: input.metadata } : {}) });
      await db.from('model_runs').insert({ application_id: input.applicationId ?? null, claim_id: input.claimId ?? null, run_type: input.runType, provider: result.provider, model_name: result.model, prompt_version: `${input.prompt.name}:${input.prompt.version}`, input_hash: inputHash, output_hash: sha256(JSON.stringify(result.data)), input_tokens: result.inputTokens ?? null, output_tokens: result.outputTokens ?? null, estimated_cost_usd: result.estimatedCostUsd ?? null, latency_ms: result.latencyMs, status: 'completed', request_metadata: (input.metadata ?? {}) as Json, response_metadata: { rawResponseId: result.rawResponseId ?? null } as Json, completed_at: new Date().toISOString() });
      return result.data;
    } catch (error) {
      await db.from('model_runs').insert({ application_id: input.applicationId ?? null, claim_id: input.claimId ?? null, run_type: input.runType, provider: 'openai', model_name: input.model, prompt_version: `${input.prompt.name}:${input.prompt.version}`, input_hash: inputHash, latency_ms: Date.now()-started, status: 'failed', error_message: error instanceof Error ? error.message.slice(0,2000) : 'Unknown AI error', request_metadata: (input.metadata ?? {}) as Json, completed_at: new Date().toISOString() });
      throw error;
    }
  }
}
