export type AIProviderName = "local" | "alibaba-pai" | "hybrid";

export interface RecommendationInput {
  childId: string;
  monthlyAllowance: number;
  recentTransactions: any[];
  currentRules: any[];
  ageGroup: string;
}

export interface RecommendationResult {
  suggestedAmount: number;
  breakdown: {
    basicNeeds: number;
    schoolAdjustment: number;
    flexibleBuffer: number;
    savingsGoal: number;
    overspendingPenalty: number;
  };
  predictedSpending: Record<string, number>;
  riskFlags: Array<{ category: string; message: string; severity: "low" | "medium" | "high" }>;
  explanation: string;
  responsibilityScore: number;
  aiProvider: AIProviderName;
  explanationProvider?: "local" | "qwen";
}

export interface TransactionInput {
  merchant: string;
  amount: number;
  note?: string;
}

export interface ClassificationResult {
  category: "essential" | "educational" | "discretionary" | "savings" | "risky" | "transfer";
  classification: string;
  needWant: "need" | "want" | "neutral";
  riskFlag: boolean;
  confidence: number;
}

export interface ExplanationInput {
  score: number;
  recentFlags: string[];
  spendingPattern: Record<string, number>;
}

export interface ExplanationResult {
  coachingText: string;
  parentInsight: string;
}

export interface AllowanceAIProvider {
  generateRecommendation(input: RecommendationInput): Promise<RecommendationResult>;
  classifyTransaction(input: TransactionInput): Promise<ClassificationResult>;
  generateExplanation(input: ExplanationInput): Promise<ExplanationResult>;
}

export function getAIProvider(): AllowanceAIProvider {
  const providerName = (process.env.AI_PROVIDER as AIProviderName) || "local";
  
  if (providerName === "alibaba-pai") {
    return require("./providers/alibaba-provider").AlibabaProvider;
  }
  
  if (providerName === "hybrid") {
    return require("./providers/hybrid-provider").HybridProvider;
  }
  
  return require("./providers/local-provider").LocalProvider;
}
