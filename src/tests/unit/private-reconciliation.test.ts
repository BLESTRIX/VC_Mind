import { describe, expect, it } from 'vitest';
import { reconcileClaim } from '../../server/private-diligence/reconciliation.service.js';

const base={claimId:'claim-1',category:'traction',claimedValue:100,observedValue:100,unit:'USD',observedUnit:'USD',supportingDocumentIds:['doc-1']};
describe('private claim reconciliation',()=>{
 it('matches exact values',()=>expect(reconcileClaim(base).result).toBe('matched'));
 it('approximately matches variance under five percent',()=>{const r=reconcileClaim({...base,observedValue:104});expect(r.result).toBe('approximately_matched');expect(r.material).toBe(false)});
 it('approximately matches five to ten percent variance',()=>expect(reconcileClaim({...base,observedValue:108}).result).toBe('approximately_matched'));
 it('marks variance over ten percent material',()=>{const r=reconcileClaim({...base,observedValue:111});expect(r.result).toBe('mismatched');expect(r.material).toBe(true)});
 it('does not compare different periods',()=>expect(reconcileClaim({...base,periodStart:'2026-01-01',periodEnd:'2026-01-31',observedPeriodStart:'2026-02-01',observedPeriodEnd:'2026-02-28'}).result).toBe('insufficient_data'));
 it('does not compare different currencies',()=>expect(reconcileClaim({...base,observedUnit:'EUR'}).result).toBe('insufficient_data'));
 it('makes undisclosed convertibles critical',()=>{const r=reconcileClaim({...base,specialCase:'undisclosed_convertible'});expect(r.severity).toBe('critical');expect(r.result).toBe('mismatched')});
 it('makes founder ownership mismatches high or critical severity',()=>expect(['high','critical']).toContain(reconcileClaim({...base,claimedValue:80,observedValue:50,specialCase:'founder_ownership'}).severity));
 it('returns insufficient data for a missing document observation',()=>expect(reconcileClaim({...base,observedValue:undefined}).result).toBe('insufficient_data'));
});
