import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { AllowanceRule } from '@/types';

export async function GetRule(id: string): Promise<AllowanceRule | null> {
  return GetItem<AllowanceRule>(Tables.allowanceRules, { id });
}

export async function GetRulesByChild(childId: string): Promise<AllowanceRule[]> {
  return QueryItems<AllowanceRule>(
    Tables.allowanceRules,
    'childId-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function CreateRule(rule: AllowanceRule): Promise<void> {
  await PutItem(Tables.allowanceRules, rule as Record<string, unknown>);
}

export async function UpdateRule(id: string, updates: Partial<AllowanceRule>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'id'));
  await UpdateItem(Tables.allowanceRules, { id }, { ...clean, updatedAt: new Date().toISOString() });
}

