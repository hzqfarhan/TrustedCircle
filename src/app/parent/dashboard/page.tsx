"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { JuniorWalletCard } from "@/components/wallet/JuniorWalletCard";
import { LoadingState } from "@/components/LoadingState";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ScoreRing } from "@/components/ScoreRing";
import { SpendingChart } from "@/components/SpendingChart";
import { RecommendationCard } from "@/components/RecommendationCard";
import { FormatRM } from "@/lib/utils-tc";
import { ChevronRight, ChevronLeft, Bell, Brain, Plus, ShieldAlert, ShieldCheck, AlertTriangle, BarChart3 } from "lucide-react";
import { NetworkGraph } from "@/components/NetworkGraph";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ParentDashboardData } from "@/types";

export default function ParentDashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    fetch("/api/dashboard/parent")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, router]);

  if (authLoading || loading || !data) {
    return (
      <MobileShell>
        <LoadingState message="Loading dashboard..." />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      {/* Top gradient bar */}
      <div
        className="shrink-0 px-4 pt-3 pb-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #0044CC 100%)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors">
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <p className="text-blue-200 text-xs">Good day,</p>
            <p className="text-white font-bold text-base">{data.profile.fullName} 👋</p>
            <p className="text-blue-300 text-[11px]">Parent</p>
          </div>
        </div>
        <Link href="/parent/alerts" className="relative">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </div>
          {data.alerts.filter((a) => !a.read).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {data.alerts.filter((a) => !a.read).length}
            </span>
          )}
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {/* Wallet Card */}
        <WalletBalanceCard
          name={data.profile.fullName}
          balance={data.profile.walletBalance || 0}
          role="Parent"
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Trusted Circle */}
        <div className="px-0 pt-4">
          <JuniorWalletCard alertCount={data.alerts.length} />
        </div>

        {/* Children Section */}
        {data.children.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm font-bold text-gray-800">Child Accounts</p>
              <Link href="/parent/child/add" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg active:bg-blue-100 transition-colors">
                <Plus size={12} /> Add Child
              </Link>
            </div>
            <NetworkGraph
              users={[
                { id: currentUser.id, name: data.profile.fullName || "You", role: "PARENT", avatar: data.profile.avatarUrl },
                ...data.children.map((c: any) => ({
                  id: c.id,
                  name: c.nickname || c.fullName,
                  role: "CHILD",
                  avatar: c.avatarUrl || (c.nickname ? `/pfp/${c.nickname.toLowerCase()}.png` : undefined)
                }))
              ]}
              currentUser={{ id: currentUser.id, name: data.profile.fullName || "You", role: "PARENT", avatar: data.profile.avatarUrl }}
              customAvatarMap={{
                'cp_aiman': '/pfp/wafi.png',
                'child_ibad_demo': '/pfp/ibad.png'
              }}
              onNodeClick={(user) => {
                if (user.id !== currentUser.id) {
                  router.push(`/parent/child/${user.id}`);
                }
              }}
            />
          </div>
        )}

        {/* Pending Requests */}
        {data.pendingRequests.length > 0 && (
          <div className="px-4 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-amber-500" /> Extra Allowance Requests
            </p>
            {data.pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ FormatRM(req.amount)} requested</p>
                    <p className="text-xs text-gray-500">{req.reason}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    PENDING
                  </span>
                </div>
                {req.childNote && (
                  <p className="text-[11px] text-gray-400 italic mb-3">&quot;{req.childNote}&quot;</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/allowance/request-extra", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "approve", requestId: req.id, approvedAmount: req.amount }),
                      });
                      if (res.ok) { toast.success("Request approved"); window.location.reload(); }
                    }}
                    className="flex-1 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Approve { FormatRM(req.amount)}
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/allowance/request-extra", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "reject", requestId: req.id }),
                      });
                      if (res.ok) { toast.success("Request rejected"); window.location.reload(); }
                    }}
                    className="px-4 py-2 bg-red-50 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      <BottomNav />
    </MobileShell>
  );
}

