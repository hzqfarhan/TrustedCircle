// ─────────────────────────────────────────────
//  AI Classification Engine
// ─────────────────────────────────────────────

import type { TransactionCategory, NeedWant } from '@/types';

interface ClassificationResult {
  category: TransactionCategory;
  needWant: NeedWant;
  riskFlag: boolean;
}

const MERCHANT_RULES: { pattern: RegExp; category: TransactionCategory; needWant: NeedWant }[] = [
  // Essential / Need
  { pattern: /food|cafeteria|canteen|kantin|restaurant|nasi|makan|kedai/i, category: 'essential', needWant: 'need' },
  { pattern: /transport|bus|train|lrt|mrt|grab|taxi|petrol|parking/i, category: 'essential', needWant: 'need' },
  { pattern: /groceries|grocery|market|pasar|mini ?market/i, category: 'essential', needWant: 'need' },
  { pattern: /pharmacy|clinic|hospital|medical|ubat/i, category: 'essential', needWant: 'need' },

  // Educational / Need
  { pattern: /book|bookstore|kedai buku|stationery|school|sekolah|tuition|kelas/i, category: 'educational', needWant: 'need' },
  { pattern: /education|learn|course|seminar/i, category: 'educational', needWant: 'need' },

  // Savings / Neutral
  { pattern: /sav(e|ing)|tabung|simpan|deposit/i, category: 'savings', needWant: 'neutral' },

  // Discretionary / Want
  { pattern: /game|gaming|steam|playstation|xbox|roblox|play ?store|app ?store/i, category: 'discretionary', needWant: 'want' },
  { pattern: /entertainment|cinema|movie|wayang|spotify|netflix|youtube/i, category: 'discretionary', needWant: 'want' },
  { pattern: /cloth(es|ing)|fashion|shoe|kasut|baju|shopping|mall/i, category: 'discretionary', needWant: 'want' },
  { pattern: /snack|candy|gula|bubble ?tea|boba|ice ?cream/i, category: 'discretionary', needWant: 'want' },
];

const RISKY_AMOUNT_THRESHOLD = 100; // RM — unusually high for a child

export function classifyTransaction(
  merchant: string,
  amount: number,
  note?: string
): ClassificationResult {
  const searchText = `${merchant} ${note || ''}`.toLowerCase();

  // Check against known rules
  for (const rule of MERCHANT_RULES) {
    if (rule.pattern.test(searchText)) {
      return {
        category: rule.category,
        needWant: rule.needWant,
        riskFlag: false,
      };
    }
  }

  // If unknown + high amount = risky
  if (amount >= RISKY_AMOUNT_THRESHOLD) {
    return { category: 'risky', needWant: 'want', riskFlag: true };
  }

  // Default: discretionary
  return { category: 'discretionary', needWant: 'want', riskFlag: false };
}

export function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    essential: 'Essential',
    educational: 'Educational',
    savings: 'Savings',
    discretionary: 'Discretionary',
    risky: 'Risky',
  };
  return labels[category] || category;
}

export function getCategoryColor(category: TransactionCategory): { bg: string; text: string; border: string } {
  const colors: Record<TransactionCategory, { bg: string; text: string; border: string }> = {
    essential: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    educational: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    savings: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    discretionary: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    risky: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  return colors[category] || colors.discretionary;
}

