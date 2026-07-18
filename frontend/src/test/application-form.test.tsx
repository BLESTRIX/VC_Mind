import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue({ applicationId: '50000000-0000-4000-8000-000000000001' }),
  uploadDeck: vi.fn().mockResolvedValue({ id: 'document-1' }),
  theses: vi.fn().mockResolvedValue([{ id: '20000000-0000-4000-8000-000000000001', name: 'Seed Thesis', version: 1, is_active: true, description: null }])
}));
vi.mock('../api/applications', () => ({ applicationsApi: { ...mocks } }));
import { NewApplicationPage } from '../pages/NewApplicationPage';

describe('application form', () => {
  it('submits the backend payload, then uploads the selected PDF', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter><NewApplicationPage /></MemoryRouter></QueryClientProvider>);
    await screen.findByText('Seed Thesis v1');
    fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'Acme Labs' } });
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Avery Founder' } });
    fireEvent.change(screen.getByLabelText('Thesis configuration'), { target: { value: '20000000-0000-4000-8000-000000000001' } });
    const deck = new File(['%PDF'], 'deck.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Pitch deck PDF'), { target: { files: [deck] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create application and upload deck' }).closest('form')!);
    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    expect(mocks.create.mock.calls[0]?.[0]).toMatchObject({ company: { name: 'Acme Labs' }, founders: [{ fullName: 'Avery Founder', isPrimaryContact: true }], thesisConfigId: '20000000-0000-4000-8000-000000000001' });
    expect(mocks.uploadDeck).toHaveBeenCalledWith('50000000-0000-4000-8000-000000000001', deck);
  });
});
