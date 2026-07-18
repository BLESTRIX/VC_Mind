import { log } from '../../lib/logger.js';
import type { ClaimVerificationStatus, EvidenceRelationship } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { calculateEvidenceCoverage } from './evidence-coverage.js';
import { evidenceConfidence } from './evidence-confidence.js';

export type ValidationFlag = {
  type: 'invalid_evidence_reference' | 'invalid_source_reference' | 'invalid_excerpt' | 'missing_source_snapshot' | 'claim_status_changed' | 'recommendation_mismatch';
  severity: 'warning' | 'error';
  claimId?: string;
  evidenceId?: string;
  evidenceSourceId?: string;
  message: string;
  detectedAt: string;
};

export type EvidenceReference = { claimId: string; evidenceId: string; evidenceSourceId: string; excerpt: string };
export type ValidationEvidenceRow = {
  id: string; claim_id: string; evidence_source_id: string; relationship: EvidenceRelationship; excerpt: string;
  source_quality: number | null; entity_match: number | null; freshness: number | null; evidence_completeness: number | null;
  validation_status?: string;
  evidence_sources: { id: string; canonical_url: string; snapshot_text: string | null; snapshot_storage_path: string | null; founder_controlled: boolean; authoritative_source: boolean; independence_cluster: string | null } | null;
};

export const normalizeForExcerptValidation = (value: string): string => value.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
export const excerptExistsInSource = (excerpt: string, source: string): boolean => { const normalizedExcerpt = normalizeForExcerptValidation(excerpt); const normalizedSource = normalizeForExcerptValidation(source); return Boolean(normalizedExcerpt && normalizedSource && normalizedSource.includes(normalizedExcerpt)); };

const validHttpUrl = (value: string): boolean => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
const flag = (type: ValidationFlag['type'], severity: ValidationFlag['severity'], reference: EvidenceReference, message: string, detectedAt: string): ValidationFlag => ({ type, severity, claimId: reference.claimId, evidenceId: reference.evidenceId, evidenceSourceId: reference.evidenceSourceId, message, detectedAt });

export function validateEvidenceReference(reference: EvidenceReference, row: ValidationEvidenceRow | undefined, detectedAt = new Date().toISOString()): ValidationFlag[] {
  if (!row || row.id !== reference.evidenceId || row.claim_id !== reference.claimId) return [flag('invalid_evidence_reference', 'error', reference, 'Evidence ID does not exist for the referenced claim.', detectedAt)];
  if (row.evidence_source_id !== reference.evidenceSourceId || !row.evidence_sources || row.evidence_sources.id !== reference.evidenceSourceId) return [flag('invalid_source_reference', 'error', reference, 'Evidence source ID does not match the stored evidence relationship.', detectedAt)];
  if (!validHttpUrl(row.evidence_sources.canonical_url) || !['supports', 'partially_supports', 'contradicts', 'context_only'].includes(row.relationship)) return [flag('invalid_source_reference', 'error', reference, 'Evidence source or relationship is invalid.', detectedAt)];
  if (!reference.excerpt.trim()) return [flag('invalid_excerpt', 'error', reference, 'Evidence excerpt is empty.', detectedAt)];
  const snapshot = row.evidence_sources.snapshot_text;
  if (snapshot === null) {
    if (!excerptExistsInSource(reference.excerpt, row.excerpt)) return [flag('invalid_excerpt', 'error', reference, 'Excerpt does not match retained evidence content.', detectedAt)];
    return [flag('missing_source_snapshot', 'warning', reference, 'Source snapshot is unavailable; validated against the retained evidence excerpt fallback.', detectedAt)];
  }
  return excerptExistsInSource(reference.excerpt, snapshot) ? [] : [flag('invalid_excerpt', 'error', reference, 'Excerpt is not present in the retained source snapshot.', detectedAt)];
}

export function validateEvidenceExcerpt(reference: EvidenceReference, row: ValidationEvidenceRow | undefined, detectedAt = new Date().toISOString()): ValidationFlag[] {
  return validateEvidenceReference(reference, row, detectedAt).filter((item) => item.type === 'invalid_excerpt' || item.type === 'missing_source_snapshot');
}

