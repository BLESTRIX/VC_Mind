import { describe, expect, it } from 'vitest';
import { recalculateClaimVerificationFromEvidence, type RecalculationEvidence, type ValidationEvidenceRow } from '../../server/evidence/evidence-integrity.service.js';

const evidence = (relationship: ValidationEvidenceRow['relationship'], overrides: Partial<RecalculationEvidence> = {}): RecalculationEvidence => ({ id: crypto.randomUUID(), claim_id: 'claim-1', evidence_source_id: crypto.randomUUID(), relationship, excerpt: 'quote', source_quality: .8, entity_match: .9, freshness: .8, evidence_completeness: .9, validation_status: 'valid', evidence_sources: { id: crypto.randomUUID(), canonical_url: 'https://example.com', snapshot_text: 'quote', snapshot_storage_path: null, founder_controlled: false, authoritative_source: false, independence_cluster: 'cluster-a' }, ...overrides });

describe('deterministic claim recalculation', () => {
  it('returns unverified with no valid evidence', () => expect(recalculateClaimVerificationFromEvidence([])).toMatchObject({ status: 'unverified', confidence: 0 }));
  it('returns contradicted for contradiction only', () => expect(recalculateClaimVerificationFromEvidence([evidence('contradicts')]).status).toBe('contradicted'));
  it('returns partially verified for conflicting evidence', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports'), evidence('contradicts')])).toMatchObject({ status: 'partially_verified', reason: expect.stringContaining('conflict') }));
  it('returns partially verified for one weak source', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports')]).status).toBe('partially_verified'));
  it('allows one authoritative non-founder source to verify', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports', { evidence_sources: { ...evidence('supports').evidence_sources!, authoritative_source: true } })]).status).toBe('verified'));
  it('allows two independent supporting clusters to verify', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports'), evidence('supports', { evidence_sources: { ...evidence('supports').evidence_sources!, independence_cluster: 'cluster-b' } })]).status).toBe('verified'));
  it('does not count founder-controlled sources as independent confirmation', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports', { evidence_sources: { ...evidence('supports').evidence_sources!, founder_controlled: true } }), evidence('supports', { evidence_sources: { ...evidence('supports').evidence_sources!, founder_controlled: true, independence_cluster: 'cluster-b' } })]).status).toBe('partially_verified'));
  it('ignores one invalid citation while retaining other valid evidence', () => expect(recalculateClaimVerificationFromEvidence([evidence('supports', { evidence_sources: { ...evidence('supports').evidence_sources!, authoritative_source: true } }), evidence('contradicts', { validation_status: 'invalid' })]).status).toBe('verified'));
});
