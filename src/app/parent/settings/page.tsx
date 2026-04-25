"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User } from "lucide-react";

export default function ParentSettingsPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  return (
    <MobileShell>
      <WalletHeader showBack title="Settings" />
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pfp/paan.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{currentUser?.fullName || "Paan"}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser?.role || "parent"} Account</p>
            </div>
          </div>
        </div>

        <button onClick={async () => { await logout(); router.push("/login"); }}
          className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-200">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

