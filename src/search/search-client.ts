import { AppError } from '../lib/errors.js';
import { getEnv } from '../lib/env.js';
import { withTimeout } from '../lib/timing.js';
import { normalizeUrl, stripMarkup } from './result-normalizer.js';
import type { SearchProvider, SearchInput, SearchResponse } from './search-types.js';
type BravePayload = { web?: { results?: Array<{ title?: string; url?: string; description?: string; page_age?: string }> } };
export class BraveSearchProvider implements SearchProvider {
  async search(input: SearchInput): Promise<SearchResponse> {
    const env=getEnv(); const query=[input.query,...(input.includeDomains??[]).map((d)=>`site:${d}`),...(input.excludeDomains??[]).map((d)=>`-site:${d}`)].join(' ');
    const url=new URL('https://api.search.brave.com/res/v1/web/search'); url.searchParams.set('q',query); url.searchParams.set('count',String(Math.min(input.maxResults,20)));
    const response=await withTimeout((signal)=>fetch(url,{headers:{Accept:'application/json','X-Subscription-Token':env.SEARCH_API_KEY},signal}),input.timeoutMs??env.SEARCH_REQUEST_TIMEOUT_MS,'SEARCH_PROVIDER_ERROR');
    if(!response.ok) throw new AppError('SEARCH_PROVIDER_ERROR',`Brave Search returned ${response.status}`,response.status>=500?503:502,{status:response.status},response.status===429||response.status>=500);
    const payload=await response.json() as BravePayload; const seen=new Set<string>(); const results=[];
    for(const [index,item] of (payload.web?.results??[]).entries()){ if(!item.url||!item.title) continue; const normalized=normalizeUrl(item.url); if(seen.has(normalized.url)) continue; seen.add(normalized.url); results.push({title:stripMarkup(item.title,500),url:normalized.url,domain:normalized.domain,...(item.description?{snippet:stripMarkup(item.description,2000)}:{}),...(item.page_age?{publishedAt:item.page_age}:{}),rank:index+1}); }
    return {results};
  }
}
