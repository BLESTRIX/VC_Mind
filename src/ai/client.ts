import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { getEnv } from '../lib/env.js';
import { withTimeout } from '../lib/timing.js';
import type { AIProvider, AIResult, GenerateStructuredInput } from './provider.js';
type ResponsesPayload = { id?: string; output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; usage?: { input_tokens?: number; output_tokens?: number }; error?: { message?: string } };
export class OpenAIProvider implements AIProvider {
  async generateStructured<T>(input: GenerateStructuredInput<T>): Promise<AIResult<T>> {
    const env = getEnv(); const started = Date.now();
    const body = { model: input.model, instructions: input.systemPrompt, input: input.userPrompt, temperature: input.temperature ?? 0.1, text: { format: { type: 'json_schema', name: input.schemaName.replace(/[^a-zA-Z0-9_-]/g, '_'), strict: true, schema: z.toJSONSchema(input.schema) } }, store: false };
    const response = await withTimeout((signal) => fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${env.AI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }), input.timeoutMs ?? env.AI_REQUEST_TIMEOUT_MS, 'AI_PROVIDER_ERROR');
    const payload = await response.json() as ResponsesPayload;
    if (!response.ok) throw new AppError('AI_PROVIDER_ERROR', payload.error?.message ?? `OpenAI returned ${response.status}`, response.status >= 500 ? 503 : 502, { status: response.status }, response.status === 429 || response.status >= 500);
    const raw = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text;
    if (!raw) throw new AppError('AI_PROVIDER_ERROR','OpenAI returned no structured output',502);
    let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new AppError('AI_PROVIDER_ERROR','OpenAI output was not valid JSON',502); }
    const validated = input.schema.safeParse(parsed);
    if (!validated.success) throw new AppError('AI_PROVIDER_ERROR','OpenAI output failed application schema validation',502,{ issues: validated.error.issues });
    return { data: validated.data, provider: 'openai', model: input.model, latencyMs: Date.now()-started, ...(payload.usage?.input_tokens !== undefined ? { inputTokens: payload.usage.input_tokens } : {}), ...(payload.usage?.output_tokens !== undefined ? { outputTokens: payload.usage.output_tokens } : {}), ...(payload.id ? { rawResponseId: payload.id } : {}) };
  }
}
