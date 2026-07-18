import { AppError } from '../../lib/errors.js';
export function isRetryable(error:unknown):boolean{return error instanceof AppError?error.retryable:false;}
export function retryDelayMs(retryCount:number):number{return Math.min(60_000,1000*2**Math.max(0,retryCount-1));}
