import { AppError } from '../../lib/errors.js';
import type { Json, ProcessingJobRow } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import type { JobType } from './job.types.js';

export class JobRepository {
  async create(applicationId: string, type: JobType, payload: Json = {}, suffix = 'v1') {
    const key = `${applicationId}:${type}:${suffix}`; const db = getServiceClient();
    const { data: existing } = await db.from('processing_jobs').select('*').eq('idempotency_key', key).maybeSingle(); if (existing) return existing;
    const { data, error } = await db.from('processing_jobs').insert({ application_id: applicationId, job_type: type, status: 'pending', idempotency_key: key, payload }).select('*').single();
    if (error?.code === '23505') { const { data: raced } = await db.from('processing_jobs').select('*').eq('idempotency_key', key).single(); if (raced) return raced; }
    if (error || !data) throw new AppError('INTERNAL_ERROR', 'Job could not be created', 500, { database: error?.message }); return data;
  }
  async claim(): Promise<ProcessingJobRow | null> { const { data, error } = await getServiceClient().rpc('claim_next_processing_job'); if (error) throw new AppError('INTERNAL_ERROR', 'Could not claim job', 500, { database: error.message }); return data; }
  async complete(id: string, result: Json) { const { error } = await getServiceClient().from('processing_jobs').update({ status: 'completed', result, completed_at: new Date().toISOString(), error_message: null }).eq('id', id); if (error) throw new AppError('INTERNAL_ERROR', 'Could not complete job', 500); }
  async fail(job: ProcessingJobRow, error: unknown, maxRetries: number, retryable: boolean) { const message = error instanceof Error ? error.message.slice(0, 2000) : 'Unknown job failure'; if (retryable && job.retry_count < maxRetries) { const retryCount = job.retry_count + 1; const next = new Date(Date.now() + Math.min(60000, 1000 * 2 ** Math.max(0, retryCount - 1))).toISOString(); await getServiceClient().from('processing_jobs').update({ status: 'pending', retry_count: retryCount, error_message: message, payload: { ...((job.payload as Record<string, Json>) ?? {}), next_attempt_at: next } }).eq('id', job.id); } else await getServiceClient().from('processing_jobs').update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() }).eq('id', job.id); }
  async retry(id: string) { const db = getServiceClient(); const { data: job } = await db.from('processing_jobs').select('*').eq('id', id).single(); if (!job) throw new AppError('NOT_FOUND', 'Job not found', 404); if (job.status !== 'failed') throw new AppError('CONFLICT', 'Only failed jobs can be retried', 409); await db.from('processing_jobs').update({ status: 'pending', error_message: null, completed_at: null }).eq('id', id); return { ...job, status: 'pending' as const }; }
}
