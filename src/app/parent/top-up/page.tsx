"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { mockTopUpAmounts } from "@/lib/mock/dashboard-actions";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TopUpPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<string>("Debit / Credit Card");

  const handleConfirm = () => {
    toast.success(`Top Up Successful! RM${amount?.toFixed(2)} has been added in this demo preview.`);
    setTimeout(() => {
      // Simulate navigate back
      window.history.back();
    }, 2000);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Top Up" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Choose Amount</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mockTopUpAmounts.map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-4 rounded-2xl font-bold text-lg border-2 transition-all ${
                    amount === val ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-700 hover:border-blue-200"
                  }`}
                >
                  RM{val}
                </button>
              ))}
            </div>
            
            <button 
              disabled={!amount}
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3 mb-6">
              {["Debit / Credit Card", "Online Banking", "JuniorWallet Balance"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setMethod(opt)}
                  className={`w-full p-4 rounded-2xl text-left font-semibold border-2 transition-all ${
                    method === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-700 hover:border-blue-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Summary</p>
              <div className="flex justify-between text-sm font-bold text-gray-900 mb-1">
                <span>Top Up Amount:</span>
                <span>RM{amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Payment Method:</span>
                <span>{method}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
                <span>Status:</span>
                <span className="font-bold">Demo Preview</span>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-colors"
            >
              Confirm Top Up
            </button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
