import { sha256 } from '../../lib/hashing.js';
import type { Json } from '../../types/database.js';
import { AppError } from '../../lib/errors.js';
import { getServiceClient } from '../supabase.js';

const quality: Record<string, number> = { bank_statement:.95, customer_contract:.9, cap_table:.9, incorporation_document:.9, product_analytics:.85, revenue_export:.85, customer_list:.6, retention_report:.6, financial_model:.6, safe_agreement:.9, term_sheet:.9, identity_document:.9, debt_schedule:.85, other:.3 };
const sourceType = (type:string) => ['customer_contract','customer_list','retention_report'].includes(type) ? 'customer_document' as const : ['bank_statement','revenue_export','financial_model','cap_table','safe_agreement','term_sheet','debt_schedule'].includes(type) ? 'financial_document' as const : 'founder_submitted' as const;

export class PrivateEvidenceService {
  async create(documentId: string) {
    const db=getServiceClient();
    const [{data:doc},{data:extraction}] = await Promise.all([db.from('documents').select('*').eq('id',documentId).single(),db.from('document_extractions').select('*').eq('document_id',documentId).eq('is_current',true).single()]);
    if(!doc||!extraction) throw new AppError('NOT_FOUND','Private document extraction not found',404);
    const envelope=extraction.structured_data as unknown as {facts?:Record<string,{value:unknown;unit?:string|null;currency?:string|null;sourceReference:string;excerpt:string}>;periodStart?:string|null;periodEnd?:string|null};
    const populated=Object.entries(envelope.facts??{}).filter(([,fact])=>fact.value!==null);
    const {data:loadedClaims}=await db.from('claims').select('id,claim_text,category').eq('application_id',doc.application_id).eq('checkable',true);
    const claims=[...(loadedClaims??[])];
    if(['safe_agreement','debt_schedule'].includes(doc.document_type)&&!claims.some(claim=>/safe|convertible|debt|note/i.test(claim.claim_text))){
      const obligation=populated.find(([name])=>['investment_amount','principal','outstanding_safes','convertible_notes'].includes(name));
      if(obligation){const {data:discovered}=await db.from('claims').insert({application_id:doc.application_id,document_id:documentId,claim_text:`Undisclosed ${doc.document_type==='safe_agreement'?'SAFE or convertible obligation':'debt obligation'} observed in private diligence`,category:'deal_terms',importance:'critical',source_type:'private_discovered_obligation',source_excerpt:obligation[1].excerpt,checkable:true,verification_status:'unverified'}).select('id,claim_text,category').single();if(discovered)claims.push(discovered);}
    }
    const sourceId=documentId;
    await db.from('evidence_sources').upsert({id:sourceId,canonical_url:`private://documents/${documentId}`,source_title:doc.original_filename,source_type:sourceType(doc.document_type),snapshot_storage_path:`${doc.storage_bucket}/${doc.storage_path}`,content_hash:doc.sha256_hash,founder_controlled:true,authoritative_source:['bank_statement','customer_contract','cap_table','incorporation_document'].includes(doc.document_type),independence_cluster:`private-document:${documentId}`},{onConflict:'id'});
    const rows=[];
    for(const claim of claims){
      const normalized=claim.claim_text.toLowerCase().replace(/[^a-z0-9]+/g,'_');
      const candidate=populated.find(([name])=>normalized.includes(name)||name.split('_').every(part=>part.length<3||normalized.includes(part)));
      if(!candidate) continue;
      const [name,fact]=candidate; const excerpt=fact.excerpt||`${name}: ${String(fact.value)}`;
      rows.push({claim_id:claim.id,evidence_source_id:sourceId,document_id:documentId,document_extraction_id:extraction.id,relationship:(claim.claim_text.startsWith('Undisclosed')?'contradicts':'context_only') as 'contradicts'|'context_only',excerpt,excerpt_hash:sha256(excerpt),observed_value:{field:name,value:fact.value,unit:fact.unit??null,currency:fact.currency??null} as unknown as Json,period_start:envelope.periodStart??null,period_end:envelope.periodEnd??null,source_reference:fact.sourceReference,source_quality:quality[doc.document_type]??.3,entity_match:.9,freshness:.9,evidence_completeness:extraction.confidence,model_confidence:extraction.confidence,validation_status:'valid' as const,human_review_status:'pending',authenticity_status:doc.authenticity_status});
    }
    let toInsert=rows;
    if(rows.length){const {data:existing}=await db.from('evidence').select('claim_id,excerpt_hash').eq('evidence_source_id',sourceId);const keys=new Set((existing??[]).map(item=>`${item.claim_id}:${item.excerpt_hash}`));toInsert=rows.filter(item=>!keys.has(`${item.claim_id}:${item.excerpt_hash}`));if(toInsert.length){const {error}=await db.from('evidence').insert(toInsert);if(error)throw new AppError('INTERNAL_ERROR','Private evidence could not be stored',500,{database:error.message});}}
    return {documentId,evidenceCreated:toInsert.length};
  }
}
