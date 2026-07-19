import { describe, expect, it } from 'vitest';
import { serializeContextWithinBudget } from '../../ai/context-budget.js';

describe('structured context budgeting', () => {
  it('keeps compact context unchanged', () => expect(serializeContextWithinBudget({ value: 'ok' }, 100)).toBe('{"value":"ok"}'));
  it('returns valid bounded JSON instead of slicing through JSON', () => {
    const result = serializeContextWithinBudget({ rows: Array.from({ length: 30 }, (_, index) => ({ id: index, text: 'x'.repeat(500) })) }, 4_000);
    expect(result.length).toBeLessThanOrEqual(4_000);
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toMatchObject({ contextTruncated: true });
  });
});
