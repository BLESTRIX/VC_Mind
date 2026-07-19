import type { Json } from '../../types/database.js';
import { AppError } from '../../lib/errors.js';
import { CitationValidationService } from '../memos/citation-validation.service.js';
import { RECOMMENDATION_POLICY } from '../scoring/scoring.config.js';
import { getServiceClient } from '../supabase.js';

export class PrivateMemoRevisionService{
 async revise(applicationId:string){
  const db=getServiceClient();
  const [{data:previous},{data:application},{data:reconciliations},{data:requests},{data:scores}]=await Promise.all([
   db.from('memos').select('*').eq('application_id',applicationId).eq('is_current',true).single(),
   db.from('applications').select('recommendation').eq('id',applicationId).single(),
   db.from('claim_reconciliations').select('claim_id,result,severity,material,explanation').eq('application_id',applicationId).eq('is_current',true),
   db.from('information_requests').select('id,title,status').eq('application_id',applicationId),
   db.from('scores').select('dimension,score').eq('application_id',applicationId).eq('is_current',true)
  ]);
  if(!previous||!application?.recommendation)throw new AppError('CONFLICT','A current memo and recommendation are required',409);
  const material=(reconciliations??[]).filter(row=>row.material);const resolved=(requests??[]).filter(row=>['submitted','accepted'].includes(row.status));const missing=(requests??[]).filter(row=>!['submitted','accepted','cancelled'].includes(row.status));const flags=Array.isArray(previous.validation_flags)?previous.validation_flags:[];
  const privateSummary={privateDiligence:{resolvedQuestions:resolved.map(row=>({requestId:row.id,title:row.title})),remainingMissingInformation:missing.map(row=>({requestId:row.id,title:row.title})),materialDiscrepancies:material,updatedScores:scores??[],updatedRecommendation:application.recommendation}};
  const {data,error}=await db.from('memos').insert({application_id:applicationId,version:previous.version+1,previous_memo_id:previous.id,investment_hypothesis:previous.investment_hypothesis,thesis_alignment:previous.thesis_alignment,strengths:previous.strengths,weaknesses:previous.weaknesses,opportunities:previous.opportunities,threats:previous.threats,verified_claims:previous.verified_claims,unverified_claims:previous.unverified_claims,contradicted_claims:previous.contradicted_claims,validation_flags:[...flags,privateSummary] as unknown as Json,key_questions:missing.map(row=>({requestId:row.id,question:row.title})) as unknown as Json,strongest_reason_to_pass:material.sort((a,b)=>['low','medium','high','critical'].indexOf(b.severity)-['low','medium','high','critical'].indexOf(a.severity))[0]?.explanation??previous.strongest_reason_to_pass,recommendation:application.recommendation,recommendation_reason:`Recommendation policy: MVP v1 — uncalibrated\n\nUpdated after deterministic private-document reconciliation. ${material.length} material discrepancies remain.`,recommendation_policy_version:RECOMMENDATION_POLICY.version,recommendation_policy_calibrated:RECOMMENDATION_POLICY.calibrated,confidence:previous.confidence}).select('*').single();
  if(error||!data)throw new AppError('INTERNAL_ERROR','Private diligence memo revision could not be stored',500,{database:error?.message});
  await new CitationValidationService().validate(applicationId);return data;
 }
}
