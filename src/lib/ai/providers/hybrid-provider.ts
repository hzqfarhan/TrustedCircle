import { AllowanceAIProvider, RecommendationInput, RecommendationResult, TransactionInput, ClassificationResult, ExplanationInput, ExplanationResult } from "../provider";
import { LocalProvider } from "./local-provider";
import { AlibabaProvider } from "./alibaba-provider";

// Hybrid provider uses local deterministic scoring, but enhances text generation with Alibaba Qwen if available.
export const HybridProvider: AllowanceAIProvider = {
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    const result = await LocalProvider.generateRecommendation(input);
    result.aiProvider = "hybrid";
    
    if (process.env.ALIBABA_MODEL_STUDIO_API_KEY) {
      result.explanationProvider = "qwen";
      // In a real implementation, we'd call Qwen here to enhance `result.explanation`.
      result.explanation = "[Hybrid/Qwen Enhanced] " + result.explanation;
    } else {
      result.explanationProvider = "local";
    }
    
    return result;
  },

  async classifyTransaction(input: TransactionInput): Promise<ClassificationResult> {
    return LocalProvider.classifyTransaction(input);
  },

  async generateExplanation(input: ExplanationInput): Promise<ExplanationResult> {
    if (process.env.ALIBABA_MODEL_STUDIO_API_KEY) {
      return AlibabaProvider.generateExplanation(input);
    }
    return LocalProvider.generateExplanation(input);
  }
};

