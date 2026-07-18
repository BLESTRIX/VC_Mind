import { RECOMMENDATION_THRESHOLDS as T } from './scoring.config.js';
import type { RecommendationContext } from './scoring.types.js';

export type RecommendationResult = {
  recommendation: 'invest' | 'pass' | 'needs_more_info';
  triggeredRules: string[];
  blockingIssues: string[];
  explanation: string;
};

export function recommend(c: RecommendationContext): RecommendationResult {
  if (c.checkableClaimCount === 0) {
    return {
      recommendation: 'needs_more_info',
      triggeredRules: ['NO_CHECKABLE_CLAIMS'],
      blockingIssues: ['NO_CHECKABLE_CLAIMS'],
      explanation: 'No checkable claims are available, so evidence coverage cannot be established.'
    };
  }

  const pass: string[] = [];
  if (c.hardThesisFailure) pass.push('HARD_THESIS_FAILURE');
  if (c.overall < T.passOverall) pass.push('OVERALL_BELOW_PASS_THRESHOLD');
  if (c.criticalContradiction) pass.push('CRITICAL_CONTRADICTION');
  if (c.unacceptableDealEconomics) pass.push('UNACCEPTABLE_DEAL_ECONOMICS');
  if (c.materialDataInconsistency) pass.push('MATERIAL_DATA_INCONSISTENCY');
  if (pass.length) return { recommendation: 'pass', triggeredRules: pass, blockingIssues: pass, explanation: `Pass rules triggered: ${pass.join(', ')}.` };

  const invest = c.overall >= T.investOverall && c.scores.thesis_fit >= T.minimumThesisFit && c.scores.deal_economics >= T.minimumDealEconomics && c.evidenceCoverage >= T.minimumEvidenceCoverage && !c.criticalContradiction && !c.unresolvedBlockingRisk;
  const needs: string[] = [];
  if (c.evidenceCoverage < T.minimumEvidenceCoverage) needs.push('INSUFFICIENT_EVIDENCE_COVERAGE');
  if (c.incompleteCriticalDiligence) needs.push('INCOMPLETE_CRITICAL_DILIGENCE');
  if (c.missingPrivateTractionValidation) needs.push('MISSING_PRIVATE_TRACTION_VALIDATION');
  if (c.missingDealTerms) needs.push('MISSING_DEAL_TERMS');
  if (c.unresolvedBlockingRisk) needs.push('UNRESOLVED_BLOCKING_RISK');
  if (invest && !needs.length) return { recommendation: 'invest', triggeredRules: ['INVEST_THRESHOLDS_MET'], blockingIssues: [], explanation: 'All deterministic investment thresholds are met.' };
  return { recommendation: 'needs_more_info', triggeredRules: needs.length ? needs : ['INVEST_THRESHOLDS_NOT_MET'], blockingIssues: needs, explanation: `Additional diligence is required: ${(needs.length ? needs : ['investment thresholds not met']).join(', ')}.` };
}
