import type { ScoreDimension } from '../../types/database.js';
export const SCORING_VERSION='v1';
export const SCORE_WEIGHTS={founder:.2,market:.15,traction:.2,product:.15,thesis_fit:.1,deal_economics:.15,risk_resilience:.05} as const satisfies Partial<Record<ScoreDimension,number>>;
export const RECOMMENDATION_THRESHOLDS={investOverall:7.5,passOverall:5.5,minimumThesisFit:7,minimumDealEconomics:6.5,minimumEvidenceCoverage:60} as const;
export function validateWeights():void{const total=Object.values(SCORE_WEIGHTS).reduce((sum,n)=>sum+n,0);if(Math.abs(total-1)>Number.EPSILON*10)throw new Error(`Scoring weights total ${total}, expected 1`);}
