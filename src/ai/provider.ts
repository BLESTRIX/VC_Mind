import type { z } from 'zod';
export type AIResult<T> = { data: T; provider: string; model: string; latencyMs: number; inputTokens?: number; outputTokens?: number; estimatedCostUsd?: number; rawResponseId?: string };
export type GenerateStructuredInput<T> = { model: string; systemPrompt: string; userPrompt: string; schema: z.ZodType<T>; schemaName: string; temperature?: number; timeoutMs?: number; maxCompletionTokens?: number; metadata?: Record<string, unknown> };
export interface AIProvider { generateStructured<T>(input: GenerateStructuredInput<T>): Promise<AIResult<T>> }
