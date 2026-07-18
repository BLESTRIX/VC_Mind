import type { ClaimImportance, ClaimVerificationStatus } from '../../types/database.js';

export const IMPORTANCE_WEIGHTS = { low: 1, medium: 2, high: 3, critical: 4 } as const;
export const EVIDENCED_STATUSES = new Set<ClaimVerificationStatus>(['verified', 'partially_verified', 'contradicted']);

export type CoverageClaim = { importance: ClaimImportance; checkable: boolean; verification_status: ClaimVerificationStatus };
export type EvidenceCoverageResult = { coveragePercentage: number; hasCheckableClaims: boolean; numeratorWeight: number; denominatorWeight: number };

export function calculateEvidenceCoverage(claims: CoverageClaim[]): EvidenceCoverageResult {
  const checkable = claims.filter((claim) => claim.checkable);
  const denominatorWeight = checkable.reduce((sum, claim) => sum + IMPORTANCE_WEIGHTS[claim.importance], 0);
  if (denominatorWeight === 0) return { coveragePercentage: 0, hasCheckableClaims: false, numeratorWeight: 0, denominatorWeight: 0 };
  const numeratorWeight = checkable.reduce((sum, claim) => sum + (EVIDENCED_STATUSES.has(claim.verification_status) ? IMPORTANCE_WEIGHTS[claim.importance] : 0), 0);
  const coveragePercentage = Math.max(0, Math.min(100, Number(((numeratorWeight / denominatorWeight) * 100).toFixed(2))));
  return { coveragePercentage, hasCheckableClaims: true, numeratorWeight, denominatorWeight };
}
