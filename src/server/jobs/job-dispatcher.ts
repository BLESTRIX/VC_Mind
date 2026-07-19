import { log } from '../../lib/logger.js';
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
      const waitMs = await this.runner.nextPendingDelayMs();
      if (waitMs === null) return;
      await new Promise((resolve) => setTimeout(resolve, Math.max(250, Math.min(waitMs + 250, 60_000))));
    }
  }
}

export const jobDispatcher = new JobDispatcher();
