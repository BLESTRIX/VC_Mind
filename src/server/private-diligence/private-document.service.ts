import { randomUUID } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { sha256 } from '../../lib/hashing.js';
import type { AuthContext } from '../auth.js';
import { assertApplicationAccess } from '../auth.js';
import { jobDispatcher } from '../jobs/job-dispatcher.js';
import { JobRepository } from '../jobs/job.repository.js';
import { getServiceClient } from '../supabase.js';
import { DiligenceAccessService } from './access-token.service.js';
import { validatePrivateFile, type PrivateFile } from './private-file-validator.js';

export class PrivateDocumentService {
  async upload(rawToken: string, requestId: string, documentType: string, file: PrivateFile) {
    const access = await new DiligenceAccessService().validate(rawToken); const db = getServiceClient();
    const { data: request } = await db.from('information_requests').select('id,application_id,requested_document_type').eq('id', requestId).eq('application_id', access.applicationId).single();
    if (!request) throw new AppError('NOT_FOUND', 'Information request not found', 404);
    if (request.requested_document_type && request.requested_document_type !== documentType) throw new AppError('VALIDATION_ERROR', 'Document type does not satisfy this request', 400);
    const checked = validatePrivateFile(file, documentType, getEnv().MAX_PDF_SIZE_MB * 1024 * 1024); const hash = sha256(file.buffer);
    const { data: duplicate } = await db.from('documents').select('id').eq('application_id', access.applicationId).eq('sha256_hash', hash).maybeSingle();
    if (duplicate) throw new AppError('CONFLICT', 'This file was already uploaded for the application', 409, { reason: 'duplicate_document' });
    const id = randomUUID(); const bucket = getEnv().SUPABASE_STORAGE_BUCKET; const path = `applications/${access.applicationId}/private/${id}/v1${checked.extension}`;
    const { error: uploadError } = await db.storage.from(bucket).upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'Private document upload failed', 500);
    const { data, error } = await db.from('documents').insert({ id, application_id: access.applicationId, information_request_id: requestId, document_type: checked.documentType, storage_bucket: bucket, storage_path: path, original_filename: file.filename.slice(0,255), mime_type: file.mimetype, file_size_bytes: file.buffer.length, sha256_hash: hash, processing_status: 'pending' }).select('id,document_type,original_filename,processing_status,uploaded_at').single();
    if (error || !data) { await db.storage.from(bucket).remove([path]); throw new AppError('INTERNAL_ERROR', 'Document metadata could not be stored', 500); }
    await db.from('information_requests').update({ status: 'submitted', submitted_document_id: id }).eq('id', requestId);
    await db.from('diligence_audit_events').insert({ application_id: access.applicationId, actor_type: 'founder_token', actor_id: access.tokenId, action: 'private_document_uploaded', target_type: 'document', target_id: id, metadata: { documentType: checked.documentType, size: file.buffer.length } });
    await new JobRepository().create(access.applicationId, 'process_private_document', { documentId: id }, id); jobDispatcher.kick();
    return data;
  }

  async list(applicationId: string, auth: AuthContext) {
    await assertApplicationAccess(auth, applicationId);
    const { data, error } = await getServiceClient().from('documents').select('id,information_request_id,document_type,original_filename,mime_type,file_size_bytes,sha256_hash,processing_status,authenticity_status,manual_review_status,uploaded_at,processed_at,document_extractions(id,status,confidence,warnings,is_current)').eq('application_id', applicationId).neq('document_type','pitch_deck').order('uploaded_at', { ascending: false });
    if (error) throw new AppError('INTERNAL_ERROR', 'Private documents could not be loaded', 500);
    return Promise.all((data ?? []).map(async (document) => {
      const full = await getServiceClient().from('documents').select('storage_bucket,storage_path').eq('id', document.id).single();
      const signed = full.data ? await getServiceClient().storage.from(full.data.storage_bucket).createSignedUrl(full.data.storage_path, 300) : null;
      return { ...document, downloadUrl: signed?.data?.signedUrl ?? null, downloadUrlExpiresInSeconds: signed?.data?.signedUrl ? 300 : null };
    }));
  }
}
