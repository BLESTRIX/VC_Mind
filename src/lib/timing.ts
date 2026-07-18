import { AppError } from './errors.js';
export async function withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number, code: 'AI_PROVIDER_ERROR' | 'SEARCH_PROVIDER_ERROR'): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await operation(controller.signal); }
  catch (error) { if (controller.signal.aborted) throw new AppError(code, `${code === 'AI_PROVIDER_ERROR' ? 'AI' : 'Search'} request timed out`, 504, undefined, true); throw error; }
  finally { clearTimeout(timer); }
}
