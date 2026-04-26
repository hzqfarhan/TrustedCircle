import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';

export interface SharedFundMember {
  userId: string;
  role: string;
}

export interface SharedFundContribution {
  contributorId: string;
  amount: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  requesterId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

export interface SharedFund {
  id: string;
  name: string;
  userId: string;
  description?: string;
  goalAmount?: number;
  approvalRule?: string;
  balance: number;
  members: SharedFundMember[];
  contributions: SharedFundContribution[];
  withdrawalRequests: WithdrawalRequest[];
  createdAt: string;
  updatedAt?: string;
}

export async function getSharedFund(id: string): Promise<SharedFund | null> {
  return getItem<SharedFund>(Tables.sharedFunds, { id });
}

export async function getSharedFundsByUser(userId: string): Promise<SharedFund[]> {
  return queryItems<SharedFund>(
    Tables.sharedFunds,
    'userId-index',
    'userId = :userId',
    { ':userId': userId }
  );
}

export async function createSharedFund(
  fund: Partial<Omit<SharedFund, 'id' | 'createdAt' | 'balance' | 'userId'>> & { ownerId: string; name: string }
): Promise<string> {
  const id = crypto.randomUUID();
  await putItem(Tables.sharedFunds, {
    ...fund,
    userId: fund.ownerId,
    id,
    balance: 0,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateSharedFund(id: string, updates: Partial<SharedFund>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'id'));
  await updateItem(Tables.sharedFunds, { id }, { ...clean, updatedAt: new Date().toISOString() });
}

export async function addFundMember(fundId: string, member: SharedFundMember): Promise<void> {
  const fund = await getSharedFund(fundId);
  if (!fund) throw new Error('Fund not found');
  const members = [...(fund.members || []), member];
  await updateItem(Tables.sharedFunds, { id: fundId }, { members, updatedAt: new Date().toISOString() });
}

export async function contributeToFund(fundId: string, amount: number, contributorId: string): Promise<void> {
  const fund = await getSharedFund(fundId);
  if (!fund) throw new Error('Fund not found');
  const contribution: SharedFundContribution = {
    contributorId,
    amount,
    createdAt: new Date().toISOString(),
  };
  const contributions = [...(fund.contributions || []), contribution];
  const newBalance = (fund.balance || 0) + amount;
  await updateItem(Tables.sharedFunds, { id: fundId }, {
    balance: newBalance,
    contributions,
    updatedAt: new Date().toISOString(),
  });
}

export async function requestWithdrawal(
  fundId: string,
  requesterId: string,
  amount: number,
  reason: string
): Promise<string> {
  const fund = await getSharedFund(fundId);
  if (!fund) throw new Error('Fund not found');
  const requestId = crypto.randomUUID();
  const withdrawal: WithdrawalRequest = {
    id: requestId,
    requesterId,
    amount,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  const withdrawalRequests = [...(fund.withdrawalRequests || []), withdrawal];
  await updateItem(Tables.sharedFunds, { id: fundId }, {
    withdrawalRequests,
    updatedAt: new Date().toISOString(),
  });
  return requestId;
}
