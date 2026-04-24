"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { TrustedCircleCard } from "@/components/TrustedCircleCard";
import { TransactionList } from "@/components/TransactionList";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { SharedFundCard } from "@/components/SharedFundCard";
import { Shield, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/utils-tc";

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/dashboard?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [currentUser]);

  if (isLoading || !currentUser) {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      {/* Top bar */}
      <div
        className="shrink-0 px-4 pt-3 pb-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #0068FF 0%, #0044CC 100%)" }}
      >
        <div>
          <p className="text-blue-200 text-xs">Good day,</p>
          <p className="text-white font-bold text-base">{currentUser.name} 👋</p>
          <p className="text-blue-300 text-[11px]">{ROLE_LABELS[currentUser.role] || currentUser.role}</p>
        </div>
        <RoleSwitcher />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {/* Balance Card */}
        <WalletBalanceCard
          name={currentUser.name}
          balance={currentUser.wallet?.balance ?? 0}
          role={ROLE_LABELS[currentUser.role] || currentUser.role}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Trusted Circle Card */}
        <div className="px-0 pt-4">
          <TrustedCircleCard alertCount={data?.alerts?.length ?? 0} />
        </div>

        {/* Shared Funds Preview */}
        {data?.funds?.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800">Shared Funds</p>
              <Link href="/trusted-circle/funds" className="text-blue-600 text-xs font-medium flex items-center gap-0.5">
                See all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {data.funds.slice(0, 2).map((f: any, i: number) => (
                <SharedFundCard key={f.id} fund={f} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Unread Alerts */}
        {data?.alerts && data.alerts.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800">Recent Alerts</p>
              <Link href="/trusted-circle/alerts" className="text-blue-600 text-xs font-medium flex items-center gap-0.5">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="flex flex-col gap-1.5">
              {data.alerts.slice(0, 2).map((a: any) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl text-sm border ${
                    a.severity === "HIGH"
                      ? "bg-red-50 border-red-100 text-red-700"
                      : a.severity === "MEDIUM"
                      ? "bg-amber-50 border-amber-100 text-amber-700"
                      : "bg-blue-50 border-blue-100 text-blue-700"
                  }`}
                >
                  <Bell size={14} className="mt-0.5 shrink-0" />
                  <p className="leading-snug">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800">Recent Transactions</p>
          </div>
          <TransactionList
            transactions={data?.transactions ?? []}
            currentUserId={currentUser.id}
          />
          {(!data?.transactions || data.transactions.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-xs">
              No recent transactions
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}
