'use server';

import { RequireCurrentUser } from '@/lib/auth/auth';
import { AssertCanMutateChildData, AssertCanReadChildData } from '@/lib/auth/authorization';
import { GetRecommendation, UpdateRecommendationStatus, CreateRecommendation } from '@/lib/data/recommendations';
import { GetChildProfile, UpdateChildProfile } from '@/lib/data/children';
import { GetTransactionsByChild } from '@/lib/data/transactions';
import { GetRulesByChild } from '@/lib/data/rules';
import { GetGoalsByChild } from '@/lib/data/goals';
import { GetRequestsByChild } from '@/lib/data/requests';
import { UpdateWalletBalance, GetProfile } from '@/lib/data/profiles';
import { CreateTransaction } from '@/lib/data/transactions';
import { CreateAuditLog } from '@/lib/data/audit-logs';
import { CreateAlert } from '@/lib/data/alerts';
import { GenerateAllowanceRecommendation } from '@/lib/ai/recommendation';
import { v4 as uuid } from 'uuid';

export async function GenerateRecommendationAction(childId: string) {
  const user = await RequireCurrentUser();
  await AssertCanMutateChildData(user, childId);

  const childProfile = await GetChildProfile(childId);
  if (!childProfile) throw new Error('Child profile not found');

  const transactions = await GetTransactionsByChild(childId, 50);
  const rules = await GetRulesByChild(childId);
  const goals = await GetGoalsByChild(childId, 'active');
  const extraRequests = await GetRequestsByChild(childId);

  const recommendation = GenerateAllowanceRecommendation({
    childId,
    transactions,
    rules,
    goals,
    extraRequests,
    currentScore: childProfile.responsibilityScore,
    currentAllowance: childProfile.monthlyAllowance,
  });

  await CreateRecommendation(recommendation);
  return recommendation;
}

export async function ApproveRecommendationAction(recommendationId: string, approvedAmount: number) {
  const user = await RequireCurrentUser();
  const rec = await GetRecommendation(recommendationId);
  if (!rec) throw new Error('Recommendation not found');

  await AssertCanMutateChildData(user, rec.childId);

  // Approve the recommendation
  await UpdateRecommendationStatus(recommendationId, 'approved', approvedAmount, user.sub);

  // Update child balance & monthly allowance
  const child = await GetChildProfile(rec.childId);
  if (child) {
    await UpdateChildProfile(rec.childId, {
      currentBalance: child.currentBalance + approvedAmount,
      monthlyAllowance: approvedAmount,
      responsibilityScore: rec.responsibilityScore,
    });

    // Create topup transaction
    await CreateTransaction({
      id: uuid(),
      childId: rec.childId,
      amount: approvedAmount,
      merchant: 'Monthly Allowance',
      category: 'essential',
      classification: 'essential',
      needWant: 'neutral',
      transactionType: 'topup',
      riskFlag: false,
      note: `Monthly allowance approved: RM${approvedAmount}`,
      createdAt: new Date().toISOString(),
    });
  }

  // Audit log
  await CreateAuditLog({
    id: uuid(),
    actorId: user.sub,
    action: 'APPROVE_RECOMMENDATION',
    entityType: 'recommendation',
    entityId: recommendationId,
    newValue: { approvedAmount },
    createdAt: new Date().toISOString()
  });

  // Alert for child
  if (child) {
    await CreateAlert({
      id: uuid(),
      childId: rec.childId,
      parentId: user.sub,
      title: 'Allowance Approved!',
      message: `Your monthly allowance of RM${approvedAmount} has been approved.`,
      severity: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true };
}

export async function RejectRecommendationAction(recommendationId: string) {
  const user = await RequireCurrentUser();
  const rec = await GetRecommendation(recommendationId);
  if (!rec) throw new Error('Recommendation not found');

  await AssertCanMutateChildData(user, rec.childId);
  await UpdateRecommendationStatus(recommendationId, 'rejected');

  await CreateAuditLog({
    id: uuid(),
    actorId: user.sub,
    action: 'REJECT_RECOMMENDATION',
    entityType: 'recommendation',
    entityId: recommendationId,
    createdAt: new Date().toISOString()
  });

  return { success: true };
}


