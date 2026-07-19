function shrink(value: unknown, stringLimit: number, arrayLimit: number): unknown {
  if (typeof value === 'string') return value.length > stringLimit ? `${value.slice(0, stringLimit)}…` : value;
  if (Array.isArray(value)) return value.slice(0, arrayLimit).map((item) => shrink(item, stringLimit, arrayLimit));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shrink(item, stringLimit, arrayLimit)]));
  return value;
}

export function serializeContextWithinBudget(value: unknown, maximumCharacters: number): string {
  const original = JSON.stringify(value);
  if (original.length <= maximumCharacters) return original;
  for (const [stringLimit, arrayLimit] of [[2_000, 40], [1_000, 25], [500, 15], [250, 10], [120, 6]] as const) {
    const serialized = JSON.stringify({ contextTruncated: true, data: shrink(value, stringLimit, arrayLimit) });
    if (serialized.length <= maximumCharacters) return serialized;
  }
  throw new Error(`Structured AI context cannot fit within ${maximumCharacters} characters`);
}
