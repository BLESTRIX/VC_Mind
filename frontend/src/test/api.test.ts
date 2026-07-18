import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiError, setApiAccessToken } from '../api/client';
import { applicationsApi } from '../api/applications';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
describe('typed API client', () => {
  beforeEach(() => { setApiAccessToken(undefined); vi.stubGlobal('fetch', vi.fn()); });
  it('sends JSON and the available bearer token', async () => { setApiAccessToken('public-user-session'); vi.mocked(fetch).mockResolvedValue(response({ ok: true })); await apiRequest('/api/test', { method: 'POST', body: JSON.stringify({ name: 'Acme' }) }); const init = vi.mocked(fetch).mock.calls[0]?.[1]; const headers = new Headers(init?.headers); expect(headers.get('Authorization')).toBe('Bearer public-user-session'); expect(headers.get('Content-Type')).toBe('application/json'); });
  it('preserves readable backend validation errors', async () => { vi.mocked(fetch).mockResolvedValue(response({ error: { code: 'VALIDATION_ERROR', message: 'Pitch deck must be a PDF.', requestId: 'request-1' } }, 400)); await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR', message: 'Pitch deck must be a PDF.', requestId: 'request-1' }); });
  it('creates an application with the supplied payload', async () => { vi.mocked(fetch).mockResolvedValue(response({ applicationId: 'app-1' }, 201)); const payload = { company: { name: 'Acme' }, founders: [{ fullName: 'Avery', isPrimaryContact: true }], thesisConfigId: '20000000-0000-4000-8000-000000000001' }; await applicationsApi.create(payload); expect(vi.mocked(fetch).mock.calls[0]?.[1]?.body).toBe(JSON.stringify(payload)); });
  it('uploads PDFs with multipart FormData and no forced JSON header', async () => { vi.mocked(fetch).mockResolvedValue(response({ id: 'doc-1' }, 201)); await applicationsApi.uploadDeck('app-1', new File(['pdf'], 'deck.pdf', { type: 'application/pdf' })); const init = vi.mocked(fetch).mock.calls[0]?.[1]; expect(init?.body).toBeInstanceOf(FormData); expect(new Headers(init?.headers).has('Content-Type')).toBe(false); });
  it('starts diligence through the implemented endpoint', async () => { vi.mocked(fetch).mockResolvedValue(response({ status: 'started' }, 202)); await applicationsApi.run('app-1'); expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('/api/applications/app-1/run-diligence'); expect(vi.mocked(fetch).mock.calls[0]?.[1]?.method).toBe('POST'); });
});
