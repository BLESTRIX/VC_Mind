import { AppError } from '../../lib/errors.js';
import type { AuthContext } from '../auth.js';
import { assertApplicationAccess, requireRoles } from '../auth.js';
import { jobDispatcher } from '../jobs/job-dispatcher.js';
import { JobRepository } from '../jobs/job.repository.js';
import { getServiceClient } from '../supabase.js';

export class DiligenceOrchestrator {
  constructor(private readonly jobs = new JobRepository()) {}

  async runFullDiligence(applicationId: string, auth: AuthContext) {
    requireRoles(auth, ['admin', 'investment_manager', 'analyst']);
    await assertApplicationAccess(auth, applicationId);
    const db = getServiceClient();
    const { data: application } = await db
      .from('applications')
      .select('current_stage')
      .eq('id', applicationId)
      .single();
    if (!application) throw new AppError('NOT_FOUND', 'Application not found', 404);
    if (['memo_ready', 'approved', 'passed'].includes(application.current_stage)) {
      return { applicationId, currentStage: application.current_stage, status: 'already_completed' as const };
    }

    const { data: active } = await db
      .from('processing_jobs')
      .select('id')
      .eq('application_id', applicationId)
      .in('status', ['pending', 'running'])
      .limit(1);
    if (active?.length) {
      jobDispatcher.kick();
      return { applicationId, currentStage: application.current_stage, status: 'already_running' as const };
    }

    const { data: document } = await db
      .from('documents')
      .select('id,processing_status')
      .eq('application_id', applicationId)
      .eq('document_type', 'pitch_deck')
      .eq('is_current', true)
      .maybeSingle();
    if (!document) throw new AppError('CONFLICT', 'Upload a pitch deck before running diligence', 409);

    if (document.processing_status === 'completed') {
      await this.jobs.create(applicationId, 'extract_claims', { documentId: document.id });
    } else {
      await this.jobs.create(applicationId, 'extract_document', { documentId: document.id });
    }
    jobDispatcher.kick();
    return { applicationId, currentStage: application.current_stage, status: 'started' as const };
  }

  async resume(applicationId: string, auth: AuthContext) {
    await assertApplicationAccess(auth, applicationId);
    const { data: failed } = await getServiceClient()
      .from('processing_jobs')
      .select('*')
      .eq('application_id', applicationId)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (failed) {
      await this.jobs.retry(failed.id);
      jobDispatcher.kick();
      return { applicationId, status: 'started' as const, currentStage: 'failed' };
    }
    return this.runFullDiligence(applicationId, auth);
  }

  async status(applicationId: string, auth: AuthContext) {
    await assertApplicationAccess(auth, applicationId);
    const [{ data: application }, { data: jobs }] = await Promise.all([
      getServiceClient().from('applications').select('current_stage,failure_reason').eq('id', applicationId).single(),
      getServiceClient().from('processing_jobs').select('*').eq('application_id', applicationId).order('created_at')
    ]);
    if (!application) throw new AppError('NOT_FOUND', 'Application not found', 404);
    return { applicationId, ...application, jobs: jobs ?? [] };
  }
}
