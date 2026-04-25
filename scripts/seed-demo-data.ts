// ─────────────────────────────────────────────
//  Seed Demo Data — DynamoDB
//  Run: npx tsx scripts/seed-demo-data.ts
// ─────────────────────────────────────────────

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });

const T = {
  profiles: process.env.DYNAMODB_PROFILES_TABLE || 'smart-wallet-profiles',
  childProfiles: process.env.DYNAMODB_CHILD_PROFILES_TABLE || 'smart-wallet-child-profiles',
  parentChildLinks: process.env.DYNAMODB_PARENT_CHILD_LINKS_TABLE || 'smart-wallet-parent-child-links',
  transactions: process.env.DYNAMODB_TRANSACTIONS_TABLE || 'smart-wallet-transactions',
  allowanceRules: process.env.DYNAMODB_ALLOWANCE_RULES_TABLE || 'smart-wallet-allowance-rules',
  recommendations: process.env.DYNAMODB_ALLOWANCE_RECOMMENDATIONS_TABLE || 'smart-wallet-allowance-recommendations',
  extraRequests: process.env.DYNAMODB_EXTRA_ALLOWANCE_REQUESTS_TABLE || 'smart-wallet-extra-allowance-requests',
  goals: process.env.DYNAMODB_GOALS_TABLE || 'smart-wallet-goals',
  badges: process.env.DYNAMODB_BADGES_TABLE || 'smart-wallet-badges',
  childBadges: process.env.DYNAMODB_CHILD_BADGES_TABLE || 'smart-wallet-child-badges',
  alerts: process.env.DYNAMODB_ALERTS_TABLE || 'smart-wallet-alerts',
  auditLogs: process.env.DYNAMODB_AUDIT_LOGS_TABLE || 'smart-wallet-audit-logs',
};

async function put(table: string, item: Record<string, any>) {
  await doc.send(new PutCommand({ TableName: table, Item: item }));
}

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

