import { putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { Alert } from '@/types';

export async function getAlertsByParent(parentId: string, limit = 20): Promise<Alert[]> {
  return queryItems<Alert>(
    Tables.alerts,
    'parentId-createdAt-index',
    'parentId = :parentId',
    { ':parentId': parentId },
    { scanForward: false, limit }
  );
}

export async function getAlertsByChild(childId: string, limit = 20): Promise<Alert[]> {
  return queryItems<Alert>(
    Tables.alerts,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit }
  );
}

export async function getUnreadAlertsByParent(parentId: string): Promise<Alert[]> {
  return queryItems<Alert>(
    Tables.alerts,
    'parentId-createdAt-index',
    'parentId = :parentId',
    { ':parentId': parentId, ':read': false },
    {
      scanForward: false,
      filterExpression: '#read = :read',
      expressionNames: { '#read': 'read' },
    }
  );
}

export async function createAlert(alert: Alert): Promise<void> {
  await putItem(Tables.alerts, alert);
}

export async function getUnreadAlertsByChild(childId: string): Promise<Alert[]> {
  return queryItems<Alert>(
    Tables.alerts,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId, ':read': false },
    {
      scanForward: false,
      filterExpression: '#read = :read',
      expressionNames: { '#read': 'read' },
    }
  );
}

export async function markAlertRead(id: string): Promise<void> {
  await updateItem(Tables.alerts, { id }, { read: true });
}
