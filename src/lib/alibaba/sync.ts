import { v4 as uuidv4 } from "uuid";

/**
 * Anonymizes child profile and transaction data before sending it
 * to Alibaba Cloud (OSS/DataWorks) for ML training or inference.
 * Strips all PII (Personally Identifiable Information).
 */
export function anonymizeChildAnalyticsPayload(input: {
  childId: string;
  ageGroup: string;
  monthlyAllowance: number;
  responsibilityScore: number;
  recentTransactions: any[];
  rules: any[];
  requests: any[];
}) {
  // Generate a reproducible or random anonymized ID.
  // For production, you could hash the childId with a salt,
  // but for privacy we use a generic UUID per sync or a deterministic hash.
  const anonymizedChildId = `anon_${uuidv4()}`;

  // Aggregate spending without exposing merchant names if possible,
  // or at least strip specific notes.
  let monthlyEssentialSpend = 0;
  let monthlyEducationalSpend = 0;
  let monthlyDiscretionarySpend = 0;
  let savingsContribution = 0;
  let riskyTransactionCount = 0;

  for (const tx of input.recentTransactions) {
    if (tx.transactionType === "spend") {
      if (tx.category === "essential") monthlyEssentialSpend += tx.amount;
      if (tx.category === "educational") monthlyEducationalSpend += tx.amount;
      if (tx.category === "discretionary") monthlyDiscretionarySpend += tx.amount;
    } else if (tx.transactionType === "saving") {
      savingsContribution += tx.amount;
    }
    if (tx.riskFlag) {
      riskyTransactionCount++;
    }
  }

  // Count rules
  const limitHitCount = 0; // In a full implementation, you'd calculate how many times limits were hit.

  return {
    anonymizedChildId,
    ageGroup: input.ageGroup,
    previousAllowance: input.monthlyAllowance,
    currentResponsibilityScore: input.responsibilityScore,
    monthlyEssentialSpend,
    monthlyEducationalSpend,
    monthlyDiscretionarySpend,
    savingsContribution,
    riskyTransactionCount,
    extraRequestCount: input.requests.length,
    limitHitCount,
    timestamp: new Date().toISOString()
  };
}
