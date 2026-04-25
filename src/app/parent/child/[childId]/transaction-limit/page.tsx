"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LimitPresetButton } from "@/components/limits";
import { FormatRM } from "@/lib/utils-tc";
import React from "react";

export default function LimitPage({ params }: { params: Promise<{ childId: string }> }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [limit, setLimit] = useState<number>(20);
  const [customInput, setCustomInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/children/${resolvedParams.childId}?parentId=${currentUser.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setChild(data);
          const currentLimit = data.perTransactionLimit ?? 20;
          setLimit(currentLimit);
          setCustomInput(currentLimit.toString());
        }
      })
      .catch(() => toast.error("Failed to load child data"))
      .finally(() => setLoading(false));
  }, [currentUser, resolvedParams.childId]);

  const presets = [5, 10, 20, 30, 50, 100];

  const handleSave = async () => {
    if (!limit || limit <= 0 || limit > 500) {
      toast.error("Please enter a valid limit amount (RM1 - RM500).");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/children/${resolvedParams.childId}/limits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perTransactionLimit: limit })
      });
      
      if (res.ok) {
        toast.success(`Spending limit updated. ${child.nickname || child.fullName} can now spend up to RM${limit} per transaction.`);
        router.push(`/parent/child/${resolvedParams.childId}/profile`);
      } else {
        toast.error("We couldn't update the spending limit. Please try again.");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MobileShell><div className="p-4">Loading...</div></MobileShell>;
  if (!child) return <MobileShell><div className="p-4">Child not found</div></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Spending Limit" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        
        <p className="text-gray-600 text-sm mb-4 font-medium">
          Set how much your child can spend in one transaction.
        </p>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm font-bold text-gray-900">{child.nickname || child.fullName}</p>
          <p className="text-[11px] text-gray-500 mb-2">{child.fullName}</p>
          <p className="text-xs font-semibold text-blue-600">Current Balance: {FormatRM(child.currentBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">Current Limit: <span className="font-semibold text-gray-800">RM{child.perTransactionLimit ?? 20} per transaction</span></p>
        </div>

        <p className="text-sm font-bold text-gray-800 mb-3">Quick Presets</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map(p => (
            <LimitPresetButton 
              key={p} 
              amount={p} 
              isSelected={limit === p} 
              onClick={(v) => { setLimit(v); setCustomInput(v.toString()); }} 
            />
          ))}
        </div>

        <p className="text-sm font-bold text-gray-800 mb-3">Custom Amount</p>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">RM</span>
            <input 
              type="number" 
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setLimit(val);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <p className="text-[11px] text-blue-800 leading-relaxed">
            <span className="font-bold">Note:</span> Each child has their own spending limit. Updating this limit will only affect this child. Limits help children spend safely while learning good money habits.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Limit"}
        </button>

      </div>
      <BottomNav />
    </MobileShell>
  );
}
