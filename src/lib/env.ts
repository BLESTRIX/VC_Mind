import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('127.0.0.1'),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('diligence-private'),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY_FAST: z.string().min(1).optional(),
  GROQ_API_KEY_STRONG: z.string().min(1).optional(),
  AI_MODEL_FAST: z.string().min(1),
  AI_MODEL_STRONG: z.string().min(1),
  AI_FAST_MODEL_TPM: z.coerce.number().int().positive().default(6000),
  AI_STRONG_MODEL_TPM: z.coerce.number().int().positive().default(12000),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  AI_PROVIDER: z.literal('groq'),
  TAVILY_API_KEY: z.string().min(1),
  SEARCH_PROVIDER: z.literal('tavily'),
  MAX_PDF_SIZE_MB: z.coerce.number().positive().max(100).default(20),
  MAX_PDF_PAGES: z.coerce.number().int().positive().max(500).default(50),
  MAX_CLAIMS_PER_APPLICATION: z.coerce.number().int().min(1).max(50).default(15),
  DILIGENCE_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(4),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  AI_FALLBACK_ENABLED: booleanString.default(false),
  GEMINI_API_KEY: z.string().min(1).optional(),
  AI_FALLBACK_PROVIDER: z.literal('google').default('google'),
  AI_FALLBACK_MODEL: z.string().min(1).default('gemini-3.5-flash'),
  AI_FALLBACK_TIMEOUT_MS: z.coerce.number().int().positive().default(45_000),
  AI_MAX_FALLBACK_ATTEMPTS: z.coerce.number().int().min(0).max(1).default(1),
  AI_FALLBACK_PERSISTENCE_BUFFER_MS: z.coerce.number().int().positive().default(5_000),
  SLA_STAGE_BUDGETS_JSON: z.string().optional(),
  SEARCH_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  MAX_JOB_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  JOB_STALE_AFTER_MS: z.coerce.number().int().min(30_000).default(120_000),
  DOCUMENT_EXTRACTION_TIMEOUT_MS: z.coerce.number().int().min(10_000).default(120_000),
  MAX_MEMO_INPUT_CHARS: z.coerce.number().int().min(5_000).default(30_000),
  INTERNAL_WORKER_TOKEN: z.string().min(24),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_LIVE_PROVIDER_TESTS: booleanString.default(false)
}).superRefine((env, context) => {
  if (!env.GROQ_API_KEY_FAST && !env.GROQ_API_KEY) {
    context.addIssue({ code: 'custom', path: ['GROQ_API_KEY_FAST'], message: 'Set GROQ_API_KEY_FAST or the legacy GROQ_API_KEY fallback' });
  }
  if (!env.GROQ_API_KEY_STRONG && !env.GROQ_API_KEY) {
    context.addIssue({ code: 'custom', path: ['GROQ_API_KEY_STRONG'], message: 'Set GROQ_API_KEY_STRONG or the legacy GROQ_API_KEY fallback' });
  }
  if (env.AI_FALLBACK_ENABLED && !env.GEMINI_API_KEY) context.addIssue({ code: 'custom', path: ['GEMINI_API_KEY'], message: 'GEMINI_API_KEY is required when AI fallback is enabled' });
});
export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;
export function getEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached && source === process.env) return cached;
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid server environment: ${issues}`);
  }
  if (source === process.env) cached = result.data;
  return result.data;
}
export function resetEnvForTests(): void { cached = undefined; }
