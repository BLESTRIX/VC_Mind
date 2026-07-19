import { AppError } from '../../lib/errors.js';
import type { Json } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import type { CreateApplicationInput } from './application.schemas.js';
import { websiteDomain } from './application.schemas.js';
export class ApplicationRepository{
 async create(input:CreateApplicationInput,userId:string):Promise<string>{const payload={...input,company:{...input.company,domain:websiteDomain(input.company.websiteUrl)}};const {data,error}=await getServiceClient().rpc('create_vc_application' as never,{p_input:payload as Json,p_user_id:userId} as never);if(error||!data)throw new AppError('INTERNAL_ERROR','Failed to create application',500,{database:error?.message});return data as string;}
 async get(id:string){const {data,error}=await getServiceClient().from('applications').select('*,companies(*),application_founders(*,founders(*)),thesis_configs(*)').eq('id',id).single();if(error||!data)throw new AppError('NOT_FOUND','Application not found',404);return data;}
 async summary(id:string){const {data,error}=await getServiceClient().from('application_summary_view').select('*').eq('application_id',id).single();if(error||!data)throw new AppError('NOT_FOUND','Application summary not found',404);return data;}
 async related(table:'claims'|'evidence'|'scores'|'memos'|'information_requests'|'decisions',applicationId:string){if(table==='evidence'){const {data,error}=await getServiceClient().from('evidence').select('*,claims!inner(application_id),evidence_sources(*)').eq('claims.application_id',applicationId);if(error)throw new AppError('INTERNAL_ERROR','Failed to load evidence',500);return data;}const {data,error}=await getServiceClient().from(table).select('*').eq('application_id',applicationId).order('created_at',{ascending:false});if(error)throw new AppError('INTERNAL_ERROR',`Failed to load ${table}`,500);return data;}
 async remove(id:string):Promise<void>{
  const db=getServiceClient();
  const{data:activeJobs,error:jobsError}=await db.from('processing_jobs').select('id').eq('application_id',id).eq('status','running').limit(1);
  if(jobsError)throw new AppError('INTERNAL_ERROR','Could not verify application jobs',500,{database:jobsError.message});
  if(activeJobs?.length)throw new AppError('CONFLICT','Wait for the running diligence job to finish before deleting this application',409);
  const{error:cancelError}=await db.from('processing_jobs').update({status:'cancelled',completed_at:new Date().toISOString()}).eq('application_id',id).eq('status','pending');
  if(cancelError)throw new AppError('INTERNAL_ERROR','Queued diligence jobs could not be cancelled',500,{database:cancelError.message});
  const{data:documents,error:documentsError}=await db.from('documents').select('storage_bucket,storage_path').eq('application_id',id);
  if(documentsError)throw new AppError('INTERNAL_ERROR','Could not load application documents',500,{database:documentsError.message});
  const pathsByBucket=new Map<string,string[]>();
  for(const document of documents??[])pathsByBucket.set(document.storage_bucket,[...(pathsByBucket.get(document.storage_bucket)??[]),document.storage_path]);
  for(const[bucket,paths]of pathsByBucket){const{error}=await db.storage.from(bucket).remove(paths);if(error)throw new AppError('INTERNAL_ERROR','Application document cleanup failed',500,{storage:error.message});}
  const{data,error}=await db.from('applications').delete().eq('id',id).select('id').maybeSingle();
  if(error)throw new AppError('INTERNAL_ERROR','Application could not be deleted',500,{database:error.message});
  if(!data)throw new AppError('NOT_FOUND','Application not found',404);
 }
}
