"use client";

import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { FormatRM } from "@/lib/utils-tc";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Briefcase, 
  HeartPulse, 
  Coins,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function GOfinancePage() {
  const { currentUser } = useAuth();
  
  const stats = [
    { label: "Net Worth", value: 3450.00, icon: Coins, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Income", value: 5000.00, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Expense", value: 1550.00, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const services = [
    { name: "GO+", desc: "Earn daily returns", icon: Plus, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "GOinvest", desc: "Start investing", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "GOprotect", desc: "Insurance plans", icon: HeartPulse, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const recentActivities = [
    { title: "Investment Return", amount: 0.45, type: "income", date: "Today" },
    { title: "Car Insurance", amount: 250.00, type: "expense", date: "Yesterday" },
    { title: "GO+ Top-up", amount: 1000.00, type: "income", date: "24 Oct" },
  ];

  return (
    <MobileShell>
      <WalletHeader showBack title="GOfinance" />
      
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        
        {/* Net Worth Card */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-[32px] p-6 text-white mb-6 shadow-lg shadow-blue-500/20">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Net Worth</p>
          <h2 className="text-3xl font-black mb-6">{FormatRM(3450.00)}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-blue-100 text-[10px] mb-1">
                <ArrowUpRight size={12} className="text-emerald-400" /> Income
              </div>
              <p className="text-sm font-bold">{FormatRM(5000.00)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-blue-100 text-[10px] mb-1">
                <ArrowDownLeft size={12} className="text-rose-400" /> Expense
              </div>
              <p className="text-sm font-bold">{FormatRM(1550.00)}</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <h3 className="text-sm font-black text-gray-800 mb-3 px-1">Financial Services</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {services.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-3 border border-gray-100 flex flex-col items-center text-center group active:scale-95 transition-transform">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-2`}>
                <s.icon size={20} />
              </div>
              <p className="text-[11px] font-bold text-gray-900">{s.name}</p>
              <p className="text-[8px] text-gray-400 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Spending Insights */}
        <div className="bg-white rounded-[24px] p-4 border border-gray-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <PieIcon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-900">Spending Analysis</p>
              <p className="text-[9px] text-gray-400">View where your money goes</p>
            </div>
          </div>
          <button className="text-blue-600 text-[11px] font-bold px-3 py-1.5 bg-blue-50 rounded-lg">View</button>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-gray-800">Financial Activity</h3>
          <button className="text-blue-600 text-[11px] font-bold">See All</button>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          {recentActivities.map((act, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${act.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {act.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{act.title}</p>
                  <p className="text-[9px] text-gray-400">{act.date}</p>
                </div>
              </div>
              <p className={`text-xs font-bold ${act.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                {act.type === 'income' ? '+' : '-'}{FormatRM(act.amount)}
              </p>
            </div>
          ))}
        </div>

      </div>
      
      <BottomNav />
    </MobileShell>
  );
}
