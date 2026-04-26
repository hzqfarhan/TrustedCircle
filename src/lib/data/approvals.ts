import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';

export interface Approval {
  id: string;
  fundId: string;
  requestId: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requesterId: string;
  responderId?: string;
  createdAt: string;
  respondedAt?: string;
}

export async function getApproval(id: string): Promise<Approval | null> {
  return getItem<Approval>(Tables.approvals, { id });
}

export async function getApprovalsByFund(fundId: string): Promise<Approval[]> {
  return queryItems<Approval>(
    Tables.approvals,
    'fundId-index',
    'fundId = :fundId',
    { ':fundId': fundId }
  );
}

export async function getApprovalsByRequest(requestId: string): Promise<Approval[]> {
  return queryItems<Approval>(
    Tables.approvals,
    'requestId-index',
    'requestId = :requestId',
    { ':requestId': requestId }
  );
}

export async function createApproval(approval: Omit<Approval, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const id = crypto.randomUUID();
  await putItem(Tables.approvals, {
    ...approval,
    id,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateApprovalStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  responderId: string
): Promise<void> {
  await updateItem(Tables.approvals, { id }, {
    status,
    responderId,
    respondedAt: new Date().toISOString(),
  });
}
