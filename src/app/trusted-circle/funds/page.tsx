"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { SharedFundCard } from "@/components/SharedFundCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FundsPage() {
  const { currentUser } = useAuth();
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/funds?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((d) => { setFunds(d); setLoading(false); });
  }, [currentUser]);

  return (
    <MobileShell>
      <WalletHeader showBack title="Shared Funds" />
      <div className="flex-1 overflow-y-auto">
        {/* Create Button */}
        <div className="px-4 pt-4">
          <Link href="/trusted-circle/funds/new">
            <div className="flex items-center gap-3 bg-blue-600 rounded-2xl p-4 text-white active:bg-blue-700 transition-colors">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Create New Fund</p>
                <p className="text-blue-200 text-xs">Start a tabung for your circle</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Fund List */}
        <div className="px-4 pt-4 pb-4 flex flex-col gap-2">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && funds.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <div className="text-3xl mb-2">💰</div>
              <p>No shared funds yet.</p>
              <p className="text-xs mt-1">Create one to get started!</p>
            </div>
          )}
          {funds.map((f, i) => (
            <SharedFundCard key={f.id} fund={f} index={i} />
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

