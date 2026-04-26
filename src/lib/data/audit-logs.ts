import { putItem, Tables } from '@/lib/aws/dynamodb';
import type { AuditLog } from '@/types';
import { v4 as uuid } from 'uuid';

export async function createAuditLog(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
): Promise<void> {
  const log: AuditLog = {
    id: uuid(),
    actorId,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
  };
  await putItem(Tables.auditLogs, log);
}
