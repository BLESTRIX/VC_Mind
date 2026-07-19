# VC Mind

VC Mind is a full-stack venture-capital diligence platform. It accepts startup applications and pitch decks, extracts checkable claims, gathers public evidence, evaluates companies against an investment thesis, calculates deterministic scores, produces investment memos, and keeps the final investment decision under human control.

The project is an experimental MVP. Its recommendations and thresholds have not been calibrated against historical investment outcomes and should support—not replace—professional judgment.

## Key Features

- Role-based application and thesis management using Supabase Auth and Row Level Security (RLS)
- Private PDF pitch-deck upload, validation, text extraction, and page-level traceability
- AI-assisted claim extraction, thesis screening, four-dimension diligence, and memo generation
- Tavily-powered public evidence research with source validation and deduplication
- Deterministic evidence coverage, factor scoring, recommendations, and safety checks
- Resumable, database-backed processing jobs with retries and stale-job recovery
- Private diligence portal for founder document uploads and responses
- Claim reconciliation, selective re-underwriting, and closing-readiness tracking
- Immutable, auditable human decisions and versioned diligence artifacts
- React interface for creating, reviewing, and managing applications

## How It Works

```text
Application + pitch deck
          |
          v
PDF extraction -> claim extraction -> thesis screening
          |
          v
Founder / market / traction / product diligence
          |
          v
Evidence verification -> deterministic scoring
          |
          v
Draft memo -> skeptic review -> final memo
          |
          v
Human investment decision
```

All model-generated claims, evidence links, scores, memo revisions, and decisions are retained for auditability. AI output is validated with Zod schemas, while official scores and recommendations are calculated in application code rather than delegated to a model.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, TanStack Router/Query, Tailwind CSS, Radix UI |
| Backend | Node.js 20+, TypeScript, Fastify, Zod |
| Database and auth | Supabase PostgreSQL, Auth, Storage, RLS |
| AI | Groq Chat Completions, with an optional Google Gemini fallback |
| Search | Tavily Search |
| Documents | Private Supabase Storage, `pdfjs-dist` |
| Testing | Vitest, Testing Library, SQL validation tests |

## Project Structure

```text
VC_Mind/
├── frontend/                 React web application
│   └── src/
│       ├── api/              Backend API clients
│       ├── auth/             Supabase authentication
│       ├── components/       Application and UI components
│       ├── pages/            Application workflow pages
│       └── routes/           TanStack routes
├── src/
│   ├── ai/                   Providers, prompts, limits, and run recording
│   ├── search/               Search client and result normalization
│   ├── server/
│   │   ├── application/      Application operations
│   │   ├── diligence/        Public diligence pipeline
│   │   ├── documents/        Pitch-deck storage and extraction
│   │   ├── evidence/         Evidence validation and confidence
│   │   ├── jobs/             Durable job orchestration
│   │   ├── memos/            Memo generation and citation safety
│   │   ├── private-diligence/ Founder portal and re-underwriting
│   │   ├── scoring/          Deterministic scores and recommendations
│   │   └── api/              Fastify routes
│   └── tests/                Unit, integration, and fixture data
├── supabase/
│   ├── migrations/           Database schema, policies, functions, and views
│   ├── tests/                SQL validation suite
│   └── seed.sql              Local development data
└── docs/                     Architecture, API, data model, AI, and operations docs
```

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop (for the local Supabase stack)
- Supabase CLI
- Groq API key(s)
- Tavily API key
- Optional: Google Gemini API key for controlled AI fallback

## Environment Configuration

Create a `.env` file in the repository root. At minimum, configure the following server-only values:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3001

SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
SUPABASE_STORAGE_BUCKET=diligence-private

GROQ_API_KEY_FAST=your-groq-key
GROQ_API_KEY_STRONG=your-groq-key
AI_PROVIDER=groq
AI_MODEL_FAST=llama-3.1-8b-instant
AI_MODEL_STRONG=llama-3.3-70b-versatile

TAVILY_API_KEY=your-tavily-key
SEARCH_PROVIDER=tavily
INTERNAL_WORKER_TOKEN=replace-with-a-random-value-at-least-24-characters

MAX_PDF_SIZE_MB=20
MAX_PDF_PAGES=50
MAX_CLAIMS_PER_APPLICATION=15
DILIGENCE_CONCURRENCY=4
```

For the frontend, copy its example configuration:

```powershell
Copy-Item .\frontend\.env.example .\frontend\.env.local
```

Then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. During local development, leave `VITE_API_BASE_URL` empty so Vite proxies `/api` to the backend on port `3001`.

Never expose the Supabase service-role key, Groq keys, Tavily key, Gemini key, or worker token in a `VITE_` variable or commit an environment file.

## Local Setup

From the repository root:

```powershell
npm install
npm --prefix frontend install
supabase start
supabase db reset
npm run dev:all
```

The backend runs at `http://127.0.0.1:3001`, the frontend at `http://localhost:5173`, and Supabase Studio at `http://127.0.0.1:54323`.

`supabase db reset` applies all migrations and the local seed. Do not run a reset against a linked remote Supabase project.

## Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run the backend in watch mode |
| `npm run dev:all` | Run backend and frontend together |
| `npm run build` | Compile the backend |
| `npm run typecheck` | Type-check backend code |
| `npm test` | Run backend unit tests |
| `npm run test:integration` | Run backend integration tests |
| `npm run jobs:run-next` | Process one eligible background job |
| `npm run jobs:drain` | Drain queued jobs and scheduled retries |
| `npm --prefix frontend run build` | Build the frontend |
| `npm --prefix frontend run lint` | Lint the frontend |

The API server also starts an in-process dispatcher when diligence work is queued. The explicit worker commands are useful for operations, recovery, or a separately deployed worker process.

## API and Authentication

The public health endpoint is:

```http
GET /api/health
```

Application, thesis, diligence, memo, evidence, scoring, and decision endpoints require a Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
```

Internal worker execution uses `X-Worker-Token`. See [API reference](docs/api-reference.md) for the endpoint catalog and request examples.

## Testing

Run the fast checks with:

```powershell
npm run typecheck
npm test
```

Supabase integration tests require the local stack and are opt-in:

```powershell
$env:RUN_SUPABASE_INTEGRATION='true'
npm run test:integration
```

Normal unit tests do not call live AI or search providers.

## Documentation

- [Backend architecture](docs/backend-architecture.md)
- [AI pipeline](docs/ai-pipeline.md)
- [API reference](docs/api-reference.md)
- [Data model](docs/data-model.md)
- [Operations guide](docs/operations.md)

## Known MVP Limitations

- Image-only PDFs are unsupported because OCR is not implemented.
- Recommendations use experimental, uncalibrated thresholds.
- Organization tenancy currently relies on profile organization labels and ownership rather than dedicated membership tables.
- Public research is limited to text returned through Tavily.
- Production deployments still require deployment-specific retention, storage-access, CORS, and monitoring controls.

## Team Members

- Muhammad Ahmed Hassan
- Ashub Shafqat
