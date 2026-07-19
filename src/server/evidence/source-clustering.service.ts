import { sha256 } from '../../lib/hashing.js';
import { log } from '../../lib/logger.js';
import { getServiceClient } from '../supabase.js';
import { refreshDeterministicDecisionState } from '../scoring/decision-state.service.js';
import { recalculateClaimVerificationFromEvidence, type ValidationEvidenceRow } from './evidence-integrity.service.js';
import { canonicalizeEvidenceUrl, detectOriginalPublisher, jaccardSimilarity, normalizedContentHash } from './evidence-normalizer.js';

export type ClusterReason='exact_content_match'|'near_duplicate_content'|'same_press_release'|'same_original_publisher'|'same_corporate_owner'|'founder_controlled'|'manual_grouping'|'unique_source';
export type ClusterSource={id:string;canonical_url:string;snapshot_text:string|null;content_hash:string|null;publisher_name:string|null;founder_controlled:boolean;source_domain:string|null;source_type:string;original_publisher?:string|null};
export type ClusterAssignment={sourceId:string;clusterId:string;reason:ClusterReason;similarity:number|null;canonicalSourceId:string;originalPublisher:string|null;countsAsIndependent:boolean;canonicalUrl:string;contentHash:string};

class UnionFind{private parent=new Map<string,string>();add(id:string){this.parent.set(id,id);}find(id:string):string{const parent=this.parent.get(id)??id;if(parent===id)return id;const root=this.find(parent);this.parent.set(id,root);return root;}union(a:string,b:string){const ra=this.find(a),rb=this.find(b);if(ra===rb)return;this.parent.set(ra,ra<rb?ra:rb);this.parent.set(rb,ra<rb?ra:rb);}}

export function assignIndependenceClusters(sources:ClusterSource[],corporateDomains:Set<string>=new Set()):ClusterAssignment[]{
 const ordered=[...sources].sort((a,b)=>a.id.localeCompare(b.id));const union=new UnionFind();const reason=new Map<string,ClusterReason>();const similarity=new Map<string,number|null>();const original=new Map<string,string|null>();
 for(const source of ordered){union.add(source.id);original.set(source.id,source.original_publisher??detectOriginalPublisher(source.snapshot_text??'',source.publisher_name));}
 const join=(a:ClusterSource,b:ClusterSource,why:ClusterReason,score:number|null)=>{union.union(a.id,b.id);reason.set(a.id,why);reason.set(b.id,why);if(score!==null){similarity.set(a.id,Math.max(similarity.get(a.id)??0,score));similarity.set(b.id,Math.max(similarity.get(b.id)??0,score));}};
 const founder=ordered.filter(source=>source.founder_controlled||corporateDomains.has(source.source_domain??'')||['company_website'].includes(source.source_type));for(let i=1;i<founder.length;i++)join(founder[0]!,founder[i]!,'founder_controlled',1);
 for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length;j++){const a=ordered[i]!,b=ordered[j]!;const aText=a.snapshot_text??'',bText=b.snapshot_text??'';const aHash=normalizedContentHash(aText),bHash=normalizedContentHash(bText);if(aHash===bHash&&aText.trim()){join(a,b,'exact_content_match',1);continue;}let score=jaccardSimilarity(aText,bText);if(score>=.9){join(a,b,'near_duplicate_content',score);continue;}const ao=original.get(a.id),bo=original.get(b.id);if(ao&&bo&&ao===bo){join(a,b,/business wire|pr newswire|press release/.test(ao)?'same_press_release':'same_original_publisher',score);continue;}if(score>=.75&&ao&&bo&&ao===bo)join(a,b,'near_duplicate_content',score);}
 const groups=new Map<string,ClusterSource[]>();for(const source of ordered){const root=union.find(source.id);groups.set(root,[...(groups.get(root)??[]),source]);}
 const stable=new Map<string,string>();for(const [root,members] of groups)stable.set(root,`ind-${sha256(members.map(item=>item.id).sort().join(':')).slice(0,24)}`);
 return ordered.map(source=>{const root=union.find(source.id),members=groups.get(root)??[source],canonical=members[0]!;const controlled=members.some(item=>item.founder_controlled||corporateDomains.has(item.source_domain??'')||item.source_type==='company_website');return{sourceId:source.id,clusterId:stable.get(root)!,reason:controlled?'founder_controlled':reason.get(source.id)??'unique_source',similarity:similarity.get(source.id)??null,canonicalSourceId:canonical.id,originalPublisher:original.get(source.id)??null,countsAsIndependent:!controlled,canonicalUrl:canonicalizeEvidenceUrl(source.canonical_url),contentHash:normalizedContentHash(source.snapshot_text??'')};});
}

export async function clusterEvidenceSources(applicationId:string){
 const db=getServiceClient();const [{data:application},{data:rawSources},{data:rawEvidence},{data:claims}]=await Promise.all([
  db.from('applications').select('company_id,companies(domain)').eq('id',applicationId).single(),
  db.from('evidence_sources').select('*,evidence!inner(claims!inner(application_id))').eq('evidence.claims.application_id',applicationId),
  db.from('evidence').select('*,evidence_sources(*),claims!inner(application_id)').eq('claims.application_id',applicationId),
  db.from('claims').select('id,verification_status,checkable').eq('application_id',applicationId)
 ]);const company=(application as unknown as {companies?:{domain?:string|null}})?.companies;const corporate=new Set<string>(company?.domain?[company.domain]:[]);const assignments=assignIndependenceClusters((rawSources??[]) as unknown as ClusterSource[],corporate);
 for(const item of assignments)await db.from('evidence_sources').update({canonical_url:item.canonicalUrl,content_hash:item.contentHash,independence_cluster:item.clusterId,cluster_reason:item.reason,cluster_similarity:item.similarity,canonical_source_id:item.canonicalSourceId,original_publisher:item.originalPublisher,counts_as_independent:item.countsAsIndependent}).eq('id',item.sourceId);
 const changedClaimIds:string[]=[];for(const claim of claims??[]){if(!claim.checkable)continue;const rows=(rawEvidence??[]).filter(row=>row.claim_id===claim.id).map(row=>{const source=Array.isArray(row.evidence_sources)?row.evidence_sources[0]:row.evidence_sources;const assignment=assignments.find(item=>item.sourceId===row.evidence_source_id);return{...row,evidence_sources:source?{...source,independence_cluster:assignment?.clusterId??null,founder_controlled:!(assignment?.countsAsIndependent??true)}:null};}) as unknown as ValidationEvidenceRow[];const next=recalculateClaimVerificationFromEvidence(rows);await db.from('claims').update({verification_status:next.status,evidence_confidence:next.confidence}).eq('id',claim.id);if(next.status!==claim.verification_status)changedClaimIds.push(claim.id);}
 const {count}=await db.from('scores').select('id',{count:'exact',head:true}).eq('application_id',applicationId).eq('is_current',true);if((count??0)>0)await refreshDeterministicDecisionState(applicationId);
 log('info','Evidence independence clustering completed',{applicationId,sourceCount:assignments.length,changedClaimCount:changedClaimIds.length,service:'source-clustering'});return{assignments,changedClaimIds};
}
