import type { ChildProfile } from '@/types';

export function getDefaultSpendingLimit(): number {
  return 20;
}

export function getChildPerTransactionLimit(child: ChildProfile): number {
  return child.perTransactionLimit ?? 20;
}

export function validateChildSpendingLimit(params: {
  amount: number;
  perTransactionLimit?: number;
}): {
  allowed: boolean;
  limit: number;
  reason?: string;
} {
  const limit = params.perTransactionLimit ?? 20;

  if (params.amount > limit) {
    return {
      allowed: false,
      limit,
      reason: `This payment is above your RM${limit} spending limit.`,
    };
  }

  return {
    allowed: true,
    limit,
  };
}
