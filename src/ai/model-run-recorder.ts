import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { sha256 } from '../lib/hashing.js';
import { SLAService,recordSlaFallbackAction } from '../server/sla/sla.service.js';
import { getServiceClient } from '../server/supabase.js';
import type { Json } from '../types/database.js';
import type { AIAttempt,AIProvider } from './provider.js';
import type { PromptDefinition } from './prompt-registry.js';

type RunInput<T>={applicationId?:string;claimId?:string;runType:string;model:string;prompt:PromptDefinition;userPrompt:string;schema:z.ZodType<T>;schemaName:string;maxCompletionTokens:number;metadata?:Record<string,unknown>};
export class ModelRunRecorder{
 constructor(private readonly provider:AIProvider){}
 async generate<T>(input:RunInput<T>):Promise<T>{
  const inputHash=sha256(`${input.prompt.systemPrompt}\n${input.userPrompt}`);const started=Date.now();const metadata={...(input.metadata??{})};
  if(input.applicationId){try{const sla=await new SLAService().get(input.applicationId);metadata.remainingStageTimeMs=Math.min(sla.totalRemainingSeconds,Math.max(0,sla.currentStageBudgetSeconds-sla.currentStageElapsedSeconds))*1000;}catch{/* AI audit still works if SLA telemetry is temporarily unavailable. */}}
  const recordedInput={...input,metadata};
  try{
   const result=await this.provider.generateStructured({model:input.model,systemPrompt:input.prompt.systemPrompt,userPrompt:input.userPrompt,schema:input.schema,schemaName:input.schemaName,temperature:.1,maxCompletionTokens:input.maxCompletionTokens,metadata});
   const attempts=result.attempts??[{provider:result.provider,model:result.model,status:'completed',latencyMs:result.latencyMs,isFallback:Boolean(result.isFallback),fallbackReason:result.fallbackReason,inputTokens:result.inputTokens,outputTokens:result.outputTokens,estimatedCostUsd:result.estimatedCostUsd,validationResult:{valid:true}} satisfies AIAttempt];
   await this.persistAttempts(attempts,recordedInput,inputHash,sha256(JSON.stringify(result.data)));
   if(result.isFallback&&input.applicationId)await recordSlaFallbackAction(input.applicationId,`Gemini fallback used: ${result.fallbackReason??'eligible primary-provider failure'}.`);
   return result.data;
  }catch(error){
   const attempts=(error&&typeof error==='object'&&'details'in error?(error as {details?:{attempts?:AIAttempt[]}}).details?.attempts:undefined)??[{provider:'groq',model:input.model,status:'failed',latencyMs:Date.now()-started,isFallback:false,errorMessage:error instanceof Error?error.message:'Unknown AI error'} satisfies AIAttempt];
   await this.persistAttempts(attempts,recordedInput,inputHash,null);throw error;
  }
 }
 private async persistAttempts<T>(attempts:AIAttempt[],input:Pick<RunInput<T>,'applicationId'|'claimId'|'runType'|'prompt'|'schemaName'|'metadata'>,inputHash:string,outputHash:string|null){const db=getServiceClient();let primaryRunId:string|null=null;for(const item of attempts){const id=randomUUID();if(!item.isFallback)primaryRunId=id;await db.from('model_runs').insert({id,application_id:input.applicationId??null,claim_id:input.claimId??null,run_type:input.runType,provider:item.provider,model_name:item.model,prompt_version:`${input.prompt.name}:${input.prompt.version}`,schema_version:input.schemaName,input_hash:inputHash,output_hash:item.status==='completed'?outputHash:null,input_tokens:item.inputTokens??null,output_tokens:item.outputTokens??null,estimated_cost_usd:item.estimatedCostUsd??null,latency_ms:item.latencyMs,status:item.status,error_message:item.errorMessage?.slice(0,2000)??null,request_metadata:(input.metadata??{}) as Json,response_metadata:{} as Json,is_fallback:item.isFallback,fallback_reason:item.fallbackReason??null,fallback_from_run_id:item.isFallback?primaryRunId:null,validation_result:(item.validationResult??null) as Json,completed_at:new Date().toISOString()});}}
}
