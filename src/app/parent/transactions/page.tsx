"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { mockTransactions } from "@/lib/mock/dashboard-actions";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FormatRM } from "@/lib/utils-tc";
import { useState } from "react";

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All");

  const filteredTxns = mockTransactions.filter(tx => {
    if (filter === "Money In") return tx.type === "money_in";
    if (filter === "Money Out") return tx.type === "money_out";
    return true;
  });

  return (
    <MobileShell>
      <WalletHeader showBack title="Transactions" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <p className="text-sm text-gray-500 mb-4 text-center">View your recent JuniorWallet activity.</p>
        
        <div className="flex gap-2 mb-6 justify-center">
          {["All", "Money In", "Money Out"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTxns.map(tx => (
            <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'money_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {tx.type === 'money_in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{tx.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500">{tx.date}</span>
                  <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{tx.category}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${tx.type === 'money_in' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {tx.type === 'money_in' ? '+' : ''}{FormatRM(tx.amount)}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
