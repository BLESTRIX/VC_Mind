import { log } from '../../lib/logger.js';
import type { Json } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { validateEvidenceReference, type EvidenceReference, type ValidationEvidenceRow, type ValidationFlag } from '../evidence/evidence-integrity.service.js';

type MemoClaim = { claimId?: unknown; evidence?: unknown };
type MemoGroup = { name: 'verified' | 'unverified' | 'contradicted'; value: Json };
type EvidenceWithStatus = ValidationEvidenceRow & { validation_status?: string };

const readClaims = (value: Json): MemoClaim[] => Array.isArray(value) ? value as MemoClaim[] : [];
const readReferences = (claim: MemoClaim): EvidenceReference[] => Array.isArray(claim.evidence) ? claim.evidence.filter((item): item is EvidenceReference => Boolean(item && typeof item === 'object' && typeof (item as EvidenceReference).claimId === 'string' && typeof (item as EvidenceReference).evidenceId === 'string' && typeof (item as EvidenceReference).evidenceSourceId === 'string' && typeof (item as EvidenceReference).excerpt === 'string')) : [];
const normalizeJoinedSource = (row: ValidationEvidenceRow & { evidence_sources: ValidationEvidenceRow['evidence_sources'] | ValidationEvidenceRow['evidence_sources'][] }): EvidenceWithStatus => ({ ...row, evidence_sources: Array.isArray(row.evidence_sources) ? row.evidence_sources[0] ?? null : row.evidence_sources });
const mergeFlags = (existing: Json, additions: ValidationFlag[]): ValidationFlag[] => {
  const prior = Array.isArray(existing) ? existing as unknown as ValidationFlag[] : [];
  const merged = new Map<string, ValidationFlag>();
  for (const item of [...prior, ...additions]) merged.set(`${item.type}:${item.claimId ?? ''}:${item.evidenceId ?? ''}:${item.evidenceSourceId ?? ''}`, item);
  return [...merged.values()];
};
const makeFlag = (type: ValidationFlag['type'], severity: ValidationFlag['severity'], message: string, fields: Partial<Pick<ValidationFlag, 'claimId' | 'evidenceId' | 'evidenceSourceId'>> = {}): ValidationFlag => ({ type, severity, ...fields, message, detectedAt: new Date().toISOString() });

export class CitationValidationService {
  async validateFinalMemoCitations(memoId: string) {
    const { data, error } = await getServiceClient().from('memos').select('application_id').eq('id', memoId).single();
    if (error) throw error;
    return this.validate(data.application_id);
  }

  async finalizeMemoValidation(memoId: string) { return this.validateFinalMemoCitations(memoId); }

