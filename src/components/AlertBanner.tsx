"use client";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AlertBannerProps {
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  className?: string;
}

export function AlertBanner({ severity, message, className }: AlertBannerProps) {
  const config = {
    HIGH: { icon: AlertTriangle, bg: "bg-red-50 border-red-200", text: "text-red-700", icon_color: "text-red-500" },
    MEDIUM: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon_color: "text-amber-500" },
    LOW: { icon: Info, bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon_color: "text-blue-500" },
  }[severity];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-2.5 px-3.5 py-3 rounded-2xl border text-sm",
        config.bg,
        config.text,
        className
      )}
    >
      <Icon size={16} className={cn("mt-0.5 shrink-0", config.icon_color)} />
      <p className="leading-snug">{message}</p>
    </motion.div>
  );
}

export function RiskScoreCard({
  score,
  severity,
  reasons,
  actions,
}: {
  score: number;
  severity: string;
  reasons: string[];
  actions: string[];
}) {
  const colorMap: Record<string, string> = {
    HIGH: "from-red-500 to-red-600",
    MEDIUM: "from-amber-400 to-amber-500",
    LOW: "from-emerald-500 to-emerald-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${colorMap[severity] || colorMap.LOW} p-4 flex items-center gap-4`}>
        <div className="bg-white/20 rounded-2xl p-3 text-center w-16 shrink-0">
          <p className="text-white text-2xl font-black">{score}</p>
          <p className="text-white/80 text-[9px] uppercase tracking-wider">Risk Score</p>
        </div>
        <div>
          <p className="text-white font-bold text-lg capitalize">{severity}</p>
          <p className="text-white/80 text-xs">Risk severity level</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {reasons.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why this was flagged</p>
            <ul className="space-y-1.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {actions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommended actions</p>
            <ul className="space-y-1.5">
              {actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                  <CheckCircle size={13} className="mt-0.5 shrink-0 text-blue-500" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
