import type { ReconciliationResult, ReconciliationSeverity } from '../../types/database.js';

export const PRIVATE_DOCUMENT_TYPES = ['cap_table','safe_agreement','term_sheet','revenue_export','bank_statement','customer_contract','customer_list','retention_report','product_analytics','financial_model','incorporation_document','identity_document','debt_schedule','other'] as const;
export type PrivateDocumentType = typeof PRIVATE_DOCUMENT_TYPES[number];

export type ClaimReconciliationResult = {
  claimId: string;
  claimedValue?: unknown;
  observedValue?: unknown;
  unit?: string | undefined;
  periodStart?: string | undefined;
  periodEnd?: string | undefined;
  result: ReconciliationResult;
  variancePercentage?: number;
  material: boolean;
  severity: ReconciliationSeverity;
  explanation: string;
  supportingDocumentIds: string[];
};

export type ReconciliationInput = {
  claimId: string;
  category: string;
  claimText?: string;
  claimedValue?: unknown;
  observedValue?: unknown;
  unit?: string | undefined;
  observedUnit?: string | undefined;
  periodStart?: string | undefined;
  periodEnd?: string | undefined;
  observedPeriodStart?: string | undefined;
  observedPeriodEnd?: string | undefined;
  supportingDocumentIds?: string[];
  specialCase?: 'undisclosed_convertible'|'founder_ownership'|'legal_entity' | undefined;
};

export type ReconciliationThresholds = { matched: number; approximate: number };
