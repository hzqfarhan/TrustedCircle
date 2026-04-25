"use client";
import { Send, ReceiptText, CreditCard, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

const actions = [
  { icon: ReceiptText, label: "Pay Bills", color: "text-blue-600", href: "/parent/pay-bills" },
  { icon: Send, label: "Transfer", color: "text-blue-600", href: "/parent/transfer" },
  { icon: CreditCard, label: "Cards", color: "text-blue-600", href: "/parent/cards" },
  { icon: PieChart, label: "GOfinance", color: "text-blue-600", href: "#" }, // Dummy or unchanged
];

export function QuickActions() {
  return (
    <div className="px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex items-center justify-between px-5"
      >
        {actions.map(({ icon: Icon, label, color, href }) => {
          if (href === "#") {
            return (
              <button
                key={label}
                onClick={() => toast.info(`Demo only: ${label} feature preview.`)}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Icon size={28} className={color} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-medium text-gray-800">{label}</span>
              </button>
            );
          }
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Icon size={28} className={color} strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-medium text-gray-800">{label}</span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

