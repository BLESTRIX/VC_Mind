import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const order = vi.fn().mockResolvedValue({ data: [{ application_id: '50000000-0000-4000-8000-000000000001', company_name: 'Acme Ventures', current_stage: 'memo_ready', recommendation: 'invest', investment_score: 8.1, calculated_evidence_coverage: 75, submitted_at: '2026-01-01T00:00:00Z', decision_deadline: '2026-01-02T00:00:00Z', remaining_sla_time: '2 hours', current_memo_id: null, current_decision: null, open_information_requests: 0 }], error: null });
vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ order }) }) } }));
import { ApplicationsPage } from '../pages/ApplicationsPage';

describe('applications page', () => {
  it('renders real application rows returned by the authenticated RLS view', async () => { const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); render(<QueryClientProvider client={client}><MemoryRouter><ApplicationsPage /></MemoryRouter></QueryClientProvider>); expect(await screen.findByText('Acme Ventures')).toBeInTheDocument(); expect(screen.getByText('8.1')).toBeInTheDocument(); expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/applications/50000000-0000-4000-8000-000000000001'); });
});
