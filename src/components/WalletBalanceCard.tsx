"use client";
import { motion } from "framer-motion";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { FormatRM } from "@/lib/utils-tc";

interface WalletBalanceCardProps {
  name: string;
  balance: number;
  role: string;
}

export function WalletBalanceCard({ name, balance, role }: WalletBalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="mx-4 mt-3 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0068FF 0%, #0044CC 60%, #002FA7 100%)",
      }}
    >
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-0.5">
              JUNIOR WALLET
            </p>
            <p className="text-white/90 text-sm font-medium">{name}</p>
          </div>
          <span className="bg-white/15 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {role}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div>
            <p className="text-blue-200 text-xs mb-0.5">Available Balance</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-3xl font-bold tracking-tight">
                {hidden ? "RM ••••••" : FormatRM(balance)}
              </p>
              <button
                onClick={() => setHidden(!hidden)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex gap-3">
          <button className="flex-1 bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-semibold py-2 rounded-2xl flex items-center justify-center gap-1.5">
            <Plus size={15} />
            Top Up
          </button>
          <button className="flex-1 bg-white text-blue-700 hover:bg-blue-50 transition-colors text-sm font-semibold py-2 rounded-2xl">
            Pay / Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}

