import { describe, expect, it } from 'vitest';
import { AppError } from '../../lib/errors.js';
import { providerRetryAfterMs, retryDelayMs } from '../../server/jobs/retry-policy.js';

describe('job retry timing', () => {
  it('honors a provider Retry-After value over exponential backoff', () => {
    const error = new AppError('AI_PROVIDER_ERROR', 'limited', 502, { retryAfterMs: 30_095 }, true);
    expect(providerRetryAfterMs(error)).toBe(30_095);
    expect(retryDelayMs(1, error)).toBe(30_095);
  });

  it('retains exponential backoff when the provider has no longer delay', () => expect(retryDelayMs(4)).toBe(8_000));
});
