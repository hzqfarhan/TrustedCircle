"use client";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import type { Badge, ChildBadge } from "@/types";

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  index?: number;
}

const BADGE_ICONS: Record<string, string> = {
  "Smart Saver": "💰",
  "Budget Hero": "🦸",
  "Needs First": "🎯",
  "Goal Builder": "🏗️",
};

export function BadgeCard({ badge, unlocked, unlockedAt, index = 0 }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-4 text-center border shadow-sm ${
        unlocked
          ? "bg-gradient-to-b from-amber-50 to-white border-amber-200"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      <div className="text-3xl mb-2">
        {unlocked ? (BADGE_ICONS[badge.name] || "🏅") : <Lock size={28} className="mx-auto text-gray-300" />}
      </div>
      <p className={`text-xs font-bold ${unlocked ? "text-gray-900" : "text-gray-400"}`}>
        {badge.name}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{badge.description}</p>
      {unlocked && unlockedAt && (
        <p className="text-[9px] text-amber-600 mt-1.5 font-medium">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

