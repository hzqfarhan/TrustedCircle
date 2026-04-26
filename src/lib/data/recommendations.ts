import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { AllowanceRecommendation } from '@/types';

export async function getRecommendation(id: string): Promise<AllowanceRecommendation | null> {
  return getItem<AllowanceRecommendation>(Tables.recommendations, { id });
}

export async function getRecommendationsByChild(
  childId: string,
  limit = 5
): Promise<AllowanceRecommendation[]> {
  return queryItems<AllowanceRecommendation>(
    Tables.recommendations,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit }
  );
}

export async function getPendingRecommendations(): Promise<AllowanceRecommendation[]> {
  return queryItems<AllowanceRecommendation>(
    Tables.recommendations,
    'status-index',
    '#status = :status',
    { ':status': 'pending' },
    { expressionNames: { '#status': 'status' } }
  );
}

export async function createRecommendation(rec: AllowanceRecommendation): Promise<void> {
  await putItem(Tables.recommendations, rec);
}

export async function approveRecommendation(
  id: string,
  approvedAmount: number,
  approvedBy: string
): Promise<void> {
  await updateItem(Tables.recommendations, { id }, {
    status: 'approved',
    approvedAmount,
    approvedBy,
    resolvedAt: new Date().toISOString(),
  });
}

export async function rejectRecommendation(id: string): Promise<void> {
  await updateItem(Tables.recommendations, { id }, {
    status: 'rejected',
    resolvedAt: new Date().toISOString(),
  });
}
