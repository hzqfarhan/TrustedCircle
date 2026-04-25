// ─────────────────────────────────────────────
//  Authorization Guards — Server-side
// ─────────────────────────────────────────────

import { GetProfile } from '@/lib/data/profiles';
import { IsParentOfChild, GetChildProfile, GetChildProfileByUserId } from '@/lib/data/children';
import type { AuthUser } from '@/lib/auth/auth';

export async function AssertParentCanAccessChild(parentId: string, childId: string): Promise<void> {
  const isLinked = await IsParentOfChild(parentId, childId);
  if (!isLinked) {
    throw new Error('Unauthorized: Parent is not linked to this child');
  }
}

export async function AssertChildOwnsProfile(userId: string, childProfileId: string): Promise<void> {
  const childProfile = await GetChildProfile(childProfileId);
  if (!childProfile || childProfile.userId !== userId) {
    throw new Error('Unauthorized: Child does not own this profile');
  }
}

export async function AssertCanReadChildData(user: AuthUser, childId: string): Promise<void> {
  const profile = await GetProfile(user.sub);
  if (!profile) throw new Error('Unauthorized: Profile not found');

  if (profile.role === 'parent') {
    await AssertParentCanAccessChild(user.sub, childId);
    return;
  }

  if (profile.role === 'child') {
    const childProfile = await GetChildProfile(childId);
    if (!childProfile || childProfile.userId !== user.sub) {
      throw new Error('Unauthorized: Child can only access own data');
    }
    return;
  }

  throw new Error('Unauthorized: Invalid role for this action');
}

export async function AssertCanMutateChildData(user: AuthUser, childId: string): Promise<void> {
  const profile = await GetProfile(user.sub);
  if (!profile) throw new Error('Unauthorized: Profile not found');

  if (profile.role === 'parent') {
    await AssertParentCanAccessChild(user.sub, childId);
    return;
  }

  throw new Error('Unauthorized: Only parents can mutate child data');
}

export async function AssertIsChild(user: AuthUser): Promise<string> {
  const profile = await GetProfile(user.sub);
  if (!profile || profile.role !== 'child') {
    throw new Error('Unauthorized: Requires child role');
  }
  const childProfile = await GetChildProfileByUserId(user.sub);
  if (!childProfile) {
    throw new Error('Unauthorized: No child profile found');
  }
  return childProfile.id;
}


