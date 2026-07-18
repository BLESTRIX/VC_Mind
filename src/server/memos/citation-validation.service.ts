import type { Json } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';

type MemoClaimReference = { claimId?: unknown };
type CitationClaim = { id: string; verification_status: string };
type CitationEvidence = {
  id: string;
  claim_id: string;
  excerpt: string;
  evidence_sources: { canonical_url: string; snapshot_text: string | null } | Array<{ canonical_url: string; snapshot_text: string | null }> | null;
};

export type ValidationFlag = {
  type: 'missing_evidence' | 'invalid_citation' | 'invalid_excerpt';
  claimId: string;
  evidenceId?: string;
  sourceUrl?: string;
  message: string;
  detectedAt: string;
};

export const normalizeEvidenceText = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

const sourceFor = (evidence: CitationEvidence) => Array.isArray(evidence.evidence_sources) ? evidence.evidence_sources[0] : evidence.evidence_sources;

export function findCitationFlags(claims: CitationClaim[], evidenceRows: CitationEvidence[], detectedAt = new Date().toISOString()): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  for (const claim of claims.filter((item) => item.verification_status !== 'unverified' && item.verification_status !== 'not_checkable')) {
    const rows = evidenceRows.filter((row) => row.claim_id === claim.id);
    if (!rows.length) {
      flags.push({ type: 'missing_evidence', claimId: claim.id, message: 'The memo references an evaluated claim with no stored evidence.', detectedAt });
      continue;
    }
    for (const row of rows) {
      const source = sourceFor(row);
      let validUrl = false;
      if (source?.canonical_url) {
        try { validUrl = ['http:', 'https:'].includes(new URL(source.canonical_url).protocol); } catch { validUrl = false; }
      }
      if (!source || !validUrl) {
        flags.push({ type: 'invalid_citation', claimId: claim.id, evidenceId: row.id, ...(source?.canonical_url ? { sourceUrl: source.canonical_url } : {}), message: 'The cited source URL does not resolve to a stored HTTP(S) evidence source for this claim.', detectedAt });
        continue;
      }
      const excerpt = normalizeEvidenceText(row.excerpt ?? '');
      const retrieved = normalizeEvidenceText(source.snapshot_text ?? '');
      if (!excerpt || !retrieved.includes(excerpt)) {
        flags.push({ type: 'invalid_excerpt', claimId: claim.id, evidenceId: row.id, sourceUrl: source.canonical_url, message: 'The cited excerpt is not present in the retained retrieved text.', detectedAt });
      }
    }
  }
  return flags;
}

const claimIdsFrom = (...groups: Json[]): string[] => {
  const ids = new Set<string>();
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const item of group as MemoClaimReference[]) if (typeof item?.claimId === 'string') ids.add(item.claimId);
  }
  return [...ids];
};

const mergeFlags = (existing: Json, additions: ValidationFlag[]): ValidationFlag[] => {
  const prior = Array.isArray(existing) ? existing as unknown as ValidationFlag[] : [];
  const merged = new Map<string, ValidationFlag>();
  for (const flag of [...prior, ...additions]) merged.set(`${flag.type}:${flag.claimId}:${flag.evidenceId ?? ''}`, flag);
  return [...merged.values()];
};

export class CitationValidationService {
  async validate(applicationId: string) {
    const db = getServiceClient();
    const { data: memo, error: memoError } = await db.from('memos')
      .select('id,verified_claims,unverified_claims,contradicted_claims,validation_flags')
      .eq('application_id', applicationId).eq('is_current', true).single();
    if (memoError) throw memoError;

    const referencedClaimIds = claimIdsFrom(memo.verified_claims, memo.unverified_claims, memo.contradicted_claims);
    if (!referencedClaimIds.length) {
      const { data: coverage } = await db.rpc('application_evidence_coverage', { p_application_id: applicationId });
      await db.from('applications').update({ evidence_coverage: Number(coverage ?? 0) }).eq('id', applicationId);
      return { flags: [], downgradedClaimIds: [], evidenceCoverage: Number(coverage ?? 0) };
    }

    const [{ data: claims, error: claimsError }, { data: evidence, error: evidenceError }] = await Promise.all([
      db.from('claims').select('id,verification_status').eq('application_id', applicationId).in('id', referencedClaimIds),
      db.from('evidence').select('id,claim_id,excerpt,evidence_sources(canonical_url,snapshot_text)').in('claim_id', referencedClaimIds)
    ]);
    if (claimsError) throw claimsError;
    if (evidenceError) throw evidenceError;

    const flags = findCitationFlags(claims ?? [], (evidence ?? []) as unknown as CitationEvidence[]);
    const downgradedClaimIds = [...new Set(flags.map((flag) => flag.claimId))];
    if (downgradedClaimIds.length) {
      const { error: claimError } = await db.from('claims').update({ verification_status: 'unverified', evidence_confidence: null }).in('id', downgradedClaimIds).eq('application_id', applicationId);
      if (claimError) throw claimError;
      const { error: runError } = await db.from('claim_verification_runs').insert(downgradedClaimIds.map((claimId) => ({ claim_id: claimId, status: 'unverified' as const, confidence: null, evidence_count: (evidence ?? []).filter((row) => row.claim_id === claimId).length, reason: 'Downgraded by deterministic citation/excerpt validation.' })));
      if (runError) throw runError;
    }

    const { data: coverage, error: coverageError } = await db.rpc('application_evidence_coverage', { p_application_id: applicationId });
    if (coverageError) throw coverageError;
    const evidenceCoverage = Number(coverage ?? 0);
    const { error: applicationError } = await db.from('applications').update({ evidence_coverage: evidenceCoverage }).eq('id', applicationId);
    if (applicationError) throw applicationError;
    if (flags.length) {
      const { error: flagError } = await db.from('memos').update({ validation_flags: mergeFlags(memo.validation_flags, flags) as unknown as Json }).eq('id', memo.id).eq('is_current', true);
      if (flagError) throw flagError;
    }
    return { flags, downgradedClaimIds, evidenceCoverage };
  }
}
