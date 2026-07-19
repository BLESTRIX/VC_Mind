import { AppError } from '../../lib/errors.js';
export function isRetryable(error:unknown):boolean{return error instanceof AppError?error.retryable:false;}
export function providerRetryAfterMs(error:unknown):number|undefined{if(!(error instanceof AppError))return;const value=error.details?.retryAfterMs;return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:undefined;}
export function retryDelayMs(retryCount:number,error?:unknown):number{const exponential=Math.min(60_000,1000*2**Math.max(0,retryCount-1));return Math.max(exponential,providerRetryAfterMs(error)??0);}
