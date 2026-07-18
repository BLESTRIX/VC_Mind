import{describe,it}from'vitest';
// The local-stack suite is opt-in because it resets/depends on local Supabase state.
const enabled=process.env.RUN_SUPABASE_INTEGRATION==='true';
describe.skipIf(!enabled)('VC Brain local integration pipeline',()=>{it.todo('creates an application and attaches multiple founders');it.todo('uploads and extracts a fixture PDF page by page');it.todo('runs fixture claim extraction with a mocked AI provider');it.todo('stores mocked search results and verifies claims');it.todo('calculates scores, creates both memo versions and a skeptic review');it.todo('creates information requests and records an immutable human decision');});
