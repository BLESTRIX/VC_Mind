import { describe,expect,it } from 'vitest';
import { validatePrivateFile } from '../../server/private-diligence/private-file-validator.js';
const pdf=Buffer.from('%PDF-1.7\nbody');const csv=Buffer.from('month,revenue\n2026-01,100');const xlsx=Buffer.concat([Buffer.from([0x50,0x4b,0x03,0x04]),Buffer.from('[Content_Types].xml')]);
describe('private file validation',()=>{
 it.each([{filename:'cap.pdf',mimetype:'application/pdf',buffer:pdf,type:'cap_table'},{filename:'revenue.csv',mimetype:'text/csv',buffer:csv,type:'revenue_export'},{filename:'customers.xlsx',mimetype:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:xlsx,type:'customer_list'}])('accepts $filename',item=>expect(()=>validatePrivateFile(item,item.type,1000)).not.toThrow());
 it('rejects MIME mismatches',()=>expect(()=>validatePrivateFile({filename:'cap.pdf',mimetype:'text/plain',buffer:pdf},'cap_table',1000)).toThrow());
 it('rejects magic byte mismatches',()=>expect(()=>validatePrivateFile({filename:'cap.pdf',mimetype:'application/pdf',buffer:csv},'cap_table',1000)).toThrow());
 it('rejects oversized files',()=>expect(()=>validatePrivateFile({filename:'cap.pdf',mimetype:'application/pdf',buffer:pdf},'cap_table',2)).toThrow());
});
