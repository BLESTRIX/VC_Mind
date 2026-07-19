import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { createResilientAIProvider } from '../../ai/resilient-provider.js';
import { claimExtractionSchema } from '../../ai/schemas.js';
import { prompts } from '../../ai/prompt-registry.js';
import { getServiceClient } from '../supabase.js';
import { transitionApplicationStage } from '../jobs/stage-runner.js';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
type DocumentWithPages = { id: string; document_pages?: Array<{ id: string; page_number: number; page_text: string | null }> };

export class ClaimExtractionService {
  constructor(private readonly ai = new ModelRunRecorder(createResilientAIProvider())) {}
  async extract(applicationId: string) {
    const db = getServiceClient();
    const { data: documents } = await db.from('documents').select('id,document_pages(*)').eq('application_id', applicationId).eq('document_type', 'pitch_deck').eq('processing_status', 'completed');
    const pages = ((documents ?? []) as unknown as DocumentWithPages[]).flatMap((document) => (document.document_pages ?? []).map((page) => ({ documentId: document.id, pageId: page.id, pageNumber: page.page_number, text: page.page_text ?? '' })));
    if (!pages.length) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'No extracted pitch-deck pages are available', 422);
    const result = await this.ai.generate({ applicationId, runType: 'claim_extraction', model: getEnv().AI_MODEL_FAST, prompt: prompts.claimExtraction, userPrompt: serializeContextWithinBudget({ maximumClaims: getEnv().MAX_CLAIMS_PER_APPLICATION, pages: pages.map(({ documentId, pageNumber, text }) => ({ documentId, pageNumber, text })) }, 10_000), schema: claimExtractionSchema, schemaName: 'claim_extraction', maxCompletionTokens: 2_000 });
    const unique = new Map<string, (typeof result.claims)[number]>();
    for (const claim of result.claims.slice(0, getEnv().MAX_CLAIMS_PER_APPLICATION)) {
      const key = normalize(claim.claimText); if (unique.has(key)) continue;
      if (claim.pageNumber !== undefined) { const page = pages.find((item) => item.pageNumber === claim.pageNumber && (!claim.documentId || item.documentId === claim.documentId)); if (!page || (claim.sourceExcerpt && !normalize(page.text).includes(normalize(claim.sourceExcerpt)))) continue; }
      unique.set(key, claim);
    }
    const rows = [...unique.values()].map((claim) => { const page = claim.pageNumber !== undefined ? pages.find((item) => item.pageNumber === claim.pageNumber && (!claim.documentId || item.documentId === claim.documentId)) : undefined; return { application_id: applicationId, document_id: page?.documentId ?? claim.documentId ?? null, document_page_id: page?.pageId ?? null, claim_text: claim.claimText, category: claim.category, importance: claim.importance, source_type: 'pitch_deck', source_excerpt: claim.sourceExcerpt ?? null, source_start_offset: claim.sourceStartOffset ?? null, source_end_offset: claim.sourceEndOffset ?? null, checkable: claim.checkable }; });
    if (!rows.length) throw new AppError('AI_PROVIDER_ERROR', 'No claim passed source-page validation', 422);
    const { data, error } = await db.from('claims').insert(rows).select('*');
    if (error) throw new AppError('INTERNAL_ERROR', 'Claims could not be stored', 500, { database: error.message });
    await transitionApplicationStage(applicationId, 'claims_ready', 'completed', null, { claimCount: data.length });
    const { data: application } = await db.from('applications').select('company_id').eq('id', applicationId).single();
    await db.from('signals').insert({ application_id: applicationId, company_id: application?.company_id ?? null, signal_type: 'claims_extracted', title: 'Decision-relevant claims extracted', payload: { claimCount: data.length }, occurred_at: new Date().toISOString() });
    return data;
  }
}
