import { describe,expect,it } from 'vitest';
import { AFFECTED_DIMENSIONS } from '../../server/private-diligence/reunderwriting.service.js';
describe('selective re-underwriting mapping',()=>{
 it('updates traction and economics for revenue evidence',()=>expect(AFFECTED_DIMENSIONS.revenue_export).toEqual(['traction','deal_economics','risk_resilience']));
 it('updates only product and traction for product analytics',()=>expect(AFFECTED_DIMENSIONS.product_analytics).toEqual(['product','traction']));
 it('does not schedule public diligence dimensions',()=>expect(Object.values(AFFECTED_DIMENSIONS).flat()).not.toContain('market'));
});
