import { getEnv } from '../lib/env.js';
import { log } from '../lib/logger.js';
import { buildServer } from './app.js';
import { jobDispatcher } from './jobs/job-dispatcher.js';
import { JobRepository } from './jobs/job.repository.js';

const env = getEnv();
const app = await buildServer();
await app.listen({ host: env.HOST, port: env.PORT });
log('info', 'VC Brain backend listening', { service: 'api', status: 'started', host: env.HOST, port: env.PORT });

try {
  const recoveredJobs = await new JobRepository().recoverStaleRunning(env.JOB_STALE_AFTER_MS);
  if (recoveredJobs > 0) log('warn', 'Recovered interrupted jobs', { service: 'job-recovery', status: 'pending', recoveredJobs });
  jobDispatcher.kick();
} catch (error) {
  log('error', 'Startup job recovery failed', { service: 'job-recovery', status: 'failed', errorCode: error instanceof Error ? error.name : 'unknown' });
}
