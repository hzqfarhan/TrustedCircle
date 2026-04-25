"use client";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { FormatRM } from "@/lib/utils-tc";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ChildRequestsPage() {
  const { currentUser, isLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    // TODO: Add dedicated endpoint; for now piggyback on parent dashboard
    fetch("/api/dashboard/parent").then((r) => r.json()).then((d) => {
      setRequests((d.pendingRequests || []).filter((r: any) => r.childId === childId));
    }).finally(() => setLoading(false));
  }, [currentUser, isLoading, childId]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Extra Requests" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {requests.length === 0 ? <EmptyState icon={<Zap size={24} className="text-gray-300" />} title="No pending requests" /> : (
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{ FormatRM(req.amount)}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">PENDING</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{req.reason}</p>
                {req.childNote && <p className="text-[11px] text-gray-400 italic mb-3">&quot;{req.childNote}&quot;</p>}
                <div className="flex gap-2">
                  <button onClick={async () => {
                    await fetch("/api/allowance/request-extra", { method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "approve", requestId: req.id, approvedAmount: req.amount }) });
                    toast.success("Approved"); window.location.reload();
                  }} className="flex-1 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl">Approve</button>
                  <button onClick={async () => {
                    await fetch("/api/allowance/request-extra", { method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "reject", requestId: req.id }) });
                    toast.success("Rejected"); window.location.reload();
                  }} className="px-4 py-2 bg-red-50 text-red-500 text-xs font-semibold rounded-xl">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
