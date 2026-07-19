import { describe,expect,it } from 'vitest';
import { closingState,CLOSING_CHECKS } from '../../server/private-diligence/closing-readiness.service.js';
const items=(status:'completed'|'not_started'|'blocked',blocking=false)=>CLOSING_CHECKS.map(()=>({status,blocking}));
describe('closing readiness',()=>{
 it('is ready when approved and complete',()=>expect(closingState('invest','approved',items('completed'))).toBe('ready_for_closing'));
 it('is blocked by a blocking item',()=>expect(closingState('invest','approved',[...items('completed'),{status:'blocked',blocking:true}])).toBe('blocked'));
 it('is conditional with non-blocking incomplete work',()=>expect(closingState('invest','conditional_approval',items('not_started'))).toBe('conditional_approval'));
 it('returns pass for pass recommendations',()=>expect(closingState('pass',null,[])).toBe('pass'));
 it('blocks without a human decision',()=>expect(closingState('invest',null,items('completed'))).toBe('blocked'));
});
