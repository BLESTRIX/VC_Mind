import { z } from 'zod';
import { AppError } from '../../lib/errors.js';
import type { AuthContext } from '../auth.js';
import { assertApplicationAccess, requireRoles } from '../auth.js';
import { getServiceClient } from '../supabase.js';
import { transitionApplicationStage } from '../jobs/stage-runner.js';

export const decisionSchema = z.object({ memoId: z.uuid().optional(), decision: z.enum(['approved', 'passed', 'needs_more_info', 'conditional_approval']), reason: z.string().trim().min(3).max(5000) });
export class DecisionService {
  async record(applicationId: string, raw: unknown, auth: AuthContext) {
    requireRoles(auth, ['admin', 'investment_manager']); await assertApplicationAccess(auth, applicationId); const input = decisionSchema.parse(raw); const db = getServiceClient();
    if (input.memoId) { const { data } = await db.from('memos').select('id').eq('id', input.memoId).eq('application_id', applicationId).maybeSingle(); if (!data) throw new AppError('VALIDATION_ERROR', 'Memo does not belong to this application', 400); }
    const { data, error } = await db.from('decisions').insert({ application_id: applicationId, memo_id: input.memoId ?? null, decision: input.decision, decision_reason: input.reason, decided_by: auth.userId }).select('*').single();
    if (error) throw new AppError('INTERNAL_ERROR', 'Decision could not be recorded', 500, { database: error.message });
    const stage = input.decision === 'approved' || input.decision === 'conditional_approval' ? 'approved' : input.decision === 'passed' ? 'passed' : 'needs_more_info';
    await transitionApplicationStage(applicationId, stage, 'completed', null, { decisionId: data.id });
    const { data: application } = await db.from('applications').select('company_id').eq('id', applicationId).single();
    await db.from('signals').insert({ application_id: applicationId, company_id: application?.company_id ?? null, signal_type: 'decision_recorded', title: 'Human decision recorded', payload: { decisionId: data.id, decision: input.decision }, occurred_at: new Date().toISOString() });
    return data;
  }
}
