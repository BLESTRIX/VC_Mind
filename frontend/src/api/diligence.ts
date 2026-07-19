import { apiRequest } from './client';
import type { FounderPortal } from './types';
export const diligenceApi={
 get:(token:string)=>apiRequest<FounderPortal>(`/api/diligence/${encodeURIComponent(token)}`),
 upload:(token:string,requestId:string,documentType:string,file:File)=>{const body=new FormData();body.append('requestId',requestId);body.append('documentType',documentType);body.append('file',file);return apiRequest(`/api/diligence/${encodeURIComponent(token)}/documents`,{method:'POST',body});},
 respond:(token:string,requestId:string,responseText:string)=>apiRequest(`/api/diligence/${encodeURIComponent(token)}/responses`,{method:'POST',body:JSON.stringify({requestId,responseText})})
};
