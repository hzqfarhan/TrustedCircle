'use server';

import { requireCurrentUser } from '@/lib/auth/auth';
import { assertCanMutateChildData, assertCanReadChildData } from '@/lib/auth/authorization';
import { getRecommendation, approveRecommendation as approveRec, rejectRecommendation as rejectRec, createRecommendation } from '@/lib/data/recommendations';
import { getChildProfile, updateChildProfile } from '@/lib/data/children';
import { getTransactionsByChild } from '@/lib/data/transactions';
import { getRulesByChild } from '@/lib/data/rules';
import { getActiveGoalsByChild } from '@/lib/data/goals';
import { getRequestsByChild } from '@/lib/data/requests';
import { updateWalletBalance, getProfile } from '@/lib/data/profiles';
import { createTransaction } from '@/lib/data/transactions';
import { createAuditLog } from '@/lib/data/audit-logs';
import { createAlert } from '@/lib/data/alerts';
import { generateAllowanceRecommendation } from '@/lib/ai/recommendation';
import { v4 as uuid } from 'uuid';

export async function generateRecommendationAction(childId: string) {
  const user = await requireCurrentUser();
  await assertCanMutateChildData(user, childId);

  const childProfile = await getChildProfile(childId);
  if (!childProfile) throw new Error('Child profile not found');

  const transactions = await getTransactionsByChild(childId, 50);
  const rules = await getRulesByChild(childId);
  const goals = await getActiveGoalsByChild(childId);
  const extraRequests = await getRequestsByChild(childId);

  const recommendation = generateAllowanceRecommendation({
    childId,
    transactions,
    rules,
    goals,
    extraRequests,
    currentScore: childProfile.responsibilityScore,
    currentAllowance: childProfile.monthlyAllowance,
  });

  await createRecommendation(recommendation);
  return recommendation;
}

export async function approveRecommendationAction(recommendationId: string, approvedAmount: number) {
  const user = await requireCurrentUser();
  const rec = await getRecommendation(recommendationId);
  if (!rec) throw new Error('Recommendation not found');

  await assertCanMutateChildData(user, rec.childId);

  // Approve the recommendation
  await approveRec(recommendationId, approvedAmount, user.sub);

  // Update child balance & monthly allowance
  const child = await getChildProfile(rec.childId);
  if (child) {
    await updateChildProfile(rec.childId, {
      currentBalance: child.currentBalance + approvedAmount,
      monthlyAllowance: approvedAmount,
      responsibilityScore: rec.responsibilityScore,
    });

    // Create topup transaction
    await createTransaction({
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
  await createAuditLog(user.sub, 'APPROVE_RECOMMENDATION', 'recommendation', recommendationId, undefined, { approvedAmount });

  // Alert for child
  if (child) {
    await createAlert({
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

export async function rejectRecommendationAction(recommendationId: string) {
  const user = await requireCurrentUser();
  const rec = await getRecommendation(recommendationId);
  if (!rec) throw new Error('Recommendation not found');

  await assertCanMutateChildData(user, rec.childId);
  await rejectRec(recommendationId);

  await createAuditLog(user.sub, 'REJECT_RECOMMENDATION', 'recommendation', recommendationId);

  return { success: true };
}
