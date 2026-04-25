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
  await put(T.profiles, { Id: 'demo_parent', FullName: 'Paan', Role: 'parent', AvatarUrl: '/pfp/paan.png', WalletBalance: 2500, CreatedAt: now, UpdatedAt: now });
  await put(T.profiles, { Id: 'demo_child', FullName: 'Aiman', Role: 'child', AvatarUrl: '/pfp/child.png', WalletBalance: 0, CreatedAt: now, UpdatedAt: now });
  console.log('✅ Profiles created');

  // ── Child Profile ──
  await put(T.childProfiles, { Id: 'cp_aiman', UserId: 'demo_child', ParentId: 'demo_parent', FullName: 'Aiman', AgeGroup: 'Teen', ResponsibilityScore: 72, CurrentBalance: 165, MonthlyAllowance: 165, Status: 'active', CreatedAt: now, UpdatedAt: now });
  console.log('✅ Child profile created');

  // ── Parent-Child Link ──
  await put(T.parentChildLinks, { Id: 'link_1', ParentId: 'demo_parent', ChildId: 'cp_aiman', Relationship: 'father', CreatedAt: now });
  console.log('✅ Parent-child link created');

  // ── Transactions ──
  const txs = [
    { Id: 'tx_1', ChildId: 'cp_aiman', Amount: 8.50, Merchant: 'Kantin Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'Lunch', CreatedAt: daysAgo(1) },
    { Id: 'tx_2', ChildId: 'cp_aiman', Amount: 4.00, Merchant: 'Bas Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'Bus fare', CreatedAt: daysAgo(2) },
    { Id: 'tx_3', ChildId: 'cp_aiman', Amount: 12.00, Merchant: 'Kantin Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(3) },
    { Id: 'tx_4', ChildId: 'cp_aiman', Amount: 25.00, Merchant: 'Kedai Buku', Category: 'educational', Classification: 'educational', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'School materials', CreatedAt: daysAgo(4) },
    { Id: 'tx_5', ChildId: 'cp_aiman', Amount: 15.00, Merchant: 'Stationery Shop', Category: 'educational', Classification: 'educational', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(5) },
    { Id: 'tx_6', ChildId: 'cp_aiman', Amount: 45.00, Merchant: 'Steam Gaming', Category: 'discretionary', Classification: 'discretionary', NeedWant: 'want', TransactionType: 'spend', RiskFlag: false, Note: 'Game purchase', CreatedAt: daysAgo(6) },
    { Id: 'tx_7', ChildId: 'cp_aiman', Amount: 20.00, Merchant: 'Savings', Category: 'savings', Classification: 'savings', NeedWant: 'neutral', TransactionType: 'saving', RiskFlag: false, Note: 'Weekly savings', CreatedAt: daysAgo(7) },
    { Id: 'tx_8', ChildId: 'cp_aiman', Amount: 8.00, Merchant: 'Cafeteria', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(8) },
    { Id: 'tx_9', ChildId: 'cp_aiman', Amount: 120.00, Merchant: 'Unknown Store', Category: 'risky', Classification: 'risky', NeedWant: 'want', TransactionType: 'spend', RiskFlag: true, Note: 'Suspicious high amount', CreatedAt: daysAgo(10) },
    { Id: 'tx_10', ChildId: 'cp_aiman', Amount: 165.00, Merchant: 'Monthly Allowance', Category: 'essential', Classification: 'essential', NeedWant: 'neutral', TransactionType: 'topup', RiskFlag: false, Note: 'Monthly allowance', CreatedAt: daysAgo(30) },
  ];
  for (const tx of txs) await put(T.transactions, tx);
  console.log('✅ Transactions created');

  // ── Allowance Rules ──
  await put(T.allowanceRules, { Id: 'rule_1', ChildId: 'cp_aiman', Category: 'discretionary', LimitType: 'monthly', Amount: 50, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now });
  await put(T.allowanceRules, { Id: 'rule_2', ChildId: 'cp_aiman', Category: 'essential', LimitType: 'monthly', Amount: 150, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now });
  console.log('✅ Allowance rules created');

  // ── Recommendation ──
  await put(T.recommendations, {
    Id: 'rec_1', ChildId: 'cp_aiman', SuggestedAmount: 165, BasicNeeds: 120, SchoolAdjustment: 20, FlexibleBuffer: 30, SavingsGoal: 20, OverspendingPenalty: 25, ResponsibilityScore: 72,
    PredictedSpending: { Essential: 120, Educational: 20, Discretionary: 30, Savings: 20 },
    RiskFlags: [{ Category: 'discretionary', Message: 'Gaming purchases increased this month. A RM20 gaming limit is recommended.', Severity: 'medium' }],
    Explanation: 'The recommended allowance is RM165. Food and transport spending were stable, but gaming purchases increased this month. A RM20 gaming limit is recommended.',
    Status: 'pending', CreatedAt: now, AiProvider: 'local', ExplanationProvider: 'local',
  });
  console.log('✅ Recommendation created');

  // ── Goals ──
  await put(T.goals, { Id: 'goal_1', ChildId: 'cp_aiman', Title: 'School Supplies Fund', GoalType: 'education', TargetAmount: 50, CurrentAmount: 20, Status: 'active', CreatedAt: now });
  await put(T.goals, { Id: 'goal_2', ChildId: 'cp_aiman', Title: 'Emergency Fund', GoalType: 'emergency', TargetAmount: 100, CurrentAmount: 35, Status: 'active', CreatedAt: now });
  console.log('✅ Goals created');

  // ── Badges ──
  const badges = [
    { Id: 'badge_1', Name: 'Smart Saver', Description: 'Saved consistently for 4 weeks', Icon: '💰', RequirementKey: 'savings_streak_4', CreatedAt: now },
    { Id: 'badge_2', Name: 'Budget Hero', Description: 'Stayed within all category limits', Icon: '🦸', RequirementKey: 'within_limits', CreatedAt: now },
    { Id: 'badge_3', Name: 'Needs First', Description: 'Spent mostly on needs over wants', Icon: '🎯', RequirementKey: 'needs_ratio', CreatedAt: now },
    { Id: 'badge_4', Name: 'Goal Builder', Description: 'Created and funded a savings goal', Icon: '🏗️', RequirementKey: 'goal_funded', CreatedAt: now },
  ];
  for (const b of badges) await put(T.badges, b);

  await put(T.childBadges, { Id: 'cb_1', ChildId: 'cp_aiman', BadgeId: 'badge_1', UnlockedAt: daysAgo(14) });
  await put(T.childBadges, { Id: 'cb_2', ChildId: 'cp_aiman', BadgeId: 'badge_3', UnlockedAt: daysAgo(7) });
  console.log('✅ Badges created');

  // ── Alerts ──
  await put(T.alerts, { Id: 'alert_1', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Risky Transaction Detected', Message: 'Aiman made a RM120 purchase at an unknown store. Please review.', Severity: 'warning', Read: false, CreatedAt: daysAgo(10) });
  await put(T.alerts, { Id: 'alert_2', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'AI Recommendation Ready', Message: 'New monthly allowance recommendation for Aiman: RM165', Severity: 'info', Read: false, CreatedAt: now });
  await put(T.alerts, { Id: 'alert_3', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Gaming Limit Warning', Message: 'Aiman is approaching the RM50 gaming limit this month.', Severity: 'warning', Read: false, CreatedAt: daysAgo(5) });
  console.log('✅ Alerts created');

  console.log('\n🎉 Demo data seeded successfully!');
  console.log('Demo Parent ID: demo_parent (Paan)');
  console.log('Demo Child ID: demo_child (Aiman)');
  console.log('Child Profile ID: cp_aiman');
}

seed().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
