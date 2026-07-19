import { AppError } from '../lib/errors.js';

type Usage = { at: number; tokens: number };
type Sleep = (milliseconds: number) => Promise<void>;

const defaultSleep: Sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function estimateGroqTokens(systemPrompt: string, userPrompt: string, schema: unknown, maxCompletionTokens: number): number {
  const inputCharacters = systemPrompt.length + userPrompt.length + JSON.stringify(schema).length;
  return Math.ceil(inputCharacters / 4) + maxCompletionTokens;
}

export class RollingTokenRateLimiter {
  private readonly usage = new Map<string, Usage[]>();
  private readonly tails = new Map<string, Promise<void>>();

  constructor(private readonly now: () => number = Date.now, private readonly sleep: Sleep = defaultSleep) {}

  async acquire(key: string, estimatedTokens: number, tokenLimit: number, windowMs: number): Promise<void> {
    if (estimatedTokens > tokenLimit) {
      throw new AppError('AI_PROVIDER_ERROR', 'Estimated AI request exceeds the configured per-minute token budget', 502, { kind: 'token_budget', model: key, estimatedTokens, tokenLimit }, false);
    }
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release = () => {};
    const current = new Promise<void>((resolve) => { release = resolve; });
    const tail = previous.then(() => current);
    this.tails.set(key, tail);
    await previous;
    try {
      await this.acquireUnlocked(key, estimatedTokens, tokenLimit, windowMs);
    } finally {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    }
  }

  reset(): void {
    this.usage.clear();
    this.tails.clear();
  }

  private async acquireUnlocked(key: string, estimatedTokens: number, tokenLimit: number, windowMs: number): Promise<void> {
    while (true) {
      const now = this.now();
      const recent = (this.usage.get(key) ?? []).filter((entry) => entry.at + windowMs > now);
      this.usage.set(key, recent);
      const used = recent.reduce((sum, entry) => sum + entry.tokens, 0);
      if (used + estimatedTokens <= tokenLimit) {
        recent.push({ at: now, tokens: estimatedTokens });
        return;
      }
      let expiringTokens = 0;
      let waitMs = windowMs;
      for (const entry of recent) {
        expiringTokens += entry.tokens;
        if (used - expiringTokens + estimatedTokens <= tokenLimit) {
          waitMs = Math.max(1, entry.at + windowMs - now + 25);
          break;
        }
      }
      await this.sleep(waitMs);
    }
  }
}

export const groqRateLimiter = new RollingTokenRateLimiter();
