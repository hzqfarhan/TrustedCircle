// ─────────────────────────────────────────────
//  Authorization Guards — Server-side
// ─────────────────────────────────────────────

import { getProfile } from '@/lib/data/profiles';
import { isParentOfChild, getChildProfile, getChildProfileByUserId } from '@/lib/data/children';
import type { AuthUser } from '@/lib/auth/auth';

export async function assertParentCanAccessChild(parentId: string, childId: string): Promise<void> {
  const isLinked = await isParentOfChild(parentId, childId);
  if (!isLinked) {
    throw new Error('Unauthorized: Parent is not linked to this child');
  }
}

export async function assertChildOwnsProfile(userId: string, childProfileId: string): Promise<void> {
  const childProfile = await getChildProfile(childProfileId);
  if (!childProfile || childProfile.userId !== userId) {
    throw new Error('Unauthorized: Child does not own this profile');
  }
}

export async function assertCanReadChildData(user: AuthUser, childId: string): Promise<void> {
  const profile = await getProfile(user.sub);
  if (!profile) throw new Error('Unauthorized: Profile not found');

  if (profile.role === 'parent') {
    await assertParentCanAccessChild(user.sub, childId);
    return;
  }

  if (profile.role === 'child') {
    const childProfile = await getChildProfile(childId);
    if (!childProfile || childProfile.userId !== user.sub) {
      throw new Error('Unauthorized: Child can only access own data');
    }
    return;
  }

  throw new Error('Unauthorized: Invalid role for this action');
}

export async function assertCanMutateChildData(user: AuthUser, childId: string): Promise<void> {
  const profile = await getProfile(user.sub);
  if (!profile) throw new Error('Unauthorized: Profile not found');

  if (profile.role === 'parent') {
    await assertParentCanAccessChild(user.sub, childId);
    return;
  }

  throw new Error('Unauthorized: Only parents can mutate child data');
}

export async function assertIsChild(user: AuthUser): Promise<string> {
  const profile = await getProfile(user.sub);
  if (!profile || profile.role !== 'child') {
    throw new Error('Unauthorized: Requires child role');
  }
  const childProfile = await getChildProfileByUserId(user.sub);
  if (!childProfile) {
    throw new Error('Unauthorized: No child profile found');
  }
  return childProfile.id;
}
