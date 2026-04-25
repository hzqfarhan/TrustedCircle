"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function RequestExtraPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <MobileShell><LoadingState /></MobileShell>;

  const handleSubmit = async () => {
    if (!amount || !reason) { toast.error("Please fill in amount and reason"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/allowance/request-extra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", amount: Number(amount), reason, childNote: note }),
      });
      if (res.ok) {
        toast.success("Request submitted!");
        router.push("/child/dashboard");
      } else {
        toast.error("Failed to submit request");
      }
    } finally { setSubmitting(false); }
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Request Extra Allowance" />
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
          <p className="text-xs text-amber-700 font-medium">📝 Your parent will review this request and decide whether to approve it.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Amount (RM)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25" min="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. School materials for science project"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Note to Parent (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            <Send size={16} /> {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
