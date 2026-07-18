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
  GROQ_API_KEY: z.string().min(1),
  AI_MODEL_FAST: z.string().min(1),
  AI_MODEL_STRONG: z.string().min(1),
  AI_PROVIDER: z.literal('groq'),
  TAVILY_API_KEY: z.string().min(1),
  SEARCH_PROVIDER: z.literal('tavily'),
  MAX_PDF_SIZE_MB: z.coerce.number().positive().max(100).default(20),
  MAX_PDF_PAGES: z.coerce.number().int().positive().max(500).default(50),
  MAX_CLAIMS_PER_APPLICATION: z.coerce.number().int().min(1).max(50).default(15),
  DILIGENCE_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(4),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  SEARCH_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  MAX_JOB_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  MAX_MEMO_INPUT_CHARS: z.coerce.number().int().positive().default(120_000),
  INTERNAL_WORKER_TOKEN: z.string().min(24),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_LIVE_PROVIDER_TESTS: booleanString.default(false)
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
