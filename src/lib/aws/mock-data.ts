// ─────────────────────────────────────────────
//  In-Memory Mock Database
// ─────────────────────────────────────────────

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const MockDB: Record<string, any[]> = {
  "juniorwallet-profiles": [
    { Id: 'demo_parent', FullName: 'Paan', Role: 'parent', AvatarUrl: '/pfp/paan.png', WalletBalance: 2500, CreatedAt: now, UpdatedAt: now },
    { Id: 'demo_child', FullName: 'Aiman', Role: 'child', AvatarUrl: '/pfp/child.png', WalletBalance: 0, CreatedAt: now, UpdatedAt: now }
  ],
  "juniorwallet-child-profiles": [
    { Id: 'cp_aiman', UserId: 'demo_child', ParentId: 'demo_parent', FullName: 'Aiman', AgeGroup: 'Teen', ResponsibilityScore: 72, CurrentBalance: 165, MonthlyAllowance: 165, Status: 'active', CreatedAt: now, UpdatedAt: now }
  ],
  "juniorwallet-parent-child-links": [
    { Id: 'link_1', ParentId: 'demo_parent', ChildId: 'cp_aiman', Relationship: 'father', CreatedAt: now }
  ],
  "juniorwallet-transactions": [
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
  ],
  "juniorwallet-allowance-rules": [
    { Id: 'rule_1', ChildId: 'cp_aiman', Category: 'discretionary', LimitType: 'monthly', Amount: 50, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now },
    { Id: 'rule_2', ChildId: 'cp_aiman', Category: 'essential', LimitType: 'monthly', Amount: 150, IsActive: true, CreatedBy: 'demo_parent', CreatedAt: now, UpdatedAt: now }
  ],
  "juniorwallet-allowance-recommendations": [
    {
      Id: 'rec_1', ChildId: 'cp_aiman', SuggestedAmount: 165, BasicNeeds: 120, SchoolAdjustment: 20, FlexibleBuffer: 30, SavingsGoal: 20, OverspendingPenalty: 25, ResponsibilityScore: 72,
      PredictedSpending: { Essential: 120, Educational: 20, Discretionary: 30, Savings: 20 },
      RiskFlags: [{ Category: 'discretionary', Message: 'Gaming purchases increased this month. A RM20 gaming limit is recommended.', Severity: 'medium' }],
      Explanation: 'The recommended allowance is RM165. Food and transport spending were stable, but gaming purchases increased this month. A RM20 gaming limit is recommended.',
      Status: 'pending', CreatedAt: now, AiProvider: 'local', ExplanationProvider: 'local'
    }
  ],
  "juniorwallet-extra-allowance-requests": [],
  "juniorwallet-goals": [
    { Id: 'goal_1', ChildId: 'cp_aiman', Title: 'School Supplies Fund', GoalType: 'education', TargetAmount: 50, CurrentAmount: 20, Status: 'active', CreatedAt: now },
    { Id: 'goal_2', ChildId: 'cp_aiman', Title: 'Emergency Fund', GoalType: 'emergency', TargetAmount: 100, CurrentAmount: 35, Status: 'active', CreatedAt: now }
  ],
  "juniorwallet-badges": [
    { Id: 'badge_1', Name: 'Smart Saver', Description: 'Saved consistently for 4 weeks', Icon: '💰', RequirementKey: 'savings_streak_4', CreatedAt: now },
    { Id: 'badge_2', Name: 'Budget Hero', Description: 'Stayed within all category limits', Icon: '🦸', RequirementKey: 'within_limits', CreatedAt: now },
    { Id: 'badge_3', Name: 'Needs First', Description: 'Spent mostly on needs over wants', Icon: '🎯', RequirementKey: 'needs_ratio', CreatedAt: now },
    { Id: 'badge_4', Name: 'Goal Builder', Description: 'Created and funded a savings goal', Icon: '🏗️', RequirementKey: 'goal_funded', CreatedAt: now },
  ],
  "juniorwallet-child-badges": [
    { Id: 'cb_1', ChildId: 'cp_aiman', BadgeId: 'badge_1', UnlockedAt: daysAgo(14) },
    { Id: 'cb_2', ChildId: 'cp_aiman', BadgeId: 'badge_3', UnlockedAt: daysAgo(7) }
  ],
  "juniorwallet-alerts": [
    { Id: 'alert_1', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Risky Transaction Detected', Message: 'Aiman made a RM120 purchase at an unknown store. Please review.', Severity: 'warning', Read: false, CreatedAt: daysAgo(10) },
    { Id: 'alert_2', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'AI Recommendation Ready', Message: 'New monthly allowance recommendation for Aiman: RM165', Severity: 'info', Read: false, CreatedAt: now },
    { Id: 'alert_3', ChildId: 'cp_aiman', ParentId: 'demo_parent', Title: 'Gaming Limit Warning', Message: 'Aiman is approaching the RM50 gaming limit this month.', Severity: 'warning', Read: false, CreatedAt: daysAgo(5) }
  ],
  "juniorwallet-audit-logs": []
};

// Also fallback to "smart-wallet-*" naming so it works regardless of .env configuration.
export function getMockTable(tableName: string) {
  const normalizedName = tableName.replace("smart-wallet-", "juniorwallet-");
  if (!MockDB[normalizedName]) {
    MockDB[normalizedName] = [];
  }
  return MockDB[normalizedName];
}
