import type { ApiErrorBody, DebugEntry } from './types';

export class ApiError extends Error { constructor(message:string,public status:number,public code?:string,public requestId?:string,public details?:unknown){super(message)} }
let accessToken:string|undefined;
let lastDebug:DebugEntry|null=null;
const listeners=new Set<()=>void>();
export const setApiAccessToken=(token?:string)=>{accessToken=token};
export const getDebugEntry=()=>lastDebug;
export const subscribeDebug=(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener)};
const publish=(entry:DebugEntry)=>{lastDebug=entry;listeners.forEach((listener)=>listener())};

function resolveApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return '';
  const deploymentHost = process.env.VERCEL_URL ?? process.env.VERCEL_BRANCH_URL ?? process.env.URL;
  return deploymentHost ? `https://${deploymentHost.replace(/\/$/, '')}` : '';
}

export async function apiRequest<T>(path:string,options:RequestInit={}):Promise<T>{
  const base=resolveApiBaseUrl();
  const headers=new Headers(options.headers);
  if(accessToken)headers.set('Authorization',`Bearer ${accessToken}`);
  if(options.body&&!(options.body instanceof FormData)&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
  const method=options.method??'GET';
  let response:Response;
  try{response=await fetch(`${base}${path}`,{...options,headers})}catch(error){const message=error instanceof Error?error.message:'Network request failed';publish({method,path,status:0,message,response:{message}});throw new ApiError(message,0)}
  const text=await response.text();let body:unknown=null;try{body=text?JSON.parse(text):null}catch{body=text}
  const errorBody=(body as ApiErrorBody|null)??{};
  publish({method,path,status:response.status,...(errorBody.error?.code?{errorCode:errorBody.error.code}:{}),...(errorBody.error?.message?{message:errorBody.error.message}:{}),...(errorBody.error?.requestId?{requestId:errorBody.error.requestId}:{}),response:body});
  if(!response.ok)throw new ApiError(errorBody.error?.message??`Request failed with HTTP ${response.status}`,response.status,errorBody.error?.code,errorBody.error?.requestId,errorBody.error?.details);
  return body as T;
}
