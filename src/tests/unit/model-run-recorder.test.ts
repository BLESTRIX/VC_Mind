import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import type { AIProvider } from '../../ai/provider.js';
import { resetEnvForTests } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';

vi.mock('../../server/supabase.js', () => ({ getServiceClient: () => ({ from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }) }) }));

beforeEach(() => {
  Object.assign(process.env, { SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service', GROQ_API_KEY: 'test-groq', AI_MODEL_FAST: 'fast-model', AI_MODEL_STRONG: 'strong-model', AI_PROVIDER: 'groq', TAVILY_API_KEY: 'test-tavily', SEARCH_PROVIDER: 'tavily', INTERNAL_WORKER_TOKEN: 'a'.repeat(24) });
  resetEnvForTests();
});

describe('model fallback policy', () => {
  it('does not redirect a rate-limited fast-model request to the strong model', async () => {
    const generateStructured = vi.fn().mockRejectedValue(new AppError('AI_PROVIDER_ERROR', 'limited', 502, { status: 429, kind: 'rate_limit', retryAfterMs: 30_000 }, true));
    const recorder = new ModelRunRecorder({ generateStructured } as unknown as AIProvider);
    await expect(recorder.generate({ runType: 'fixture', model: 'fast-model', prompt: { name: 'fixture', version: 'v1', description: 'fixture', systemPrompt: 'system' }, userPrompt: 'user', schema: z.object({ value: z.string() }), schemaName: 'fixture', maxCompletionTokens: 100 })).rejects.toMatchObject({ details: { kind: 'rate_limit' } });
    expect(generateStructured).toHaveBeenCalledTimes(1);
    expect(generateStructured.mock.calls[0]?.[0]).toMatchObject({ model: 'fast-model' });
  });
});
