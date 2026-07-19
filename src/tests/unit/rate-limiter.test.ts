import { describe, expect, it } from 'vitest';
import { estimateGroqTokens, RollingTokenRateLimiter } from '../../ai/rate-limiter.js';

describe('Groq token rate limiter', () => {
  it('includes the output cap in its conservative request estimate', () => expect(estimateGroqTokens('1234', '1234', {}, 500)).toBe(503));

  it('waits for the rolling window when the next request would exceed TPM', async () => {
    let now = 0;
    const waits: number[] = [];
    const limiter = new RollingTokenRateLimiter(() => now, async (milliseconds) => { waits.push(milliseconds); now += milliseconds; });
    await limiter.acquire('strong', 700, 1_000, 60_000);
    await limiter.acquire('strong', 400, 1_000, 60_000);
    expect(waits).toEqual([60_025]);
  });

  it('rejects a single request that can never fit the configured TPM budget', async () => {
    await expect(new RollingTokenRateLimiter().acquire('strong', 1_001, 1_000, 60_000)).rejects.toMatchObject({ retryable: false, details: { kind: 'token_budget' } });
  });
});
