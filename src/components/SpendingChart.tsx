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

interface DonutData {
  name: string;
  value: number;
  color: string;
}

function Donut({ title, chartData }: { title: string; chartData: DonutData[] }) {
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex-1 flex flex-col items-center">
      <p className="text-[11px] font-bold text-gray-800 mb-4 text-center">{title}</p>
      <div className="w-24 h-24 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={24}
              outerRadius={44}
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(0)}%`, ""]}
              contentStyle={{ borderRadius: 12, fontSize: 10, border: "1px solid #e5e7eb" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full space-y-1.5 px-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[10px] text-gray-500 font-medium truncate">{item.name}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-700 tabular-nums">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpendingChart({ data }: SpendingChartProps) {
  const actualData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: GetCategoryLabel(key as any),
      value: Math.round(value * 100) / 100,
      color: COLORS[key] || "#94a3b8",
    }));

  // Hardcoded AI Recommendation data (healthier distribution)
  const aiRecommendedData: DonutData[] = [
    { name: "Essential", value: 45, color: COLORS.essential },
    { name: "Educational", value: 25, color: COLORS.educational },
    { name: "Discretionary", value: 20, color: COLORS.discretionary },
    { name: "Risky", value: 10, color: COLORS.risky },
  ];

  if (actualData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-xs">
        No spending data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start divide-x divide-gray-100">
        <div className="flex-1 pr-4">
          <Donut title="Spending by Category" chartData={actualData} />
        </div>
        <div className="flex-1 pl-4">
          <Donut title="AI Recommendation" chartData={aiRecommendedData} />
        </div>
      </div>
    </div>
  );
}



