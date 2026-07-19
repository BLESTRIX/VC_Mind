import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { getEnv } from '../lib/env.js';
import { withTimeout } from '../lib/timing.js';
import type { AIProvider, AIResult, GenerateStructuredInput } from './provider.js';
import { estimateGroqTokens, groqRateLimiter } from './rate-limiter.js';

type GroqPayload = { id?: string; choices?: Array<{ message?: { content?: string | null } }>; usage?: { prompt_tokens?: number; completion_tokens?: number }; error?: { message?: string } };
const pricing: Record<string, { input: number; output: number }> = { 'llama-3.1-8b-instant': { input: .05, output: .08 }, 'llama-3.3-70b-versatile': { input: .59, output: .79 } };

export class GroqProvider implements AIProvider {
  async generateStructured<T>(input: GenerateStructuredInput<T>): Promise<AIResult<T>> {
    const env = getEnv(); const started = Date.now(); const schema = z.toJSONSchema(input.schema); const maxCompletionTokens = input.maxCompletionTokens ?? 2_000;
    const tokenLimit = input.model === env.AI_MODEL_STRONG ? env.AI_STRONG_MODEL_TPM : env.AI_FAST_MODEL_TPM;
    await groqRateLimiter.acquire(input.model, estimateGroqTokens(input.systemPrompt, input.userPrompt, schema, maxCompletionTokens), tokenLimit, env.AI_RATE_LIMIT_WINDOW_MS);
    const body = { model: input.model, messages: [{ role: 'system', content: `${input.systemPrompt}\n\nReturn exactly one JSON object matching this JSON Schema. Do not include markdown fences or commentary.\n${JSON.stringify(schema)}` }, { role: 'user', content: input.userPrompt }], temperature: input.temperature ?? .1, response_format: { type: 'json_object' }, max_completion_tokens: maxCompletionTokens, stream: false };
    const response = await withTimeout((signal) => fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }), input.timeoutMs ?? env.AI_REQUEST_TIMEOUT_MS, 'AI_PROVIDER_ERROR');
    const payload = await response.json() as GroqPayload;
    if (!response.ok) {
      const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'));
      throw new AppError('AI_PROVIDER_ERROR', payload.error?.message ?? `Groq returned ${response.status}`, response.status >= 500 ? 503 : 502, { status: response.status, model: input.model, ...(retryAfterMs !== undefined ? { retryAfterMs } : {}), kind: response.status === 429 ? 'rate_limit' : 'provider_error' }, response.status === 429 || response.status >= 500);
    }
    const raw = payload.choices?.[0]?.message?.content; if (!raw) throw new AppError('AI_PROVIDER_ERROR', 'Groq returned no JSON output', 502, { model: input.model }, true);
    let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new AppError('AI_PROVIDER_ERROR', 'Groq output was not valid JSON', 502, { model: input.model }, true); }
    const validated = input.schema.safeParse(parsed); if (!validated.success) throw new AppError('AI_PROVIDER_ERROR', 'Groq output failed application schema validation', 502, { model: input.model, issues: validated.error.issues }, true);
    const inputTokens = payload.usage?.prompt_tokens; const outputTokens = payload.usage?.completion_tokens; const rates = pricing[input.model]; const estimatedCostUsd = rates && inputTokens !== undefined && outputTokens !== undefined ? inputTokens / 1_000_000 * rates.input + outputTokens / 1_000_000 * rates.output : undefined;
    return { data: validated.data, provider: 'groq', model: input.model, latencyMs: Date.now() - started, ...(inputTokens !== undefined ? { inputTokens } : {}), ...(outputTokens !== undefined ? { outputTokens } : {}), ...(estimatedCostUsd !== undefined ? { estimatedCostUsd } : {}), ...(payload.id ? { rawResponseId: payload.id } : {}) };
  }
}

function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
}
