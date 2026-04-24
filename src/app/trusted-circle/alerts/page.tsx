"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { VoiceAssistButton } from "@/components/VoiceAssistButton";
import { formatDate } from "@/lib/utils-tc";
import { AlertTriangle, CheckCircle2, Info, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AlertsPage() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!currentUser) return;
    fetch(`/api/alerts?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((d) => { setAlerts(d); setLoading(false); });
  };

  useEffect(() => { load(); }, [currentUser]);

  const markRead = async (id: string) => {
    await fetch(`/api/alerts/${id}/read`, { method: "PATCH" });
    load();
  };

  const markAllRead = async () => {
    await fetch(`/api/alerts/read-all?userId=${currentUser?.id}`, { method: "PATCH" });
    toast.success("All alerts marked as read");
    load();
  };

  const iconMap: Record<string, React.ReactNode> = {
    HIGH: <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />,
    MEDIUM: <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />,
    LOW: <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />,
  };

  const bgMap: Record<string, string> = {
    HIGH: "bg-red-50 border-red-100",
    MEDIUM: "bg-amber-50 border-amber-100",
    LOW: "bg-blue-50 border-blue-100",
  };

  const textMap: Record<string, string> = {
    HIGH: "text-red-800",
    MEDIUM: "text-amber-800",
    LOW: "text-blue-800",
  };

  const unread = alerts.filter((a) => !a.isRead);

  return (
    <MobileShell>
      <WalletHeader
        showBack
        title="Alerts"
        rightElement={
          unread.length > 0 ? (
            <button onClick={markAllRead} className="text-blue-600 text-xs font-medium">
              Mark all read
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Bell size={36} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">No alerts yet</p>
            <p className="text-xs mt-1">Alerts will appear here when activity is detected</p>
          </div>
        )}

        <div className="p-4 flex flex-col gap-2">
          {alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                onClick={() => !a.isRead && markRead(a.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${bgMap[a.severity] || "bg-gray-50 border-gray-100"} ${!a.isRead ? "cursor-pointer" : "opacity-70"} transition-opacity`}
              >
                {iconMap[a.severity] || <Info size={16} className="mt-0.5 shrink-0 text-gray-400" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${textMap[a.severity] || "text-gray-700"}`}>{a.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[10px] text-gray-400">{formatDate(a.createdAt)}</p>
                    {!a.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  {a.severity === "HIGH" && !a.isRead && (
                    <div className="mt-2">
                      <VoiceAssistButton
                        text={`Alert: ${a.message}`}
                        variant="icon"
                      />
                    </div>
                  )}
                </div>
                {a.isRead && (
                  <CheckCircle2 size={14} className="text-gray-300 shrink-0 mt-0.5" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
