// ─────────────────────────────────────────────
//  Seed real AWS DynamoDB tables with demo data
//  Usage: npx tsx scripts/seed-aws-dynamodb.ts
// ─────────────────────────────────────────────

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import 'dotenv/config';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: fromIni({ profile: 'finhack' }),
});

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

// ─── Table names from env ───
const T = {
  profiles: process.env.DYNAMODB_PROFILES_TABLE || 'Users',
  childProfiles: process.env.DYNAMODB_CHILD_PROFILES_TABLE || 'ChildProfiles',
  parentChildLinks: process.env.DYNAMODB_PARENT_CHILD_LINKS_TABLE || 'UserChildLink',
  transactions: process.env.DYNAMODB_TRANSACTIONS_TABLE || 'Transactions',
  allowanceRules: process.env.DYNAMODB_ALLOWANCE_RULES_TABLE || 'AllowanceRules',
  recommendations: process.env.DYNAMODB_ALLOWANCE_RECOMMENDATIONS_TABLE || 'AllowanceRecommendations',
  extraRequests: process.env.DYNAMODB_EXTRA_ALLOWANCE_REQUESTS_TABLE || 'ExtraAllowanceRequests',
  goals: process.env.DYNAMODB_GOALS_TABLE || 'Goals',
  badges: process.env.DYNAMODB_BADGES_TABLE || 'Badges',
  childBadges: process.env.DYNAMODB_CHILD_BADGES_TABLE || 'ChildBadges',
  alerts: process.env.DYNAMODB_ALERTS_TABLE || 'Alerts',
  auditLogs: process.env.DYNAMODB_AUDIT_LOGS_TABLE || 'AuditLogs',
  kycDocuments: process.env.DYNAMODB_CHILD_KYC_DOCUMENTS_TABLE || 'KYCDocuments',
  sharedFunds: process.env.DYNAMODB_SHARED_FUNDS_TABLE || 'SharedFunds',
  approvals: process.env.DYNAMODB_APPROVALS_TABLE || 'Approvals',
};

async function put(table: string, item: Record<string, any>) {
  await doc.send(new PutCommand({ TableName: table, Item: item }));
}

