export type ErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INVALID_STAGE_TRANSITION' | 'DOCUMENT_PROCESSING_FAILED' | 'AI_PROVIDER_ERROR' | 'SEARCH_PROVIDER_ERROR' | 'JOB_ALREADY_RUNNING' | 'JOB_RETRY_LIMIT_REACHED' | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly statusCode = 500, public readonly details?: Record<string, unknown>, public readonly retryable = false) { super(message); this.name = 'AppError'; }
}
export function asAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError('INTERNAL_ERROR', 'An unexpected backend error occurred', 500, undefined, false);
}
