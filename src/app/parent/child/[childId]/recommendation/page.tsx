"use client";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { RecommendationCard } from "@/components/RecommendationCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { AntiAbuseNotice } from "@/components/dashboard/AntiAbuseNotice";
import { useAuth } from "@/lib/auth-context";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RecommendationPage() {
  const { currentUser, isLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch(`/api/dashboard/parent/${childId}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [currentUser, isLoading, childId]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  const recs = data?.recommendations || [];

  return (
    <MobileShell>
      <WalletHeader showBack title="AI Recommendations" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <button onClick={async () => {
          const res = await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate", childId }) });
          if (res.ok) { toast.success("Generated!"); window.location.reload(); }
        }} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors mb-4">
          <Brain size={16} /> Generate New Recommendation
        </button>

        {recs.length === 0 ? <EmptyState icon={<Brain size={24} className="text-gray-300" />} title="No recommendations yet" /> : (
          <div className="space-y-4">
            <AntiAbuseNotice />
            {recs.map((rec: any) => (
              <RecommendationCard key={rec.id} recommendation={rec} isParent
                onApprove={async (amount) => {
                  await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "approve", recommendationId: rec.id, approvedAmount: amount }) });
                  toast.success("Approved!"); window.location.reload();
                }}
                onReject={async () => {
                  await fetch("/api/allowance", { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "reject", recommendationId: rec.id }) });
                  toast.success("Rejected"); window.location.reload();
                }}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
