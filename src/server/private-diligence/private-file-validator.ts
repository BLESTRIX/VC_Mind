import { AppError } from '../../lib/errors.js';
import { PRIVATE_DOCUMENT_TYPES, type PrivateDocumentType } from './private-diligence.types.js';

export type PrivateFile = { filename: string; mimetype: string; buffer: Buffer };
const allowed = new Map([['.pdf',['application/pdf']],['.csv',['text/csv','application/csv','text/plain']],['.xlsx',['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]]);
export function validatePrivateFile(file: PrivateFile, documentType: string, maxBytes: number): { documentType: PrivateDocumentType; extension: string } {
  if (!PRIVATE_DOCUMENT_TYPES.includes(documentType as PrivateDocumentType)) throw new AppError('VALIDATION_ERROR', 'Unsupported private document type', 400);
  const extension = /\.[^.]+$/.exec(file.filename.toLowerCase())?.[0] ?? '';
  const mimes = allowed.get(extension); if (!mimes?.includes(file.mimetype)) throw new AppError('VALIDATION_ERROR', 'File extension and MIME type are not allowed', 400);
  if (!file.buffer.length || file.buffer.length > maxBytes) throw new AppError('VALIDATION_ERROR', `File must be between 1 byte and ${maxBytes} bytes`, 400);
  const pdf = file.buffer.subarray(0,5).toString('ascii') === '%PDF-';
  const xlsx = file.buffer[0] === 0x50 && file.buffer[1] === 0x4b && file.buffer[2] === 0x03 && file.buffer[3] === 0x04 && file.buffer.includes(Buffer.from('[Content_Types].xml'));
  const csv = extension === '.csv' && !file.buffer.includes(0) && /[,;\t\r\n]/.test(file.buffer.subarray(0,4096).toString('utf8'));
  if ((extension === '.pdf' && !pdf) || (extension === '.xlsx' && !xlsx) || (extension === '.csv' && !csv)) throw new AppError('VALIDATION_ERROR', 'File contents do not match the declared file type', 400);
  return { documentType: documentType as PrivateDocumentType, extension };
}
