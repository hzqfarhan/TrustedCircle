import { GetItem, PutItem, UpdateItem, QueryItems, Tables } from '@/lib/aws/dynamodb';
import type { ChildProfile, ParentChildLink } from '@/types';

export async function GetChildProfile(id: string): Promise<ChildProfile | null> {
  return GetItem<ChildProfile>(Tables.childProfiles, { id });
}

export async function GetChildProfileByUserId(userId: string): Promise<ChildProfile | null> {
  const results = await QueryItems<ChildProfile>(
    Tables.childProfiles,
    'userId-index',
    'userId = :userId',
    { ':userId': userId },
    { limit: 1 }
  );
  return results[0] || null;
}

export async function GetChildrenByParent(parentId: string): Promise<ChildProfile[]> {
  return QueryItems<ChildProfile>(
    Tables.childProfiles,
    'parentId-index',
    'parentId = :parentId',
    { ':parentId': parentId }
  );
}

export async function CreateChildProfile(child: ChildProfile): Promise<void> {
  await PutItem(Tables.childProfiles, child as Record<string, unknown>);
}

export async function UpdateChildProfile(id: string, updates: Partial<ChildProfile>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'id'));
  await UpdateItem(Tables.childProfiles, { id }, { ...clean, updatedAt: new Date().toISOString() });
}

// Parent-Child Links
export async function GetParentChildLinks(parentId: string): Promise<ParentChildLink[]> {
  return QueryItems<ParentChildLink>(
    Tables.parentChildLinks,
    'parentId-index',
    'parentId = :parentId',
    { ':parentId': parentId }
  );
}

export async function GetChildParentLink(childId: string): Promise<ParentChildLink | null> {
  const results = await QueryItems<ParentChildLink>(
    Tables.parentChildLinks,
    'childId-index',
    'childId = :childId',
    { ':childId': childId },
    { limit: 1 }
  );
  return results[0] || null;
}

export async function CreateParentChildLink(link: ParentChildLink): Promise<void> {
  await PutItem(Tables.parentChildLinks, link as Record<string, unknown>);
}

export async function IsParentOfChild(parentId: string, childId: string): Promise<boolean> {
  const links = await GetParentChildLinks(parentId);
  return links.some((l) => l.childId === childId);
}
