"use client";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { CategoryBadge } from "@/components/CategoryBadge";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { FormatRM, FormatDate } from "@/lib/utils-tc";
import { Receipt } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChildTransactionsPage() {
  const { currentUser, isLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch(`/api/dashboard/parent/${childId}`).then((r) => r.json()).then((d) => setTransactions(d.transactions || [])).finally(() => setLoading(false));
  }, [currentUser, isLoading, childId]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Transactions" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {transactions.length === 0 ? <EmptyState icon={<Receipt size={24} className="text-gray-300" />} title="No transactions" /> : (
          <div className="space-y-1">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.merchant}</p>
                    <CategoryBadge category={tx.category} />
                  </div>
                  <p className="text-[11px] text-gray-400">{ FormatDate(tx.createdAt)}</p>
                  {tx.note && <p className="text-[10px] text-gray-400">{tx.note}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.transactionType === "topup" ? "text-emerald-600" : "text-gray-800"}`}>
                    {tx.transactionType === "topup" ? "+" : "-"}{ FormatRM(tx.amount)}
                  </p>
                  {tx.riskFlag && <span className="text-[9px] text-red-500 font-semibold">⚠ RISK</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
