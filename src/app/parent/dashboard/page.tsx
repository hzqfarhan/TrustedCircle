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
import { formatRM } from "@/lib/utils-tc";
import { ChevronRight, ChevronLeft, Bell, Brain, Plus, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">Child Accounts</p>
              <Link href="/parent/child/add">
                <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg active:bg-blue-100 transition-colors">
                  <Plus size={12} /> Add Child
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              {data.children.map((child: any) => (
                <Link key={child.id} href={`/parent/child/${child.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 active:bg-gray-50 transition-colors relative overflow-hidden"
                  >
                    <ScoreRing score={child.responsibilityScore} size={56} strokeWidth={5} showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{child.nickname || child.fullName}</p>
                        {child.kycStatus === 'kyc_pending' || child.kycStatus === 'kyc_under_review' ? (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            <ShieldAlert size={10} /> Pending KYC
                          </span>
                        ) : child.kycStatus === 'verified' ? (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{child.fullName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-gray-500 font-medium">{child.ageGroup} · Age {child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / 31557600000) : '?'}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatRM(child.currentBalance)}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Recommendations */}
        {data.pendingRecommendations.length > 0 && (
          <div className="px-4 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Brain size={15} className="text-purple-500" /> AI Recommendations
            </p>
            {data.pendingRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isParent
                onApprove={async (amount) => {
                  const res = await fetch("/api/allowance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "approve", recommendationId: rec.id, approvedAmount: amount }),
                  });
                  if (res.ok) {
                    toast.success(`Approved RM${amount} allowance`);
                    // Refresh
                    window.location.reload();
                  }
                }}
                onReject={async () => {
                  const res = await fetch("/api/allowance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "reject", recommendationId: rec.id }),
                  });
                  if (res.ok) {
                    toast.success("Recommendation rejected");
                    window.location.reload();
                  }
                }}
              />
            ))}
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
                    <p className="text-sm font-semibold text-gray-900">{formatRM(req.amount)} requested</p>
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
                    Approve {formatRM(req.amount)}
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

        {/* Recent Alerts */}
        {data.alerts.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800">Recent Alerts</p>
              <Link href="/parent/alerts" className="text-blue-600 text-xs font-medium flex items-center gap-0.5">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="space-y-1.5">
              {data.alerts.slice(0, 3).map((a) => {
                const colors = {
                  info: "bg-blue-50 border-blue-100 text-blue-700",
                  warning: "bg-amber-50 border-amber-100 text-amber-700",
                  critical: "bg-red-50 border-red-100 text-red-700",
                  success: "bg-emerald-50 border-emerald-100 text-emerald-700",
                };
                return (
                  <div key={a.id} className={`flex items-start gap-2.5 p-3 rounded-2xl text-sm border ${colors[a.severity]}`}>
                    <Bell size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">{a.title}</p>
                      <p className="text-[11px] opacity-80">{a.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      <BottomNav />
    </MobileShell>
  );
}
