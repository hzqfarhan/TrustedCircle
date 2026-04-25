"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormatRM } from "@/lib/utils-tc";
import { ArrowDownLeft } from "lucide-react";

export default function WithdrawPage({ params }: { params: { id: string } }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [fund, setFund] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/funds/${params.id}`)
      .then((r) => r.json())
      .then(setFund);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !fund) return;
    setLoading(true);

    // Create withdrawal request + pending approvals for each member
    const res = await fetch(`/api/funds/${params.id}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        requesterId: currentUser.id,
      }),
    });

    if (res.ok) {
      toast.success("Withdrawal request submitted! Waiting for approvals.");
      router.push(`/trusted-circle/funds/${params.id}`);
    } else {
      toast.error("Failed to submit withdrawal request");
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Request Withdrawal" />
      <div className="flex-1 overflow-y-auto">
        {fund && (
          <div className="p-4">
            {/* Fund Summary */}
            <div className="bg-blue-600 rounded-3xl p-4 mb-5 text-white">
              <p className="text-blue-200 text-xs mb-1">Available in Fund</p>
              <p className="text-2xl font-black">{ FormatRM(fund.balance)}</p>
              <p className="text-blue-200 text-xs mt-1">{fund.name}</p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex gap-2.5">
              <ArrowDownLeft size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Withdrawals require approval from members based on the fund's rule. Funds will only be released once conditions are met.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (RM) *</label>
                <input
                  type="number"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={fund.balance}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Purpose / Note</label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What is this withdrawal for?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-500">Approval required by:</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {fund.approvalRule === "ALL"
                    ? "All members"
                    : fund.approvalRule === "2_OF_3"
                    ? "Any 2 of 3 members"
                    : fund.approvalRule === "PARENT_ONLY"
                    ? "Parent + Companion"
                    : "Selected approvers"}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Withdrawal Request"}
              </button>
            </form>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
