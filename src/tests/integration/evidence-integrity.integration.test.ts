import { describe, expect, it } from 'vitest';
import { EvidenceIntegrityService } from '../../server/evidence/evidence-integrity.service.js';
import { getServiceClient } from '../../server/supabase.js';

const enabled = process.env.RUN_SUPABASE_INTEGRATION === 'true';
const applicationId = '50000000-0000-4000-8000-000000000001';

describe.skipIf(!enabled)('evidence integrity against local Supabase', () => {
  it('persists validation results, recalculates claims, and is idempotent without a model call', async () => {
    const service = new EvidenceIntegrityService();
    const first = await service.validateApplication(applicationId);
    const second = await service.validateApplication(applicationId);
    const { data: evidence } = await getServiceClient().from('evidence').select('validation_status,validation_error,claims!inner(application_id)').eq('claims.application_id', applicationId);
    expect(evidence?.length).toBeGreaterThan(0);
    expect(evidence?.every((row) => ['valid', 'invalid'].includes(row.validation_status))).toBe(true);
    expect(second.coverage).toEqual(first.coverage);
    expect(second.changedClaimIds).toEqual([]);
  });
});
