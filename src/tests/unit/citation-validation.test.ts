import { describe, expect, it } from 'vitest';
import { excerptExistsInSource, normalizeForExcerptValidation, validateEvidenceReference, type ValidationEvidenceRow } from '../../server/evidence/evidence-integrity.service.js';

const row = (overrides: Partial<ValidationEvidenceRow> = {}): ValidationEvidenceRow => ({ id: 'evidence-1', claim_id: 'claim-1', evidence_source_id: 'source-1', relationship: 'supports', excerpt: 'Real “Evidence”', source_quality: .8, entity_match: .9, freshness: .8, evidence_completeness: .9, evidence_sources: { id: 'source-1', canonical_url: 'https://example.com/source', snapshot_text: 'This is real "evidence" from the source.', snapshot_storage_path: null, founder_controlled: false, authoritative_source: true, independence_cluster: 'example' }, ...overrides });
const reference = { claimId: 'claim-1', evidenceId: 'evidence-1', evidenceSourceId: 'source-1', excerpt: 'REAL   “EVIDENCE”' };

describe('evidence reference and excerpt validation', () => {
  it('normalizes Unicode, smart quotes, case, zero-width characters, and whitespace', () => expect(normalizeForExcerptValidation('  Ｒeal\u200B “Evidence” ')).toBe('real "evidence"'));
  it('matches normalized exact substrings', () => expect(excerptExistsInSource(reference.excerpt, row().evidence_sources!.snapshot_text!)).toBe(true));
  it('accepts matching claim, evidence, and source IDs', () => expect(validateEvidenceReference(reference, row())).toEqual([]));
  it('rejects evidence attached to another claim', () => expect(validateEvidenceReference(reference, row({ claim_id: 'claim-2' }))[0]?.type).toBe('invalid_evidence_reference'));
  it('rejects missing evidence IDs', () => expect(validateEvidenceReference(reference, undefined)[0]?.type).toBe('invalid_evidence_reference'));
  it('rejects mismatched or missing source IDs', () => expect(validateEvidenceReference(reference, row({ evidence_source_id: 'source-2' }))[0]?.type).toBe('invalid_source_reference'));
  it('rejects invented and empty excerpts', () => { expect(validateEvidenceReference({ ...reference, excerpt: 'invented' }, row())[0]?.type).toBe('invalid_excerpt'); expect(validateEvidenceReference({ ...reference, excerpt: '' }, row())[0]?.type).toBe('invalid_excerpt'); });
  it('rejects empty source content', () => expect(validateEvidenceReference(reference, row({ evidence_sources: { ...row().evidence_sources!, snapshot_text: '' } }))[0]?.type).toBe('invalid_excerpt'));
  it('uses retained evidence excerpt as final fallback and emits a warning', () => expect(validateEvidenceReference({ ...reference, excerpt: 'Real “Evidence”' }, row({ evidence_sources: { ...row().evidence_sources!, snapshot_text: null } }))[0]).toMatchObject({ type: 'missing_source_snapshot', severity: 'warning' }));
});
