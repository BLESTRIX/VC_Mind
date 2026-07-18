import { describe, expect, it } from 'vitest';
import { SCORE_WEIGHTS, validateWeights } from '../../server/scoring/scoring.config.js';
import { hasCriticalContradiction, overallScore, rubricTotal } from '../../server/scoring/scoring.service.js';
import { recommend } from '../../server/scoring/recommendation.service.js';

const scores = { founder: 8, market: 8, traction: 8, product: 8, thesis_fit: 8, deal_economics: 8, risk_resilience: 8 };
const context = { scores, overall: 8, evidenceCoverage: 100, hasCheckableClaims: true, hardThesisFailure: false, criticalContradiction: false, unresolvedBlockingRisk: false, unacceptableDealEconomics: false, materialDataInconsistency: false, incompleteCriticalDiligence: false, missingPrivateTractionValidation: false, missingDealTerms: false };

describe('deterministic scoring', () => {
  it('keeps scoring weights unchanged', () => { expect(() => validateWeights()).not.toThrow(); expect(Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(1); });
  it('calculates and bounds scores', () => { expect(overallScore(scores)).toBeCloseTo(8); expect(rubricTotal({ a: 3, b: -1, c: 2 })).toBe(4); });
  it('forces needs more info with no checkable claims', () => expect(recommend({ ...context, hasCheckableClaims: false, hardThesisFailure: true }).recommendation).toBe('needs_more_info'));
  it('requires information when coverage is low', () => expect(recommend({ ...context, evidenceCoverage: 20 }).recommendation).toBe('needs_more_info'));
  it('requires information when no usable evidence remains unless a hard failure applies', () => { expect(recommend({ ...context, overall: 4, evidenceCoverage: 0 }).recommendation).toBe('needs_more_info'); expect(recommend({ ...context, evidenceCoverage: 0, hardThesisFailure: true }).recommendation).toBe('pass'); });
  it.each([['high', true], ['critical', true], ['medium', false], ['low', false]])('detects contradicted %s importance correctly', (importance, expected) => expect(hasCriticalContradiction([{ importance, verification_status: 'contradicted' }])).toBe(expected));
  it('does not treat partially verified or unverified high claims as contradictions', () => expect(hasCriticalContradiction([{ importance: 'high', verification_status: 'partially_verified' }, { importance: 'critical', verification_status: 'unverified' }])).toBe(false));
  it('critical contradiction forces pass and prevents invest', () => { const result = recommend({ ...context, criticalContradiction: true }); expect(result.recommendation).toBe('pass'); expect(result.explanation).toContain('high-priority or critical'); });
});
