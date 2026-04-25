"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function ChildSettingsPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  return (
    <MobileShell>
      <WalletHeader showBack title="Settings" />
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <User size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{currentUser?.fullName}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser?.role} Account</p>
            </div>
          </div>
        </div>
        <button onClick={async () => { await logout(); router.push("/login"); }}
          className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-200">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
