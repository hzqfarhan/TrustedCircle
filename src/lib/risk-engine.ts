// ─────────────────────────────────────────────
//  Trusted Circle — AI Risk Scoring Engine
// ─────────────────────────────────────────────

export interface RiskInput {
  amount: number;
  senderId?: string;
  recipientId?: string;
  recipientAccountId?: string; // raw string for flagged check
  userAvgAmount?: number; // caller passes pre-computed avg
  isNewRecipient?: boolean;
  isFlaggedRecipient?: boolean;
  transactionHour?: number; // 0–23
  isChildOutsideZone?: boolean;
  failedAttempts?: number;
  isUnusualCategory?: boolean;
  highThresholdAmount?: number; // configurable, default 1000
}

export interface RiskResult {
  score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  recommendedActions: string[];
}

export function assessRisk(input: RiskInput): RiskResult {
  let score = 0;
  const reasons: string[] = [];
  const actions: string[] = [];

  const HIGH_THRESHOLD = input.highThresholdAmount ?? 1000;

  // Rule 1 – Amount vs personal average
  if (input.userAvgAmount && input.userAvgAmount > 0) {
    const ratio = input.amount / input.userAvgAmount;
    if (ratio >= 6) {
      score += 25;
      reasons.push(
        `Amount is ${ratio.toFixed(1)}× higher than your usual transfers`
      );
    } else if (ratio >= 3) {
      score += 15;
      reasons.push(`Amount is notably higher than your usual spend pattern`);
    }
  }

  // Rule 2 – High absolute threshold
  if (input.amount >= HIGH_THRESHOLD) {
    score += 20;
    reasons.push(
      `Transfer exceeds high-amount threshold of RM${HIGH_THRESHOLD}`
    );
    actions.push("Consider splitting into smaller transfers or using DuitNow");
  }

  // Rule 3 – New recipient
  if (input.isNewRecipient) {
    score += 15;
    reasons.push("Recipient has never received funds from this wallet before");
    actions.push("Double-check recipient details before proceeding");
  }

  // Rule 4 – Flagged recipient
  if (input.isFlaggedRecipient) {
    score += 35;
    reasons.push(
      "Destination account is in the fraud alert list (CCID/PDRM flagged)"
    );
    actions.push("Do NOT proceed — report this account via CCID portal");
  }

  // Rule 5 – Odd hours (12am–5am)
  const hour = input.transactionHour ?? new Date().getHours();
  if (hour >= 0 && hour < 5) {
    score += 10;
    reasons.push("Transaction attempted during unusual hours (midnight–5am)");
  }

  // Rule 6 – Child outside allowed zone
  if (input.isChildOutsideZone) {
    score += 40;
    reasons.push(
      "Transaction attempted outside child's allowed geolocation zone"
    );
    actions.push("Parent approval required to override zone restriction");
  }

  // Rule 7 – Repeated failed attempts
  if (input.failedAttempts && input.failedAttempts >= 2) {
    score += 15;
    reasons.push(
      `${input.failedAttempts} previous failed transfer attempts detected`
    );
    actions.push("Review recent activity for potential unauthorized access");
  }

  // Rule 8 – Unusual category spike
  if (input.isUnusualCategory) {
    score += 15;
    reasons.push("Spending category spike detected outside normal behavior");
  }

  const score_final = Math.min(score, 100);

  const severity: RiskResult["severity"] =
    score_final >= 60 ? "HIGH" : score_final >= 25 ? "MEDIUM" : "LOW";

  if (severity === "HIGH" && actions.length === 0) {
    actions.push("Require trusted member approval before releasing funds");
  }
  if (severity === "MEDIUM" && actions.length === 0) {
    actions.push("Verify via OTP before completing this transfer");
  }
  if (severity === "LOW" && reasons.length === 0) {
    reasons.push("No anomalies detected for this transaction");
  }

  return {
    score: score_final,
    severity,
    reasons,
    recommendedActions: actions,
  };
}

export function formatSeverityColor(severity: string) {
  if (severity === "HIGH") return "text-red-500";
  if (severity === "MEDIUM") return "text-amber-500";
  return "text-emerald-500";
}

export function formatSeverityBg(severity: string) {
  if (severity === "HIGH") return "bg-red-50 border-red-200";
  if (severity === "MEDIUM") return "bg-amber-50 border-amber-200";
  return "bg-emerald-50 border-emerald-200";
}
