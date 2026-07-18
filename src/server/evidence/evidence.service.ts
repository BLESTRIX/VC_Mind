import pLimit from 'p-limit';
import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { TavilySearchProvider } from '../../search/search-client.js';
import type { SearchProvider } from '../../search/search-types.js';
import type { EvidenceSourceRow } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { classifySource, independenceCluster } from './evidence-normalizer.js';
import { EvidenceRepository } from './evidence.repository.js';

export class EvidenceService {
  constructor(private readonly search: SearchProvider = new TavilySearchProvider(), private readonly repository = new EvidenceRepository()) {}
  async collect(applicationId: string) {
    const db = getServiceClient();
    const { data: application } = await db.from('applications').select('*,companies(name,domain)').eq('id', applicationId).single();
    if (!application) throw new AppError('NOT_FOUND', 'Application not found', 404);
    const company = (application as unknown as { companies: { name: string; domain: string | null } }).companies;
    const { data: claims } = await db.from('claims').select('*').eq('application_id', applicationId).eq('checkable', true).in('importance', ['high', 'critical']);
    const limit = pLimit(getEnv().DILIGENCE_CONCURRENCY);
    return Promise.all((claims ?? []).map((claim) => limit(async () => {
      const query = `"${company.name}" ${claim.claim_text}`.slice(0, 500);
      const audit = await this.repository.startQuery(applicationId, claim.id, query, 'tavily');
      try {
        const response = await this.search.search({ query, maxResults: 5 });
        const sources: EvidenceSourceRow[] = [];
        for (const item of response.results) {
          const snapshot = (item.content ?? item.snippet ?? '').trim(); if (!snapshot) continue;
          const type = classifySource(item.domain, company.domain);
          sources.push(await this.repository.upsertSource({ url: item.url, title: item.title, domain: item.domain, type, snapshot, founderControlled: type === 'company_website' || type === 'social_profile', authoritative: type === 'government', cluster: independenceCluster(item.domain, item.title), ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}) }));
        }
        await this.repository.finishQuery(audit.id, 'completed', sources.length);
        return { claim, queryId: audit.id, sources };
      } catch (error) { await this.repository.finishQuery(audit.id, 'failed', 0, error instanceof Error ? error.message : 'Search failed'); throw error; }
    })));
  }
}
