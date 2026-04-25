"use client";
import Link from "next/link";
import { Shield, ChevronRight, Users, PiggyBank, Baby, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: PiggyBank, label: "Tabung", desc: "Save together for family goals", href: "/parent/tabung" },
  { icon: Baby, label: "Child Account", desc: "Parental controls & limits", href: "/trusted-circle/child" },
  { icon: Cpu, label: "AI Monitor", desc: "Smart risk detection", href: "/trusted-circle/ai-monitor" },
  { icon: Users, label: "Members", desc: "Manage circle & roles", href: "/trusted-circle/members" },
];

export function JuniorWalletCard({ alertCount }: { alertCount?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="mx-4 rounded-3xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1F6B 0%, #1a3aad 100%)" }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">JuniorWallet</p>
              <p className="text-blue-300 text-[10px]">#JuniorWallet</p>
            </div>
          </div>
          {alertCount !== undefined && alertCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {features.map(({ icon: Icon, label, desc, href }) => (
            <Link key={href} href={href}>
              <div className="bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors rounded-2xl p-3 flex flex-col gap-1.5">
                <Icon size={18} className="text-white/80" />
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-blue-200 text-[10px] leading-tight">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/trusted-circle"
          className="mt-3 flex items-center justify-center gap-1 text-blue-200 text-xs font-medium py-1"
        >
          View all features <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