async function seed() {
  console.log('🌱 Seeding demo data...\n');

  // ── Profiles ──
  await put(T.profiles, { id: 'demo_parent', fullName: 'Paan', role: 'parent', avatarUrl: '/pfp/paan.png', walletBalance: 2500, createdAt: now, updatedAt: now });
  await put(T.profiles, { id: 'demo_child', fullName: 'Aiman', role: 'child', avatarUrl: '/pfp/child.png', walletBalance: 0, createdAt: now, updatedAt: now });
  console.log('✅ Profiles created');

  // ── Child Profile ──
  await put(T.childProfiles, { id: 'cp_aiman', userId: 'demo_child', parentId: 'demo_parent', fullName: 'Aiman', ageGroup: 'Teen', responsibilityScore: 72, currentBalance: 165, monthlyAllowance: 165, status: 'active', createdAt: now, updatedAt: now });
  console.log('✅ Child profile created');

  // ── Parent-Child Link ──
  await put(T.parentChildLinks, { id: 'link_1', parentId: 'demo_parent', childId: 'cp_aiman', relationship: 'father', createdAt: now });
  console.log('✅ Parent-child link created');

  // ── Transactions ──
  const txs = [
    { id: 'tx_1', childId: 'cp_aiman', amount: 8.50, merchant: 'Kantin Sekolah', category: 'essential', classification: 'essential', needWant: 'need', transactionType: 'spend', riskFlag: false, note: 'Lunch', createdAt: daysAgo(1) },
    { id: 'tx_2', childId: 'cp_aiman', amount: 4.00, merchant: 'Bas Sekolah', category: 'essential', classification: 'essential', needWant: 'need', transactionType: 'spend', riskFlag: false, note: 'Bus fare', createdAt: daysAgo(2) },
    { id: 'tx_3', childId: 'cp_aiman', amount: 12.00, merchant: 'Kantin Sekolah', category: 'essential', classification: 'essential', needWant: 'need', transactionType: 'spend', riskFlag: false, createdAt: daysAgo(3) },
    { id: 'tx_4', childId: 'cp_aiman', amount: 25.00, merchant: 'Kedai Buku', category: 'educational', classification: 'educational', needWant: 'need', transactionType: 'spend', riskFlag: false, note: 'School materials', createdAt: daysAgo(4) },
    { id: 'tx_5', childId: 'cp_aiman', amount: 15.00, merchant: 'Stationery Shop', category: 'educational', classification: 'educational', needWant: 'need', transactionType: 'spend', riskFlag: false, createdAt: daysAgo(5) },
    { id: 'tx_6', childId: 'cp_aiman', amount: 45.00, merchant: 'Steam Gaming', category: 'discretionary', classification: 'discretionary', needWant: 'want', transactionType: 'spend', riskFlag: false, note: 'Game purchase', createdAt: daysAgo(6) },
    { id: 'tx_7', childId: 'cp_aiman', amount: 20.00, merchant: 'Savings', category: 'savings', classification: 'savings', needWant: 'neutral', transactionType: 'saving', riskFlag: false, note: 'Weekly savings', createdAt: daysAgo(7) },
    { id: 'tx_8', childId: 'cp_aiman', amount: 8.00, merchant: 'Cafeteria', category: 'essential', classification: 'essential', needWant: 'need', transactionType: 'spend', riskFlag: false, createdAt: daysAgo(8) },
    { id: 'tx_9', childId: 'cp_aiman', amount: 120.00, merchant: 'Unknown Store', category: 'risky', classification: 'risky', needWant: 'want', transactionType: 'spend', riskFlag: true, note: 'Suspicious high amount', createdAt: daysAgo(10) },
    { id: 'tx_10', childId: 'cp_aiman', amount: 165.00, merchant: 'Monthly Allowance', category: 'essential', classification: 'essential', needWant: 'neutral', transactionType: 'topup', riskFlag: false, note: 'Monthly allowance', createdAt: daysAgo(30) },
  ];
  for (const tx of txs) await put(T.transactions, tx);
  console.log('✅ Transactions created');

  // ── Allowance Rules ──
  await put(T.allowanceRules, { id: 'rule_1', childId: 'cp_aiman', category: 'discretionary', limitType: 'monthly', amount: 50, isActive: true, createdBy: 'demo_parent', createdAt: now, updatedAt: now });
  await put(T.allowanceRules, { id: 'rule_2', childId: 'cp_aiman', category: 'essential', limitType: 'monthly', amount: 150, isActive: true, createdBy: 'demo_parent', createdAt: now, updatedAt: now });
  console.log('✅ Allowance rules created');

  // ── Recommendation ──
  await put(T.recommendations, {
    id: 'rec_1', childId: 'cp_aiman', suggestedAmount: 165, basicNeeds: 120, schoolAdjustment: 20, flexibleBuffer: 30, savingsGoal: 20, overspendingPenalty: 25, responsibilityScore: 72,
    predictedSpending: { essential: 120, educational: 20, discretionary: 30, savings: 20 },
    riskFlags: [{ category: 'discretionary', message: 'Gaming purchases increased this month. A RM20 gaming limit is recommended.', severity: 'medium' }],
    explanation: 'The recommended allowance is RM165. Food and transport spending were stable, but gaming purchases increased this month. A RM20 gaming limit is recommended.',
    status: 'pending', createdAt: now, aiProvider: 'local', explanationProvider: 'local',
  });
  console.log('✅ Recommendation created');

  // ── Goals ──
  await put(T.goals, { id: 'goal_1', childId: 'cp_aiman', title: 'School Supplies Fund', goalType: 'education', targetAmount: 50, currentAmount: 20, status: 'active', createdAt: now });
  await put(T.goals, { id: 'goal_2', childId: 'cp_aiman', title: 'Emergency Fund', goalType: 'emergency', targetAmount: 100, currentAmount: 35, status: 'active', createdAt: now });
  console.log('✅ Goals created');

  // ── Badges ──
  const badges = [
    { id: 'badge_1', name: 'Smart Saver', description: 'Saved consistently for 4 weeks', icon: '💰', requirementKey: 'savings_streak_4', createdAt: now },
    { id: 'badge_2', name: 'Budget Hero', description: 'Stayed within all category limits', icon: '🦸', requirementKey: 'within_limits', createdAt: now },
    { id: 'badge_3', name: 'Needs First', description: 'Spent mostly on needs over wants', icon: '🎯', requirementKey: 'needs_ratio', createdAt: now },
    { id: 'badge_4', name: 'Goal Builder', description: 'Created and funded a savings goal', icon: '🏗️', requirementKey: 'goal_funded', createdAt: now },
  ];
  for (const b of badges) await put(T.badges, b);

  await put(T.childBadges, { id: 'cb_1', childId: 'cp_aiman', badgeId: 'badge_1', unlockedAt: daysAgo(14) });
  await put(T.childBadges, { id: 'cb_2', childId: 'cp_aiman', badgeId: 'badge_3', unlockedAt: daysAgo(7) });
  console.log('✅ Badges created');

  // ── Alerts ──
  await put(T.alerts, { id: 'alert_1', childId: 'cp_aiman', parentId: 'demo_parent', title: 'Risky Transaction Detected', message: 'Aiman made a RM120 purchase at an unknown store. Please review.', severity: 'warning', read: false, createdAt: daysAgo(10) });
  await put(T.alerts, { id: 'alert_2', childId: 'cp_aiman', parentId: 'demo_parent', title: 'AI Recommendation Ready', message: 'New monthly allowance recommendation for Aiman: RM165', severity: 'info', read: false, createdAt: now });
  await put(T.alerts, { id: 'alert_3', childId: 'cp_aiman', parentId: 'demo_parent', title: 'Gaming Limit Warning', message: 'Aiman is approaching the RM50 gaming limit this month.', severity: 'warning', read: false, createdAt: daysAgo(5) });
  console.log('✅ Alerts created');

  console.log('\n🎉 Demo data seeded successfully!');
  console.log('Demo Parent ID: demo_parent (Paan)');
  console.log('Demo Child ID: demo_child (Aiman)');
  console.log('Child Profile ID: cp_aiman');
}

seed().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
