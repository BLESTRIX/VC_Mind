import { describe,expect,it } from 'vitest';
import { sha256 } from '../../lib/hashing.js';
import { isUsableDiligenceToken } from '../../server/private-diligence/access-token.service.js';
import { safeRequestPath } from '../../server/app.js';
const raw='a'.repeat(43);const record={token_hash:sha256(raw),application_id:'app-1',expires_at:new Date(Date.now()+60_000).toISOString(),revoked_at:null};
describe('founder diligence access tokens',()=>{
 it('accepts a valid token',()=>expect(isUsableDiligenceToken(raw,record)).toBe(true));
 it('rejects an expired token',()=>expect(isUsableDiligenceToken(raw,{...record,expires_at:new Date(Date.now()-1).toISOString()})).toBe(false));
 it('rejects a revoked token',()=>expect(isUsableDiligenceToken(raw,{...record,revoked_at:new Date().toISOString()})).toBe(false));
 it('rejects an invalid token',()=>expect(isUsableDiligenceToken('b'.repeat(43),record)).toBe(false));
 it('blocks cross-application access',()=>expect(isUsableDiligenceToken(raw,record,'app-2')).toBe(false));
 it('redacts raw tokens from request-log paths',()=>expect(safeRequestPath(`/api/diligence/${raw}/documents`)).toBe('/api/diligence/[REDACTED]/documents'));
});
