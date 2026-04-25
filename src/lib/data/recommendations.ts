import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { AllowanceRecommendation } from '@/types';

export async function GetRecommendation(id: string): Promise<AllowanceRecommendation | null> {
  return GetItem<AllowanceRecommendation>(Tables.recommendations, { id });
}

export async function GetRecommendationsByChild(childId: string): Promise<AllowanceRecommendation[]> {
  return QueryItems<AllowanceRecommendation>(
    Tables.recommendations,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false }
  );
}

export async function GetLatestRecommendation(childId: string): Promise<AllowanceRecommendation | null> {
  const recs = await GetRecommendationsByChild(childId);
  return recs[0] || null;
}

export async function GetPendingRecommendations(): Promise<AllowanceRecommendation[]> {
  return QueryItems<AllowanceRecommendation>(
    Tables.recommendations,
    'status-index',
    '#status = :status',
    { ':status': 'pending' },
    { expressionNames: { '#status': 'status' } }
  );
}

export async function CreateRecommendation(rec: AllowanceRecommendation): Promise<void> {
  await PutItem(Tables.recommendations, rec as Record<string, unknown>);
}

export async function UpdateRecommendationStatus(
  id: string,
  status: AllowanceRecommendation['status'],
  approvedAmount?: number,
  approvedBy?: string
): Promise<void> {
  const updates: any = { 
    status, 
    resolvedAt: new Date().toISOString() 
  };
  if (approvedAmount !== undefined) updates.approvedAmount = approvedAmount;
  if (approvedBy !== undefined) updates.approvedBy = approvedBy;

  await UpdateItem(Tables.recommendations, { id }, updates);
}

