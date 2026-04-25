"use client";
import { motion } from "framer-motion";
import { Brain, Check, X, Edit3, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { formatRM } from "@/lib/utils-tc";
import type { AllowanceRecommendation } from "@/types";
import { useState } from "react";
import { AIProviderBadge } from "./dashboard/AIProviderBadge";

interface RecommendationCardProps {
  recommendation: AllowanceRecommendation;
  onApprove?: (amount: number) => void;
  onReject?: () => void;
  isParent?: boolean;
}

export function RecommendationCard({ recommendation, onApprove, onReject, isParent = false }: RecommendationCardProps) {
  const [editAmount, setEditAmount] = useState(recommendation.suggestedAmount);
  const [editing, setEditing] = useState(false);
  const isPending = recommendation.status === "pending";

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    edited: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
            <Brain size={18} className="text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">AI Recommendation</p>
              <AIProviderBadge provider={(recommendation as any).aiProvider} />
            </div>
            <p className="text-[10px] text-gray-400">Based on spending analysis</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[recommendation.status]}`}>
          {recommendation.status.toUpperCase()}
        </span>
      </div>

      {/* Suggested Amount */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
        <p className="text-xs text-gray-500 mb-1">Suggested Monthly Allowance</p>
        <p className="text-3xl font-bold text-blue-700">{formatRM(recommendation.suggestedAmount)}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 mb-4">
        <BreakdownRow icon={<TrendingUp size={14} />} label="Basic Needs" amount={recommendation.basicNeeds} positive />
        <BreakdownRow icon={<TrendingUp size={14} />} label="School Adjustment" amount={recommendation.schoolAdjustment} positive />
        <BreakdownRow icon={<TrendingUp size={14} />} label="Flexible Buffer" amount={recommendation.flexibleBuffer} positive />
        <BreakdownRow icon={<TrendingUp size={14} />} label="Savings Goal" amount={recommendation.savingsGoal} positive />
        {recommendation.overspendingPenalty > 0 && (
          <BreakdownRow
            icon={<TrendingDown size={14} />}
            label="Overspending Penalty"
            amount={-recommendation.overspendingPenalty}
            positive={false}
          />
        )}
      </div>

      {/* Risk Flags */}
      {recommendation.riskFlags.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {recommendation.riskFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700">{flag.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{recommendation.explanation}</p>

      {/* Actions - Parent only */}
      {isParent && isPending && (
        <div className="flex gap-2">
          {editing ? (
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium"
                min={0}
              />
              <button
                onClick={() => { onApprove?.(editAmount); setEditing(false); }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onApprove?.(recommendation.suggestedAmount)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check size={16} /> Approve
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2.5 bg-red-50 text-red-500 text-sm font-semibold rounded-2xl hover:bg-red-100 transition-colors"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

function BreakdownRow({ icon, label, amount, positive }: { icon: React.ReactNode; label: string; amount: number; positive: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <span className={positive ? "text-emerald-500" : "text-red-400"}>{icon}</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${positive ? "text-gray-800" : "text-red-500"}`}>
        {positive ? "+" : ""}{formatRM(Math.abs(amount))}
      </span>
    </div>
  );
}
