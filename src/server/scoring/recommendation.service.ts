import { RECOMMENDATION_POLICY as P } from './scoring.config.js';
import type { RecommendationContext } from './scoring.types.js';

export type RecommendationResult = {
  recommendation: 'invest' | 'pass' | 'needs_more_info';
  triggeredRules: string[];
  blockingIssues: string[];
  explanation: string;
};

export function recommend(c: RecommendationContext): RecommendationResult {
  if (!c.hasCheckableClaims) {
    return {
      recommendation: 'needs_more_info',
      triggeredRules: ['NO_CHECKABLE_CLAIMS'],
      blockingIssues: ['NO_CHECKABLE_CLAIMS'],
      explanation: 'No checkable claims were available for evidence-based evaluation.'
    };
  }

  const pass: string[] = [];
  if (c.hardThesisFailure) pass.push('HARD_THESIS_FAILURE');
  if (c.criticalContradiction) pass.push('CRITICAL_CONTRADICTION');
  if (pass.length) return { recommendation: 'pass', triggeredRules: pass, blockingIssues: pass, explanation: c.criticalContradiction ? 'A high-priority or critical claim was contradicted by validated evidence.' : `Pass rules triggered: ${pass.join(', ')}.` };
  if (c.evidenceCoverage === 0) return { recommendation: 'needs_more_info', triggeredRules: ['NO_USABLE_EVIDENCE'], blockingIssues: ['NO_USABLE_EVIDENCE'], explanation: 'No usable validated evidence remains for evidence-based evaluation.' };
  if (c.overall < P.passThreshold) pass.push('OVERALL_BELOW_PASS_THRESHOLD');
  if (c.unacceptableDealEconomics) pass.push('UNACCEPTABLE_DEAL_ECONOMICS');
  if (c.materialDataInconsistency) pass.push('MATERIAL_DATA_INCONSISTENCY');
  if (pass.length) return { recommendation: 'pass', triggeredRules: pass, blockingIssues: pass, explanation: `Pass rules triggered: ${pass.join(', ')}.` };

  const invest = c.overall >= P.investThreshold && c.scores.thesis_fit >= P.thesisFitThreshold && c.scores.deal_economics >= P.dealEconomicsThreshold && c.evidenceCoverage >= P.evidenceCoverageThreshold && !c.criticalContradiction && !c.unresolvedBlockingRisk;
  const needs: string[] = [];
  if (c.evidenceCoverage < P.evidenceCoverageThreshold) needs.push('INSUFFICIENT_EVIDENCE_COVERAGE');
  if (c.incompleteCriticalDiligence) needs.push('INCOMPLETE_CRITICAL_DILIGENCE');
  if (c.missingPrivateTractionValidation) needs.push('MISSING_PRIVATE_TRACTION_VALIDATION');
  if (c.missingDealTerms) needs.push('MISSING_DEAL_TERMS');
  if (c.unresolvedBlockingRisk) needs.push('UNRESOLVED_BLOCKING_RISK');
  if (invest && !needs.length) return { recommendation: 'invest', triggeredRules: ['INVEST_THRESHOLDS_MET'], blockingIssues: [], explanation: 'All deterministic investment thresholds are met.' };
  return { recommendation: 'needs_more_info', triggeredRules: needs.length ? needs : ['INVEST_THRESHOLDS_NOT_MET'], blockingIssues: needs, explanation: `Additional diligence is required: ${(needs.length ? needs : ['investment thresholds not met']).join(', ')}.` };
}
