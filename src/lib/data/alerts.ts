import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { Alert } from '@/types';

export async function GetAlert(id: string): Promise<Alert | null> {
  return GetItem<Alert>(Tables.alerts, { id });
}

export async function GetAlertsByParent(parentId: string): Promise<Alert[]> {
  return QueryItems<Alert>(
    Tables.alerts,
    'parentId-createdAt-index',
    'parentId = :parentId',
    { ':parentId': parentId },
    { scanForward: false }
  );
}

export async function GetAlertsByChild(childId: string): Promise<Alert[]> {
  return QueryItems<Alert>(
    Tables.alerts,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false }
  );
}

export async function CreateAlert(alert: Alert): Promise<void> {
  await PutItem(Tables.alerts, alert as Record<string, unknown>);
}

export async function MarkAlertAsRead(id: string): Promise<void> {
  await UpdateItem(Tables.alerts, { id }, { read: true });
}

export async function MarkAllAlertsAsRead(parentId: string): Promise<void> {
  const alerts = await GetAlertsByParent(parentId);
  const unread = alerts.filter(a => !a.read);
  await Promise.all(unread.map(a => MarkAlertAsRead(a.id)));
}
