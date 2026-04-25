"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import {
  Shield, Wallet, Baby, Users, Cpu, Bell, Settings2, ChevronRight, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { ROLE_LABELS } from "@/lib/utils-tc";

const features = [
  { icon: Baby, label: "Child Account", desc: "Spending limits, zones & cashflow monitor", href: "/trusted-circle/child", color: "bg-purple-50 text-purple-600" },
  { icon: Cpu, label: "AI Monitor", desc: "Behavioral risk detection & explanations", href: "/trusted-circle/ai-monitor", color: "bg-teal-50 text-teal-600" },
  { icon: Settings2, label: "Roles & Permissions", desc: "Fine-tune trust levels per member", href: "/trusted-circle/roles", color: "bg-gray-100 text-gray-600" },
];

const protections = [
  "AI behavioral risk scoring",
  "Shared fund withdrawal approval",
  "Child zone restriction",
  "High-amount transfer verification",
  "Voice alert narration",
];

export default function TrustedCirclePage() {
  const { currentUser } = useAuth();

  return (
    <MobileShell>
      <WalletHeader showBack title="Trusted Circle" />

      <div className="flex-1 overflow-y-auto">
        {/* Hero banner */}
        <div
          className="mx-4 mt-3 rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #0B1F6B 0%, #1a3aad 100%)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Trusted Circle</p>
              <p className="text-blue-300 text-xs">#JanjiTrusted</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            Your family's financial safety layer. Protect, monitor, and approve transactions together.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {protections.map((p) => (
              <div key={p} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <CheckCircle size={10} className="text-emerald-400" />
                <span className="text-white/80 text-[10px]">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current user info */}
        {currentUser && (
          <div className="mx-4 mt-3 bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {currentUser.fullName[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{currentUser.fullName}</p>
              <p className="text-xs text-gray-400">
                Active as <span className="text-blue-600 font-medium">{ROLE_LABELS[currentUser.role] || currentUser.role}</span>
              </p>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="px-4 pt-4 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Features</p>
          <div className="flex flex-col gap-2">
            {features.map(({ icon: Icon, label, desc, href, color }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={href}>
                  <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 active:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}
