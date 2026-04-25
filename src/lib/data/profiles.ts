import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { Profile } from '@/types';

export async function getProfile(id: string): Promise<Profile | null> {
  return getItem<Profile>(Tables.profiles, { id });
}

export async function getProfilesByRole(role: string): Promise<Profile[]> {
  return queryItems<Profile>(
    Tables.profiles,
    'role-index',
    '#role = :role',
    { ':role': role },
    { expressionNames: { '#role': 'role' } }
  );
}

export async function createProfile(profile: Profile): Promise<void> {
  await putItem(Tables.profiles, profile as Record<string, unknown>);
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  const { id: _, ...rest } = { id, ...updates };
  await updateItem(Tables.profiles, { id }, { ...rest, updatedAt: new Date().toISOString() });
}

export async function updateWalletBalance(id: string, newBalance: number): Promise<void> {
  await updateItem(Tables.profiles, { id }, { walletBalance: newBalance, updatedAt: new Date().toISOString() });
}
