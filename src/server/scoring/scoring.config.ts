import type { ScoreDimension } from '../../types/database.js';
export const SCORING_VERSION='factor-v1';
export const SCORE_WEIGHTS={founder:.2,market:.15,traction:.2,product:.15,thesis_fit:.1,deal_economics:.15,risk_resilience:.05} as const satisfies Partial<Record<ScoreDimension,number>>;
export const RECOMMENDATION_POLICY={version:'mvp-v1',calibrated:false,investThreshold:7.5,passThreshold:5.5,evidenceCoverageThreshold:60,thesisFitThreshold:7,dealEconomicsThreshold:6.5} as const;
/** @deprecated Use RECOMMENDATION_POLICY. Kept as a compatibility view, never a second source of values. */
export const RECOMMENDATION_THRESHOLDS={investOverall:RECOMMENDATION_POLICY.investThreshold,passOverall:RECOMMENDATION_POLICY.passThreshold,minimumThesisFit:RECOMMENDATION_POLICY.thesisFitThreshold,minimumDealEconomics:RECOMMENDATION_POLICY.dealEconomicsThreshold,minimumEvidenceCoverage:RECOMMENDATION_POLICY.evidenceCoverageThreshold} as const;
export const RECOMMENDATION_WARNING='Experimental MVP Recommendation\n\nThis recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes.';
export function validateWeights():void{const total=Object.values(SCORE_WEIGHTS).reduce((sum,n)=>sum+n,0);if(Math.abs(total-1)>Number.EPSILON*10)throw new Error(`Scoring weights total ${total}, expected 1`);}
