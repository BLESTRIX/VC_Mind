import { AppError } from '../../lib/errors.js';
import type { Json } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { APPLICATION_SLA_STAGE,configuredStageBudgets,HUMAN_REVIEW_RESERVATION_SECONDS,JOB_SLA_STAGE,TOTAL_SLA_SECONDS,type SLAStageName } from './sla.config.js';

export type SLAStatus='on_track'|'at_risk'|'breached'|'completed';
export type StageSLAStatus={stage:string;budget_seconds:number;elapsed_seconds:number;remaining_seconds:number;budget_used_percentage:number;sla_status:SLAStatus;started_at:string|null;completed_at:string|null;attempt_number:number;fallback_actions:string[]};
export type ApplicationSLAStatus={deadline:string;totalElapsedSeconds:number;totalRemainingSeconds:number;status:SLAStatus;currentStage:string;currentStageBudgetSeconds:number;currentStageElapsedSeconds:number;currentStageBudgetUsedPercentage:number;blockingReasons:string[];fallbackActions:string[];stages:StageSLAStatus[]};

export function stageSlaStatus(elapsedSeconds:number,budgetSeconds:number,completed=false):SLAStatus{
 if(completed)return'completed';
 if(elapsedSeconds>budgetSeconds)return'breached';
 if(elapsedSeconds>=budgetSeconds*.75)return'at_risk';
 return'on_track';
}
const secondsBetween=(start:string|Date,end:string|Date)=>Math.max(0,Math.floor((new Date(end).getTime()-new Date(start).getTime())/1000));
const actionsFrom=(value:Json|null|undefined):string[]=>Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[];

export function calculateApplicationSla(input:{submittedAt:string;deadline?:string;currentStage:string;jobs:Array<{job_type:string;status:string;started_at:string|null;completed_at:string|null;attempt_number:number;retry_count:number}>;openBlockingRequests:number;humanReviewStarted:boolean;stageEvents?:Array<{stage?:string;fallback_actions?:Json|null}>;now?:Date}):ApplicationSLAStatus{
 const now=input.now??new Date();
 const deadline=input.deadline??new Date(new Date(input.submittedAt).getTime()+TOTAL_SLA_SECONDS*1000).toISOString();
 const budgets=configuredStageBudgets();
 const grouped=new Map<SLAStageName,typeof input.jobs>();
 for(const job of input.jobs){const stage=JOB_SLA_STAGE[job.job_type];if(stage)grouped.set(stage,[...(grouped.get(stage)??[]),job]);}
 const stages=(Object.keys(budgets) as SLAStageName[]).map(stage=>{
  const jobs=grouped.get(stage)??[];
  const started=jobs.map(job=>job.started_at).filter((value):value is string=>Boolean(value)).sort()[0]??null;
  const unfinished=jobs.some(job=>job.status==='pending'||job.status==='running');
  const completed=jobs.length>0&&!unfinished&&jobs.every(job=>job.status==='completed'||job.status==='cancelled');
  const completedAt=completed?jobs.map(job=>job.completed_at).filter((value):value is string=>Boolean(value)).sort().at(-1)??null:null;
  // Parallel jobs share one stage budget, so measure wall time from the first
  // start rather than summing concurrent job durations.
  const elapsed=started?secondsBetween(started,completedAt??now):0;
  const budget=budgets[stage];
  const fallbackActions=[...new Set((input.stageEvents??[]).filter(event=>event.stage&&APPLICATION_SLA_STAGE[event.stage]===stage).flatMap(event=>actionsFrom(event.fallback_actions)))];
  return{stage,budget_seconds:budget,elapsed_seconds:elapsed,remaining_seconds:Math.max(0,budget-elapsed),budget_used_percentage:budget?Math.round(elapsed/budget*10000)/100:0,sla_status:stageSlaStatus(elapsed,budget,completed),started_at:started,completed_at:completedAt,attempt_number:Math.max(1,...jobs.map(job=>job.attempt_number)),fallback_actions:fallbackActions};
 });
 const applicationStage=APPLICATION_SLA_STAGE[input.currentStage];
 const current=stages.find(stage=>stage.sla_status==='breached')??stages.find(stage=>stage.started_at&&!stage.completed_at)??stages.find(stage=>stage.stage===applicationStage)??stages.find(stage=>!stage.completed_at)??stages.at(-1)!;
 const totalElapsedSeconds=secondsBetween(input.submittedAt,now);
 const totalRemainingSeconds=Math.max(0,secondsBetween(now,deadline));
 const blockingReasons:string[]=[];
 if(totalRemainingSeconds<HUMAN_REVIEW_RESERVATION_SECONDS)blockingReasons.push('Fewer than four hours remain before the decision deadline.');
 if(input.openBlockingRequests>0)blockingReasons.push(`${input.openBlockingRequests} blocking information request(s) remain open.`);
 if(stages.some(stage=>stage.sla_status==='at_risk'||stage.sla_status==='breached'))blockingReasons.push('A critical stage has consumed at least 75% of its budget.');
 if(!input.humanReviewStarted&&totalRemainingSeconds<=HUMAN_REVIEW_RESERVATION_SECONDS)blockingReasons.push('Required human review has not started.');
 if(input.jobs.some(job=>job.retry_count>0&&(job.status==='pending'||job.status==='running')))blockingReasons.push('Retry activity threatens the application deadline.');
 const fallbackActions=[...new Set((input.stageEvents??[]).flatMap(event=>actionsFrom(event.fallback_actions)))];
 let status:SLAStatus=input.currentStage==='approved'||input.currentStage==='passed'?'completed':totalRemainingSeconds===0?'breached':blockingReasons.length?'at_risk':'on_track';
 if(stages.some(stage=>stage.sla_status==='breached'))status='breached';
 return{deadline,totalElapsedSeconds,totalRemainingSeconds,status,currentStage:current.stage,currentStageBudgetSeconds:current.budget_seconds,currentStageElapsedSeconds:current.elapsed_seconds,currentStageBudgetUsedPercentage:current.budget_used_percentage,blockingReasons,fallbackActions,stages};
}

