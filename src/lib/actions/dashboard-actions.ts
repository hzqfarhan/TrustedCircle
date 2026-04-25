'use server';

import { requireCurrentUser } from '@/lib/auth/auth';
import { getProfile } from '@/lib/data/profiles';
import { getChildrenByParent, getChildProfileByUserId } from '@/lib/data/children';
import { getTransactionsByChild } from '@/lib/data/transactions';
import { getPendingRecommendations, getRecommendationsByChild } from '@/lib/data/recommendations';
import { getRequestsByParent } from '@/lib/data/requests';
import { getAlertsByParent, getAlertsByChild } from '@/lib/data/alerts';
import { getRulesByChild } from '@/lib/data/rules';
import { getActiveGoalsByChild } from '@/lib/data/goals';
import { getChildBadgesWithDetails, getAllBadges } from '@/lib/data/badges';
import type { ParentDashboardData, ChildDashboardData } from '@/types';

export async function getParentDashboardData(): Promise<ParentDashboardData> {
  const user = await requireCurrentUser();
  const profile = await getProfile(user.sub);
  if (!profile || profile.role !== 'parent') throw new Error('Not a parent');

  const children = await getChildrenByParent(user.sub);
  const childIds = children.map((c) => c.id);

  // Get recent transactions from all children
  let recentTransactions: ParentDashboardData['recentTransactions'] = [];
  for (const childId of childIds) {
    const txs = await getTransactionsByChild(childId, 5);
    recentTransactions.push(...txs);
  }
  recentTransactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  recentTransactions = recentTransactions.slice(0, 10);

  const pendingRecommendations = await getPendingRecommendations();
  const relevantRecs = pendingRecommendations.filter((r) => childIds.includes(r.childId));

  const pendingRequests = await getRequestsByParent(user.sub, 'pending');
  const alerts = await getAlertsByParent(user.sub, 10);

  const totalChildBalance = children.reduce((sum, c) => sum + c.currentBalance, 0);

  return {
    profile,
    children,
    recentTransactions,
    pendingRecommendations: relevantRecs,
    pendingRequests,
    alerts,
    totalChildBalance,
  };
}

export async function getChildDashboardData(): Promise<ChildDashboardData> {
  const user = await requireCurrentUser();
  const profile = await getProfile(user.sub);
  if (!profile || profile.role !== 'child') throw new Error('Not a child');

  const childProfile = await getChildProfileByUserId(user.sub);
  if (!childProfile) throw new Error('Child profile not found');

  const recentTransactions = await getTransactionsByChild(childProfile.id, 15);
  const recommendations = await getRecommendationsByChild(childProfile.id, 1);
  const goals = await getActiveGoalsByChild(childProfile.id);
  const badges = await getChildBadgesWithDetails(childProfile.id);
  const rules = await getRulesByChild(childProfile.id);

  // Calculate weekly spending
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyTransactions = recentTransactions.filter(
    (t) => t.transactionType === 'spend' && new Date(t.createdAt) >= weekStart
  );
  const weeklySpent = weeklyTransactions.reduce((s, t) => s + t.amount, 0);

  // Daily safe spend
  const daysLeft = 7 - now.getDay() || 1;
  const weeklyBudget = childProfile.monthlyAllowance / 4;
  const dailySafeSpend = Math.max(0, Math.round(((weeklyBudget - weeklySpent) / daysLeft) * 100) / 100);

  // Spending by category
  const spendingByCategory = recentTransactions
    .filter((t) => t.transactionType === 'spend')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return {
    profile,
    childProfile,
    recentTransactions,
    currentRecommendation: recommendations[0],
    goals,
    badges,
    rules,
    weeklySpent,
    dailySafeSpend,
    spendingByCategory,
  };
}

export async function getChildDetailData(childId: string) {
  const user = await requireCurrentUser();
  const profile = await getProfile(user.sub);
  if (!profile) throw new Error('Profile not found');

  // Import inline to avoid circular
  const { assertCanReadChildData } = await import('@/lib/auth/authorization');
  await assertCanReadChildData(user, childId);

  const { getChildProfile } = await import('@/lib/data/children');
  const childProfile = await getChildProfile(childId);
  if (!childProfile) throw new Error('Child not found');

  const transactions = await getTransactionsByChild(childId, 20);
  const recommendations = await getRecommendationsByChild(childId, 3);
  const rules = await getRulesByChild(childId);
  const goals = await getActiveGoalsByChild(childId);
  const badges = await getChildBadgesWithDetails(childId);
  const alerts = await getAlertsByChild(childId, 5);

  const spendTx = transactions.filter((t) => t.transactionType === 'spend');
  const spendingByCategory = spendTx.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    childProfile,
    transactions,
    recommendations,
    currentRecommendation: recommendations.find((r) => r.status === 'pending') || recommendations[0],
    rules,
    goals,
    badges,
    alerts,
    spendingByCategory,
    totalSpent: spendTx.reduce((s, t) => s + t.amount, 0),
  };
}