  async validate(applicationId: string) {
    const db = getServiceClient();
    const [{ data: memo, error: memoError }, { data: application, error: applicationError }, { data: revisionJob }] = await Promise.all([
      db.from('memos').select('id,verified_claims,unverified_claims,contradicted_claims,recommendation,validation_flags').eq('application_id', applicationId).eq('is_current', true).single(),
      db.from('applications').select('recommendation').eq('id', applicationId).single(),
      db.from('processing_jobs').select('result').eq('application_id', applicationId).eq('job_type', 'revise_memo').eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle()
    ]);
    if (memoError) throw memoError;
    if (applicationError) throw applicationError;

    const groups: MemoGroup[] = [{ name: 'verified', value: memo.verified_claims }, { name: 'unverified', value: memo.unverified_claims }, { name: 'contradicted', value: memo.contradicted_claims }];
    const claimItems = groups.flatMap((group) => readClaims(group.value).map((item) => ({ group: group.name, item })));
    const claimIds = [...new Set(claimItems.map(({ item }) => item.claimId).filter((id): id is string => typeof id === 'string'))];
    const references = claimItems.flatMap(({ item }) => readReferences(item));
    const evidenceIds = [...new Set(references.map((reference) => reference.evidenceId))];
    const [{ data: claims, error: claimsError }, evidenceResult] = await Promise.all([
      claimIds.length ? db.from('claims').select('id,verification_status').eq('application_id', applicationId).in('id', claimIds) : Promise.resolve({ data: [], error: null }),
      evidenceIds.length ? db.from('evidence').select('id,claim_id,evidence_source_id,relationship,excerpt,source_quality,entity_match,freshness,evidence_completeness,validation_status,evidence_sources(id,canonical_url,snapshot_text,snapshot_storage_path,founder_controlled,authoritative_source,independence_cluster)').in('id', evidenceIds) : Promise.resolve({ data: [], error: null })
    ]);
    if (claimsError) throw claimsError;
    if (evidenceResult.error) throw evidenceResult.error;
    const evidence = (evidenceResult.data ?? []).map((row) => normalizeJoinedSource(row as unknown as Parameters<typeof normalizeJoinedSource>[0]));
    for (const row of evidence) {
      const storagePath = row.evidence_sources?.snapshot_storage_path;
      if (row.evidence_sources?.snapshot_text === null && storagePath) {
        const source = row.evidence_sources;
        const [bucket, ...parts] = storagePath.split('/').filter(Boolean);
        if (bucket && parts.length) {
          const { data } = await db.storage.from(bucket).download(parts.join('/'));
          if (data && source) source.snapshot_text = await data.text();
        }
      }
    }
    const claimById = new Map((claims ?? []).map((claim) => [claim.id, claim]));
    const evidenceById = new Map(evidence.map((row) => [row.id, row]));
    const flags: ValidationFlag[] = [];
    let usableReferences = 0;

    for (const { group, item } of claimItems) {
      if (typeof item.claimId !== 'string' || !claimById.has(item.claimId)) {
        flags.push(makeFlag('invalid_evidence_reference', 'error', 'Memo references a claim that does not belong to this application.', typeof item.claimId === 'string' ? { claimId: item.claimId } : {}));
        continue;
      }
      const claim = claimById.get(item.claimId)!;
      if (group === 'verified' && claim.verification_status !== 'verified') flags.push(makeFlag('claim_status_changed', 'error', 'Memo describes a claim as verified but the current deterministic status is not verified.', { claimId: item.claimId }));
      if (group === 'contradicted' && claim.verification_status !== 'contradicted') flags.push(makeFlag('claim_status_changed', 'warning', 'Memo contradiction label no longer matches the current deterministic claim status.', { claimId: item.claimId }));
      const itemReferences = readReferences(item);
      if (group !== 'unverified' && !itemReferences.length) flags.push(makeFlag('invalid_evidence_reference', 'error', 'Evaluated memo claim has no ID-based evidence reference.', { claimId: item.claimId }));
      for (const reference of itemReferences) {
        if (reference.claimId !== item.claimId) {
          flags.push(makeFlag('invalid_evidence_reference', 'error', 'Memo evidence reference belongs to a different claim.', { claimId: item.claimId, evidenceId: reference.evidenceId, evidenceSourceId: reference.evidenceSourceId }));
          continue;
        }
        const row = evidenceById.get(reference.evidenceId);
        const referenceFlags = validateEvidenceReference(reference, row);
        if (row?.validation_status !== 'valid') referenceFlags.push(makeFlag('invalid_evidence_reference', 'error', 'Referenced evidence is not marked valid.', { claimId: reference.claimId, evidenceId: reference.evidenceId, evidenceSourceId: reference.evidenceSourceId }));
        flags.push(...referenceFlags);
        if (!referenceFlags.some((entry) => entry.severity === 'error')) usableReferences++;
      }
    }

    if (!usableReferences) flags.push(makeFlag('invalid_evidence_reference', 'error', 'The final memo has no usable validated evidence references.'));
    const modelRecommendation = ((revisionJob?.result as { output?: { recommendation?: unknown } } | null)?.output?.recommendation);
    if (memo.recommendation !== application.recommendation || (typeof modelRecommendation === 'string' && modelRecommendation !== application.recommendation)) flags.push(makeFlag('recommendation_mismatch', 'error', 'Model memo recommendation differed from the official deterministic recommendation and the stored memo uses the official value.'));

    const merged = mergeFlags(memo.validation_flags, flags);
    const { error: updateError } = await db.from('memos').update({ recommendation: application.recommendation ?? memo.recommendation, validation_flags: merged as unknown as Json }).eq('id', memo.id).eq('is_current', true);
    if (updateError) throw updateError;
    for (const item of flags) log(item.severity === 'error' ? 'error' : 'warn', 'Final memo citation validation', { applicationId, memoId: memo.id, claimId: item.claimId, evidenceId: item.evidenceId, evidenceSourceId: item.evidenceSourceId, validationType: item.type, validationStatus: item.severity, stage: 'final_memo_validation' });
    return { memoId: memo.id, flags, usableReferences, recommendation: application.recommendation };
  }
}
