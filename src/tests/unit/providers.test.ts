import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { GroqProvider } from '../../ai/client.js';
import { TavilySearchProvider } from '../../search/search-client.js';
import { resetEnvForTests } from '../../lib/env.js';
import { groqRateLimiter } from '../../ai/rate-limiter.js';

beforeEach(() => {
  Object.assign(process.env, { SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service', GROQ_API_KEY: 'test-groq', AI_MODEL_FAST: 'llama-3.1-8b-instant', AI_MODEL_STRONG: 'llama-3.3-70b-versatile', AI_FAST_MODEL_TPM: '1000000', AI_STRONG_MODEL_TPM: '1000000', AI_PROVIDER: 'groq', TAVILY_API_KEY: 'test-tavily', SEARCH_PROVIDER: 'tavily', INTERNAL_WORKER_TOKEN: 'a'.repeat(24) });
  resetEnvForTests();
  groqRateLimiter.reset();
});

describe('Groq provider', () => {
  it('uses JSON Object Mode and validates the returned object', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'run-1', choices: [{ message: { content: '{"value":"ok"}' } }], usage: { prompt_tokens: 10, completion_tokens: 3 } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await new GroqProvider().generateStructured({ model: 'llama-3.1-8b-instant', systemPrompt: 'Return data.', userPrompt: 'input', schema: z.object({ value: z.string() }), schemaName: 'fixture', maxCompletionTokens: 321 });
    expect(result.data).toEqual({ value: 'ok' }); expect(result.provider).toBe('groq');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]; const body = JSON.parse(String(init.body));
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions'); expect(body.response_format).toEqual({ type: 'json_object' }); expect(body.model).toBe('llama-3.1-8b-instant'); expect(body.max_completion_tokens).toBe(321);
  });

  it('preserves Groq Retry-After details on rate limits', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Rate limit reached' } }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '30.095' } })));
    await expect(new GroqProvider().generateStructured({ model: 'llama-3.3-70b-versatile', systemPrompt: 'Return data.', userPrompt: 'input', schema: z.object({ value: z.string() }), schemaName: 'fixture', maxCompletionTokens: 100 })).rejects.toMatchObject({ retryable: true, details: { status: 429, kind: 'rate_limit', retryAfterMs: 30095 } });
  });
});

describe('Tavily provider', () => {
  it('posts bounded search parameters and normalizes results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [{ title: 'Fixture', url: 'https://www.example.com/report?utm_source=test', content: 'Useful evidence', raw_content: 'Longer evidence snapshot', score: .9 }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await new TavilySearchProvider().search({ query: 'fixture claim', maxResults: 5, excludeDomains: ['noise.example'] });
    expect(result.results[0]).toMatchObject({ url: 'https://example.com/report', domain: 'example.com', content: 'Longer evidence snapshot' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]; const body = JSON.parse(String(init.body));
    expect(url).toBe('https://api.tavily.com/search'); expect(body).toMatchObject({ search_depth: 'basic', max_results: 5, include_answer: false, include_raw_content: 'text' });
  });
});
