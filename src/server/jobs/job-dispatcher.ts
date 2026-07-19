import { log } from '../../lib/logger.js';
import { getEnv } from '../../lib/env.js';
import { JobRunner } from './job-runner.js';

/** Drains durable jobs after an API request starts or resumes a pipeline. */
export class JobDispatcher {
  private active: Promise<void> | null = null;

  constructor(private readonly runner = new JobRunner()) {}

  kick(): void {
    if (this.active) return;
    this.active = this.drain()
      .catch((error) => {
        log('error', 'Background job dispatcher stopped unexpectedly', {
          service: 'job-dispatcher', status: 'failed',
          errorCode: error instanceof Error ? error.name : 'unknown'
        });
      })
      .finally(() => { this.active = null; });
  }

  private async drain(): Promise<void> {
    const staleAfterMs = getEnv().JOB_STALE_AFTER_MS;
    while (true) {
      try {
        const job = await this.runner.runNext();
        if (job) continue;
      } catch (error) {
        log('warn', 'Background job failed; checking for an eligible retry', {
          service: 'job-dispatcher', status: 'pending',
          errorCode: error instanceof Error ? error.name : 'unknown'
        });
      }
      const [pendingDelayMs, staleDelayMs] = await Promise.all([
        this.runner.nextPendingDelayMs(),
        this.runner.nextStaleRunningDelayMs(staleAfterMs)
      ]);
      if (pendingDelayMs === null && staleDelayMs === null) return;
      const waitMs = Math.min(pendingDelayMs ?? Number.POSITIVE_INFINITY, staleDelayMs ?? Number.POSITIVE_INFINITY);
      await new Promise((resolve) => setTimeout(resolve, Math.max(250, Math.min(waitMs + 250, 60_000))));
      const recoveredJobs = await this.runner.recoverStaleRunning(staleAfterMs);
      if (recoveredJobs > 0) {
        log('warn', 'Recovered interrupted jobs after the dispatcher was already running', {
          service: 'job-dispatcher', status: 'pending', recoveredJobs
        });
      }
    }
  }
}

export const jobDispatcher = new JobDispatcher();
