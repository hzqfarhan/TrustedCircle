'use server';

import { RequireCurrentUser } from '@/lib/auth/auth';
import { GetProfile } from '@/lib/data/profiles';
import { GetChildrenByParent, GetChildProfileByUserId, GetChildProfile } from '@/lib/data/children';
import { GetTransactionsByChild } from '@/lib/data/transactions';
import { GetPendingRecommendations, GetRecommendationsByChild } from '@/lib/data/recommendations';
import { GetPendingRequestsByParent } from '@/lib/data/requests';
import { GetAlertsByParent, GetAlertsByChild } from '@/lib/data/alerts';
import { GetRulesByChild } from '@/lib/data/rules';
import { GetGoalsByChild } from '@/lib/data/goals';
import { GetChildBadgesWithDetails, GetAllBadges } from '@/lib/data/badges';
import type { ParentDashboardData, ChildDashboardData } from '@/types';

export async function GetParentDashboardData(): Promise<ParentDashboardData> {
  const user = await RequireCurrentUser();
  const profile = await GetProfile(user.sub);
  if (!profile || profile.role !== 'parent') throw new Error('Not a parent');

  const children = await GetChildrenByParent(user.sub);
  const childIds = children.map((c) => c.id);

  // Get recent transactions from all children
  let recentTransactions: ParentDashboardData['recentTransactions'] = [];
  for (const childId of childIds) {
    const txs = await GetTransactionsByChild(childId, 5);
    recentTransactions.push(...txs);
  }
  recentTransactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  recentTransactions = recentTransactions.slice(0, 10);

  const pendingRecommendations = await GetPendingRecommendations();
  const relevantRecs = pendingRecommendations.filter((r) => childIds.includes(r.childId));

  const pendingRequests = await GetPendingRequestsByParent(user.sub);
  const alerts = await GetAlertsByParent(user.sub);

  const totalChildBalance = children.reduce((sum, c) => sum + c.currentBalance, 0);

  return {
    profile,
    children,
    recentTransactions,
    pendingRecommendations: relevantRecs,
    pendingRequests,
    alerts: alerts.slice(0, 10),
    totalChildBalance,
  };
}

export async function GetChildDashboardData(): Promise<ChildDashboardData> {
  const user = await RequireCurrentUser();
  const profile = await GetProfile(user.sub);
  if (!profile || profile.role !== 'child') throw new Error('Not a child');

  const childProfile = await GetChildProfileByUserId(user.sub);
  if (!childProfile) throw new Error('Child profile not found');

  const recentTransactions = await GetTransactionsByChild(childProfile.id, 15);
  const recommendations = await GetRecommendationsByChild(childProfile.id);
  const goals = await GetGoalsByChild(childProfile.id, 'active');
  const badges = await GetChildBadgesWithDetails(childProfile.id);
  const rules = await GetRulesByChild(childProfile.id);

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

export async function GetChildDetailData(childId: string) {
  const user = await RequireCurrentUser();
  const profile = await GetProfile(user.sub);
  if (!profile) throw new Error('Profile not found');

  // Import inline to avoid circular
  const { AssertCanReadChildData } = await import('@/lib/auth/authorization');
  await AssertCanReadChildData(user, childId);

  const childProfile = await GetChildProfile(childId);
  if (!childProfile) throw new Error('Child not found');

  const transactions = await GetTransactionsByChild(childId, 20);
  const recommendations = await GetRecommendationsByChild(childId);
  const rules = await GetRulesByChild(childId);
  const goals = await GetGoalsByChild(childId, 'active');
  const badges = await GetChildBadgesWithDetails(childId);
  const alerts = await GetAlertsByChild(childId);

  const spendTx = transactions.filter((t) => t.transactionType === 'spend');
  const spendingByCategory = spendTx.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    childProfile,
    transactions,
    recommendations: recommendations.slice(0, 3),
    currentRecommendation: recommendations.find((r) => r.status === 'pending') || recommendations[0],
    rules,
    goals,
    badges,
    alerts: alerts.slice(0, 5),
    spendingByCategory,
    totalSpent: spendTx.reduce((s, t) => s + t.amount, 0),
  };
}


