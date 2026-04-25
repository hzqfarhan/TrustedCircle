"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { BadgeCard } from "@/components/BadgeCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Award } from "lucide-react";

export default function ChildBadgesPage() {
  const { currentUser, isLoading } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch("/api/dashboard/child")
      .then((r) => r.json())
      .then((d) => setBadges(d.badges || []))
      .finally(() => setLoading(false));
  }, [currentUser, isLoading]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="My Badges" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {badges.length === 0
          ? <EmptyState icon={<Award size={24} className="text-gray-300" />} title="No badges yet" description="Keep up good habits to earn badges!" />
          : <div className="grid grid-cols-2 gap-3">
              {badges.map((cb: any, i: number) => (
                <BadgeCard key={cb.id} badge={cb.badge} unlocked={true} unlockedAt={cb.unlockedAt} index={i} />
              ))}
            </div>
        }
      </div>
      <BottomNav />
    </MobileShell>
  );
}
