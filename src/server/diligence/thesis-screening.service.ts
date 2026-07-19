import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { ModelRunRecorder } from '../../ai/model-run-recorder.js';
import { createResilientAIProvider } from '../../ai/resilient-provider.js';
import { thesisScreeningSchema } from '../../ai/schemas.js';
import { prompts } from '../../ai/prompt-registry.js';
import { getServiceClient } from '../supabase.js';
import { transitionApplicationStage } from '../jobs/stage-runner.js';
import { applyMissingDataPenalty,completeAssessments, dimensionScore, factorPoints, FACTOR_RUBRIC, type FactorAssessment, type FactorAssessmentLevel } from '../scoring/factor-scoring.js';
import { SCORE_WEIGHTS, SCORING_VERSION } from '../scoring/scoring.config.js';
type Failure = { rule: string; reason: string };

export class ThesisScreeningService {
  constructor(private readonly ai = new ModelRunRecorder(createResilientAIProvider())) {}
  async screen(applicationId: string) {
    const db = getServiceClient();
    const { data } = await db.from('applications').select('*,companies(*),thesis_configs(*)').eq('id', applicationId).single();
    if (!data) throw new AppError('NOT_FOUND', 'Application not found', 404);
    const application = data;
    const company = (data as unknown as { companies: Record<string, unknown> }).companies;
    const thesis = (data as unknown as { thesis_configs: Record<string, unknown> }).thesis_configs;
    const failures: Failure[] = [];
    const allow = (field: string, listKey: string) => { const value = String(company[field] ?? '').toLowerCase(); const list = ((thesis[listKey] as string[] | undefined) ?? []).map((item) => item.toLowerCase()); if (list.length && (!value || !list.includes(value))) failures.push({ rule: `${field}_allowlist`, reason: `${String(company[field] ?? 'Missing value')} is outside configured ${listKey}.` }); };
    allow('sector', 'sectors'); allow('stage', 'stages'); allow('geography', 'geographies');
    if (application.funding_ask_usd === null) failures.push({ rule: 'missing_funding_ask', reason: 'Funding ask is required for thesis screening.' });
    if (application.funding_ask_usd !== null && thesis.minimum_check_size_usd !== null && application.funding_ask_usd < Number(thesis.minimum_check_size_usd)) failures.push({ rule: 'minimum_check_size', reason: 'Funding ask is below the configured minimum.' });
    if (application.funding_ask_usd !== null && thesis.maximum_check_size_usd !== null && application.funding_ask_usd > Number(thesis.maximum_check_size_usd)) failures.push({ rule: 'maximum_check_size', reason: 'Funding ask exceeds the configured maximum.' });
    const semantic = await this.ai.generate({ applicationId, runType: 'thesis_screening', model: getEnv().AI_MODEL_FAST, prompt: prompts.thesisScreening, userPrompt: JSON.stringify({ rubric: FACTOR_RUBRIC.thesis_fit, company, thesis, hardFailures: failures }), schema: thesisScreeningSchema, schemaName: 'thesis_screening', maxCompletionTokens: 800 });
    const failed=(fragment:string)=>failures.some(item=>item.rule.includes(fragment));
    const fixed=(factorKey:string,ok:boolean):FactorAssessment=>({factorKey,level:ok?'exceptional':'none',explanation:ok?`${factorKey} satisfies the configured thesis rule.`:`${factorKey} fails or lacks required configuration.`,supportingClaimIds:[],supportingEvidenceIds:[],missingData:false});
    const checkOk=!failed('check_size')&&!failed('funding_ask');
    const qualitative=semantic.assessments.find(item=>item.factorKey==='qualitative_alignment')??{factorKey:'qualitative_alignment',level:'none' as FactorAssessmentLevel,explanation:'No qualitative alignment assessment was returned.',supportingClaimIds:[],supportingEvidenceIds:[],missingData:true};
    const assessments=completeAssessments('thesis_fit',[fixed('sector_fit',!failed('sector')),fixed('stage_fit',!failed('stage')),fixed('geography_fit',!failed('geography')),fixed('check_size_fit',checkOk),{...qualitative,supportingClaimIds:[],supportingEvidenceIds:[]}]);
    const points=FACTOR_RUBRIC.thesis_fit.map(definition=>{const assessment=applyMissingDataPenalty(assessments.find(item=>item.factorKey===definition.key)!);return{definition,assessment,score:factorPoints(definition.maximumScore,assessment)};});
    const score=dimensionScore(points.map(item=>({score:item.score,maximumScore:item.definition.maximumScore})));
    const {data:scoreRow,error:scoreError}=await db.from('scores').insert({ application_id: applicationId, dimension: 'thesis_fit', score, weight: SCORE_WEIGHTS.thesis_fit, weighted_score: score * SCORE_WEIGHTS.thesis_fit, explanation: `Derived from stored thesis-fit factors (${SCORING_VERSION}).`, evidence_count: 0, scoring_version: SCORING_VERSION }).select('id').single();
    if(scoreError||!scoreRow)throw new AppError('INTERNAL_ERROR','Thesis factors could not be linked to a score',500,{database:scoreError?.message});
    await db.from('score_factors').insert(points.map(item=>({application_id:applicationId,score_id:scoreRow.id,dimension:'thesis_fit' as const,factor_key:item.definition.key,factor_label:item.definition.label,assessment_level:item.assessment.level,score:item.score,maximum_score:item.definition.maximumScore,explanation:item.assessment.explanation,supporting_claim_ids:[],supporting_evidence_ids:[],missing_data:item.assessment.missingData,rubric_version:SCORING_VERSION})));
    await transitionApplicationStage(applicationId, 'screened', 'completed', null, { hardFailures: failures });
    return { eligible: failures.length === 0, hardFailures: failures, thesisFitScore: score, assessments };
  }
}
