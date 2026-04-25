// ─────────────────────────────────────────────
//  AI Allowance Recommendation Engine
// ─────────────────────────────────────────────

import type { Transaction, AllowanceRecommendation, PredictedSpending, RiskFlag, AllowanceRule, Goal, ExtraAllowanceRequest } from '@/types';
import { CalculateResponsibilityScore } from './scoring';
import { v4 as uuid } from 'uuid';

interface RecommendationInput {
  childId: string;
  transactions: Transaction[];
  rules: AllowanceRule[];
  goals: Goal[];
  extraRequests: ExtraAllowanceRequest[];
  currentScore: number;
  currentAllowance: number;
}

export function GenerateAllowanceRecommendation(input: RecommendationInput): AllowanceRecommendation {
  const { childId, transactions, rules, goals, extraRequests, currentScore, currentAllowance } = input;

  // Categorize spending
  const spendTx = transactions.filter((t) => t.transactionType === 'spend');

  const essentialTotal = spendTx.filter((t) => t.category === 'essential').reduce((s, t) => s + t.amount, 0);
  const educationalTotal = spendTx.filter((t) => t.category === 'educational').reduce((s, t) => s + t.amount, 0);
  const discretionaryTotal = spendTx.filter((t) => t.category === 'discretionary').reduce((s, t) => s + t.amount, 0);
  const savingsTotal = spendTx.filter((t) => t.transactionType === 'saving').reduce((s, t) => s + t.amount, 0);
  const riskyTotal = spendTx.filter((t) => t.category === 'risky').reduce((s, t) => s + t.amount, 0);

  // Calculate averages (assume monthly window)
  const basicNeeds = Math.round(essentialTotal > 0 ? essentialTotal : 120);
  const schoolAdjustment = Math.round(educationalTotal > 0 ? educationalTotal * 0.8 : 20);
  const flexibleBuffer = 30;
  const savingsGoal = 20;

  // Overspending penalty
  let overspendingPenalty = 0;
  const riskFlags: RiskFlag[] = [];

  // Penalize discretionary spikes
  if (discretionaryTotal > essentialTotal * 0.5) {
    overspendingPenalty += Math.round(discretionaryTotal * 0.3);
    riskFlags.push({
      category: 'discretionary',
      message: 'Discretionary spending is high relative to essentials',
      severity: 'medium',
    });
  }

  // Penalize risky transactions
  if (riskyTotal > 0) {
    overspendingPenalty += Math.round(riskyTotal * 0.5);
    riskFlags.push({
      category: 'risky',
      message: 'Risky transactions detected this period',
      severity: 'high',
    });
  }

  // Penalize hitting budget limits
  const exceededLimits = rules.filter((rule) => {
    if (!rule.isActive) return false;
    const catSpend = spendTx.filter((t) => t.category === rule.category).reduce((s, t) => s + t.amount, 0);
    return catSpend > rule.amount;
  });

  if (exceededLimits.length > 0) {
    overspendingPenalty += 10 * exceededLimits.length;
    riskFlags.push({
      category: 'limits',
      message: `${exceededLimits.length} category limit(s) exceeded`,
      severity: 'medium',
    });
  }

  // Penalize frequent extra requests
  if (extraRequests.length >= 3) {
    overspendingPenalty += 5;
    riskFlags.push({
      category: 'requests',
      message: 'Frequent extra allowance requests',
      severity: 'low',
    });
  }

  // Calculate suggested amount
  let suggestedAmount = basicNeeds + schoolAdjustment + flexibleBuffer + savingsGoal - overspendingPenalty;

  // Cap increases: never increase more than 20% above current
  if (currentAllowance > 0 && suggestedAmount > currentAllowance * 1.2) {
    suggestedAmount = Math.round(currentAllowance * 1.2);
  }

  // Floor: minimum RM 50
  suggestedAmount = Math.max(50, Math.round(suggestedAmount));

  // Calculate responsibility score
  const scoring = CalculateResponsibilityScore({
    transactions,
    rules,
    goals,
    extraRequests,
    currentScore,
  });

  // Predicted spending
  const predictedSpending: PredictedSpending = {
    essential: basicNeeds,
    educational: schoolAdjustment,
    discretionary: Math.round(discretionaryTotal * 0.8),
    savings: savingsGoal,
  };

  // Build explanation
  const explanationParts: string[] = [];
  explanationParts.push(`The recommended allowance is RM${suggestedAmount}.`);

  if (essentialTotal > 0) {
    explanationParts.push(`Food and transport spending were ${essentialTotal > basicNeeds ? 'above' : 'within'} the expected range.`);
  }

  if (discretionaryTotal > essentialTotal * 0.3) {
    explanationParts.push(`Discretionary spending increased this month.`);
  }

  if (riskFlags.length > 0) {
    const gamingFlag = riskFlags.find((f) => f.category === 'discretionary');
    if (gamingFlag) {
      explanationParts.push('A gaming/entertainment limit is recommended.');
    }
  }

  if (scoring.score >= 75) {
    explanationParts.push('Good financial responsibility habits are being demonstrated.');
  }

  return {
    id: uuid(),
    childId,
    suggestedAmount,
    basicNeeds,
    schoolAdjustment,
    flexibleBuffer,
    savingsGoal,
    overspendingPenalty,
    responsibilityScore: scoring.score,
    predictedSpending,
    riskFlags,
    explanation: explanationParts.join(' '),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

