"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { FormatRM, FormatDate } from "@/lib/utils-tc";
import { Baby, ChevronRight, MapPin, AlertTriangle, Plus, Users, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NetworkGraph } from "@/components/NetworkGraph";
import { Cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils-tc";

export default function ChildPage() {
  const { currentUser } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isParent = currentUser?.role === "PARENT";
  const isChild = currentUser?.role === "CHILD";
  const [viewMode, setViewMode] = useState<"list" | "network">("list");
  const users = (currentUser as any)?.users || [];
  
  const customAvatarMap: Record<string, string> = {
    u_akmal: "/pfp/akmal.png",
    u_ibad: "/pfp/ibad.png",
    u_paan: "/pfp/paan.png",
    u_wafi: "/pfp/wafi.png",
    u_abang: "/pfp/aizat.png",
    u_child: "/pfp/child.png",
  };

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/child?userId=${currentUser.id}&role=${currentUser.role}`)
      .then((r) => r.json())
      .then((d) => { setChildData(d); setLoading(false); });
  }, [currentUser]);

  const child = childData?.childAccount;
  const childUser = childData?.childUser;
  const alerts = childData?.alerts ?? [];
  const recentTx = childData?.recentTransactions ?? [];
  const wallet = childData?.wallet;

  return (
    <MobileShell>
      <WalletHeader showBack title="Child Account" />
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !child && isParent && (
          <div className="p-4">
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mb-4">
                <Baby size={28} className="text-purple-600" />
              </div>
              <p className="font-bold text-gray-800 mb-1">No Child Account Yet</p>
              <p className="text-gray-400 text-sm mb-6">Link or create a child account to start monitoring</p>
              <Link href="/trusted-circle/child/create">
                <button className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-2xl flex items-center gap-2">
                  <Plus size={16} /> Create Child Account
                </button>
              </Link>
            </div>
          </div>
        )}

        {!loading && child && (
          <>
            {/* Child Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-3 rounded-3xl p-5"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                  {childUser?.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-white font-bold">{childUser?.name || "Child"}</p>
                  <p className="text-purple-200 text-xs">Child Account</p>
                </div>
              </div>
              <p className="text-purple-200 text-xs">Available Balance</p>
              <p className="text-white text-3xl font-black">{ FormatRM(wallet?.balance ?? 0)}</p>

              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                <div>
                  <p className="text-purple-200 text-[10px]">Spending Limit</p>
                  <p className="text-white font-semibold">{ FormatRM(child.spendingLimit ?? 0)} / {child.limitType?.toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-200 text-[10px]">Zones Active</p>
                  <p className="text-white font-semibold">{child.zoneRules?.filter((z: any) => z.isActive).length ?? 0} zones</p>
                </div>
              </div>
            </motion.div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mx-4 mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Alerts</p>
                <div className="flex flex-col gap-1.5">
                  {alerts.slice(0, 3).map((a: any) => (
                    <div key={a.id} className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 text-sm">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-red-700 text-xs">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allowed Zones */}
            <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-600" /> Allowed Zones
                </p>
                <Link href={`/trusted-circle/child/${child.id}/controls`} className="text-blue-600 text-xs">Manage</Link>
              </div>
              {child.zoneRules?.length === 0 && (
                <p className="text-gray-400 text-xs">No zones configured</p>
              )}
              {child.zoneRules?.map((z: any) => (
                <div key={z.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-700">{z.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${z.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    {z.isActive ? "Active" : "Off"}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mx-4 mt-3 flex gap-2">
              <Link href={`/trusted-circle/child/${child.id}/cashflow`} className="flex-1">
                <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
                  <p className="text-blue-600 text-lg font-black">{recentTx.length}</p>
                  <p className="text-gray-500 text-[11px]">Transactions</p>
                  <p className="text-blue-600 text-[10px] mt-0.5">View cashflow →</p>
                </div>
              </Link>
              <Link href={`/trusted-circle/child/${child.id}/controls`} className="flex-1">
                <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
                  <p className="text-purple-600 text-lg font-black">{child.limitType}</p>
                  <p className="text-gray-500 text-[11px]">Limit Type</p>
                  <p className="text-purple-600 text-[10px] mt-0.5">Edit controls →</p>
                </div>
              </Link>
            </div>

            {/* Network & Members List */}
            <div className="mx-4 mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Circle Network</p>
              <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                <button
                  onClick={() => setViewMode("list")}
                  className={ Cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
                    viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Users size={16} /> List
                </button>
                <button
                  onClick={() => setViewMode("network")}
                  className={ Cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
                    viewMode === "network" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Share2 size={16} /> Network
                </button>
              </div>

              {viewMode === "network" ? (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
                  <NetworkGraph 
                    users={users} 
                    currentUser={currentUser} 
                    edgeStyle="solid"
                    customAvatarMap={customAvatarMap}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  {users.map((u: any) => {
                    const isMe = u.id === currentUser?.id;
                    const finalAvatar = u.avatar || customAvatarMap[u.id];

                    return (
                      <div key={u.id} className={ Cn("bg-white rounded-2xl p-3 border", isMe ? "border-blue-200" : "border-gray-100")}>
                        <div className="flex items-center gap-3">
                          {finalAvatar ? (
                            <img src={finalAvatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                              {u.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                              {isMe && <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">YOU</span>}
                            </div>
                            <p className="text-xs text-gray-500 capitalize">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role.toLowerCase()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="mx-4 mt-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</p>
              {recentTx.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
              )}
              <div className="flex flex-col gap-1">
                {recentTx.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="bg-white rounded-xl p-3 flex items-center justify-between text-sm border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{tx.note || tx.category}</p>
                      <p className="text-[11px] text-gray-400">{ FormatDate(tx.createdAt)}</p>
                    </div>
                    <p className={`font-bold ${tx.status === "BLOCKED" ? "text-red-500" : "text-gray-800"}`}>
                      {tx.status === "BLOCKED" ? "BLOCKED" : `-${ FormatRM(tx.amount)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Child's own view */}
        {!loading && isChild && !child && (
          <div className="p-8 text-center text-gray-400">
            <Baby size={40} className="mx-auto mb-3 text-purple-300" />
            <p className="text-sm">Your account is managed by a parent.<br />Ask them to set up your Trusted Circle.</p>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}

