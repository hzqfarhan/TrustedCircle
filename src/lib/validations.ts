// ─────────────────────────────────────────────
//  Zod Validation Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['parent', 'child']),
});

export const createChildSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  ageGroup: z.enum(['child', 'teen', 'young-adult']),
  monthlyAllowance: z.number().min(0).optional(),
});

export const createRuleSchema = z.object({
  childId: z.string().min(1),
  category: z.string().min(1),
  limitType: z.enum(['daily', 'weekly', 'monthly']),
  amount: z.number().min(0),
});

export const updateRuleSchema = z.object({
  amount: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  limitType: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

export const approveRecommendationSchema = z.object({
  recommendationId: z.string().min(1),
  approvedAmount: z.number().min(0),
});

export const extraAllowanceRequestSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least RM 1'),
  reason: z.string().min(3, 'Please provide a reason'),
  childNote: z.string().optional().default(''),
});

export const approveExtraRequestSchema = z.object({
  requestId: z.string().min(1),
  approvedAmount: z.number().min(0),
  parentMessage: z.string().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  goalType: z.string().min(1),
  targetAmount: z.number().min(1, 'Target must be at least RM 1'),
});

export const transactionCategoryOverrideSchema = z.object({
  transactionId: z.string().min(1),
  category: z.enum(['essential', 'educational', 'savings', 'discretionary', 'risky']),
  needWant: z.enum(['need', 'want', 'neutral']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateChildInput = z.infer<typeof createChildSchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type ApproveRecommendationInput = z.infer<typeof approveRecommendationSchema>;
export type ExtraAllowanceRequestInput = z.infer<typeof extraAllowanceRequestSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
