"use client";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { FormatRM } from "@/lib/utils-tc";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChildLimitsPage() {
  const { currentUser, isLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [rules, setRules] = useState<any[]>([]);
  const [spending, setSpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch(`/api/dashboard/parent/${childId}`).then((r) => r.json()).then((d) => {
      setRules(d.rules || []);
      setSpending(d.spendingByCategory || {});
    }).finally(() => setLoading(false));
  }, [currentUser, isLoading, childId]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Category Limits" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {rules.length === 0 ? <EmptyState icon={<BarChart3 size={24} className="text-gray-300" />} title="No limits set" description="Set category spending limits for your child." /> : (
          <div className="space-y-3">
            {rules.map((rule: any) => {
              const spent = spending[rule.category] || 0;
              const pct = rule.amount > 0 ? (spent / rule.amount) * 100 : 0;
              return (
                <div key={rule.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{rule.category}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{rule.limitType} limit</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rule.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Spent: { FormatRM(spent)}</span>
                    <span>Limit: { FormatRM(rule.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
