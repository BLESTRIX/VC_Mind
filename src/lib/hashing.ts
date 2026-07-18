import { createHash, randomUUID } from 'node:crypto';
export const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex');
export const stableJson = (value: unknown): string => JSON.stringify(value, Object.keys((value ?? {}) as object).sort());
export const requestId = (): string => randomUUID();
