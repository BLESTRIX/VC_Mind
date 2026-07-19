import { z } from 'zod';
import type { Json } from '../../types/database.js';
import type { PrivateDocumentType } from './private-diligence.types.js';

const fact = z.object({ value: z.union([z.string(), z.number(), z.boolean()]).nullable(), unit: z.string().nullable().default(null), currency: z.string().nullable().default(null), sourceReference: z.string(), excerpt: z.string() }).strict();
const extractionEnvelope = z.object({ documentType: z.string(), facts: z.record(z.string(), fact), periodStart: z.string().nullable(), periodEnd: z.string().nullable(), sourceSystem: z.string().nullable() }).strict();
export const EXTRACTION_VERSION = 'private-extract-v1';

const fields: Record<PrivateDocumentType, string[]> = {
  cap_table: ['legal_company_name','share_classes','founder_ownership','investor_ownership','option_pool','fully_diluted_shares','outstanding_safes','convertible_notes','total_dilution','as_of_date'],
  safe_agreement: ['investment_amount','valuation_cap','discount','mfn','pro_rata_rights','structure','existing_obligations','closing_conditions'],
  term_sheet: ['investment_amount','valuation_cap','discount','mfn','pro_rata_rights','structure','existing_obligations','closing_conditions'],
  revenue_export: ['monthly_revenue','mrr','arr','transaction_count','unique_paying_customers','refunds','failed_payments','growth_rate','customer_concentration','period_covered','currency'],
  bank_statement: ['monthly_revenue','transactions','closing_balance','period_covered','currency'],
  customer_contract: ['customer_name','paying_status','contract_value','start_date','renewal_date','churn','retention','cohort','concentration'],
  customer_list: ['customer_name','paying_status','contract_value','start_date','renewal_date','churn','retention','cohort','concentration'],
  retention_report: ['customer_name','paying_status','contract_value','start_date','renewal_date','churn','retention','cohort','concentration'],
  product_analytics: ['active_users','retention','engagement','usage_period','growth','conversion','source_system'],
  financial_model: ['monthly_revenue','mrr','arr','growth_rate','currency','period_covered'],
  incorporation_document: ['legal_name','registration_number','jurisdiction','incorporation_date','directors','registered_address','company_status'],
  identity_document: ['legal_name','document_status'], debt_schedule: ['principal','interest_rate','maturity_date','lender','currency'], other: []
};

const labels: Record<string, RegExp> = {
  mrr: /\bMRR\b\s*[:=-]?\s*([$€£]?[\d,.]+)/i, arr: /\bARR\b\s*[:=-]?\s*([$€£]?[\d,.]+)/i,
  founder_ownership: /founder ownership\s*[:=-]?\s*([\d.]+\s*%)/i, option_pool: /option pool\s*[:=-]?\s*([\d.]+\s*%)/i,
  valuation_cap: /valuation cap\s*[:=-]?\s*([$€£]?[\d,.]+)/i, discount: /discount\s*[:=-]?\s*([\d.]+\s*%)/i,
  active_users: /active users\s*[:=-]?\s*([\d,.]+)/i, retention: /retention\s*[:=-]?\s*([\d.]+\s*%)/i,
  legal_name: /legal (?:company )?name\s*[:=-]?\s*([^\r\n,;]+)/i, legal_company_name: /(?:legal )?company name\s*[:=-]?\s*([^\r\n,;]+)/i,
  registration_number: /registration (?:number|no\.?|#)\s*[:=-]?\s*([\w-]+)/i, jurisdiction: /jurisdiction\s*[:=-]?\s*([^\r\n,;]+)/i,
  incorporation_date: /incorporation date\s*[:=-]?\s*([^\r\n,;]+)/i, company_status: /company status\s*[:=-]?\s*([^\r\n,;]+)/i,
  investment_amount: /investment amount\s*[:=-]?\s*([$€£]?[\d,.]+)/i, fully_diluted_shares: /fully diluted shares\s*[:=-]?\s*([\d,.]+)/i,
  outstanding_safes: /outstanding SAFEs?\s*[:=-]?\s*([$€£]?[\d,.]+)/i, convertible_notes: /convertible notes?\s*[:=-]?\s*([$€£]?[\d,.]+)/i
};
const valueOf = (raw: string): string | number => {
  const normalized = raw.trim();
  if (/^[$€£]?[\d,.]+%?$/.test(normalized)) {
    const parsed = Number(normalized.replace(/[$€£,%]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return normalized;
};
const unitOf = (raw: string) => raw.includes('%') ? 'percentage' : /^[\d,.]+$/.test(raw.trim()) ? 'count' : null;
const currencyOf = (raw: string) => raw.includes('$') ? 'USD' : raw.includes('€') ? 'EUR' : raw.includes('£') ? 'GBP' : null;

export function extractStructuredFacts(documentType: PrivateDocumentType, text: string, sourceSystem: string | null = null) {
  const facts: Record<string, z.infer<typeof fact>> = {};
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);
  for (const field of fields[documentType]) {
    const regex = labels[field];
    if (!regex) continue;
    const match = regex.exec(text);
    if (!match?.[1]) continue;
    const lineIndex = lines.findIndex((line) => line.includes(match[0]));
    const raw = match[1].trim();
    facts[field] = { value: valueOf(raw), unit: unitOf(raw), currency: currencyOf(raw), sourceReference: `line ${Math.max(1, lineIndex + 1)}`, excerpt: match[0].slice(0, 500) };
  }
  if (!Object.keys(facts).length) warnings.push('No supported structured facts were detected; missing values remain null.');
  for (const field of fields[documentType]) if (!(field in facts)) facts[field] = { value: null, unit: null, currency: null, sourceReference: 'not found', excerpt: '' };
  const output = extractionEnvelope.parse({ documentType, facts, periodStart: null, periodEnd: null, sourceSystem });
  const populated = Object.values(facts).filter((item) => item.value !== null).length;
  return { structuredData: output as unknown as Json, warnings, confidence: fields[documentType].length ? Number((populated / fields[documentType].length).toFixed(2)) : 0 };
}

export function validateExtractionOutput(value: unknown) { return extractionEnvelope.parse(value); }
