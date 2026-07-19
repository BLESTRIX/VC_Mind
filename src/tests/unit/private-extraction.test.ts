import { describe,expect,it } from 'vitest';
import { extractStructuredFacts,validateExtractionOutput } from '../../server/private-diligence/extraction.service.js';
describe('controlled private document extraction',()=>{
 it.each([
  ['cap_table','Company name: Acme\nFounder ownership: 65%\nOption pool: 10%','founder_ownership'],
  ['safe_agreement','Investment amount: $250,000\nValuation cap: $5,000,000\nDiscount: 20%','valuation_cap'],
  ['revenue_export','MRR: $120,000\nARR: $1,440,000','mrr'],
  ['customer_list','Retention: 92%','retention'],
  ['product_analytics','Active users: 12,000\nRetention: 45%','active_users'],
  ['incorporation_document','Legal name: Acme Inc\nRegistration number: 123-ABC\nJurisdiction: Delaware','registration_number']
 ] as const)('extracts %s facts',(type,text,field)=>{const result=extractStructuredFacts(type,text);const parsed=validateExtractionOutput(result.structuredData);expect(parsed.facts[field]?.value).not.toBeNull()});
 it('keeps missing values null',()=>{const result=validateExtractionOutput(extractStructuredFacts('cap_table','unrelated text').structuredData);expect(result.facts.founder_ownership?.value).toBeNull()});
 it('rejects invalid model-shaped output',()=>expect(()=>validateExtractionOutput({documentType:'cap_table',facts:{x:{value:1}}})).toThrow());
});
