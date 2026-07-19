type Row = Record<string, any>;

const sourceRow = (value: unknown): Row => Array.isArray(value) ? (value[0] ?? {}) : ((value as Row | null) ?? {});

export function compactApplication(application: Row): Row {
  const company = sourceRow(application.companies);
  const thesis = sourceRow(application.thesis_configs);
  return {
    id: application.id,
    recommendation: application.recommendation,
    fundingAskUsd: application.funding_ask_usd,
    valuationCapUsd: application.valuation_cap_usd,
    preMoneyValuationUsd: application.pre_money_valuation_usd,
    postMoneyValuationUsd: application.post_money_valuation_usd,
    investmentScore: application.investment_score,
    evidenceCoverage: application.evidence_coverage,
    company: {
      name: company.name,
      websiteUrl: company.website_url,
      sector: company.sector,
      stage: company.stage,
      geography: company.geography,
      productDescription: company.product_description
    },
    thesis: {
      name: thesis.name,
      sectors: thesis.sectors,
      stages: thesis.stages,
      geographies: thesis.geographies,
      minimumCheckSizeUsd: thesis.minimum_check_size_usd,
      maximumCheckSizeUsd: thesis.maximum_check_size_usd,
      ownershipTargetPercentage: thesis.ownership_target_percentage,
      riskAppetite: thesis.risk_appetite,
      focusNote: thesis.focus_note
    }
  };
}

export const compactClaim = (claim: Row): Row => ({
  id: claim.id,
  claimText: claim.claim_text,
  category: claim.category,
  importance: claim.importance,
  sourceExcerpt: claim.source_excerpt,
  checkable: claim.checkable,
  verificationStatus: claim.verification_status,
  evidenceConfidence: claim.evidence_confidence
});

export function compactEvidence(evidence: Row): Row {
  const source = sourceRow(evidence.evidence_sources);
  return {
    id: evidence.id,
    claimId: evidence.claim_id,
    evidenceSourceId: evidence.evidence_source_id,
    relationship: evidence.relationship,
    excerpt: evidence.excerpt,
    sourceQuality: evidence.source_quality,
    entityMatch: evidence.entity_match,
    evidenceCompleteness: evidence.evidence_completeness,
    modelConfidence: evidence.model_confidence,
    source: {
      title: source.title,
      url: source.url,
      domain: source.domain,
      sourceType: source.source_type,
      authoritative: source.authoritative_source,
      founderControlled: source.founder_controlled
    }
  };
}

export const compactScore = (score: Row): Row => ({
  dimension: score.dimension,
  score: score.score,
  weight: score.weight,
  weightedScore: score.weighted_score,
  explanation: score.explanation,
  evidenceCount: score.evidence_count
});

export const compactDeal = (deal: Row | null): Row | null => deal ? ({
  proposedCheckSizeUsd: deal.proposed_check_size_usd,
  preMoneyValuationUsd: deal.pre_money_valuation_usd,
  postMoneyValuationUsd: deal.post_money_valuation_usd,
  impliedOwnershipPercentage: deal.implied_ownership_percentage,
  expectedReturnMultiple: deal.expected_return_multiple,
  calculationInputs: deal.calculation_inputs
}) : null;
