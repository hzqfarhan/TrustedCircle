"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { JuniorWalletCard } from "@/components/wallet/JuniorWalletCard";
import { TransactionList } from "@/components/TransactionList";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { LoadingState } from "@/components/LoadingState";
import { ChevronRight, Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    // Redirect to role-specific dashboard
    if (currentUser.role === "parent") {
      router.push("/parent/dashboard");
    } else if (currentUser.role === "child") {
      router.push("/child/dashboard");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <MobileShell>
        <LoadingState message="Redirecting..." />
      </MobileShell>
    );
  }

  // Fallback for non-parent/child roles (companions, friends, etc.)
  return (
    <MobileShell>
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
            <p className="text-white font-bold text-base">{currentUser.fullName} 👋</p>
            <p className="text-blue-300 text-[11px] capitalize">{currentUser.role}</p>
          </div>
        </div>
        <RoleSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth">
        <WalletBalanceCard
          name={currentUser.fullName}
          balance={currentUser.walletBalance ?? 0}
          role={currentUser.role}
        />
        <QuickActions />
        <div className="px-0 pt-4">
          <JuniorWalletCard />
        </div>
        <div className="h-6" />
      </div>

      <BottomNav />
    </MobileShell>
  );
}
