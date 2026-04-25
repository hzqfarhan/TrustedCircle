import { z } from "zod";

export const updateSpendingLimitSchema = z.object({
  perTransactionLimit: z.number().positive().min(1).max(500),
});

export const validateSpendingLimitSchema = z.object({
  childId: z.string(),
  amount: z.number().positive().max(10000),
  transactionType: z.literal("spend"),
});
