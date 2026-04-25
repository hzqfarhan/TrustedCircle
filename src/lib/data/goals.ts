import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { Goal } from '@/types';

export async function GetGoal(id: string): Promise<Goal | null> {
  return GetItem<Goal>(Tables.goals, { id });
}

export async function GetGoalsByChild(childId: string, status?: 'active' | 'completed' | 'cancelled'): Promise<Goal[]> {
  const condition = status 
    ? 'childId = :childId AND #status = :status'
    : 'childId = :childId';
  
  const values: any = { ':childId': childId };
  if (status) values[':status'] = status;

  return QueryItems<Goal>(
    Tables.goals,
    'childId-status-index',
    condition,
    values,
    { expressionNames: status ? { '#status': 'status' } : undefined }
  );
}

export async function CreateGoal(goal: Goal): Promise<void> {
  await PutItem(Tables.goals, goal as Record<string, unknown>);
}

export async function UpdateGoalProgress(id: string, amount: number): Promise<void> {
  const goal = await GetGoal(id);
  if (!goal) return;

  const newAmount = goal.currentAmount + amount;
  const updates: any = { currentAmount: newAmount };
  
  if (newAmount >= goal.targetAmount) {
    updates.status = 'completed';
    updates.completedAt = new Date().toISOString();
  }

  await UpdateItem(Tables.goals, { id }, updates);
}
