import { describe, expect, it } from 'vitest';
import { SCORE_WEIGHTS, validateWeights } from '../../server/scoring/scoring.config.js';
import { hasCriticalContradiction, overallScore, rubricTotal } from '../../server/scoring/scoring.service.js';
import { recommend } from '../../server/scoring/recommendation.service.js';

const scores = { founder: 8, market: 8, traction: 8, product: 8, thesis_fit: 8, deal_economics: 8, risk_resilience: 8 };
const context = { scores, overall: 8, evidenceCoverage: 100, checkableClaimCount: 1, hardThesisFailure: false, criticalContradiction: false, unresolvedBlockingRisk: false, unacceptableDealEconomics: false, materialDataInconsistency: false, incompleteCriticalDiligence: false, missingPrivateTractionValidation: false, missingDealTerms: false };

describe('deterministic scoring', () => {
  it('weights total exactly one', () => { expect(() => validateWeights()).not.toThrow(); expect(Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(1); });
  it('calculates the weighted overall score', () => expect(overallScore(scores)).toBeCloseTo(8));
  it('bounds rubric scores', () => expect(rubricTotal({ a: 3, b: -1, c: 2 })).toBe(4));
  it('passes a hard thesis failure', () => expect(recommend({ ...context, overall: 9, hardThesisFailure: true }).recommendation).toBe('pass'));
  it('requires information when coverage is low', () => expect(recommend({ ...context, evidenceCoverage: 20 }).recommendation).toBe('needs_more_info'));
  it('forces needs more info when there are no checkable claims', () => expect(recommend({ ...context, checkableClaimCount: 0, hardThesisFailure: true }).triggeredRules).toEqual(['NO_CHECKABLE_CLAIMS']));
  it('defines a critical contradiction as a contradicted high-importance claim', () => {
    expect(hasCriticalContradiction([{ importance: 'high', verification_status: 'contradicted' }])).toBe(true);
    expect(hasCriticalContradiction([{ importance: 'critical', verification_status: 'contradicted' }])).toBe(false);
  });
});
