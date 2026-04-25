// ─────────────────────────────────────────────
//  Responsibility Score Engine
// ─────────────────────────────────────────────

import type { Transaction, AllowanceRule, ExtraAllowanceRequest, Goal } from '@/types';

interface ScoringInput {
  transactions: Transaction[];
  rules: AllowanceRule[];
  goals: Goal[];
  extraRequests: ExtraAllowanceRequest[];
  currentScore: number;
}

interface ScoringResult {
  score: number;
  breakdown: { label: string; impact: number; positive: boolean }[];
}

export function calculateResponsibilityScore(input: ScoringInput): ScoringResult {
  let score = input.currentScore || 70;
  const breakdown: ScoringResult['breakdown'] = [];

  // Count transactions by category
  const categoryCounts = input.transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSpending = input.transactions
    .filter((t) => t.transactionType === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  const discretionarySpending = input.transactions
    .filter((t) => t.category === 'discretionary' || t.category === 'risky')
    .reduce((sum, t) => sum + t.amount, 0);

  const essentialSpending = input.transactions
    .filter((t) => t.category === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);

  // +10 if savings goal contribution exists
  const hasSavingsContribution = input.transactions.some((t) => t.transactionType === 'saving');
  const activeGoals = input.goals.filter((g) => g.status === 'active' && g.currentAmount > 0);

  if (hasSavingsContribution || activeGoals.length > 0) {
    score += 10;
    breakdown.push({ label: 'Savings contribution', impact: 10, positive: true });
  }

  // +5 if essential spending is stable (>40% of total)
  if (totalSpending > 0 && essentialSpending / totalSpending > 0.4) {
    score += 5;
    breakdown.push({ label: 'Stable essential spending', impact: 5, positive: true });
  }

  // +5 if no risky transactions
  const riskyCount = categoryCounts['risky'] || 0;
  if (riskyCount === 0) {
    score += 5;
    breakdown.push({ label: 'No risky transactions', impact: 5, positive: true });
  }

  // +5 if child stayed within limits
  const withinLimits = checkWithinLimits(input.transactions, input.rules);
  if (withinLimits) {
    score += 5;
    breakdown.push({ label: 'Stayed within limits', impact: 5, positive: true });
  }

  // -10 for risky transaction
  if (riskyCount > 0) {
    score -= 10;
    breakdown.push({ label: 'Risky transactions detected', impact: -10, positive: false });
  }

  // -10 for high discretionary spending (>50% of total)
  if (totalSpending > 0 && discretionarySpending / totalSpending > 0.5) {
    score -= 10;
    breakdown.push({ label: 'High discretionary spending', impact: -10, positive: false });
  }

  // -5 for frequent extra allowance requests (3+ in period)
  const pendingOrRecentRequests = input.extraRequests.filter(
    (r) => r.status === 'pending' || r.status === 'approved'
  );
  if (pendingOrRecentRequests.length >= 3) {
    score -= 5;
    breakdown.push({ label: 'Frequent extra allowance requests', impact: -5, positive: false });
  }

  // -10 for repeatedly maxing out limits
  if (!withinLimits) {
    score -= 10;
    breakdown.push({ label: 'Budget limits exceeded', impact: -10, positive: false });
  }

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, breakdown };
}

function checkWithinLimits(transactions: Transaction[], rules: AllowanceRule[]): boolean {
  if (rules.length === 0) return true;

  for (const rule of rules) {
    if (!rule.isActive) continue;
    const categorySpending = transactions
      .filter((t) => t.category === rule.category && t.transactionType === 'spend')
      .reduce((sum, t) => sum + t.amount, 0);
    if (categorySpending > rule.amount) return false;
  }
  return true;
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#3b82f6';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
