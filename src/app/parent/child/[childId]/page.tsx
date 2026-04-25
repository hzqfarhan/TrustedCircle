"use client";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { ScoreRing } from "@/components/ScoreRing";
import { SpendingChart } from "@/components/SpendingChart";
import { RecommendationCard } from "@/components/RecommendationCard";
import { CategoryBadge } from "@/components/CategoryBadge";
import { GoalCard } from "@/components/GoalCard";
import { WalletHeader } from "@/components/WalletHeader";
import { FormatRM, FormatDate } from "@/lib/utils-tc";
import { Brain, Target, Zap, BarChart3, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function ChildDetailPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    fetch(`/api/dashboard/parent/${childId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, childId]);

  if (authLoading || loading || !data) return <MobileShell><LoadingState /></MobileShell>;
  const child = data.childProfile;

  return (
    <MobileShell>
      <WalletHeader 
        showBack 
        title={child.fullName} 
        rightElement={
          <Link href={`/parent/child/${childId}/profile`} className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center active:bg-blue-100 transition-colors">
            <User size={16} className="text-blue-600" />
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        <div className="mx-4 mt-3 rounded-3xl p-5" style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #002FA7 100%)" }}>
          <div className="flex items-center gap-4">
            <ScoreRing score={child.responsibilityScore} size={80} strokeWidth={7} showLabel={false} />
            <div>
              <p className="text-white text-lg font-bold">{child.fullName}</p>
              <p className="text-blue-200 text-xs">{child.ageGroup}</p>
              <p className="text-white text-xl font-bold mt-1">{ FormatRM(child.currentBalance)}</p>
              <p className="text-blue-200 text-[10px]">Monthly: { FormatRM(child.monthlyAllowance)}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2 px-4 pt-4">
          {[
            { icon: Brain, label: "AI Rec", href: `/parent/child/${childId}/recommendation`, color: "text-purple-600", bg: "bg-purple-50" },
            { icon: BarChart3, label: "Limits", href: `/parent/child/${childId}/transaction-limit`, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Target, label: "Goals", href: `/parent/child/${childId}/goals`, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: Zap, label: "Requests", href: `/parent/child/${childId}/requests`, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 group">
              <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform`}>
                <item.icon size={20} className={item.color} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>

        {data.spendingByCategory && Object.keys(data.spendingByCategory).length > 0 && (
          <div className="px-4 pt-5"><SpendingChart data={data.spendingByCategory} /></div>
        )}

        {data.currentRecommendation && (
          <div className="px-4 pt-5">
            <RecommendationCard
              recommendation={data.currentRecommendation}
              isParent
              onApprove={async (amount) => {
                const res = await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "approve", recommendationId: data.currentRecommendation.id, approvedAmount: amount }) });
                if (res.ok) { toast.success("Approved!"); window.location.reload(); }
              }}
              onReject={async () => {
                await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "reject", recommendationId: data.currentRecommendation.id }) });
                toast.success("Rejected"); window.location.reload();
              }}
            />
          </div>
        )}

        {(!data.currentRecommendation || data.currentRecommendation.status !== "pending") && (
          <div className="px-4 pt-4">
            <button onClick={async () => {
              const res = await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate", childId }) });
              if (res.ok) { toast.success("Generated!"); window.location.reload(); }
            }} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
              <Brain size={16} /> Generate AI Recommendation
            </button>
          </div>
        )}

        {data.goals?.length > 0 && (
          <div className="px-4 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-3">Savings Goals</p>
            <div className="space-y-2">{data.goals.map((g: any, i: number) => <GoalCard key={g.id} goal={g} index={i} />)}</div>
          </div>
        )}

        <div className="px-4 pt-5 pb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Recent Transactions</p>
          <div className="space-y-1">
            {(data.transactions || []).slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.merchant}</p>
                    <CategoryBadge category={tx.category} />
                  </div>
                  <p className="text-[11px] text-gray-400">{ FormatDate(tx.createdAt)}</p>
                </div>
                <p className={`text-sm font-bold ${tx.transactionType === "topup" ? "text-emerald-600" : "text-gray-800"}`}>
                  {tx.transactionType === "topup" ? "+" : "-"}{ FormatRM(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-6" />
      </div>
      <BottomNav />
    </MobileShell>
  );
}
