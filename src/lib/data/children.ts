import { getItem, putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';
import type { ChildProfile, ParentChildLink } from '@/types';

export async function getChildProfile(id: string): Promise<ChildProfile | null> {
  return getItem<ChildProfile>(Tables.childProfiles, { id });
}

export async function getChildProfileByUserId(userId: string): Promise<ChildProfile | null> {
  const results = await queryItems<ChildProfile>(
    Tables.childProfiles,
    'userId-index',
    'userId = :userId',
    { ':userId': userId },
    { limit: 1 }
  );
  return results[0] || null;
}

export async function getChildrenByParent(parentId: string): Promise<ChildProfile[]> {
  return queryItems<ChildProfile>(
    Tables.childProfiles,
    'parentId-index',
    'parentId = :parentId',
    { ':parentId': parentId }
  );
}

export async function createChildProfile(child: ChildProfile): Promise<void> {
  await putItem(Tables.childProfiles, child);
}

export async function updateChildProfile(id: string, updates: Partial<ChildProfile>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'id'));
  await updateItem(Tables.childProfiles, { id }, { ...clean, updatedAt: new Date().toISOString() });
}

// Parent-Child Links
export async function getParentChildLinks(parentId: string): Promise<ParentChildLink[]> {
  return queryItems<ParentChildLink>(
    Tables.parentChildLinks,
    'parentId-index',
    'parentId = :parentId',
    { ':parentId': parentId }
  );
}

export async function getChildParentLink(childId: string): Promise<ParentChildLink | null> {
  const results = await queryItems<ParentChildLink>(
    Tables.parentChildLinks,
    'childId-index',
    'childId = :childId',
    { ':childId': childId },
    { limit: 1 }
  );
  return results[0] || null;
}

export async function createParentChildLink(link: ParentChildLink): Promise<void> {
  await putItem(Tables.parentChildLinks, link);
}

export async function isParentOfChild(parentId: string, childId: string): Promise<boolean> {
  const links = await getParentChildLinks(parentId);
  return links.some((l) => l.childId === childId);
}
