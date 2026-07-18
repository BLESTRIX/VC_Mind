import { describe, expect, it } from 'vitest';
import { createApplicationSchema } from '../../server/application/application.schemas.js';

const base = {
  company: { name: 'Fictional Labs' },
  founders: [{ fullName: 'Avery Example', isPrimaryContact: true }],
  thesisConfigId: '20000000-0000-4000-8000-000000000001'
};

describe('application validation', () => {
  it('accepts multiple founders', () => {
    const parsed = createApplicationSchema.parse({ ...base, founders: [...base.founders, { fullName: 'Jordan Example' }] });
    expect(parsed.founders).toHaveLength(2);
  });
  it('rejects negative asks', () => expect(() => createApplicationSchema.parse({ ...base, fundingAskUsd: -1 })).toThrow());
  it('rejects two primary contacts', () => expect(() => createApplicationSchema.parse({ ...base, founders: [base.founders[0], { fullName: 'Second', isPrimaryContact: true }] })).toThrow());
});
