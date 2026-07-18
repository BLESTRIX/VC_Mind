export type ConfidenceEvidence = { sourceQuality: number; entityMatch: number; completeness: number; freshness?: number | null | undefined; relationship: string; independenceCluster?: string | null | undefined; founderControlled?: boolean | undefined };

export function evidenceConfidence(items: ConfidenceEvidence[]): number {
  const relevant = items.filter((item) => item.relationship !== 'context_only');
  if (!relevant.length) return 0;
  const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const sourceQuality = average(relevant.map((item) => item.sourceQuality));
  const entityMatch = average(relevant.map((item) => item.entityMatch));
  const completeness = average(relevant.map((item) => item.completeness));
  const freshness = average(relevant.map((item) => item.freshness ?? 0.5));
  const independentClusters = new Set(relevant.filter((item) => !item.founderControlled && item.independenceCluster).map((item) => item.independenceCluster)).size;
  const independentConfirmation = Math.min(1, independentClusters / 2);
  return Math.max(0, Math.min(1, sourceQuality * 0.30 + entityMatch * 0.25 + independentConfirmation * 0.20 + completeness * 0.15 + freshness * 0.10));
}
