# Backend operations

## Setup

Copy `.env.example` to `.env`, fill every secret, install Node 20+, Docker, and the Supabase CLI, then run:

```bash
npm install
supabase start
supabase db reset
npm run dev
```

The service-role, AI, search, and worker keys are server-only. Never use a `NEXT_PUBLIC_`/browser-exposed prefix, print them, or commit `.env`. The Storage bucket named by `SUPABASE_STORAGE_BUCKET` must be private.

Required variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY_FAST`, `GROQ_API_KEY_STRONG`, `AI_MODEL_FAST`, `AI_MODEL_STRONG`, `AI_PROVIDER=groq`, `TAVILY_API_KEY`, `SEARCH_PROVIDER=tavily`, `MAX_PDF_SIZE_MB`, `MAX_PDF_PAGES`, `MAX_CLAIMS_PER_APPLICATION`, `DILIGENCE_CONCURRENCY`, and `INTERNAL_WORKER_TOKEN`. `GROQ_API_KEY` remains supported as a fallback for either missing pool key. Fast-pool calls handle extraction, screening, dimension diligence, claim verification, and information requests. Strong-pool calls handle memo generation, skeptic review, and memo revision. For independent provider throughput, configure keys backed by independent Groq quota pools; keys in one organization may still share organization-level TPM. `AI_FAST_MODEL_TPM` and `AI_STRONG_MODEL_TPM` default to 6,000 and 12,000; set them to the exact pool limits shown in Groq Console. `AI_RATE_LIMIT_WINDOW_MS` defaults to 60 seconds and `MAX_MEMO_INPUT_CHARS` defaults to 30,000. Timeouts, retry count, host/port, logging, and storage bucket remain configurable.

The controlled Google fallback is server-only and defaults to disabled. Configure `AI_FALLBACK_ENABLED=true`, `GEMINI_API_KEY`, `AI_FALLBACK_PROVIDER=google`, `AI_FALLBACK_MODEL=gemini-3.5-flash`, `AI_FALLBACK_TIMEOUT_MS=45000`, and `AI_MAX_FALLBACK_ATTEMPTS=1`. The fallback is eligible only for transient primary failures, is attempted at most once, and is skipped when the remaining stage budget cannot cover the fallback timeout plus persistence buffer. Never expose `GEMINI_API_KEY` through frontend-prefixed variables.

SLA stage budgets use the defaults in `src/server/sla/sla.config.ts`. Deployments may override individual values with a server-only `SLA_STAGE_BUDGETS_JSON` object; values are seconds. The 24-hour application deadline and four-hour human-review reservation are fixed policy safeguards in the MVP implementation.

## Workers and retries

```bash
npm run jobs:run-next
npm run jobs:drain
```

Alternatively call `POST /api/jobs/run-next` with the internal worker token. Jobs use persisted inputs, unique idempotency keys, locked claiming, exponential retry metadata, and a configured retry cap. The drain worker remains alive for scheduled retries. Groq 429 responses retain the provider's `Retry-After` delay, do not trigger an 8B-to-70B fallback, and do not mark the application failed until retries are exhausted. Validation/corrupt-data failures are permanent; timeouts, 429s, and provider 5xx responses are retryable. Inspect failed rows and use `POST /api/jobs/:id/retry` after correcting permanent causes.

## Tests and types

```bash
npm run typecheck
npm test
RUN_SUPABASE_INTEGRATION=true npm run test:integration
supabase gen types typescript --local > src/types/database.ts
```

Normal tests never call live AI or search providers. The local integration harness is opt-in and its full local-stack scenarios are currently pending. Common failures include an absent private bucket, image-only PDF (OCR is deliberately unsupported), missing provider keys, stale database types after migration 011, and a worker token shorter than 24 characters.

Database setup and seed commands remain documented in `docs/data-model.md`. Never reset a linked remote project.
