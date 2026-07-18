import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClaimsTable, DecisionForm, EvidenceTable, MemoPanel, ScoresTable } from '../components/DiligenceSections';
import { ErrorMessage } from '../components/Common';
import { shouldPoll } from '../pages/ApplicationDetailPage';
import type { Claim, Evidence, Memo, Score } from '../api/types';

const claim: Claim = { id: 'claim-1', claim_text: 'Revenue is $1m', category: 'traction', importance: 'high', checkable: true, verification_status: 'contradicted', evidence_confidence: .8, source_excerpt: 'Revenue', document_page_id: null };
const evidence: Evidence = { id: 'evidence-1', claim_id: 'claim-1', relationship: 'supports', excerpt: 'Invented excerpt', source_quality: .7, entity_match: .9, validation_status: 'invalid', validation_error: 'Excerpt mismatch', evidence_sources: { source_title: 'Source', source_domain: 'example.com', canonical_url: 'https://example.com', founder_controlled: false, authoritative_source: true } };
const score: Score = { id: 'score-1', dimension: 'overall', score: 7.8, weight: 1, weighted_score: 7.8, evidence_count: 3, explanation: 'Deterministic result', scoring_version: 'v1', is_current: true };
const memo: Memo = { id: 'memo-1', version: 2, investment_hypothesis: 'Strong thesis', thesis_alignment: 'Aligned', strengths: ['Team'], weaknesses: ['Risk'], opportunities: [], threats: [], verified_claims: [], unverified_claims: [], contradicted_claims: [], key_questions: [], strongest_reason_to_pass: 'Risk', recommendation: 'needs_more_info', recommendation_reason: 'More evidence required', confidence: .6, validation_flags: [{ type: 'invalid_excerpt', severity: 'error', message: 'Bad citation' }], is_current: true, created_at: new Date().toISOString() };

describe('backend testing components', () => {
  it('shows claim verification statuses', () => { render(<ClaimsTable claims={[claim]} />); expect(screen.getByText('contradicted')).toBeInTheDocument(); expect(screen.getByText('Revenue is $1m')).toBeInTheDocument(); });
  it('marks invalid evidence visibly and shows its error', () => { const { container } = render(<EvidenceTable evidence={[evidence]} claims={[claim]} />); expect(screen.getByText('invalid')).toBeInTheDocument(); expect(screen.getByText('Excerpt mismatch')).toBeInTheDocument(); expect(container.querySelector('.invalid-row')).toBeInTheDocument(); });
  it('shows scores returned by the backend', () => { render(<ScoresTable scores={[score]} />); expect(screen.getAllByText('7.8').length).toBeGreaterThan(0); expect(screen.getByText('Deterministic result')).toBeInTheDocument(); });
  it('shows memo validation flags prominently', () => { render(<MemoPanel memo={memo} />); expect(screen.getByText('Validation flags')).toBeInTheDocument(); expect(screen.getByText(/Bad citation/)).toBeInTheDocument(); });
  it('requires a reason before submitting a decision', () => { const submit = vi.fn(); render(<DecisionForm decisions={[]} memoId="memo-1" onSubmit={submit} />); fireEvent.click(screen.getByRole('button', { name: 'Approve' })); expect(screen.getByRole('alert')).toHaveTextContent('reason'); expect(submit).not.toHaveBeenCalled(); });
  it('stops polling on every terminal stage', () => { expect(shouldPoll('diligence_running')).toBe(true); for (const stage of ['memo_ready', 'approved', 'passed', 'needs_more_info', 'failed'] as const) expect(shouldPoll(stage)).toBe(false); });
  it('renders backend errors instead of hiding them', () => { render(<ErrorMessage error={new Error('Backend returned VALIDATION_ERROR.')} />); expect(screen.getByRole('alert')).toHaveTextContent('VALIDATION_ERROR'); });
});
