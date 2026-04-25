import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { ExtraAllowanceRequest } from '@/types';

export async function GetExtraRequest(id: string): Promise<ExtraAllowanceRequest | null> {
  return GetItem<ExtraAllowanceRequest>(Tables.extraRequests, { id });
}

export async function GetRequestsByChild(childId: string): Promise<ExtraAllowanceRequest[]> {
  return QueryItems<ExtraAllowanceRequest>(
    Tables.extraRequests,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false }
  );
}

export async function GetPendingRequestsByParent(parentId: string): Promise<ExtraAllowanceRequest[]> {
  return QueryItems<ExtraAllowanceRequest>(
    Tables.extraRequests,
    'parentId-status-index',
    'parentId = :parentId AND #status = :status',
    { ':parentId': parentId, ':status': 'pending' },
    { expressionNames: { '#status': 'status' } }
  );
}

export async function CreateExtraRequest(req: ExtraAllowanceRequest): Promise<void> {
  await PutItem(Tables.extraRequests, req as Record<string, unknown>);
}

export async function ResolveExtraRequest(
  id: string,
  status: 'approved' | 'rejected' | 'partially_approved',
  approvedAmount?: number,
  parentMessage?: string
): Promise<void> {
  const updates: any = { 
    status, 
    resolvedAt: new Date().toISOString() 
  };
  if (approvedAmount !== undefined) updates.approvedAmount = approvedAmount;
  if (parentMessage !== undefined) updates.parentMessage = parentMessage;

  await UpdateItem(Tables.extraRequests, { id }, updates);
}
