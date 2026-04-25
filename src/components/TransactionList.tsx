"use client";
import { FormatRM, FormatDate } from "@/lib/utils-tc";
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, Receipt } from "lucide-react";
import { motion } from "framer-motion";

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  TRANSFER: { icon: <ArrowUpRight size={15} />, color: "text-blue-600", bg: "bg-blue-50" },
  MERCHANT: { icon: <ShoppingCart size={15} />, color: "text-purple-600", bg: "bg-purple-50" },
  BILL: { icon: <Receipt size={15} />, color: "text-amber-600", bg: "bg-amber-50" },
  WITHDRAWAL: { icon: <ArrowDownLeft size={15} />, color: "text-red-500", bg: "bg-red-50" },
  essential: { icon: <ShoppingCart size={15} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  educational: { icon: <Receipt size={15} />, color: "text-blue-600", bg: "bg-blue-50" },
  savings: { icon: <ArrowDownLeft size={15} />, color: "text-purple-600", bg: "bg-purple-50" },
  discretionary: { icon: <ShoppingCart size={15} />, color: "text-amber-600", bg: "bg-amber-50" },
  risky: { icon: <ArrowDownLeft size={15} />, color: "text-red-500", bg: "bg-red-50" },
};

interface TxItem {
  id: string;
  amount: number;
  createdAt: string;
  senderId?: string | null;
  category?: string;
  status?: string;
  merchant?: string;
  sender?: { name: string } | null;
  receiver?: { name: string } | null;
  transactionType?: string;
}

export function TransactionList({
  transactions,
  currentUserId,
}: {
  transactions: TxItem[];
  currentUserId: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {transactions.map((tx, i) => {
        const isSender = tx.senderId === currentUserId;
        const cfg = categoryConfig[tx.category || "TRANSFER"] || categoryConfig.TRANSFER;
        const label = tx.merchant || (isSender
          ? tx.receiver?.name || "Unknown"
          : tx.sender?.name || "Unknown");

        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl"
          >
            <div
              className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
              <p className="text-[11px] text-gray-400">{ FormatDate(tx.createdAt)}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  tx.transactionType === "topup" ? "text-emerald-600" : isSender ? "text-gray-800" : "text-emerald-600"
                }`}
              >
                {tx.transactionType === "topup" ? "+" : isSender ? "-" : "+"}
                { FormatRM(tx.amount)}
              </p>
              {tx.status && (
                <span
                  className={`text-[10px] font-medium ${
                    tx.status === "BLOCKED"
                      ? "text-red-500"
                      : tx.status === "PENDING"
                      ? "text-amber-500"
                      : "text-gray-400"
                  }`}
                >
                  {tx.status}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

