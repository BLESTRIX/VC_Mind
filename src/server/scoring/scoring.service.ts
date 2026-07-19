import { AppError } from '../../lib/errors.js';
import type { Json } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { SCORE_WEIGHTS, SCORING_VERSION, RECOMMENDATION_POLICY, validateWeights } from './scoring.config.js';
import type { DimensionScores } from './scoring.types.js';
import { recommend } from './recommendation.service.js';
import { calculateEvidenceCoverage } from '../evidence/evidence-coverage.js';
import { applyMissingDataPenalty,completeAssessments, dimensionScore, factorPoints, FACTOR_RUBRIC, type FactorAssessment, type FactorAssessmentLevel, type FactorDimension } from './factor-scoring.js';

const bounded=(value:number)=>Math.max(0,Math.min(10,value));
export function rubricTotal(scores:Record<string,number>):number{return bounded(Object.values(scores).reduce((sum,value)=>sum+Math.max(0,Math.min(2,value)),0));}
export function overallScore(scores:DimensionScores):number{validateWeights();return (Object.entries(SCORE_WEIGHTS) as Array<[keyof DimensionScores,number]>).reduce((sum,[key,weight])=>sum+scores[key]*weight,0);}
export function hasCriticalContradiction(claims:Array<{importance:string;verification_status:string}>):boolean{return claims.some(claim=>claim.verification_status==='contradicted'&&(claim.importance==='high'||claim.importance==='critical'));}

const assessment=(factorKey:string,level:FactorAssessmentLevel,explanation:string,missingData=false):FactorAssessment=>({factorKey,level,explanation,supportingClaimIds:[],supportingEvidenceIds:[],missingData});
const levelFor=(value:number):FactorAssessmentLevel=>value>=1?'exceptional':value>=.75?'strong':value>=.5?'moderate':value>.1?'weak':'none';

