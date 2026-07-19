import type { ScoreDimension } from '../../types/database.js';

export type FactorAssessmentLevel='none'|'weak'|'moderate'|'strong'|'exceptional';
export type FactorAssessment={factorKey:string;level:FactorAssessmentLevel;explanation:string;supportingClaimIds:string[];supportingEvidenceIds:string[];missingData:boolean};
export type FactorDefinition={key:string;label:string;maximumScore:number};
export const FACTOR_LEVEL_RATIO={none:0,weak:.25,moderate:.5,strong:.75,exceptional:1} as const;
const orderedLevels:FactorAssessmentLevel[]=['none','weak','moderate','strong','exceptional'];

const label=(key:string)=>key.split('_').map(word=>word[0]?.toUpperCase()+word.slice(1)).join(' ');
const keys={
 founder:['relevant_domain_experience','building_and_shipping','technical_operational_credibility','prior_execution_record','team_completeness'],
 market:['market_size_support','growth_and_timing','pain_severity','competitive_whitespace','adoption_regulatory_feasibility'],
 traction:['evidence_quality','growth','customer_quality','retention_engagement','repeatability'],
 product:['product_existence','technical_feasibility','differentiation','execution_velocity','defensibility'],
 thesis_fit:['sector_fit','stage_fit','geography_fit','check_size_fit','qualitative_alignment'],
 deal_economics:['valuation','ownership','return_potential','dilution','return_hurdle'],
 risk_resilience:['critical_claims','contradictions','evidence_coverage','private_validation','data_consistency']
} as const;
export type FactorDimension=Exclude<ScoreDimension,'overall'>;
export const FACTOR_RUBRIC=Object.fromEntries(Object.entries(keys).map(([dimension,factors])=>[dimension,factors.map(key=>({key,label:label(key),maximumScore:2}))])) as Record<FactorDimension,FactorDefinition[]>;

export function factorPoints(maximumScore:number,assessment:Pick<FactorAssessment,'level'|'missingData'>):number{
 const ratio=FACTOR_LEVEL_RATIO[assessment.level];
 return Math.max(0,Math.min(maximumScore,maximumScore*ratio));
}
export function applyMissingDataPenalty(assessment:FactorAssessment):FactorAssessment{if(!assessment.missingData||assessment.level==='none')return assessment;const level=orderedLevels[Math.max(0,orderedLevels.indexOf(assessment.level)-1)]!;return{...assessment,level,explanation:`${assessment.explanation} Missing data applies a one-level assessment reduction.`};}
export function dimensionScore(factors:Array<{score:number;maximumScore:number}>):number{
 const maximum=factors.reduce((sum,f)=>sum+f.maximumScore,0);if(!maximum)return 0;
 return Math.max(0,Math.min(10,factors.reduce((sum,f)=>sum+f.score,0)/maximum*10));
}
export function completeAssessments(dimension:FactorDimension,assessments:FactorAssessment[]):FactorAssessment[]{
 const byKey=new Map(assessments.map(item=>[item.factorKey,item]));
 return FACTOR_RUBRIC[dimension].map(factor=>byKey.get(factor.key)??{factorKey:factor.key,level:'none',explanation:'No assessment was returned; missing data receives zero points.',supportingClaimIds:[],supportingEvidenceIds:[],missingData:true});
}