export class SLAService{
 async get(applicationId:string):Promise<ApplicationSLAStatus>{
  const db=getServiceClient();
  const [{data:application},{data:jobs},{count:openBlockingRequests},{count:decisionCount},{data:events}]=await Promise.all([
   db.from('applications').select('submitted_at,decision_deadline,current_stage').eq('id',applicationId).single(),
   db.from('processing_jobs').select('job_type,status,started_at,completed_at,attempt_number,retry_count').eq('application_id',applicationId),
   db.from('information_requests').select('id',{count:'exact',head:true}).eq('application_id',applicationId).in('status',['requested','submitted','under_review']),
   db.from('decisions').select('id',{count:'exact',head:true}).eq('application_id',applicationId),
   db.from('application_stage_events').select('stage,fallback_actions').eq('application_id',applicationId)
  ]);
  if(!application)throw new AppError('NOT_FOUND','Application not found',404);
  return calculateApplicationSla({submittedAt:application.submitted_at,deadline:application.decision_deadline,currentStage:application.current_stage,jobs:jobs??[],openBlockingRequests:openBlockingRequests??0,humanReviewStarted:(decisionCount??0)>0,stageEvents:events??[]});
 }
}
export async function recordSlaFallbackAction(applicationId:string,action:string):Promise<void>{const db=getServiceClient();const{data:event}=await db.from('application_stage_events').select('id,fallback_actions').eq('application_id',applicationId).eq('status','running').order('created_at',{ascending:false}).limit(1).maybeSingle();if(!event)return;await db.from('application_stage_events').update({fallback_actions:[...new Set([...actionsFrom(event.fallback_actions),action])]}).eq('id',event.id);}
