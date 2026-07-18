import { describe, expect, it } from 'vitest';
import { calculateEvidenceCoverage } from '../../server/evidence/evidence-coverage.js';

describe('evidence coverage', () => {
  it('uses importance weights and counts contradictions as evaluated evidence', () => {
    expect(calculateEvidenceCoverage([
      { importance: 'high', checkable: true, verification_status: 'contradicted' },
      { importance: 'medium', checkable: true, verification_status: 'unverified' },
      { importance: 'low', checkable: true, verification_status: 'partially_verified' }
    ])).toBeCloseTo(66.67);
  });

  it('ignores non-checkable claims and returns zero for an empty denominator', () => {
    expect(calculateEvidenceCoverage([{ importance: 'high', checkable: false, verification_status: 'verified' }])).toBe(0);
  });
});
