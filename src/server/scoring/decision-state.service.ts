import { ScoringService } from './scoring.service.js';

export async function refreshDeterministicDecisionState(applicationId: string) {
  return new ScoringService().calculate(applicationId);
}
