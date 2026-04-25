// ─────────────────────────────────────────────
//  Smart Allowance System — TypeScript Types
// ─────────────────────────────────────────────

export interface Profile {
  id: string;
  fullName: string;
  role: 'parent' | 'child' | 'admin';
  avatarUrl?: string;
  phone?: string;
  walletBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  userId: string;
  parentId: string;
  fullName: string;
  ageGroup: string;
  responsibilityScore: number;
  currentBalance: number;
  monthlyAllowance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  relationship: string;
  createdAt: string;
}

export type TransactionCategory = 'essential' | 'educational' | 'savings' | 'discretionary' | 'risky';
export type NeedWant = 'need' | 'want' | 'neutral';
export type TransactionType = 'spend' | 'topup' | 'transfer' | 'saving';

export interface Transaction {
  id: string;
  childId: string;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  classification: TransactionCategory;
  needWant: NeedWant;
  transactionType: TransactionType;
  riskFlag: boolean;
  note?: string;
  createdAt: string;
}

export interface AllowanceRule {
  id: string;
  childId: string;
  category: string;
  limitType: 'daily' | 'weekly' | 'monthly';
  amount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export interface PredictedSpending {
  essential: number;
  educational: number;
  discretionary: number;
  savings: number;
}

export interface RiskFlag {
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AllowanceRecommendation {
  id: string;
  childId: string;
  suggestedAmount: number;
  basicNeeds: number;
  schoolAdjustment: number;
  flexibleBuffer: number;
  savingsGoal: number;
  overspendingPenalty: number;
  responsibilityScore: number;
  predictedSpending: PredictedSpending;
  riskFlags: RiskFlag[];
  explanation: string;
  status: RecommendationStatus;
  approvedAmount?: number;
  approvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type ExtraRequestStatus = 'pending' | 'approved' | 'rejected' | 'partially_approved';

export interface ExtraAllowanceRequest {
  id: string;
  childId: string;
  parentId: string;
  amount: number;
  reason: string;
  childNote: string;
  status: ExtraRequestStatus;
  approvedAmount?: number;
  parentMessage?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Goal {
  id: string;
  childId: string;
  title: string;
  goalType: string;
  targetAmount: number;
  currentAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementKey: string;
  createdAt: string;
}

export interface ChildBadge {
  id: string;
  childId: string;
  badgeId: string;
  unlockedAt: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface Alert {
  id: string;
  childId: string;
  parentId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}

// Dashboard aggregate types
export interface ParentDashboardData {
  profile: Profile;
  children: ChildProfile[];
  recentTransactions: Transaction[];
  pendingRecommendations: AllowanceRecommendation[];
  pendingRequests: ExtraAllowanceRequest[];
  alerts: Alert[];
  totalChildBalance: number;
}

export interface ChildDashboardData {
  profile: Profile;
  childProfile: ChildProfile;
  recentTransactions: Transaction[];
  currentRecommendation?: AllowanceRecommendation;
  goals: Goal[];
  badges: (ChildBadge & { badge: Badge })[];
  rules: AllowanceRule[];
  weeklySpent: number;
  dailySafeSpend: number;
  spendingByCategory: Record<string, number>;
}
