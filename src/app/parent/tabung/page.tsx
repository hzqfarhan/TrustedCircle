"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { Plus, PiggyBank, Target, ChevronRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const dummyTabungs = [
  { name: "School Supplies", saved: 30, target: 50, progress: 60 },
  { name: "Emergency Fund", saved: 45, target: 100, progress: 45 },
  { name: "Birthday Treat", saved: 20, target: 80, progress: 25 },
];

export default function TabungPage() {
  const showDemoToast = () => {
    toast.info("Demo only: Tabung feature will be available soon.");
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Tabung" />
      
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <PiggyBank size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Family Tabung</h2>
          <p className="text-sm text-gray-500 mt-1">Save together for family goals.</p>
        </div>

        <button 
          onClick={showDemoToast}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-6 transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Tabung
        </button>

        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Target size={16} className="text-blue-500" /> Active Tabungs
          </p>

          {dummyTabungs.map((tabung, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{tabung.name}</h3>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Saved RM{tabung.saved} of RM{tabung.target}
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <TrendingUp size={10} /> Active
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${tabung.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                <span>Progress</span>
                <span>{tabung.progress}%</span>
              </div>

              <div className="flex gap-2 mt-2 pt-3 border-t border-gray-50">
                <button 
                  onClick={showDemoToast}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold py-2 rounded-xl transition-colors"
                >
                  Add Money
                </button>
                <button 
                  onClick={showDemoToast}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  View Details <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <BottomNav />
    </MobileShell>
  );
}
