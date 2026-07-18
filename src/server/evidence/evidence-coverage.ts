import type { ClaimImportance, ClaimVerificationStatus } from '../../types/database.js';

export type CoverageClaim = {
  importance: ClaimImportance;
  checkable: boolean;
  verification_status: ClaimVerificationStatus;
};

export const importanceWeight = (importance: ClaimImportance): number => {
  if (importance === 'medium') return 2;
  if (importance === 'low') return 1;
  return 3;
};

export function calculateEvidenceCoverage(claims: CoverageClaim[]): number {
  const checkable = claims.filter((claim) => claim.checkable);
  const denominator = checkable.reduce((sum, claim) => sum + importanceWeight(claim.importance), 0);
  if (denominator === 0) return 0;
  const numerator = checkable
    .filter((claim) => claim.verification_status !== 'unverified')
    .reduce((sum, claim) => sum + importanceWeight(claim.importance), 0);
  return Math.round((numerator / denominator) * 10_000) / 100;
}
