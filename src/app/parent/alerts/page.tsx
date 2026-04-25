"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export default function ParentAlertsPage() {
  const { currentUser, isLoading } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !currentUser) return;
    fetch("/api/dashboard/parent")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts || []))
      .finally(() => setLoading(false));
  }, [currentUser, isLoading]);

  if (isLoading || loading) return <MobileShell><LoadingState /></MobileShell>;

  const colors: Record<string, string> = {
    info: "bg-blue-50 border-blue-100 text-blue-700",
    warning: "bg-amber-50 border-amber-100 text-amber-700",
    critical: "bg-red-50 border-red-100 text-red-700",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Alerts" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {alerts.length === 0 ? <EmptyState title="No alerts yet" description="You'll see notifications here when there's activity." /> : (
          <div className="space-y-2">
            {alerts.map((a: any) => (
              <div key={a.id} className={`p-3 rounded-2xl border ${colors[a.severity] || colors.info} ${a.read ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-2">
                  <Bell size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{a.title}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{a.message}</p>
                    <p className="text-[9px] opacity-50 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
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
