"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";
import { formatRM } from "@/lib/utils-tc";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

const mockWeekly = [
  { day: "Mon", amount: 8.5 },
  { day: "Tue", amount: 12 },
  { day: "Wed", amount: 8.5 },
  { day: "Thu", amount: 20 },
  { day: "Fri", amount: 15 },
  { day: "Sat", amount: 35 },
  { day: "Sun", amount: 8.5 },
];

const mockCategory = [
  { name: "Canteen", value: 42.5 },
  { name: "Transport", value: 15 },
  { name: "Books", value: 20 },
  { name: "Snacks", value: 10 },
];

export default function CashflowPage({ params }: { params: { id: string } }) {
  const total = mockWeekly.reduce((acc, d) => acc + d.amount, 0);
  const limit = 200;
  const pct = (total / limit) * 100;

  return (
    <MobileShell>
      <WalletHeader showBack title="Cashflow Monitor" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Budget health */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-4 border border-gray-100"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Weekly Budget Health</p>
          <div className="flex justify-between items-end mb-2">
            <p className="text-2xl font-black text-gray-900">{formatRM(total)}</p>
            <p className="text-sm text-gray-400">/ {formatRM(limit)}</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-500"}`}
            />
          </div>
          <p className={`text-xs font-medium ${pct >= 90 ? "text-red-500" : pct >= 70 ? "text-amber-500" : "text-emerald-600"}`}>
            {pct >= 90 ? "⚠️ Almost at limit" : pct >= 70 ? "🔶 Getting close" : "✅ Healthy spending"}
          </p>
        </motion.div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">This Week</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mockWeekly} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px #0001", fontSize: 12 }}
                formatter={(v: number) => [`RM ${v.toFixed(2)}`, "Spent"]}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">Category Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={mockCategory}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {mockCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`RM ${v.toFixed(2)}`, "Spent"]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-2">By Category</p>
          {mockCategory.map((c, i) => (
            <div key={c.name} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-sm text-gray-700 flex-1">{c.name}</span>
              <span className="text-sm font-bold text-gray-900">{formatRM(c.value)}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
