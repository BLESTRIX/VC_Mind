import { describe, expect, it } from 'vitest';
import { calculateEvidenceCoverage, IMPORTANCE_WEIGHTS } from '../../server/evidence/evidence-coverage.js';

describe('evidence coverage', () => {
  it('uses 3/2/1 weights and counts verified, partial, and contradicted statuses', () => {
    const result = calculateEvidenceCoverage([
      { importance: 'high', checkable: true, verification_status: 'verified' },
      { importance: 'medium', checkable: true, verification_status: 'partially_verified' },
      { importance: 'low', checkable: true, verification_status: 'contradicted' }
    ]);
    expect(result).toEqual({ coveragePercentage: 100, hasCheckableClaims: true, numeratorWeight: 6, denominatorWeight: 6 });
  });
  it('produces 66.67 percent for high verified, medium unverified, and low contradicted', () => expect(calculateEvidenceCoverage([
    { importance: 'high', checkable: true, verification_status: 'verified' },
    { importance: 'medium', checkable: true, verification_status: 'unverified' },
    { importance: 'low', checkable: true, verification_status: 'contradicted' }
  ]).coveragePercentage).toBe(66.67));
  it('uses weight 4 for critical claims', () => expect(IMPORTANCE_WEIGHTS.critical).toBe(4));
  it('does not count not_checkable or unverified statuses', () => expect(calculateEvidenceCoverage([
    { importance: 'critical', checkable: true, verification_status: 'not_checkable' },
    { importance: 'high', checkable: true, verification_status: 'unverified' }
  ]).numeratorWeight).toBe(0));
  it('excludes non-checkable claims', () => expect(calculateEvidenceCoverage([{ importance: 'critical', checkable: false, verification_status: 'verified' }])).toEqual({ coveragePercentage: 0, hasCheckableClaims: false, numeratorWeight: 0, denominatorWeight: 0 }));
  it('never exceeds 100', () => expect(calculateEvidenceCoverage([{ importance: 'critical', checkable: true, verification_status: 'verified' }]).coveragePercentage).toBeLessThanOrEqual(100));
});
