import type { ReconciliationInput, ReconciliationThresholds, ClaimReconciliationResult } from './private-diligence.types.js';

export const DEFAULT_RECONCILIATION_THRESHOLDS: ReconciliationThresholds = { matched: 5, approximate: 10 };
export const CATEGORY_THRESHOLDS: Record<string, ReconciliationThresholds> = {
  traction: { matched: 5, approximate: 10 }, financial: { matched: 3, approximate: 7 },
  deal_terms: { matched: 1, approximate: 3 }, legal: { matched: 0, approximate: 0 }
};

const numeric = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/[$,%\s,]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const samePeriod = (input: ReconciliationInput) => !input.periodStart && !input.periodEnd ||
  input.periodStart === input.observedPeriodStart && input.periodEnd === input.observedPeriodEnd;

export function reconcileClaim(input: ReconciliationInput, configured?: Partial<Record<string, ReconciliationThresholds>>): ClaimReconciliationResult {
  const base = { claimId: input.claimId, claimedValue: input.claimedValue, observedValue: input.observedValue, unit: input.unit, periodStart: input.periodStart, periodEnd: input.periodEnd, supportingDocumentIds: input.supportingDocumentIds ?? [] };
  if (input.specialCase === 'undisclosed_convertible') return { ...base, result: 'mismatched', material: true, severity: 'critical', explanation: 'A SAFE or convertible obligation was observed but not disclosed in the existing claims.' };
  if (input.specialCase === 'legal_entity') return { ...base, result: 'mismatched', material: true, severity: 'critical', explanation: 'The observed legal entity does not match the claimed entity; closing is blocked pending human review.' };
  if (input.claimedValue == null || input.observedValue == null) return { ...base, result: 'insufficient_data', material: false, severity: 'low', explanation: 'A claimed or observed value is missing.' };
  if (input.unit && input.observedUnit && input.unit.toLowerCase() !== input.observedUnit.toLowerCase()) return { ...base, result: 'insufficient_data', material: false, severity: 'medium', explanation: 'Units or currencies differ and cannot be normalized safely.' };
  if (!samePeriod(input)) return { ...base, result: 'insufficient_data', material: false, severity: 'medium', explanation: 'Reporting periods differ and cannot be normalized safely.' };
  const claimed = numeric(input.claimedValue); const observed = numeric(input.observedValue);
  if (claimed !== undefined && observed !== undefined) {
    const variance = claimed === 0 ? (observed === 0 ? 0 : 100) : Math.abs(observed - claimed) / Math.abs(claimed) * 100;
    const rounded = Number(variance.toFixed(2));
    const thresholds = configured?.[input.category] ?? CATEGORY_THRESHOLDS[input.category] ?? DEFAULT_RECONCILIATION_THRESHOLDS;
    if (variance === 0) return { ...base, result: 'matched', variancePercentage: rounded, material: false, severity: 'low', explanation: 'Observed and claimed numeric values match exactly.' };
    if (variance <= thresholds.matched) return { ...base, result: 'approximately_matched', variancePercentage: rounded, material: false, severity: 'low', explanation: `Variance of ${rounded}% is within the configured match tolerance.` };
    if (variance <= thresholds.approximate) return { ...base, result: 'approximately_matched', variancePercentage: rounded, material: false, severity: 'medium', explanation: `Variance of ${rounded}% is within the configured approximate-match tolerance.` };
    const ownership = input.specialCase === 'founder_ownership';
    return { ...base, result: 'mismatched', variancePercentage: rounded, material: true, severity: ownership && variance > 20 ? 'critical' : ownership ? 'high' : variance > 30 ? 'high' : 'medium', explanation: `Variance of ${rounded}% exceeds the configured materiality threshold.` };
  }
  const matched = String(input.claimedValue).trim().toLowerCase() === String(input.observedValue).trim().toLowerCase();
  return { ...base, result: matched ? 'matched' : 'mismatched', material: !matched, severity: matched ? 'low' : input.category === 'legal' ? 'high' : 'medium', explanation: matched ? 'Observed and claimed values match.' : 'Observed and claimed values differ.' };
}
