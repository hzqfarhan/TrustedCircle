import { AllowanceAIProvider, RecommendationInput, RecommendationResult, TransactionInput, ClassificationResult, ExplanationInput, ExplanationResult } from "../provider";
import { generateAllowanceRecommendation } from "../recommendation";
import { classifyTransaction } from "../classification";
import { calculateResponsibilityScore } from "../scoring";

export const LocalProvider: AllowanceAIProvider = {
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    // The existing recommendation engine uses deterministic logic.
    // We adapt its output to the new interface.
    const result = await generateAllowanceRecommendation({
      childId: input.childId,
      monthlyAllowance: input.monthlyAllowance,
      recentTransactions: input.recentTransactions,
      currentRules: input.currentRules,
      ageGroup: input.ageGroup
    });
    
    return {
      suggestedAmount: result.suggestedAmount,
      breakdown: {
        basicNeeds: result.basicNeeds,
        schoolAdjustment: result.schoolAdjustment,
        flexibleBuffer: result.flexibleBuffer,
        savingsGoal: result.savingsGoal,
        overspendingPenalty: result.overspendingPenalty
      },
      predictedSpending: result.predictedSpending,
      riskFlags: result.riskFlags,
      explanation: result.explanation,
      responsibilityScore: result.responsibilityScore,
      aiProvider: "local",
      explanationProvider: "local"
    };
  },

  async classifyTransaction(input: TransactionInput): Promise<ClassificationResult> {
    return classifyTransaction(input.merchant, input.amount, input.note);
  },

  async generateExplanation(input: ExplanationInput): Promise<ExplanationResult> {
    // Local deterministic fallback
    let coachingText = "Keep tracking your spending and saving consistently!";
    if (input.score < 50) {
      coachingText = "Spending all your allowance will not increase next month’s allowance. Building good habits helps earn more trust.";
    } else if (input.score > 80) {
      coachingText = "Excellent job budgeting! Consistent saving earns you trust and badges.";
    }

    let parentInsight = `Child's responsibility score is ${input.score}. `;
    if (input.recentFlags.length > 0) {
      parentInsight += `Noticeable flags: ${input.recentFlags.join(", ")}.`;
    } else {
      parentInsight += "Spending patterns look healthy.";
    }

    return {
      coachingText,
      parentInsight
    };
  }
};
