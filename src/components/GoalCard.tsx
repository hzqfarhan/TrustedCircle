"use client";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { formatRM } from "@/lib/utils-tc";
import type { Goal } from "@/types";

export function GoalCard({ goal, index = 0 }: { goal: Goal; index?: number }) {
  const g = goal as any;
  const title = g.Title ?? g.title;
  const goalType = g.GoalType ?? g.goalType;
  const targetAmount = g.TargetAmount ?? g.targetAmount;
  const currentAmount = g.CurrentAmount ?? g.currentAmount;
  const status = g.Status ?? g.status;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isComplete = status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl p-4 shadow-sm border ${isComplete ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isComplete ? "bg-emerald-100" : "bg-blue-50"}`}>
            <Target size={16} className={isComplete ? "text-emerald-600" : "text-blue-600"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-[10px] text-gray-400 capitalize">{goalType}</p>
          </div>
        </div>
        {isComplete && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            ✓ Done
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-gray-500">{formatRM(currentAmount)}</span>
          <span className="text-gray-400">{formatRM(targetAmount)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-blue-400"}`}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{progress.toFixed(0)}% complete</p>
      </div>
    </motion.div>
  );
}
