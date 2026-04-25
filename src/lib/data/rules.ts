import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { AllowanceRule } from '@/types';

export async function getRule(id: string): Promise<AllowanceRule | null> {
  return getItem<AllowanceRule>(Tables.allowanceRules, { id });
}

export async function getRulesByChild(childId: string): Promise<AllowanceRule[]> {
  return queryItems<AllowanceRule>(
    Tables.allowanceRules,
    'childId-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function createRule(rule: AllowanceRule): Promise<void> {
  await putItem(Tables.allowanceRules, rule as Record<string, unknown>);
}

export async function updateRule(id: string, updates: Partial<AllowanceRule>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'id'));
  await updateItem(Tables.allowanceRules, { id }, { ...clean, updatedAt: new Date().toISOString() });
}