export class ScoringService{
 async calculate(applicationId:string){
  const db=getServiceClient();
  const [{data:jobs},{data:claims},{data:evidence},{data:deal},{data:thesisFactors}]=await Promise.all([
   db.from('processing_jobs').select('job_type,result').eq('application_id',applicationId).eq('status','completed'),
   db.from('claims').select('id,importance,verification_status,category,checkable').eq('application_id',applicationId),
   db.from('evidence').select('id,claim_id,validation_status,claims!inner(application_id)').eq('claims.application_id',applicationId),
   db.from('deal_economics').select('*').eq('application_id',applicationId).maybeSingle(),
   db.from('score_factors').select('*').eq('application_id',applicationId).eq('dimension','thesis_fit').eq('is_current',true)
  ]);
  const claimRows=claims??[];const validClaimIds=new Set(claimRows.map(row=>row.id));const evidenceById=new Map((evidence??[]).filter(row=>row.validation_status==='valid').map(row=>[row.id,row.claim_id]));
  const sanitize=(item:FactorAssessment):FactorAssessment=>{const supportingClaimIds=item.supportingClaimIds.filter(id=>validClaimIds.has(id));const supportingEvidenceIds=item.supportingEvidenceIds.filter(id=>{const claimId=evidenceById.get(id);return claimId!==undefined&&supportingClaimIds.includes(claimId);});const rejected=supportingClaimIds.length!==item.supportingClaimIds.length||supportingEvidenceIds.length!==item.supportingEvidenceIds.length;return{...item,supportingClaimIds,supportingEvidenceIds,missingData:item.missingData||rejected,explanation:rejected?`${item.explanation} Invalid or cross-application evidence references were excluded.`:item.explanation};};
  const resultFor=(dimension:string)=>jobs?.find(job=>job.job_type===`run_${dimension}_diligence`)?.result as {assessments?:FactorAssessment[]}|null;
  const inputs=new Map<FactorDimension,FactorAssessment[]>();
  for(const dimension of ['founder','market','traction','product'] as const)inputs.set(dimension,completeAssessments(dimension,(resultFor(dimension)?.assessments??[]).map(sanitize)));
  inputs.set('thesis_fit',completeAssessments('thesis_fit',(thesisFactors??[]).map(row=>({factorKey:row.factor_key,level:row.assessment_level as FactorAssessmentLevel,explanation:row.explanation,supportingClaimIds:row.supporting_claim_ids,supportingEvidenceIds:row.supporting_evidence_ids,missingData:row.missing_data}))));
  const dealInputs=(deal?.calculation_inputs??{}) as Record<string,unknown>;const dealScore=Number(dealInputs.score??0);
  inputs.set('deal_economics',completeAssessments('deal_economics',[
   assessment('valuation',levelFor(dealScore/10),'Valuation factor derived from deterministic deal inputs.',deal?.post_money_valuation_usd==null),
   assessment('ownership',levelFor(Number(deal?.implied_ownership_percentage??0)/7),'Ownership factor derived from the calculated ownership percentage.',deal?.implied_ownership_percentage==null),
   assessment('return_potential',levelFor(Number(deal?.expected_return_multiple??0)/10),'Return potential derived from the calculated return multiple.',deal?.expected_return_multiple==null),
   assessment('dilution',deal?.expected_future_dilution_percentage==null?'none':levelFor((100-Number(deal.expected_future_dilution_percentage))/100),'Dilution factor derived from supplied dilution assumptions.',deal?.expected_future_dilution_percentage==null),
   assessment('return_hurdle',deal?.minimum_required_return_multiple==null?'none':levelFor(Number(deal?.expected_return_multiple??0)/Number(deal.minimum_required_return_multiple)),'Return-hurdle factor compares deterministic expected and required multiples.',deal?.minimum_required_return_multiple==null)
  ]));
  const contradictions=claimRows.filter(row=>row.verification_status==='contradicted').length;const criticalOpen=claimRows.filter(row=>row.importance==='critical'&&row.verification_status==='unverified').length;const coverage=calculateEvidenceCoverage(claimRows);
  inputs.set('risk_resilience',completeAssessments('risk_resilience',[
   assessment('critical_claims',levelFor(1-Math.min(1,criticalOpen/2)),'Reduced for unresolved critical claims.',claimRows.length===0),
   assessment('contradictions',levelFor(1-Math.min(1,contradictions/3)),'Reduced for contradicted claims.',claimRows.length===0),
   assessment('evidence_coverage',levelFor(coverage.coveragePercentage/100),'Derived from validated claim evidence coverage.',!coverage.hasCheckableClaims),
   assessment('private_validation',claimRows.some(row=>row.category==='traction'&&row.verification_status==='verified')?'strong':'none','Requires verified traction evidence.',!claimRows.some(row=>row.category==='traction')),
   assessment('data_consistency',contradictions===0?'exceptional':contradictions===1?'moderate':'none','Derived from the number of material contradictions.',claimRows.length===0)
  ]));

  const dimensionScores={} as DimensionScores;const factorRowsByDimension=new Map<FactorDimension,Array<Record<string,unknown>>>();
  for(const dimension of Object.keys(FACTOR_RUBRIC) as FactorDimension[]){const items=completeAssessments(dimension,inputs.get(dimension)??[]);const rows=FACTOR_RUBRIC[dimension].map(definition=>{const item=applyMissingDataPenalty(sanitize(items.find(entry=>entry.factorKey===definition.key)!));return{application_id:applicationId,dimension,factor_key:definition.key,factor_label:definition.label,assessment_level:item.level,score:factorPoints(definition.maximumScore,item),maximum_score:definition.maximumScore,explanation:item.explanation,supporting_claim_ids:item.supportingClaimIds,supporting_evidence_ids:item.supportingEvidenceIds,missing_data:item.missingData,rubric_version:SCORING_VERSION};});dimensionScores[dimension]=dimensionScore(rows.map(row=>({score:Number(row.score),maximumScore:Number(row.maximum_score)})));factorRowsByDimension.set(dimension,rows);}
  const overall=overallScore(dimensionScores);const recommendation=recommend({scores:dimensionScores,overall,evidenceCoverage:coverage.coveragePercentage,hasCheckableClaims:coverage.hasCheckableClaims,hardThesisFailure:dimensionScores.thesis_fit<5,criticalContradiction:hasCriticalContradiction(claimRows),unresolvedBlockingRisk:claimRows.some(row=>row.importance==='critical'&&['unverified','partially_verified'].includes(row.verification_status)),unacceptableDealEconomics:dimensionScores.deal_economics<3,materialDataInconsistency:contradictions>=2,incompleteCriticalDiligence:criticalOpen>0,missingPrivateTractionValidation:!claimRows.some(row=>row.category==='traction'&&row.verification_status==='verified'),missingDealTerms:!claimRows.some(row=>row.category==='deal_terms'&&row.verification_status==='verified')});
  for(const dimension of Object.keys(FACTOR_RUBRIC) as FactorDimension[]){const score=dimensionScores[dimension];const {data:scoreRow,error}=await db.from('scores').insert({application_id:applicationId,dimension,score,weight:SCORE_WEIGHTS[dimension],weighted_score:score*SCORE_WEIGHTS[dimension],explanation:`Derived from stored factor points using rubric ${SCORING_VERSION}.`,evidence_count:evidenceById.size,scoring_version:SCORING_VERSION}).select('id').single();if(error||!scoreRow)throw new AppError('INTERNAL_ERROR','Dimension score could not be stored',500,{database:error?.message});const factorRows=(factorRowsByDimension.get(dimension)??[]).map(row=>({...row,score_id:scoreRow.id}));const {error:factorError}=await db.from('score_factors').insert(factorRows as never);if(factorError)throw new AppError('INTERNAL_ERROR','Score factors could not be stored',500,{database:factorError.message});}
  await db.from('scores').insert({application_id:applicationId,dimension:'overall',score:overall,weight:1,weighted_score:overall,explanation:recommendation.explanation,evidence_count:evidenceById.size,scoring_version:SCORING_VERSION});
  await db.from('applications').update({investment_score:overall,evidence_coverage:coverage.coveragePercentage,recommendation:recommendation.recommendation,recommendation_policy_version:RECOMMENDATION_POLICY.version,recommendation_policy_calibrated:RECOMMENDATION_POLICY.calibrated}).eq('id',applicationId);
  return{scores:dimensionScores,overall,evidenceCoverage:coverage.coveragePercentage,recommendation};
 }
}
