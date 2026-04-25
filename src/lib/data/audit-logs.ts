import { PutItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { AuditLog } from '@/types';

export async function CreateAuditLog(log: AuditLog): Promise<void> {
  await PutItem(Tables.auditLogs, log as Record<string, unknown>);
}

export async function GetAuditLogsByActor(actorId: string): Promise<AuditLog[]> {
  return QueryItems<AuditLog>(
    Tables.auditLogs,
    'actorId-createdAt-index',
    'actorId = :actorId',
    { ':actorId': actorId },
    { scanForward: false }
  );
}
