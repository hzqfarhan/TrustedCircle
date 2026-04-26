import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { ExtraAllowanceRequest } from '@/types';

export async function getExtraRequest(id: string): Promise<ExtraAllowanceRequest | null> {
  return getItem<ExtraAllowanceRequest>(Tables.extraRequests, { id });
}

export async function getRequestsByChild(childId: string, limit = 10): Promise<ExtraAllowanceRequest[]> {
  return queryItems<ExtraAllowanceRequest>(
    Tables.extraRequests,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit }
  );
}

export async function getRequestsByParent(parentId: string, status?: string): Promise<ExtraAllowanceRequest[]> {
  if (status) {
    return queryItems<ExtraAllowanceRequest>(
      Tables.extraRequests,
      'parentId-status-index',
      'parentId = :parentId AND #status = :status',
      { ':parentId': parentId, ':status': status },
      { expressionNames: { '#status': 'status' } }
    );
  }
  return queryItems<ExtraAllowanceRequest>(
    Tables.extraRequests,
    'parentId-status-index',
    'parentId = :parentId',
    { ':parentId': parentId }
  );
}

export async function createExtraRequest(req: ExtraAllowanceRequest): Promise<void> {
  await putItem(Tables.extraRequests, req);
}

export async function resolveExtraRequest(
  id: string,
  status: 'approved' | 'rejected' | 'partially_approved',
  approvedAmount?: number,
  parentMessage?: string
): Promise<void> {
  await updateItem(Tables.extraRequests, { id }, {
    status,
    ...(approvedAmount !== undefined && { approvedAmount }),
    ...(parentMessage && { parentMessage }),
    resolvedAt: new Date().toISOString(),
  });
}
