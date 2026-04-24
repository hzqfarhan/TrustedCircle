"use client";
import Link from "next/link";
import { Send, QrCode, RefreshCcw, Receipt } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { icon: Send, label: "Transfer", href: "/transfer", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: QrCode, label: "Scan", href: "/transfer", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: RefreshCcw, label: "Top Up", href: "/dashboard", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Receipt, label: "Pay Bills", href: "/dashboard", color: "text-amber-600", bg: "bg-amber-50" },
];

export function QuickActions() {
  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-4 gap-3">
        {actions.map(({ icon: Icon, label, href, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
          >
            <Link href={href} className="flex flex-col items-center gap-1.5 group">
              <div
                className={`${bg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}
              >
                <Icon size={22} className={color} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-medium text-gray-600">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
