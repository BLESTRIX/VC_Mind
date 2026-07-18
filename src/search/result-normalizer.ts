import { AppError } from '../lib/errors.js';
const tracking = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid']);
export function normalizeUrl(raw: string): { url: string; domain: string } {
  let url: URL; try { url = new URL(raw); } catch { throw new AppError('SEARCH_PROVIDER_ERROR','Search provider returned an invalid URL',502); }
  if (!['http:','https:'].includes(url.protocol)) throw new AppError('SEARCH_PROVIDER_ERROR','Unsafe evidence URL protocol',502);
  url.hash=''; for (const key of [...url.searchParams.keys()]) if (tracking.has(key.toLowerCase())) url.searchParams.delete(key);
  url.hostname=url.hostname.toLowerCase().replace(/^www\./,''); if (url.pathname !== '/') url.pathname=url.pathname.replace(/\/$/,'');
  return { url:url.toString(), domain:url.hostname };
}
export function stripMarkup(value: string, max=12000): string { return value.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,max); }
