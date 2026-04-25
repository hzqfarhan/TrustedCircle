"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { ScoreRing } from "@/components/ScoreRing";
import { FormatRM } from "@/lib/utils-tc";
import { ShieldAlert, ShieldCheck, Plus, Baby, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ChildAccountsListPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return;

    if (currentUser.role === "parent") {
      fetch("/api/dashboard/parent")
        .then((r) => r.json())
        .then(setData)
        .catch(() => toast.error("Failed to load child accounts"))
        .finally(() => setLoading(false));
    } else {
      router.push("/trusted-circle");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || loading) {
    return (
      <MobileShell>
        <WalletHeader showBack title="Child Accounts" />
        <div className="flex-1 flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <BottomNav />
      </MobileShell>
    );
  }

  if (!data && currentUser?.role === "parent") {
    return (
      <MobileShell>
        <WalletHeader showBack title="Child Accounts" />
        <div className="p-8 text-center text-gray-400">Error loading data.</div>
        <BottomNav />
      </MobileShell>
    );
  }

  const children = data?.children || [];

  return (
    <MobileShell>
      <WalletHeader showBack title="Child Accounts" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-800">Your Children</p>
          <Link href="/parent/child/add" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg active:bg-blue-100 transition-colors">
            <Plus size={12} /> Add Child
          </Link>
        </div>

        {children.length === 0 ? (
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
        ) : (
          <div className="space-y-3">
            {children.map((child: any) => (
              <div key={child.id} className="relative group">
                <Link href={`/parent/child/${child.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        <p className="text-sm font-semibold text-blue-600 pr-10">{ FormatRM(child.currentBalance)}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                
                <Link 
                  href={`/parent/child/${child.id}/transaction-limit`}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                >
                  <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform border border-blue-100 shadow-sm">
                    <BarChart3 size={20} className="text-blue-600" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}

