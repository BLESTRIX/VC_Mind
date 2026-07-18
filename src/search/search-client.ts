import { AppError } from '../lib/errors.js';
import { getEnv } from '../lib/env.js';
import { withTimeout } from '../lib/timing.js';
import { normalizeUrl, stripMarkup } from './result-normalizer.js';
import type { SearchProvider, SearchInput, SearchResponse } from './search-types.js';
type TavilyPayload = { results?: Array<{ title?: string; url?: string; content?: string; raw_content?: string | null; published_date?: string; score?: number }> };

export class TavilySearchProvider implements SearchProvider {
  async search(input: SearchInput): Promise<SearchResponse> {
    const env = getEnv();
    const body = { query: input.query, search_depth: 'basic', max_results: Math.min(input.maxResults, 20), include_answer: false, include_raw_content: 'text', include_domains: input.includeDomains ?? [], exclude_domains: input.excludeDomains ?? [] };
    const response = await withTimeout((signal) => fetch('https://api.tavily.com/search', { method: 'POST', headers: { Authorization: `Bearer ${env.TAVILY_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }), input.timeoutMs ?? env.SEARCH_REQUEST_TIMEOUT_MS, 'SEARCH_PROVIDER_ERROR');
    const payload = await response.json() as TavilyPayload;
    if (!response.ok) throw new AppError('SEARCH_PROVIDER_ERROR', `Tavily Search returned ${response.status}`, response.status >= 500 ? 503 : 502, { status: response.status }, response.status === 429 || response.status >= 500);
    const seen = new Set<string>(); const results = [];
    for (const [index, item] of (payload.results ?? []).entries()) { if (!item.url || !item.title || (item.score !== undefined && item.score < .2)) continue; const normalized = normalizeUrl(item.url); if (seen.has(normalized.url)) continue; seen.add(normalized.url); results.push({ title: stripMarkup(item.title, 500), url: normalized.url, domain: normalized.domain, ...(item.content ? { snippet: stripMarkup(item.content, 3000) } : {}), ...(item.raw_content ? { content: stripMarkup(item.raw_content, 12000) } : {}), ...(item.published_date ? { publishedAt: item.published_date } : {}), rank: index + 1 }); }
    return { results };
  }
}
