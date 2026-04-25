"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function CreateChildPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("200");
  const [limitType, setLimitType] = useState("WEEKLY");
  const [loading, setLoading] = useState(false);

  const users: any[] = [];
  const childUsers = users.filter((u) => u.role === "CHILD");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChildId) return;
    setLoading(true);

    const res = await fetch("/api/child/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: currentUser.id,
        childId: selectedChildId,
        spendingLimit: parseFloat(spendingLimit),
        limitType,
      }),
    });

    if (res.ok) {
      toast.success("Child account linked!");
      router.push("/trusted-circle/child");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create");
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Link Child Account" />
      <div className="flex-1 overflow-y-auto p-4">
        {/* Verification Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 flex gap-2.5">
          <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-900">Identity Verification</p>
            <p className="text-xs text-blue-700 mt-0.5">
              In a production app, this would require MyKid / MyKad verification and guardian consent. For demo, select from seeded accounts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Select Child Account *</label>
            {childUsers.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">No child accounts available in demo data.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {childUsers.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setSelectedChildId(u.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedChildId === u.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {u.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">Child Account · Demo</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Spending Limit (RM)</label>
            <input
              type="number"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={spendingLimit}
              onChange={(e) => setSpendingLimit(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Limit Period</label>
            <div className="flex gap-2">
              {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setLimitType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    limitType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedChildId}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 hover:bg-blue-700 transition-colors mt-2"
          >
            {loading ? "Linking..." : "Link Child Account"}
          </button>
        </form>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
