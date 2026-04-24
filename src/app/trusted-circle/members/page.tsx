"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { ROLE_LABELS, ROLE_COLORS, initials } from "@/lib/utils-tc";
import { cn } from "@/lib/utils";
import { NetworkGraph } from "@/components/NetworkGraph";
import { Users, Share2 } from "lucide-react";

export default function MembersPage() {
  const { users, currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "network">("list");

  const customAvatarMap: Record<string, string> = {
    u_akmal: "/pfp/akmal.png",
    u_ibad: "/pfp/ibad.png",
    u_paan: "/pfp/paan.png",
    u_wafi: "/pfp/wafi.png",
    u_abang: "/pfp/aizat.png",
    u_child: "/pfp/child.png",
  };

  const permissions: Record<string, string[]> = {
    PARENT: ["View funds", "Contribute", "Request withdrawal", "Approve withdrawal", "Monitor child", "Receive alerts", "Verify transfers"],
    COMPANION: ["View funds", "Contribute", "Request withdrawal", "Approve withdrawal", "Receive alerts", "Verify transfers"],
    FRIEND: ["View funds", "Contribute", "Request withdrawal", "Receive alerts"],
    GENERAL: ["View funds", "Contribute"],
    CHILD: ["Own wallet view", "Spend within limits"],
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Circle Members" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
              viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Users size={16} /> List
          </button>
          <button
            onClick={() => setViewMode("network")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
              viewMode === "network" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Share2 size={16} /> Network
          </button>
        </div>

        {viewMode === "network" ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <NetworkGraph 
              users={users} 
              currentUser={currentUser} 
              edgeStyle="solid"
              customAvatarMap={customAvatarMap}
            />
            <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Your Circle Map</h3>
              <p className="text-xs text-blue-600 leading-relaxed">
                This network visualizes connections between you and members of your Trusted Circle. 
                As the central hub, you can monitor and manage interactions and permissions seamlessly.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {users.map((u) => {
            const perms = permissions[u.role] || [];
            const isMe = u.id === currentUser?.id;
            const finalAvatar = u.avatar || customAvatarMap[u.id];

            return (
              <div key={u.id} className={cn("bg-white rounded-2xl p-4 border", isMe ? "border-blue-200" : "border-gray-100")}>
                <div className="flex items-center gap-3 mb-3">
                  {finalAvatar ? (
                    <img src={finalAvatar} alt={u.name} className="w-11 h-11 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0",
                        ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"
                      )}
                    >
                      {initials(u.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      {isMe && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full", ROLE_COLORS[u.role])}>
                    {u.role}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p) => (
                    <span key={p} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
                  <span>Wallet: RM {u.wallet?.balance?.toFixed(2) ?? "—"}</span>
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
