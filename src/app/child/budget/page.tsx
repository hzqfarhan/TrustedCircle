"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { SpendingChart } from "@/components/SpendingChart";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/lib/auth-context";
import { FormatRM } from "@/lib/utils-tc";
import { useEffect, useState } from "react";

export default function ChildBudgetPage() {
  const { currentUser, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch("/api/dashboard/child").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [currentUser, isLoading]);

  if (isLoading || loading || !data) return <MobileShell><LoadingState /></MobileShell>;

  const weeklyBudget = data.childProfile.monthlyAllowance / 4;
  const pct = weeklyBudget > 0 ? (data.weeklySpent / weeklyBudget) * 100 : 0;

  return (
    <MobileShell>
      <WalletHeader showBack title="My Budget" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Weekly Budget</p>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Spent: { FormatRM(data.weeklySpent)}</span>
            <span>Budget: { FormatRM(weeklyBudget)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
              style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Daily safe spend: <span className="font-semibold text-emerald-600">{ FormatRM(data.dailySafeSpend)}</span></p>
        </div>

        {/* Category Rules */}
        {data.rules?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-3">Category Limits</p>
            <div className="space-y-3">
              {data.rules.map((rule: any) => {
                const spent = data.spendingByCategory[rule.category] || 0;
                const limitPct = rule.amount > 0 ? (spent / rule.amount) * 100 : 0;
                return (
                  <div key={rule.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 capitalize font-medium">{rule.category}</span>
                      <span className="text-gray-400">{ FormatRM(spent)} / { FormatRM(rule.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${limitPct > 90 ? "bg-red-400" : "bg-blue-400"}`}
                        style={{ width: `${Math.min(limitPct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Spending Chart */}
        {Object.keys(data.spendingByCategory).length > 0 && <SpendingChart data={data.spendingByCategory} />}
      </div>
      <BottomNav />
    </MobileShell>
  );
}

