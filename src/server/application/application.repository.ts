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
}
