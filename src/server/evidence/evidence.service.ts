import pLimit from 'p-limit';
import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { TavilySearchProvider } from '../../search/search-client.js';
import type { SearchProvider } from '../../search/search-types.js';
import type { EvidenceSourceRow } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { classifySource, independenceCluster } from './evidence-normalizer.js';
import { EvidenceRepository } from './evidence.repository.js';
import { SLAService,recordSlaFallbackAction } from '../sla/sla.service.js';

export class EvidenceService {
  constructor(private readonly search: SearchProvider = new TavilySearchProvider(), private readonly repository = new EvidenceRepository()) {}
  async collect(applicationId: string) {
    const db = getServiceClient();
    const { data: application } = await db.from('applications').select('*,companies(name,domain)').eq('id', applicationId).single();
    if (!application) throw new AppError('NOT_FOUND', 'Application not found', 404);
    const company = (application as unknown as { companies: { name: string; domain: string | null } }).companies;
    const { data: claims } = await db.from('claims').select('*').eq('application_id', applicationId).eq('checkable', true);
    let atRisk=false;try{const sla=await new SLAService().get(applicationId);atRisk=sla.status!=='on_track'||sla.totalRemainingSeconds<4*60*60;}catch{/* SLA telemetry must not prevent diligence. */}
    const prioritized=[...(claims??[])].sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.importance]-{critical:0,high:1,medium:2,low:3}[b.importance])).filter(claim=>!atRisk||claim.importance!=='low');
    if(atRisk&&(claims??[]).some(claim=>claim.importance==='low'))await recordSlaFallbackAction(applicationId,'Skipped optional low-importance public research while SLA was at risk.');
    const limit = pLimit(getEnv().DILIGENCE_CONCURRENCY);
    return Promise.all(prioritized.map((claim) => limit(async () => {
      const query = `"${company.name}" ${claim.claim_text}`.slice(0, 500);
      const audit = await this.repository.startQuery(applicationId, claim.id, query, 'tavily');
      try {
        let response;try{response=await this.search.search({query,maxResults:5});}catch(first){if(!(first instanceof AppError)||!first.retryable)throw first;await recordSlaFallbackAction(applicationId,'Retried a transient search-provider failure once.');try{response=await this.search.search({query,maxResults:5});}catch(second){await this.repository.finishQuery(audit.id,'failed',0,second instanceof Error?second.message:'Search failed');await recordSlaFallbackAction(applicationId,'Continued with stored evidence after search-provider timeout; affected diligence remains incomplete.');return{claim,queryId:audit.id,sources:[] as EvidenceSourceRow[]};}}
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
