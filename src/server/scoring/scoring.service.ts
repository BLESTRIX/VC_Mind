import { AppError } from '../../lib/errors.js';
import type { TablesInsert } from '../../types/database.js';
import { getServiceClient } from '../supabase.js';
import { SCORE_WEIGHTS, SCORING_VERSION, validateWeights } from './scoring.config.js';
import type { DimensionScores } from './scoring.types.js';
import { recommend } from './recommendation.service.js';
import { calculateEvidenceCoverage } from '../evidence/evidence-coverage.js';
const bounded = (value: number) => Math.max(0, Math.min(10, value));
export function rubricTotal(scores: Record<string, number>): number { return bounded(Object.values(scores).reduce((sum, value) => sum + Math.max(0, Math.min(2, value)), 0)); }
export function overallScore(scores: DimensionScores): number { validateWeights(); return (Object.entries(SCORE_WEIGHTS) as Array<[keyof DimensionScores, number]>).reduce((sum, [key, weight]) => sum + scores[key] * weight, 0); }
export function hasCriticalContradiction(claims: Array<{ importance: string; verification_status: string }>): boolean { return claims.some((claim) => claim.verification_status === 'contradicted' && (claim.importance === 'high' || claim.importance === 'critical')); }

export class ScoringService {
  async calculate(applicationId: string) {
    const db = getServiceClient();
    const [{ data: jobs }, { data: claims }, { data: deal }, { data: thesis }] = await Promise.all([
      db.from('processing_jobs').select('job_type,result').eq('application_id', applicationId).eq('status', 'completed'), db.from('claims').select('importance,verification_status,category,checkable').eq('application_id', applicationId), db.from('deal_economics').select('*').eq('application_id', applicationId).maybeSingle(), db.from('scores').select('*').eq('application_id', applicationId).eq('dimension', 'thesis_fit').eq('is_current', true).maybeSingle()
    ]);
    const resultFor = (name: string) => jobs?.find((job) => job.job_type === `run_${name}_diligence`)?.result as { rubricScores?: Record<string, number> } | null;
    const scores: DimensionScores = { founder: rubricTotal(resultFor('founder')?.rubricScores ?? {}), market: rubricTotal(resultFor('market')?.rubricScores ?? {}), traction: rubricTotal(resultFor('traction')?.rubricScores ?? {}), product: rubricTotal(resultFor('product')?.rubricScores ?? {}), thesis_fit: Number(thesis?.score ?? 0), deal_economics: Number((deal?.calculation_inputs as { score?: number } | null)?.score ?? 0), risk_resilience: bounded(10 - (claims ?? []).filter((claim) => claim.verification_status === 'contradicted').length * 3 - (claims ?? []).filter((claim) => claim.importance === 'critical' && claim.verification_status === 'unverified').length * 2) };
    const overall = overallScore(scores); const coverage = calculateEvidenceCoverage(claims ?? []); const evidenceCoverage = coverage.coveragePercentage;
    const recommendation = recommend({ scores, overall, evidenceCoverage, hasCheckableClaims: coverage.hasCheckableClaims, hardThesisFailure: scores.thesis_fit < 5, criticalContradiction: hasCriticalContradiction(claims ?? []), unresolvedBlockingRisk: (claims ?? []).some((claim) => claim.importance === 'critical' && ['unverified', 'partially_verified'].includes(claim.verification_status)), unacceptableDealEconomics: scores.deal_economics < 3, materialDataInconsistency: (claims ?? []).filter((claim) => claim.verification_status === 'contradicted').length >= 2, incompleteCriticalDiligence: (claims ?? []).some((claim) => claim.importance === 'critical' && claim.verification_status === 'unverified'), missingPrivateTractionValidation: !(claims ?? []).some((claim) => claim.category === 'traction' && claim.verification_status === 'verified'), missingDealTerms: !(claims ?? []).some((claim) => claim.category === 'deal_terms' && claim.verification_status === 'verified') });
    const evidenceCount = (claims ?? []).filter((claim) => claim.verification_status !== 'unverified').length;
    const rows: TablesInsert<'scores'>[] = (Object.entries(scores) as Array<[keyof DimensionScores, number]>).map(([dimension, score]) => ({ application_id: applicationId, dimension, score, weight: SCORE_WEIGHTS[dimension], weighted_score: score * SCORE_WEIGHTS[dimension], explanation: `Deterministic ${dimension} score using rubric version ${SCORING_VERSION}.`, evidence_count: evidenceCount, scoring_version: SCORING_VERSION }));
    rows.push({ application_id: applicationId, dimension: 'overall', score: overall, weight: 1, weighted_score: overall, explanation: recommendation.explanation, evidence_count: evidenceCount, scoring_version: SCORING_VERSION });
    const { data: existingScores } = await db.from('scores').select('dimension,score,weight,weighted_score,evidence_count,scoring_version').eq('application_id', applicationId).eq('is_current', true);
    const unchanged = rows.length === (existingScores ?? []).length && rows.every((row) => (existingScores ?? []).some((current) => current.dimension === row.dimension && Number(current.score) === Number(row.score) && Number(current.weight) === Number(row.weight) && Number(current.weighted_score) === Number(row.weighted_score) && current.evidence_count === row.evidence_count && current.scoring_version === row.scoring_version));
    if (!unchanged) { const { error } = await db.from('scores').insert(rows); if (error) throw new AppError('INTERNAL_ERROR', 'Scores could not be stored', 500, { database: error.message }); }
    await db.from('applications').update({ investment_score: overall, evidence_coverage: evidenceCoverage, recommendation: recommendation.recommendation }).eq('id', applicationId);
    return { scores, overall, evidenceCoverage, recommendation };
  }
}