async function seed() {
  console.log('Seeding AWS DynamoDB tables...\n');

  // Users
  console.log('→ Users');
  await put(T.profiles, { UserId: 'demo_parent', FullName: 'Paan', Role: 'parent', AvatarUrl: '/pfp/paan.png', WalletBalance: 2500, CreatedAt: now, UpdatedAt: now });
  await put(T.profiles, { UserId: 'demo_child', FullName: 'Aiman', Role: 'child', AvatarUrl: '/pfp/child.png', WalletBalance: 0, CreatedAt: now, UpdatedAt: now });
  await put(T.profiles, { UserId: 'demo_child_ibad_user', FullName: "MUHAMMAD KHAIRUL IBAD BIN JIMA'AIN", Role: 'child', WalletBalance: 0, CreatedAt: now, UpdatedAt: now });

  // ChildProfiles
  console.log('→ ChildProfiles');
  await put(T.childProfiles, { ChildId: 'cp_aiman', UserId: 'demo_child', ParentId: 'demo_parent', FullName: 'Aiman', AgeGroup: 'Teen', ResponsibilityScore: 72, CurrentBalance: 165, MonthlyAllowance: 165, Status: 'active', CreatedAt: now, UpdatedAt: now });
  await put(T.childProfiles, { ChildId: 'child_ibad_demo', UserId: 'demo_child_ibad_user', ParentId: 'demo_parent', FullName: "MUHAMMAD KHAIRUL IBAD BIN JIMA'AIN", Nickname: 'ibad', Email: 'ibad.junior@example.com', DateOfBirth: '2016-04-01', AgeGroup: 'under_12', Relationship: 'son', ResponsibilityScore: 72, CurrentBalance: 165, MonthlyAllowance: 165, KycStatus: 'kyc_pending', Status: 'pending_kyc', CreatedAt: now, UpdatedAt: now });

  // ParentChildLinks
  console.log('→ UserChildLink');
  await put(T.parentChildLinks, { UserChildLinkId: 'link_1', ParentId: 'demo_parent', ChildId: 'cp_aiman', Relationship: 'father', CreatedAt: now });
  await put(T.parentChildLinks, { UserChildLinkId: 'link_ibad', ParentId: 'demo_parent', ChildId: 'child_ibad_demo', Relationship: 'father', CreatedAt: now });

  // Transactions
  console.log('→ Transactions');
  const txs = [
    { TransactionId: 'tx_1', ChildId: 'cp_aiman', Amount: 8.50, Merchant: 'Kantin Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'Lunch', CreatedAt: daysAgo(1) },
    { TransactionId: 'tx_2', ChildId: 'cp_aiman', Amount: 4.00, Merchant: 'Bas Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'Bus fare', CreatedAt: daysAgo(2) },
    { TransactionId: 'tx_3', ChildId: 'cp_aiman', Amount: 12.00, Merchant: 'Kantin Sekolah', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(3) },
    { TransactionId: 'tx_4', ChildId: 'cp_aiman', Amount: 25.00, Merchant: 'Kedai Buku', Category: 'educational', Classification: 'educational', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, Note: 'School materials', CreatedAt: daysAgo(4) },
    { TransactionId: 'tx_5', ChildId: 'cp_aiman', Amount: 15.00, Merchant: 'Stationery Shop', Category: 'educational', Classification: 'educational', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(5) },
    { TransactionId: 'tx_6', ChildId: 'cp_aiman', Amount: 45.00, Merchant: 'Steam Gaming', Category: 'discretionary', Classification: 'discretionary', NeedWant: 'want', TransactionType: 'spend', RiskFlag: false, Note: 'Game purchase', CreatedAt: daysAgo(6) },
    { TransactionId: 'tx_7', ChildId: 'cp_aiman', Amount: 20.00, Merchant: 'Savings', Category: 'savings', Classification: 'savings', NeedWant: 'neutral', TransactionType: 'saving', RiskFlag: false, Note: 'Weekly savings', CreatedAt: daysAgo(7) },
    { TransactionId: 'tx_8', ChildId: 'cp_aiman', Amount: 8.00, Merchant: 'Cafeteria', Category: 'essential', Classification: 'essential', NeedWant: 'need', TransactionType: 'spend', RiskFlag: false, CreatedAt: daysAgo(8) },
    { TransactionId: 'tx_9', ChildId: 'cp_aiman', Amount: 120.00, Merchant: 'Unknown Store', Category: 'risky', Classification: 'risky', NeedWant: 'want', TransactionType: 'spend', RiskFlag: true, Note: 'Suspicious high amount', CreatedAt: daysAgo(10) },
    { TransactionId: 'tx_10', ChildId: 'cp_aiman', Amount: 165.00, Merchant: 'Monthly Allowance', Category: 'essential', Classification: 'essential', NeedWant: 'neutral', TransactionType: 'topup', RiskFlag: false, Note: 'Monthly allowance', CreatedAt: daysAgo(30) },
  ];
  for (const tx of txs) await put(T.transactions, tx);

  // AllowanceRules
  console.log('→ AllowanceRules');
  await put(T.allowanceRules, { RuleId: 'rule_1', ChildId: 'cp_aiman', Category: 'discretionary', LimitType: 'monthly', Amount: 50, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now });
  await put(T.allowanceRules, { RuleId: 'rule_2', ChildId: 'cp_aiman', Category: 'essential', LimitType: 'monthly', Amount: 150, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now });

  // Recommendations
  console.log('→ AllowanceRecommendations');
  await put(T.recommendations, {
    AllowanceRecommendationsId: 'rec_1', ChildId: 'cp_aiman', SuggestedAmount: 165, BasicNeeds: 120, SchoolAdjustment: 20, FlexibleBuffer: 30, SavingsGoal: 20, OverspendingPenalty: 25, ResponsibilityScore: 72,
    PredictedSpending: { Essential: 120, Educational: 20, Discretionary: 30, Savings: 20 },
    RiskFlags: [{ Category: 'discretionary', Message: 'Gaming purchases increased this month. A RM20 gaming limit is recommended.', Severity: 'medium' }],
    Explanation: 'The recommended allowance is RM165. Food and transport spending were stable, but gaming purchases increased this month. A RM20 gaming limit is recommended.',
    Status: 'pending', CreatedAt: now, AiProvider: 'local', ExplanationProvider: 'local',
  });

  // Goals
  console.log('→ Goals');
  await put(T.goals, { GoalId: 'goal_1', ChildId: 'cp_aiman', Title: 'School Supplies Fund', GoalType: 'education', TargetAmount: 50, CurrentAmount: 20, Status: 'active', CreatedAt: now });
  await put(T.goals, { GoalId: 'goal_2', ChildId: 'cp_aiman', Title: 'Emergency Fund', GoalType: 'emergency', TargetAmount: 100, CurrentAmount: 35, Status: 'active', CreatedAt: now });

  // Badges
  console.log('→ Badges');
  await put(T.badges, { BadgesId: 'badge_1', Name: 'Smart Saver', Description: 'Saved consistently for 4 weeks', Icon: '💰', RequirementKey: 'savings_streak_4', CreatedAt: now });
  await put(T.badges, { BadgesId: 'badge_2', Name: 'Budget Hero', Description: 'Stayed within all category limits', Icon: '🦸', RequirementKey: 'within_limits', CreatedAt: now });
  await put(T.badges, { BadgesId: 'badge_3', Name: 'Needs First', Description: 'Spent mostly on needs over wants', Icon: '🎯', RequirementKey: 'needs_ratio', CreatedAt: now });
  await put(T.badges, { BadgesId: 'badge_4', Name: 'Goal Builder', Description: 'Created and funded a savings goal', Icon: '🏗️', RequirementKey: 'goal_funded', CreatedAt: now });

  // ChildBadges
  console.log('→ ChildBadges');
  await put(T.childBadges, { ChildBadgesId: 'cb_1', ChildId: 'cp_aiman', BadgeId: 'badge_1', UnlockedAt: daysAgo(14) });
  await put(T.childBadges, { ChildBadgesId: 'cb_2', ChildId: 'cp_aiman', BadgeId: 'badge_3', UnlockedAt: daysAgo(7) });

  // Alerts
  console.log('→ Alerts');
  await put(T.alerts, { AlertId: 'alert_1', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Risky Transaction Detected', Message: 'Aiman made a RM120 purchase at an unknown store. Please review.', Severity: 'warning', Read: false, CreatedAt: daysAgo(10) });
  await put(T.alerts, { AlertId: 'alert_2', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'AI Recommendation Ready', Message: 'New monthly allowance recommendation for Aiman: RM165', Severity: 'info', Read: false, CreatedAt: now });
  await put(T.alerts, { AlertId: 'alert_3', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Gaming Limit Warning', Message: 'Aiman is approaching the RM50 gaming limit this month.', Severity: 'warning', Read: false, CreatedAt: daysAgo(5) });

  // AuditLogs
  console.log('→ AuditLogs');
  await put(T.auditLogs, { AuditLogId: 'audit_child_ibad_created', ActorId: 'demo_parent', Action: 'child_created', EntityType: 'child_profile', EntityId: 'child_ibad_demo', CreatedAt: now });

  // KYCDocuments
  console.log('→ KYCDocuments');
  await put(T.kycDocuments, { KycDocumentId: 'kyc_ibad_demo_mykid', ChildId: 'child_ibad_demo', ParentId: 'demo_parent', DocumentType: 'mykid', DocumentNumberMasked: '******-**-0031', DocumentNumberHash: 'hash_160401010031', DocumentFileKey: 'kyc-documents/demo_parent/child_ibad_demo/kyc_ibad_demo_mykid', Status: 'pending', SubmittedAt: now, CreatedAt: now, UpdatedAt: now });

  // SharedFunds
  console.log('→ SharedFunds');
  await put(T.sharedFunds, {
    SharedFundId: 'fund_emergency_001', Name: 'Family Emergency Fund', UserId: 'demo_parent', Balance: 500, GoalAmount: 2000, ApprovalRule: 'ALL',
    Members: [{ UserId: 'demo_parent', Role: 'ADMIN' }, { UserId: 'demo_child', Role: 'MEMBER' }],
    Contributions: [{ ContributorId: 'demo_parent', Amount: 400, CreatedAt: daysAgo(14) }, { ContributorId: 'demo_child', Amount: 100, CreatedAt: daysAgo(7) }],
    WithdrawalRequests: [], CreatedAt: daysAgo(14), UpdatedAt: daysAgo(7),
  });
  await put(T.sharedFunds, {
    SharedFundId: 'fund_school_001', Name: 'School Supplies Fund', UserId: 'demo_parent', Balance: 150, GoalAmount: 300, ApprovalRule: 'PARENT_ONLY',
    Members: [{ UserId: 'demo_parent', Role: 'ADMIN' }, { UserId: 'demo_child', Role: 'MEMBER' }],
    Contributions: [{ ContributorId: 'demo_parent', Amount: 150, CreatedAt: daysAgo(10) }],
    WithdrawalRequests: [], CreatedAt: daysAgo(10), UpdatedAt: daysAgo(10),
  });

  // Approvals
  console.log('→ Approvals');
  await put(T.approvals, { ApprovalId: 'approval_001', RequestId: 'withdrawal_req_001', FundId: 'fund_emergency_001', ApproverId: 'demo_parent', Status: 'PENDING', CreatedAt: now });
  await put(T.approvals, { ApprovalId: 'approval_002', RequestId: 'withdrawal_req_002', FundId: 'fund_school_001', ApproverId: 'demo_parent', Status: 'APPROVED', RespondedAt: daysAgo(1), CreatedAt: daysAgo(5) });

  console.log('\nDone! All demo data seeded into AWS DynamoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
