"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { ScoreRing } from "@/components/ScoreRing";
import { GoalCard } from "@/components/GoalCard";
import { BadgeCard } from "@/components/BadgeCard";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SpendingChart } from "@/components/SpendingChart";
import { formatRM, formatDate } from "@/lib/utils-tc";
import { Wallet, Target, Award, Plus, Lightbulb, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChildDashboardData } from "@/types";

export default function ChildDashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ChildDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) { router.push("/login"); return; }
    fetch("/api/dashboard/child")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, router]);

  if (authLoading || loading || !data) return <MobileShell><LoadingState message="Loading your dashboard..." /></MobileShell>;

  const tips = [
    "Nice work staying within your food budget! 🎉",
    "Try saving RM10 this week to unlock Smart Saver.",
    "Spending all your allowance will not increase next month’s allowance. Building good habits helps earn more trust!",
  ];

  return (
    <MobileShell>
      {/* Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #0044CC 100%)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors">
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <p className="text-blue-200 text-xs">Welcome back,</p>
            <p className="text-white font-bold text-base">{data.childProfile.fullName} 👋</p>
          </div>
        </div>
        <ScoreRing score={data.childProfile.responsibilityScore} size={48} strokeWidth={4} showLabel={false} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 rounded-2xl p-4 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wallet size={16} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Your Allowance Balance</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRM(data.childProfile.currentBalance)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Monthly: {formatRM(data.childProfile.monthlyAllowance)}</p>
        </motion.div>

        {/* Budget Progress */}
        <div className="mx-4 mt-3 rounded-2xl p-4 bg-white shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">Weekly Budget</p>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Spent this week</span>
            <span>{formatRM(data.weeklySpent)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
              style={{ width: `${Math.min((data.weeklySpent / (data.childProfile.monthlyAllowance / 4)) * 100, 100)}%` }} />
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2">
            <p className="text-xs text-emerald-700 font-semibold">💡 Daily safe spend: {formatRM(data.dailySafeSpend)}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Stay within this to keep your budget on track!</p>
          </div>
        </div>

        {/* Tip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mx-4 mt-3 rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-purple-500 mt-0.5 shrink-0" />
            <p className="text-xs text-purple-700 leading-relaxed">{tips[Math.floor(Math.random() * tips.length)]}</p>
          </div>
        </motion.div>

        {/* Spending Chart */}
        {Object.keys(data.spendingByCategory).length > 0 && (
          <div className="px-4 pt-4"><SpendingChart data={data.spendingByCategory} /></div>
        )}

        {/* Goals */}
        {data.goals.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">My Goals</p>
              <Link href="/child/goals" className="text-blue-600 text-xs font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {data.goals.slice(0, 2).map((g, i) => <GoalCard key={g.id} goal={g} index={i} />)}
            </div>
          </div>
        )}

        {/* Badges */}
        {data.badges.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">My Badges</p>
              <Link href="/child/badges" className="text-blue-600 text-xs font-medium">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.badges.slice(0, 4).map((cb, i) => (
                <BadgeCard key={cb.id} badge={cb.badge} unlocked={true} unlockedAt={cb.unlockedAt} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Request Extra */}
        <div className="px-4 pt-5">
          <Link href="/child/request-extra"
            className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Request Extra Allowance
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Recent Transactions</p>
          <div className="space-y-1">
            {data.recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.merchant}</p>
                    <CategoryBadge category={tx.category} />
                  </div>
                  <p className="text-[11px] text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
                <p className={`text-sm font-bold ${tx.transactionType === "topup" ? "text-emerald-600" : "text-gray-800"}`}>
                  {tx.transactionType === "topup" ? "+" : "-"}{formatRM(tx.amount)}
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
