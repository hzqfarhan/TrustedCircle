import React from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface SpendingLimitCardProps {
  limit: number;
}

export function SpendingLimitCard({ limit }: SpendingLimitCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-1">
        <ShieldCheck size={20} className="text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">Spending Limit</p>
        <p className="text-xl font-bold text-blue-600 mt-0.5">RM{limit} <span className="text-xs text-gray-500 font-medium">per transaction</span></p>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          Your parent set this to help you spend safely.
        </p>
      </div>
    </div>
  );
}

interface PaymentBlockedCardProps {
  limit: number;
}

export function PaymentBlockedCard({ limit }: PaymentBlockedCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-start gap-3 mt-4">
      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-1">
        <AlertTriangle size={20} className="text-red-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-700">Payment Blocked</p>
        <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
          This payment is above your RM{limit} spending limit. Ask your parent if you need a higher limit.
        </p>
        <button 
          onClick={() => alert("Demo only: Extra spending approval request will be available soon.")}
          className="mt-3 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold py-2 px-4 rounded-xl transition-colors"
        >
          Request Help
        </button>
      </div>
    </div>
  );
}

interface LimitPresetButtonProps {
  amount: number;
  isSelected: boolean;
  onClick: (amount: number) => void;
}

export function LimitPresetButton({ amount, isSelected, onClick }: LimitPresetButtonProps) {
  return (
    <button
      onClick={() => onClick(amount)}
      className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
        isSelected
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
      }`}
    >
      RM{amount}
    </button>
  );
}
