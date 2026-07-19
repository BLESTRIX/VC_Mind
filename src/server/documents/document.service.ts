import { randomUUID } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { AppError } from '../../lib/errors.js';
import { sha256 } from '../../lib/hashing.js';
import { log } from '../../lib/logger.js';
import type { AuthContext } from '../auth.js';
import { assertApplicationAccess, requireRoles } from '../auth.js';
import { getServiceClient } from '../supabase.js';
import { validatePdf, type PdfFile } from './file-validator.js';
import { extractPdf, type ExtractedDocument } from './pdf-extractor.js';

async function withDocumentTimeout<T>(operation: Promise<T>, timeoutMs: number, step: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new AppError('DOCUMENT_PROCESSING_FAILED', `Document ${step} timed out after ${Math.round(timeoutMs / 1000)} seconds`, 504, { step }, false)), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class DocumentService {
  async uploadPitchDeck(applicationId: string, file: PdfFile, auth: AuthContext) {
    requireRoles(auth, ['admin', 'investment_manager', 'analyst']);
    await assertApplicationAccess(auth, applicationId);
    const env = getEnv();
    validatePdf(file, env.MAX_PDF_SIZE_MB * 1024 * 1024);
    const hash = sha256(file.buffer);
    const db = getServiceClient();
    const { data: duplicate } = await db.from('documents').select('*').eq('application_id', applicationId).eq('sha256_hash', hash).maybeSingle();
    if (duplicate) return duplicate;
    const id = randomUUID();
    const path = `applications/${applicationId}/documents/${id}/v1.pdf`;
    const { error: uploadError } = await db.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(path, file.buffer, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'Private pitch-deck upload failed', 500, { storage: uploadError.message });
    const { data, error } = await db.from('documents').insert({ id, application_id: applicationId, uploaded_by: auth.userId, document_type: 'pitch_deck', storage_bucket: env.SUPABASE_STORAGE_BUCKET, storage_path: path, original_filename: file.filename, mime_type: file.mimetype, file_size_bytes: file.buffer.length, sha256_hash: hash, processing_status: 'pending' }).select('*').single();
    if (error) {
      await db.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([path]);
      throw new AppError('INTERNAL_ERROR', 'Document metadata could not be stored', 500, { database: error.message });
    }
    return data;
  }

  async extract(documentId: string): Promise<ExtractedDocument> {
    const started = Date.now();
    const db = getServiceClient();
    const { data: doc, error } = await db.from('documents').select('*').eq('id', documentId).single();
    if (error || !doc) throw new AppError('NOT_FOUND', 'Document not found', 404);
    if (doc.processing_status === 'completed') {
      const { data: pages } = await db.from('document_pages').select('*').eq('document_id', documentId).order('page_number');
      return { documentId, pages: (pages ?? []).map((page) => ({ pageNumber: page.page_number, text: page.page_text ?? '', textHash: page.text_hash ?? sha256(page.page_text ?? '') })), pageCount: doc.page_count ?? 0, characterCount: (pages ?? []).reduce((count, page) => count + (page.page_text?.length ?? 0), 0), warnings: [] };
    }

    await db.from('documents').update({ processing_status: 'processing' }).eq('id', documentId);
    log('info', 'Document extraction started', { service: 'document-extractor', applicationId: doc.application_id, fileSizeBytes: doc.file_size_bytes, status: 'processing' });
    try {
      const downloadStarted = Date.now();
      const { data, error: downloadError } = await withDocumentTimeout(db.storage.from(doc.storage_bucket).download(doc.storage_path), getEnv().DOCUMENT_EXTRACTION_TIMEOUT_MS, 'download');
      if (downloadError || !data) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'Stored PDF could not be downloaded', 500);
      const buffer = new Uint8Array(await data.arrayBuffer());
      log('info', 'Document downloaded', { service: 'document-extractor', applicationId: doc.application_id, fileSizeBytes: buffer.byteLength, durationMs: Date.now() - downloadStarted, status: 'processing' });

      const parseStarted = Date.now();
      const result = await withDocumentTimeout(extractPdf(documentId, buffer, getEnv().MAX_PDF_PAGES), getEnv().DOCUMENT_EXTRACTION_TIMEOUT_MS, 'PDF parsing');
      log('info', 'PDF text parsed', { service: 'document-extractor', applicationId: doc.application_id, pageCount: result.pageCount, characterCount: result.characterCount, durationMs: Date.now() - parseStarted, status: 'processing' });

      const { error: pagesError } = await db.from('document_pages').upsert(result.pages.map((page) => ({ document_id: documentId, page_number: page.pageNumber, page_text: page.text, text_hash: page.textHash })), { onConflict: 'document_id,page_number' });
      if (pagesError) throw new AppError('INTERNAL_ERROR', 'Extracted document pages could not be stored', 500, { database: pagesError.message });
      const finalStatus = result.characterCount < 100 ? 'failed' : 'completed';
      const { error: updateError } = await db.from('documents').update({ page_count: result.pageCount, processing_status: finalStatus, processed_at: new Date().toISOString(), extracted_text: { characterCount: result.characterCount, warnings: result.warnings } }).eq('id', documentId);
      if (updateError) throw new AppError('INTERNAL_ERROR', 'Document processing status could not be stored', 500, { database: updateError.message });
      if (result.characterCount < 100) throw new AppError('DOCUMENT_PROCESSING_FAILED', 'PDF appears image-only; submit a text-searchable PDF', 422, { warnings: result.warnings });
      log('info', 'Document extraction completed', { service: 'document-extractor', applicationId: doc.application_id, pageCount: result.pageCount, characterCount: result.characterCount, durationMs: Date.now() - started, status: 'completed' });
      return result;
    } catch (caught) {
      await db.from('documents').update({ processing_status: 'failed', processed_at: new Date().toISOString() }).eq('id', documentId);
      log('error', 'Document extraction failed', { service: 'document-extractor', applicationId: doc.application_id, durationMs: Date.now() - started, status: 'failed', errorCode: caught instanceof Error ? caught.name : 'unknown' });
      throw caught;
    }
  }
}
