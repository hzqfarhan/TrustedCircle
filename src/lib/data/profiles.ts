import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { Profile } from '@/types';

export async function GetProfile(id: string): Promise<Profile | null> {
  return GetItem<Profile>(Tables.profiles, { id });
}

export async function GetProfilesByRole(role: string): Promise<Profile[]> {
  return QueryItems<Profile>(
    Tables.profiles,
    'role-index',
    '#role = :role',
    { ':role': role },
    { expressionNames: { '#role': 'role' } }
  );
}

export async function CreateProfile(profile: Profile): Promise<void> {
  await PutItem(Tables.profiles, profile as Record<string, unknown>);
}

export async function UpdateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  const { id: _, ...rest } = { id, ...updates };
  await UpdateItem(Tables.profiles, { id }, { ...rest, updatedAt: new Date().toISOString() });
}

export async function UpdateWalletBalance(id: string, newBalance: number): Promise<void> {
  await UpdateItem(Tables.profiles, { id }, { walletBalance: newBalance, updatedAt: new Date().toISOString() });
}
