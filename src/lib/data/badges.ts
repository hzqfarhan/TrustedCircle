import { GetItem, PutItem, QueryItems, Tables, ScanItems } from '@/lib/aws/dynamodb';
import type { Badge, ChildBadge } from '@/types';

export async function GetAllBadges(): Promise<Badge[]> {
  return ScanItems<Badge>(Tables.badges);
}

export async function GetBadge(id: string): Promise<Badge | null> {
  return GetItem<Badge>(Tables.badges, { id });
}

export async function GetChildBadges(childId: string): Promise<ChildBadge[]> {
  return QueryItems<ChildBadge>(
    Tables.childBadges,
    'childId-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function GrantBadgeToChild(childId: string, badgeId: string): Promise<void> {
  const id = `${childId}_${badgeId}`;
  const exists = await GetItem<ChildBadge>(Tables.childBadges, { id });
  if (exists) return;

  await PutItem(Tables.childBadges, {
    id,
    childId,
    badgeId,
    unlockedAt: new Date().toISOString()
  });
}

export async function GetChildBadgesWithDetails(childId: string): Promise<(ChildBadge & { badge: Badge })[]> {
  const [earned, allBadges] = await Promise.all([
    GetChildBadges(childId),
    GetAllBadges()
  ]);

  return earned.map(e => ({
    ...e,
    badge: allBadges.find(b => b.id === e.badgeId)!
  })).filter(b => !!b.badge);
}
