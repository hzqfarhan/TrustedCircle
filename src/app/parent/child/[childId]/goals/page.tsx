"use client";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { GoalCard } from "@/components/GoalCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { Target } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChildGoalsPage() {
  const { currentUser, isLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch(`/api/dashboard/parent/${childId}`).then((r) => r.json()).then((d) => setGoals(d.goals || [])).finally(() => setLoading(false));
  }, [currentUser, isLoading, childId]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Savings Goals" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {goals.length === 0 ? <EmptyState icon={<Target size={24} className="text-gray-300" />} title="No goals yet" /> : (
          <div className="space-y-3">{goals.map((g: any, i: number) => <GoalCard key={g.id} goal={g} index={i} />)}</div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
