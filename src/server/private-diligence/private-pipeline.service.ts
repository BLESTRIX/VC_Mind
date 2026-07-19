import type { ClaimVerificationStatus, Json } from '../../types/database.js';
import { AppError } from '../../lib/errors.js';
import { getServiceClient } from '../supabase.js';
import { DocumentService } from '../documents/document.service.js';
import { extractStructuredFacts, EXTRACTION_VERSION } from './extraction.service.js';
import { reconcileClaim } from './reconciliation.service.js';

const numberFromText = (text: string): number | undefined => {
  const match = text.match(/(?:[$€£]\s*)?([\d,.]+)\s*(%|k|m|million|thousand)?/i);
  if (!match?.[1]) return undefined;
  let value = Number(match[1].replace(/,/g, ''));
  if (/^(m|million)$/i.test(match[2] ?? '')) value *= 1e6;
  if (/^(k|thousand)$/i.test(match[2] ?? '')) value *= 1e3;
  return Number.isFinite(value) ? value : undefined;
};
const observed = (value: Json | null): { value?: unknown; unit?: string; currency?: string } => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, Json | undefined>;
  return { ...(record.value !== undefined ? { value: record.value } : {}), ...(typeof record.unit === 'string' ? { unit: record.unit } : {}), ...(typeof record.currency === 'string' ? { currency: record.currency } : {}) };
};

export class PrivatePipelineService {
  async extract(documentId: string) {
    const db = getServiceClient(); const { data: doc } = await db.from('documents').select('*').eq('id', documentId).single();
    if (!doc) throw new AppError('NOT_FOUND', 'Document not found', 404);
    let text = ''; const warnings: string[] = [];
    if (doc.mime_type === 'application/pdf') {
      await new DocumentService().extract(documentId);
      const { data: pages } = await db.from('document_pages').select('page_number,page_text').eq('document_id', documentId).order('page_number');
      text = (pages ?? []).map((page) => `[page ${page.page_number}]\n${page.page_text ?? ''}`).join('\n');
    } else {
      const { data, error } = await db.storage.from(doc.storage_bucket).download(doc.storage_path);
      if (error || !data) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'Stored document could not be downloaded', 500);
      if (doc.original_filename?.toLowerCase().endsWith('.xlsx')) warnings.push('XLSX binary parsing is unavailable; export as CSV for deterministic row extraction.'); else text = await data.text();
    }
    const result = extractStructuredFacts(doc.document_type as Parameters<typeof extractStructuredFacts>[0], text, doc.source_system); result.warnings.push(...warnings);
    const { data, error } = await db.from('document_extractions').insert({ document_id: documentId, extractor_type: `${doc.document_type}_controlled`, extractor_version: EXTRACTION_VERSION, status: 'completed', structured_data: result.structuredData, warnings: result.warnings, confidence: result.confidence }).select('*').single();
    if (error || !data) throw new AppError('INTERNAL_ERROR', 'Extraction result could not be stored', 500, { database: error?.message });
    await db.from('documents').update({ processing_status: 'completed', processed_at: new Date().toISOString() }).eq('id', documentId); return data;
  }

  async reconcile(applicationId: string, documentId?: string) {
    const db = getServiceClient(); let query = db.from('evidence').select('claim_id,document_id,observed_value,period_start,period_end,source_reference,claims!inner(id,application_id,claim_text,category,importance)').eq('claims.application_id', applicationId).not('document_id', 'is', null).eq('validation_status', 'valid');
    if (documentId) query = query.eq('document_id', documentId);
    const { data: evidence } = await query; const byClaim = new Map<string, NonNullable<typeof evidence>>();
    for (const row of evidence ?? []) { const list = byClaim.get(row.claim_id) ?? []; list.push(row); byClaim.set(row.claim_id, list); }
    const results = [];
    for (const [claimId, items] of byClaim) {
      const row = items[0]; if (!row) continue;
      const claim = row.claims as unknown as { claim_text: string; category: string; importance: string }; const value = observed(row.observed_value);
      const claimedValue = numberFromText(claim.claim_text) ?? claim.claim_text; const lower = claim.claim_text.toLowerCase(); const documentIds = [...new Set(items.map((item) => item.document_id).filter((id): id is string => Boolean(id)))];
      const specialCase = lower.includes('undisclosed') && /safe|convertible|debt|note/.test(lower) ? 'undisclosed_convertible' : lower.includes('founder') && lower.includes('ownership') ? 'founder_ownership' : undefined;
      const result = reconcileClaim({ claimId, category: claim.category, claimText: claim.claim_text, claimedValue, observedValue: value.value, unit: lower.includes('%') ? 'percentage' : value.currency, observedUnit: value.unit ?? value.currency, periodStart: row.period_start ?? undefined, periodEnd: row.period_end ?? undefined, observedPeriodStart: row.period_start ?? undefined, observedPeriodEnd: row.period_end ?? undefined, supportingDocumentIds: documentIds, specialCase });
      const { error } = await db.from('claim_reconciliations').insert({ application_id: applicationId, claim_id: claimId, claimed_value: (result.claimedValue ?? null) as Json, observed_value: (result.observedValue ?? null) as Json, unit: result.unit ?? null, period_start: result.periodStart ?? null, period_end: result.periodEnd ?? null, result: result.result, variance_percentage: result.variancePercentage ?? null, material: result.material, severity: result.severity, explanation: result.explanation, supporting_document_ids: result.supportingDocumentIds, reconciliation_version: 'deterministic-v1' });
      if (error) throw new AppError('INTERNAL_ERROR', 'Reconciliation could not be stored', 500, { database: error.message });
      let status: ClaimVerificationStatus | undefined = result.result === 'matched' ? 'verified' : result.result === 'approximately_matched' ? 'partially_verified' : result.result === 'mismatched' ? 'contradicted' : undefined;
      if (!status) { const { count } = await db.from('evidence').select('id', { count: 'exact', head: true }).eq('claim_id', claimId).eq('validation_status', 'valid'); if (!count) status = 'unverified'; }
      if (status) { const confidence = result.result === 'matched' ? 1 : result.result === 'mismatched' ? .95 : .8; await db.from('claim_verification_runs').insert({ claim_id: claimId, status, confidence, evidence_count: items.length, reason: `Private reconciliation: ${result.explanation}` }); await db.from('claims').update({ verification_status: status, evidence_confidence: confidence }).eq('id', claimId); }
      results.push(result);
    }
    const { data: missingRequests } = await db.from('information_requests').select('claim_id,requested_document_type,title').eq('application_id', applicationId).eq('status', 'requested').not('claim_id', 'is', null);
    for (const request of missingRequests ?? []) {
      if (!request.claim_id || byClaim.has(request.claim_id)) continue;
      const result = reconcileClaim({ claimId: request.claim_id, category: 'other', supportingDocumentIds: [] });
      const { error } = await db.from('claim_reconciliations').insert({ application_id: applicationId, claim_id: request.claim_id, claimed_value: null, observed_value: null, unit: null, period_start: null, period_end: null, result: result.result, variance_percentage: null, material: false, severity: 'low', explanation: `Required ${request.requested_document_type ?? 'document'} is missing for: ${request.title}`, supporting_document_ids: [], reconciliation_version: 'deterministic-v1' });
      if (error) throw new AppError('INTERNAL_ERROR', 'Missing-document reconciliation could not be stored', 500, { database: error.message }); results.push(result);
    }
    const { data: coverage } = await db.rpc('application_evidence_coverage', { p_application_id: applicationId }); await db.from('applications').update({ evidence_coverage: Number(coverage ?? 0) }).eq('id', applicationId); return results;
  }
}
