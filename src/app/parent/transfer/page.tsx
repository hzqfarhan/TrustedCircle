"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";
import { toast } from "sonner";
import { Send, ShieldAlert } from "lucide-react";

export default function TransferPage() {
  const [amount, setAmount] = useState<number>(30);

  const handleTransfer = () => {
    toast.success(`Transfer Successful! RM${amount.toFixed(2)} has been sent to ibad in demo mode.`);
    setTimeout(() => {
      window.history.back();
    }, 2000);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Transfer" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send size={24} className="text-blue-600" />
          </div>
          <p className="text-sm text-gray-500">Send money safely to your linked child account.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recipient Details</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-400">
              I
            </div>
            <div>
              <p className="font-bold text-gray-900">ibad</p>
              <p className="text-[10px] text-gray-500">MUHAMMAD KHAIRUL IBAD BIN JIMA&apos;AIN</p>
              <span className="inline-block mt-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Child Account</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Amount</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[10, 20, 30, 50].map(val => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  amount === val ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-700 hover:border-blue-200"
                }`}
              >
                RM{val}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium">Transfer type: Parent Allowance Transfer</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-6 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 font-medium">
            Child accounts can only receive money from linked parents or approved guardians.
          </p>
        </div>

        <button 
          onClick={handleTransfer}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm mb-4"
        >
          Send Transfer
        </button>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-400 font-medium italic">
            Example policy: Money packets are blocked for child accounts.
          </p>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