export type RecalculationEvidence = ValidationEvidenceRow & { validation_status?: string };
export function recalculateClaimVerificationFromEvidence(evidence: RecalculationEvidence[]): { status: ClaimVerificationStatus; confidence: number; reason: string; evidenceCount: number } {
  const valid = evidence.filter((row) => row.validation_status === 'valid' && row.relationship !== 'context_only');
  const supports = valid.filter((row) => row.relationship === 'supports');
  const partial = valid.filter((row) => row.relationship === 'partially_supports');
  const contradictions = valid.filter((row) => row.relationship === 'contradicts');
  const confidence = evidenceConfidence(valid.map((row) => ({ sourceQuality: row.source_quality ?? 0, entityMatch: row.entity_match ?? 0, completeness: row.evidence_completeness ?? 0, freshness: row.freshness, relationship: row.relationship, independenceCluster: row.evidence_sources?.independence_cluster, founderControlled: row.evidence_sources?.founder_controlled })));
  if (!valid.length) return { status: 'unverified', confidence: 0, reason: 'No valid relevant evidence remains.', evidenceCount: 0 };
  if (contradictions.length && (supports.length || partial.length)) return { status: 'partially_verified', confidence, reason: 'Valid supporting and contradicting evidence conflict.', evidenceCount: valid.length };
  if (contradictions.length) return { status: 'contradicted', confidence, reason: 'Valid evidence contradicts the claim and no valid support remains.', evidenceCount: valid.length };
  const authoritative = supports.some((row) => row.evidence_sources?.authoritative_source && !row.evidence_sources.founder_controlled);
  const independentClusters = new Set(supports.filter((row) => !row.evidence_sources?.founder_controlled && row.evidence_sources?.independence_cluster).map((row) => row.evidence_sources?.independence_cluster)).size;
  if (supports.length && (authoritative || independentClusters >= 2)) return { status: 'verified', confidence, reason: authoritative ? 'Validated by an authoritative independent source.' : 'Validated by two independent supporting source clusters.', evidenceCount: valid.length };
  return { status: 'partially_verified', confidence, reason: 'Valid support exists but does not meet the verified threshold.', evidenceCount: valid.length };
}

const joinedSource = (row: Omit<ValidationEvidenceRow, 'evidence_sources'> & { evidence_sources: ValidationEvidenceRow['evidence_sources'] | ValidationEvidenceRow['evidence_sources'][] }): ValidationEvidenceRow => ({ ...row, evidence_sources: Array.isArray(row.evidence_sources) ? row.evidence_sources[0] ?? null : row.evidence_sources });

export class EvidenceIntegrityService {
  async validateApplication(applicationId: string) {
    const db = getServiceClient();
    const [{ data: claims, error: claimError }, { data: rawEvidence, error: evidenceError }] = await Promise.all([
      db.from('claims').select('id,importance,checkable,verification_status').eq('application_id', applicationId),
      db.from('evidence').select('id,claim_id,evidence_source_id,relationship,excerpt,source_quality,entity_match,freshness,evidence_completeness,validation_status,evidence_sources(id,canonical_url,snapshot_text,snapshot_storage_path,founder_controlled,authoritative_source,independence_cluster),claims!inner(application_id)').eq('claims.application_id', applicationId)
    ]);
    if (claimError) throw claimError;
    if (evidenceError) throw evidenceError;
    const evidence = (rawEvidence ?? []).map((row) => joinedSource(row as unknown as Parameters<typeof joinedSource>[0]));
    const flags: ValidationFlag[] = [];
    for (const row of evidence) {
      const storagePath = row.evidence_sources?.snapshot_storage_path;
      if (!row.evidence_sources?.snapshot_text && storagePath) {
        const source = row.evidence_sources;
        const [bucket, ...parts] = storagePath.split('/').filter(Boolean);
        if (bucket && parts.length) {
          const { data } = await db.storage.from(bucket).download(parts.join('/'));
          if (data && source) source.snapshot_text = await data.text();
        }
      }
      const reference: EvidenceReference = { claimId: row.claim_id, evidenceId: row.id, evidenceSourceId: row.evidence_source_id, excerpt: row.excerpt };
      const rowFlags = validateEvidenceReference(reference, row);
      flags.push(...rowFlags);
      const errors = rowFlags.filter((item) => item.severity === 'error');
      const { error } = await db.from('evidence').update({ validation_status: errors.length ? 'invalid' : 'valid', validation_error: errors.map((item) => item.message).join(' ') || null }).eq('id', row.id);
      if (error) throw error;
      row.validation_status = errors.length ? 'invalid' : 'valid';
      for (const item of rowFlags) log(item.severity === 'error' ? 'error' : 'warn', 'Evidence integrity validation', { applicationId, claimId: item.claimId, evidenceId: item.evidenceId, evidenceSourceId: item.evidenceSourceId, validationType: item.type, validationStatus: errors.length ? 'invalid' : 'valid', stage: 'evidence_validation' });
    }
    const changedClaimIds: string[] = [];
    for (const claim of claims ?? []) {
      if (!claim.checkable) continue;
      const recalculated = recalculateClaimVerificationFromEvidence(evidence.filter((row) => row.claim_id === claim.id));
      await db.from('claims').update({ verification_status: recalculated.status, evidence_confidence: recalculated.confidence }).eq('id', claim.id);
      if (claim.verification_status !== recalculated.status) {
        changedClaimIds.push(claim.id);
        await db.from('claim_verification_runs').insert({ claim_id: claim.id, status: recalculated.status, confidence: recalculated.confidence, evidence_count: recalculated.evidenceCount, reason: recalculated.reason });
        flags.push({ type: 'claim_status_changed', severity: 'warning', claimId: claim.id, message: `Claim status changed from ${claim.verification_status} to ${recalculated.status}.`, detectedAt: new Date().toISOString() });
      }
      claim.verification_status = recalculated.status;
    }
    const coverage = calculateEvidenceCoverage(claims ?? []);
    await db.from('applications').update({ evidence_coverage: coverage.coveragePercentage }).eq('id', applicationId);
    return { flags, changedClaimIds, coverage };
  }
}
