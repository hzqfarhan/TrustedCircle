"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GetCategoryLabel } from "@/lib/ai/classification";

interface SpendingChartProps {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  essential: "#10b981",
  educational: "#3b82f6",
  savings: "#8b5cf6",
  discretionary: "#f59e0b",
  risky: "#ef4444",
};

export function SpendingChart({ data }: SpendingChartProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: GetCategoryLabel(key as any),
      value: Math.round(value * 100) / 100,
      color: COLORS[key] || "#94a3b8",
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-xs">
        No spending data yet
      </div>
    );
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <p className="text-sm font-bold text-gray-800 mb-3">Spending by Category</p>
      <div className="flex items-center gap-4">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={48}
                strokeWidth={2}
                stroke="#fff"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`RM ${value.toFixed(2)}`, ""]}
                contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[11px] text-gray-600">{item.name}</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-800">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

