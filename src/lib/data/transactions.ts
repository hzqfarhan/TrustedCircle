import { getItem, putItem, queryItems, updateItem, Tables } from '@/lib/aws/dynamodb';
import type { Transaction } from '@/types';

export async function getTransaction(id: string): Promise<Transaction | null> {
  return getItem<Transaction>(Tables.transactions, { id });
}

export async function getTransactionsByChild(
  childId: string,
  limit = 20
): Promise<Transaction[]> {
  return queryItems<Transaction>(
    Tables.transactions,
    'childId-createdAt-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit }
  );
}

export async function getTransactionsByChildInRange(
  childId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  return queryItems<Transaction>(
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

export async function createTransaction(tx: Transaction): Promise<void> {
  await putItem(Tables.transactions, tx as Record<string, unknown>);
}

export async function updateTransactionCategory(
  id: string,
  category: string,
  classification: string,
  needWant: string
): Promise<void> {
  await updateItem(Tables.transactions, { id }, { category, classification, needWant });
}
