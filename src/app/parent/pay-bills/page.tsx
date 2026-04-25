"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { mockBillCategories } from "@/lib/mock/dashboard-actions";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

export default function PayBillsPage() {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  const handlePay = () => {
    toast.success(`Payment Successful! Your ${selectedBill?.toLowerCase()} payment has been completed in demo mode.`);
    setTimeout(() => {
      window.history.back();
    }, 2000);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Pay Bills" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Receipt size={28} className="text-amber-600" />
          </div>
          <p className="text-sm text-gray-500">Pay school and family bills with JuniorWallet.</p>
        </div>

        {!selectedBill ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Select Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {mockBillCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedBill(cat)}
                  className="bg-white border border-gray-100 hover:border-amber-200 hover:bg-amber-50 p-4 rounded-2xl text-left font-semibold text-gray-700 transition-colors shadow-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-50 pb-3">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bill Name</span>
                  <span className="font-semibold text-gray-900">{selectedBill}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">RM45.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Child</span>
                  <span className="font-semibold text-gray-900">ibad</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Unpaid</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePay}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
            >
              Pay Bill (RM45.00)
            </button>
            <button 
              onClick={() => setSelectedBill(null)}
              className="w-full mt-3 text-sm font-semibold text-gray-500 hover:text-gray-700 py-2"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
