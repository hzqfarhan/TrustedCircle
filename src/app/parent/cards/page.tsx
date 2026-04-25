"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { CreditCard, Snowflake, SlidersHorizontal, Activity } from "lucide-react";
import { toast } from "sonner";
import { mockCard } from "@/lib/mock/dashboard-actions";
import { motion } from "framer-motion";
import { FormatRM } from "@/lib/utils-tc";

export default function CardsPage() {
  const handleAction = (msg: string) => {
    toast.info(`Demo only: ${msg}`);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Cards" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <p className="text-sm text-gray-500 mb-6 text-center">Manage JuniorWallet cards and spending controls.</p>

        {/* Dummy Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 mb-6 overflow-hidden shadow-md"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard size={120} />
          </div>
          <div className="relative z-10 flex flex-col h-32 justify-between">
            <div className="flex justify-between items-start">
              <span className="text-white font-bold tracking-widest uppercase text-sm">JuniorWallet Card</span>
              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{mockCard.status}</span>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] uppercase tracking-wider mb-1">Card Holder</p>
              <p className="text-white font-bold text-lg">{mockCard.holder}</p>
            </div>
          </div>
        </motion.div>

        {/* Card Limits */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Current Limits</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Daily Limit</span>
                <span className="font-bold text-gray-900">{FormatRM(mockCard.dailyLimit)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Monthly Limit</span>
                <span className="font-bold text-gray-900">{FormatRM(mockCard.monthlyLimit)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <h3 className="font-bold text-gray-800 mb-3 ml-1">Card Controls</h3>
        <div className="space-y-3">
          <button 
            onClick={() => handleAction("Card freeze will be available soon.")}
            className="w-full bg-white border border-gray-100 hover:bg-gray-50 p-4 rounded-2xl flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Snowflake size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Freeze Card</p>
              <p className="text-[11px] text-gray-500">Temporarily disable this card</p>
            </div>
          </button>

          <button 
            onClick={() => handleAction("Limit settings preview.")}
            className="w-full bg-white border border-gray-100 hover:bg-gray-50 p-4 rounded-2xl flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <SlidersHorizontal size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Set Limit</p>
              <p className="text-[11px] text-gray-500">Adjust daily and monthly limits</p>
            </div>
          </button>

          <button 
            onClick={() => handleAction("Card activity preview.")}
            className="w-full bg-white border border-gray-100 hover:bg-gray-50 p-4 rounded-2xl flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">View Card Activity</p>
              <p className="text-[11px] text-gray-500">See all transactions made with this card</p>
            </div>
          </button>
        </div>

      </div>
      <BottomNav />
    </MobileShell>
  );
}
