import { GetItem, PutItem, QueryItems, UpdateItem, Tables } from '@/lib/aws/dynamodb';
import type { Transaction } from '@/types';

export async function GetTransaction(id: string): Promise<Transaction | null> {
  return GetItem<Transaction>(Tables.transactions, { id });
}

export async function GetTransactionsByChild(
  childId: string,
  limit = 20
): Promise<Transaction[]> {
  return QueryItems<Transaction>(
    Tables.transactions,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit }
  );
}

export async function GetTransactionsByChildInRange(
  childId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  return QueryItems<Transaction>(
    Tables.transactions,
    'childId-createdAt-index',
    'childId = :childId AND createdAt BETWEEN :start AND :end',
    {
      ':childId': childId,
      ':start': startDate,
      ':end': endDate,
    },
    { scanForward: false }
  );
}

export async function CreateTransaction(tx: Transaction): Promise<void> {
  await PutItem(Tables.transactions, tx as Record<string, unknown>);
}

export async function UpdateTransactionCategory(
  id: string,
  category: string,
  classification: string,
  needWant: string
): Promise<void> {
  await UpdateItem(Tables.transactions, { id }, { category, classification, needWant });
}
