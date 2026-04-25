import { AllowanceAIProvider, RecommendationInput, RecommendationResult, TransactionInput, ClassificationResult, ExplanationInput, ExplanationResult } from "../provider";
import { LocalProvider } from "./local-provider";

// This is a stub for Alibaba Cloud PAI and Qwen integration.
// If credentials are not present, it gracefully falls back to the LocalProvider.

export const AlibabaProvider: AllowanceAIProvider = {
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    if (!process.env.ALIBABA_PAI_ENDPOINT) {
      console.warn("Alibaba PAI not configured. Falling back to local MVP engine.");
      return LocalProvider.generateRecommendation(input);
    }
    
    // Stub for PAI integration:
    // 1. Send anonymized features to PAI endpoint
    // 2. Receive score and recommendation array
    // ...
    
    // For now, we fallback safely.
    const result = await LocalProvider.generateRecommendation(input);
    result.aiProvider = "alibaba-pai";
    return result;
  },

  async classifyTransaction(input: TransactionInput): Promise<ClassificationResult> {
    if (!process.env.ALIBABA_MODEL_STUDIO_API_KEY) {
      return LocalProvider.classifyTransaction(input);
    }
    
    // Stub for Alibaba Cloud NLP / Qwen classification
    return LocalProvider.classifyTransaction(input);
  },

  async generateExplanation(input: ExplanationInput): Promise<ExplanationResult> {
    if (!process.env.ALIBABA_MODEL_STUDIO_API_KEY) {
      return LocalProvider.generateExplanation(input);
    }
    
    // Stub for Alibaba Qwen Model Studio text generation
    const result = await LocalProvider.generateExplanation(input);
    return {
      coachingText: result.coachingText,
      parentInsight: "[Alibaba Qwen] " + result.parentInsight
    };
  }
};

