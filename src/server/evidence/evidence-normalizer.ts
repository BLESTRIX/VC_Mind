import type { EvidenceSourceType } from '../../types/database.js';
import { sha256 } from '../../lib/hashing.js';
export function classifySource(domain:string,companyDomain?:string|null):EvidenceSourceType{if(companyDomain&&domain===companyDomain)return'company_website';if(domain==='github.com')return'github';if(domain.endsWith('.gov')||domain.endsWith('.gov.uk')||domain.endsWith('.gc.ca'))return'government';if(/crunchbase|pitchbook|tracxn/.test(domain))return'database';if(/linkedin|x\.com|twitter/.test(domain))return'social_profile';return'news';}
export function independenceCluster(domain:string,title:string):string{return `${domain}:${title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(' ').slice(0,6).join('-')}`.slice(0,250);}
const tracking=/^(utm_[a-z]+|gclid|fbclid|mc_cid|mc_eid|ref|source)$/i;
export function canonicalizeEvidenceUrl(raw:string,canonicalLink?:string|null,redirectUrl?:string|null):string{
 const preferred=canonicalLink||redirectUrl||raw;const url=new URL(preferred);
 url.protocol=url.protocol.toLowerCase();url.hostname=url.hostname.toLowerCase().replace(/^www\./,'');url.hash='';
 for(const key of [...url.searchParams.keys()])if(tracking.test(key))url.searchParams.delete(key);
 url.pathname=url.pathname.replace(/\/(amp|print)\/?$/i,'').replace(/\/$/,'')||'/';
 url.searchParams.sort();return url.toString();
}
export function normalizeSourceText(text:string):string{return text.normalize('NFKC').toLowerCase().replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/(?:cookie policy|privacy policy|all rights reserved|subscribe to our newsletter)/gi,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
export function normalizedContentHash(text:string):string{return sha256(normalizeSourceText(text));}
export function wordShingles(text:string,size=5):Set<string>{const words=normalizeSourceText(text).split(' ').filter(Boolean);const shingles=new Set<string>();if(words.length<size){if(words.length)shingles.add(words.join(' '));return shingles;}for(let i=0;i<=words.length-size;i++)shingles.add(words.slice(i,i+size).join(' '));return shingles;}
export function jaccardSimilarity(left:string,right:string):number{const a=wordShingles(left),b=wordShingles(right);if(!a.size&&!b.size)return 1;if(!a.size||!b.size)return 0;let intersection=0;for(const value of a)if(b.has(value))intersection++;return intersection/(a.size+b.size-intersection);}
export function detectOriginalPublisher(text:string,publisherName?:string|null):string|null{const normalized=text.replace(/\s+/g,' ');const patterns=[/(?:originally published by|according to|via|source:)\s+([A-Z][A-Za-z0-9 .&'-]{2,80})/i,/\b(Business Wire|PR Newswire)\b/i,/(?:press release|company announcement)\s+(?:from|by)\s+([A-Z][A-Za-z0-9 .&'-]{2,80})/i];for(const pattern of patterns){const match=normalized.match(pattern);if(match?.[1])return match[1].trim().toLowerCase();}return publisherName?.trim().toLowerCase()||null;}
