"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { APPROVAL_RULE_LABELS } from "@/lib/utils-tc";

export default function NewFundPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    goalAmount: "",
    approvalRule: "2_OF_3",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    const res = await fetch("/api/funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ownerId: currentUser.id }),
    });
    if (res.ok) {
      const fund = await res.json();
      toast.success("Fund created successfully!");
      router.push(`/trusted-circle/funds/${fund.id}`);
    } else {
      toast.error("Failed to create fund");
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Create Shared Fund" />
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fund Name *</label>
            <input
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Bali Trip 2026"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
            <textarea
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What is this fund for?"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Goal Amount (RM) — Optional</label>
            <input
              type="number"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 5000"
              value={form.goalAmount}
              onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Withdrawal Approval Rule</label>
            <div className="flex flex-col gap-2">
              {Object.entries(APPROVAL_RULE_LABELS).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setForm({ ...form, approvalRule: key })}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    form.approvalRule === key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                      form.approvalRule === key ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${form.approvalRule === key ? "text-blue-700" : "text-gray-800"}`}>
                      {label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Fund"}
          </button>
        </form>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
