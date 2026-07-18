import { describe, expect, it } from 'vitest';
import { findCitationFlags, normalizeEvidenceText } from '../../server/memos/citation-validation.service.js';

describe('citation validation', () => {
  it('normalizes case and whitespace before matching excerpts', () => expect(normalizeEvidenceText('  Real\n  Evidence ')).toBe('real evidence'));

  it('accepts a normalized excerpt contained in retained retrieved text', () => {
    const flags = findCitationFlags(
      [{ id: 'claim-1', verification_status: 'verified' }],
      [{ id: 'evidence-1', claim_id: 'claim-1', excerpt: 'REAL   evidence', evidence_sources: { canonical_url: 'https://example.com/source', snapshot_text: 'This is real evidence from the source.' } }],
      '2026-01-01T00:00:00.000Z'
    );
    expect(flags).toEqual([]);
  });

  it('flags missing sources and excerpts absent from retrieved text', () => {
    const flags = findCitationFlags(
      [{ id: 'claim-1', verification_status: 'contradicted' }],
      [
        { id: 'bad-url', claim_id: 'claim-1', excerpt: 'quote', evidence_sources: null },
        { id: 'bad-quote', claim_id: 'claim-1', excerpt: 'invented quote', evidence_sources: { canonical_url: 'https://example.com/source', snapshot_text: 'Stored source text.' } }
      ],
      '2026-01-01T00:00:00.000Z'
    );
    expect(flags.map((flag) => flag.type)).toEqual(['invalid_citation', 'invalid_excerpt']);
  });
});
