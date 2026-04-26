import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { Goal } from '@/types';

export async function getGoal(id: string): Promise<Goal | null> {
  return getItem<Goal>(Tables.goals, { id });
}

export async function getGoalsByChild(childId: string): Promise<Goal[]> {
  return queryItems<Goal>(
    Tables.goals,
    'childId-status-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function getActiveGoalsByChild(childId: string): Promise<Goal[]> {
  return queryItems<Goal>(
    Tables.goals,
    'childId-status-index',
    'childId = :childId AND #status = :status',
    { ':childId': childId, ':status': 'active' },
    { expressionNames: { '#status': 'status' } }
  );
}

export async function createGoal(goal: Goal): Promise<void> {
  await putItem(Tables.goals, goal);
}

export async function updateGoalProgress(id: string, currentAmount: number): Promise<void> {
  const goal = await getGoal(id);
  const updates: Record<string, unknown> = { currentAmount };
  if (goal && currentAmount >= goal.targetAmount) {
    updates.status = 'completed';
    updates.completedAt = new Date().toISOString();
  }
  await updateItem(Tables.goals, { id }, updates);
}
