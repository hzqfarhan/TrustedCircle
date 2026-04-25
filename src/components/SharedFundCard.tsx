"use client";
import { FormatRM } from "@/lib/utils-tc";
import Link from "next/link";
import { Target, Users } from "lucide-react";
import { motion } from "framer-motion";

interface FundData {
  id: string;
  name: string;
  description?: string | null;
  balance: number;
  goalAmount?: number | null;
  _count?: { members: number };
}

export function SharedFundCard({ fund, index = 0 }: { fund: FundData; index?: number }) {
  const progress = fund.goalAmount ? (fund.balance / fund.goalAmount) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link href={`/trusted-circle/funds/${fund.id}`}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{fund.name}</p>
              {fund.description && (
                <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-1">{fund.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-700 font-bold text-sm">{ FormatRM(fund.balance)}</p>
              {fund.goalAmount && (
                <p className="text-gray-400 text-[10px]">/ { FormatRM(fund.goalAmount)}</p>
              )}
            </div>
          </div>

          {progress !== null && (
            <div className="mt-2 mb-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{progress.toFixed(0)}% of goal</p>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-400">
            <Users size={11} />
            <span className="text-[11px]">
              {fund._count?.members ?? 0} member{(fund._count?.members ?? 0) !== 1 ? "s" : ""}
            </span>
            {fund.goalAmount && (
              <>
                <span className="mx-1">·</span>
                <Target size={11} />
                <span className="text-[11px]">Goal-based</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

