// ─────────────────────────────────────────────
//  In-Memory Mock Database
// ─────────────────────────────────────────────

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const MockDB: Record<string, any[]> = {
  "JuniorWallet-Profiles": [
    { id: 'demo_parent', fullName: 'Paan', role: 'parent', avatarUrl: '/pfp/paan.png', walletBalance: 2500, createdAt: now, updatedAt: now },
    { id: 'demo_child', fullName: 'Aiman', role: 'child', avatarUrl: '/pfp/child.png', walletBalance: 0, createdAt: now, updatedAt: now },
    { id: 'demo_child_ibad_user', fullName: "MUHAMMAD KHAIRUL IBAD BIN JIMA'AIN", role: 'child', walletBalance: 0, createdAt: now, updatedAt: now }
  ],
  "JuniorWallet-ChildProfiles": [
    { id: 'cp_aiman', userId: 'demo_child', parentId: 'demo_parent', fullName: 'Aiman', ageGroup: 'Teen', responsibilityScore: 72, currentBalance: 165, monthlyAllowance: 165, status: 'active', createdAt: now, updatedAt: now },
    { id: 'child_ibad_demo', userId: 'demo_child_ibad_user', parentId: 'demo_parent', fullName: "MUHAMMAD KHAIRUL IBAD BIN JIMA'AIN", nickname: 'ibad', email: 'ibad.junior@example.com', dateOfBirth: '2016-04-01', ageGroup: 'under_12', relationship: 'son', responsibilityScore: 72, currentBalance: 165, monthlyAllowance: 165, kycStatus: 'kyc_pending', status: 'pending_kyc', createdAt: now, updatedAt: now }
  ],
  "JuniorWallet-ParentChildLinks": [
    { id: 'link_1', parentId: 'demo_parent', childId: 'cp_aiman', relationship: 'father', createdAt: now },
    { id: 'link_ibad', parentId: 'demo_parent', childId: 'child_ibad_demo', relationship: 'father', createdAt: now }
  ],
  "JuniorWallet-Transactions": [
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
  ],
  "JuniorWallet-AllowanceRules": [
    { id: 'rule_1', childId: 'cp_aiman', category: 'discretionary', limitType: 'monthly', amount: 50, isActive: true, createdBy: 'demo_parent', createdAt: now, updatedAt: now },
    { id: 'rule_2', childId: 'cp_aiman', category: 'essential', limitType: 'monthly', amount: 150, isActive: true, createdBy: 'demo_parent', createdAt: now, updatedAt: now }
  ],
  "JuniorWallet-AllowanceRecommendations": [
    {
      id: 'rec_1', childId: 'cp_aiman', suggestedAmount: 165, basicNeeds: 120, schoolAdjustment: 20, flexibleBuffer: 30, savingsGoal: 20, overspendingPenalty: 25, responsibilityScore: 72,
      predictedSpending: { essential: 120, educational: 20, discretionary: 30, savings: 20 },
      riskFlags: [{ category: 'discretionary', message: 'Gaming purchases increased this month. A RM20 gaming limit is recommended.', severity: 'medium' }],
      explanation: 'The recommended allowance is RM165. Food and transport spending were stable, but gaming purchases increased this month. A RM20 gaming limit is recommended.',
      status: 'pending', createdAt: now, aiProvider: 'local', explanationProvider: 'local'
    }
  ],
  "JuniorWallet-ExtraAllowanceRequests": [],
  "JuniorWallet-Goals": [
    { id: 'goal_1', childId: 'cp_aiman', title: 'School Supplies Fund', goalType: 'education', targetAmount: 50, currentAmount: 20, status: 'active', createdAt: now },
    { id: 'goal_2', childId: 'cp_aiman', title: 'Emergency Fund', goalType: 'emergency', targetAmount: 100, currentAmount: 35, status: 'active', createdAt: now }
  ],
  "JuniorWallet-Badges": [
    { id: 'badge_1', name: 'Smart Saver', description: 'Saved consistently for 4 weeks', icon: '💰', requirementKey: 'savings_streak_4', createdAt: now },
    { id: 'badge_2', name: 'Budget Hero', description: 'Stayed within all category limits', icon: '🦸', requirementKey: 'within_limits', createdAt: now },
    { id: 'badge_3', name: 'Needs First', description: 'Spent mostly on needs over wants', icon: '🎯', requirementKey: 'needs_ratio', createdAt: now },
    { id: 'badge_4', name: 'Goal Builder', description: 'Created and funded a savings goal', icon: '🏗️', requirementKey: 'goal_funded', createdAt: now },
  ],
  "JuniorWallet-ChildBadges": [
    { id: 'cb_1', childId: 'cp_aiman', badgeId: 'badge_1', unlockedAt: daysAgo(14) },
    { id: 'cb_2', childId: 'cp_aiman', badgeId: 'badge_3', unlockedAt: daysAgo(7) }
  ],
  "JuniorWallet-Alerts": [
    { id: 'alert_1', childId: 'cp_aiman', parentId: 'demo_parent', title: 'Risky Transaction Detected', message: 'Aiman made a RM120 purchase at an unknown store. Please review.', severity: 'warning', read: false, createdAt: daysAgo(10) },
    { id: 'alert_2', childId: 'cp_aiman', parentId: 'demo_parent', title: 'AI Recommendation Ready', message: 'New monthly allowance recommendation for Aiman: RM165', severity: 'info', read: false, createdAt: now },
    { id: 'alert_3', childId: 'cp_aiman', parentId: 'demo_parent', title: 'Gaming Limit Warning', message: 'Aiman is approaching the RM50 gaming limit this month.', severity: 'warning', read: false, createdAt: daysAgo(5) }
  ],
  "JuniorWallet-AuditLogs": [
    { id: 'audit_child_ibad_created', actorId: 'demo_parent', action: 'child_created', entityType: 'child_profile', entityId: 'child_ibad_demo', newValue: { childId: 'child_ibad_demo', nickname: 'ibad', fullName: "MUHAMMAD KHAIRUL IBAD BIN JIMA'AIN", kycStatus: 'kyc_pending', documentNumberMasked: '******-**-0031' }, createdAt: now }
  ],
  "JuniorWallet-ChildKycDocuments": [
    { id: 'kyc_ibad_demo_mykid', childId: 'child_ibad_demo', parentId: 'demo_parent', documentType: 'mykid', documentNumberMasked: '******-**-0031', documentNumberHash: 'hash_160401010031', documentFileKey: 'kyc-documents/demo_parent/child_ibad_demo/kyc_ibad_demo_mykid', status: 'pending', submittedAt: now, createdAt: now, updatedAt: now }
  ]
};

