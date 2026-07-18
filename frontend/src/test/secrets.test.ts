import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
describe('frontend secret boundary', () => { it('does not reference backend secret variable names in executable source', () => { const files = ['api/client.ts', 'api/applications.ts', 'lib/supabase.ts', 'main.tsx']; const source = files.map((file) => readFileSync(resolve(process.cwd(), 'src', file), 'utf8')).join('\n'); expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|GROQ_API_KEY|TAVILY_API_KEY|INTERNAL_WORKER_TOKEN/); }); });
