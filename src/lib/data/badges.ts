import { getItem, putItem, queryItems, scanItems, Tables } from '@/lib/aws/dynamodb';
import type { Badge, ChildBadge } from '@/types';

export async function getBadge(id: string): Promise<Badge | null> {
  return getItem<Badge>(Tables.badges, { id });
}

export async function getAllBadges(): Promise<Badge[]> {
  return scanItems<Badge>(Tables.badges);
}

export async function createBadge(badge: Badge): Promise<void> {
  await putItem(Tables.badges, badge as Record<string, unknown>);
}

export async function getChildBadges(childId: string): Promise<ChildBadge[]> {
  return queryItems<ChildBadge>(
    Tables.childBadges,
    'childId-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function awardBadge(childBadge: ChildBadge): Promise<void> {
  await putItem(Tables.childBadges, childBadge as Record<string, unknown>);
}

export async function getChildBadgesWithDetails(childId: string): Promise<(ChildBadge & { badge: Badge })[]> {
  const childBadges = await getChildBadges(childId);
  const allBadges = await getAllBadges();
  const badgeMap = new Map(allBadges.map((b) => [b.id, b]));

  return childBadges
    .map((cb) => {
      const badge = badgeMap.get(cb.badgeId);
      if (!badge) return null;
      return { ...cb, badge };
    })
    .filter(Boolean) as (ChildBadge & { badge: Badge })[];
}