// Also fallback to "smart-wallet-*" naming so it works regardless of .env configuration.
export function GetMockTable(tableName: string) {
  const normalizedName = tableName.replace("smart-wallet-", "JuniorWallet-").replace("juniorwallet-", "JuniorWallet-");
  // Some callers might use lowercase names or with hyphens, we try to match our PascalCase keys.
  // Actually, we should try to match the exact keys we defined above.
  
  // Standard mapping
  const tableMapping: Record<string, string> = {
    'smart-wallet-profiles': 'JuniorWallet-Profiles',
    'juniorwallet-profiles': 'JuniorWallet-Profiles',
    'smart-wallet-child-profiles': 'JuniorWallet-ChildProfiles',
    'juniorwallet-child-profiles': 'JuniorWallet-ChildProfiles',
    'smart-wallet-parent-child-links': 'JuniorWallet-ParentChildLinks',
    'juniorwallet-parent-child-links': 'JuniorWallet-ParentChildLinks',
    'smart-wallet-transactions': 'JuniorWallet-Transactions',
    'juniorwallet-transactions': 'JuniorWallet-Transactions',
    'smart-wallet-allowance-rules': 'JuniorWallet-AllowanceRules',
    'juniorwallet-allowance-rules': 'JuniorWallet-AllowanceRules',
    'smart-wallet-allowance-recommendations': 'JuniorWallet-AllowanceRecommendations',
    'juniorwallet-allowance-recommendations': 'JuniorWallet-AllowanceRecommendations',
    'smart-wallet-extra-allowance-requests': 'JuniorWallet-ExtraAllowanceRequests',
    'juniorwallet-extra-allowance-requests': 'JuniorWallet-ExtraAllowanceRequests',
    'smart-wallet-goals': 'JuniorWallet-Goals',
    'juniorwallet-goals': 'JuniorWallet-Goals',
    'smart-wallet-badges': 'JuniorWallet-Badges',
    'juniorwallet-badges': 'JuniorWallet-Badges',
    'smart-wallet-child-badges': 'JuniorWallet-ChildBadges',
    'juniorwallet-child-badges': 'JuniorWallet-ChildBadges',
    'smart-wallet-alerts': 'JuniorWallet-Alerts',
    'juniorwallet-alerts': 'JuniorWallet-Alerts',
    'smart-wallet-audit-logs': 'JuniorWallet-AuditLogs',
    'juniorwallet-audit-logs': 'JuniorWallet-AuditLogs',
    'smart-wallet-child-kyc-documents': 'JuniorWallet-ChildKycDocuments',
    'juniorwallet-child-kyc-documents': 'JuniorWallet-ChildKycDocuments',
  };

  const targetKey = tableMapping[normalizedName.toLowerCase()] || tableName;

  if (!MockDB[targetKey]) {
    MockDB[targetKey] = [];
  }
  return MockDB[targetKey];
}

