import { randomBytes } from 'node:crypto';
import { AppError } from '../../lib/errors.js';
import { sha256 } from '../../lib/hashing.js';
import type { AuthContext } from '../auth.js';
import { assertApplicationAccess, requireRoles } from '../auth.js';
import { getServiceClient } from '../supabase.js';

const attempts = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; const RATE_LIMIT = 30;
export type FounderAccess = { applicationId: string; tokenId: string; tokenHash: string };
export type DiligenceTokenRecord = { token_hash:string; application_id:string; expires_at:string; revoked_at:string|null };
export function isUsableDiligenceToken(rawToken:string, record:DiligenceTokenRecord|null, expectedApplicationId?:string):boolean {
  return Boolean(rawToken.length>=32&&rawToken.length<=256&&record&&record.token_hash===sha256(rawToken)&&!record.revoked_at&&Date.parse(record.expires_at)>Date.now()&&(!expectedApplicationId||record.application_id===expectedApplicationId));
}

function enforceRateLimit(key: string) {
  if(attempts.size>10_000) for(const [candidate,value] of attempts) if(value.resetAt<=Date.now()) attempts.delete(candidate);
  const now = Date.now(); const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS }); return; }
  current.count++;
  if (current.count > RATE_LIMIT) throw new AppError('CONFLICT', 'Too many diligence portal requests; try again shortly', 429, { reason: 'rate_limited' });
}

export class DiligenceAccessService {
  async create(applicationId: string, auth: AuthContext, expiresInHours = 168) {
    requireRoles(auth, ['admin','investment_manager','analyst']); await assertApplicationAccess(auth, applicationId);
    const db = getServiceClient();
    const { data: app } = await db.from('applications').select('id,recommendation').eq('id', applicationId).single();
    if (!app) throw new AppError('NOT_FOUND', 'Application not found', 404);
    const rawToken = randomBytes(32).toString('base64url'); const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + Math.min(Math.max(expiresInHours, 1), 720) * 3_600_000).toISOString();
    const { data, error } = await db.from('diligence_access_tokens').insert({ application_id: applicationId, token_hash: tokenHash, expires_at: expiresAt, created_by: auth.userId }).select('id,expires_at').single();
    if (error || !data) throw new AppError('INTERNAL_ERROR', 'Diligence access link could not be created', 500, { database: error?.message });
    await db.from('diligence_audit_events').insert({ application_id: applicationId, actor_type: 'staff', actor_id: auth.userId, action: 'access_link_created', target_type: 'diligence_access_token', target_id: data.id, metadata: { expiresAt } });
    return { token: rawToken, expiresAt: data.expires_at };
  }

  async revoke(applicationId: string, auth: AuthContext) {
    requireRoles(auth, ['admin','investment_manager','analyst']); await assertApplicationAccess(auth, applicationId);
    const now = new Date().toISOString(); const db = getServiceClient();
    const { data, error } = await db.from('diligence_access_tokens').update({ revoked_at: now }).eq('application_id', applicationId).is('revoked_at', null).select('id');
    if (error) throw new AppError('INTERNAL_ERROR', 'Diligence access could not be revoked', 500);
    await db.from('diligence_audit_events').insert({ application_id: applicationId, actor_type: 'staff', actor_id: auth.userId, action: 'access_links_revoked', metadata: { count: data?.length ?? 0 } });
    return { revoked: data?.length ?? 0 };
  }

  async validate(rawToken: string, touch = true): Promise<FounderAccess> {
    if (!rawToken || rawToken.length < 32 || rawToken.length > 256) throw new AppError('UNAUTHORIZED', 'Diligence access link is invalid', 401);
    const tokenHash = sha256(rawToken); enforceRateLimit(tokenHash);
    const db = getServiceClient(); const { data } = await db.from('diligence_access_tokens').select('id,application_id,expires_at,revoked_at').eq('token_hash', tokenHash).maybeSingle();
    if (!data || !isUsableDiligenceToken(rawToken, { ...data, token_hash: tokenHash })) throw new AppError('UNAUTHORIZED', 'Diligence access link is invalid or expired', 401);
    if (touch) await db.from('diligence_access_tokens').update({ last_accessed_at: new Date().toISOString() }).eq('id', data.id);
    return { applicationId: data.application_id, tokenId: data.id, tokenHash };
  }

  async portal(rawToken: string) {
    const access = await this.validate(rawToken); const db = getServiceClient();
    const [{ data: application }, { data: requests }, { data: documents }, { data: responses }] = await Promise.all([
      db.from('applications').select('id,companies(name)').eq('id', access.applicationId).single(),
      db.from('information_requests').select('id,title,description,requested_document_type,status,due_at,submitted_document_id').eq('application_id', access.applicationId).order('created_at'),
      db.from('documents').select('id,information_request_id,document_type,original_filename,processing_status,uploaded_at').eq('application_id', access.applicationId).not('information_request_id','is',null),
      db.from('diligence_responses').select('information_request_id,created_at').eq('application_id', access.applicationId)
    ]);
    return { application: { id: application?.id, companyName: (application?.companies as {name?:string}|null)?.name ?? 'Company' }, requests: requests ?? [], submissions: { documents: documents ?? [], responses: responses ?? [] } };
  }

  async respond(rawToken: string, requestId: string, responseText: string) {
    const access = await this.validate(rawToken); const db = getServiceClient();
    const { data: request } = await db.from('information_requests').select('id,application_id').eq('id', requestId).eq('application_id', access.applicationId).single();
    if (!request) throw new AppError('NOT_FOUND', 'Information request not found', 404);
    const text = responseText.trim(); if (!text || text.length > 10_000) throw new AppError('VALIDATION_ERROR', 'Response must contain 1 to 10000 characters', 400);
    const { data, error } = await db.from('diligence_responses').upsert({ application_id: access.applicationId, information_request_id: requestId, response_text: text }, { onConflict: 'information_request_id' }).select('id,created_at').single();
    if (error || !data) throw new AppError('INTERNAL_ERROR', 'Response could not be stored', 500);
    await db.from('information_requests').update({ status: 'submitted' }).eq('id', requestId);
    await db.from('diligence_audit_events').insert({ application_id: access.applicationId, actor_type: 'founder_token', actor_id: access.tokenId, action: 'text_response_submitted', target_type: 'information_request', target_id: requestId });
    return data;
  }
}
