"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { FormatRM } from "@/lib/utils-tc";

const DEMO_ZONES = ["Home Area", "School Zone", "Nearby Mall", "Hospital Zone"];

export default function ChildControlsPage({ params }: { params: { id: string } }) {
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState("");
  const [limitType, setLimitType] = useState("WEEKLY");
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/child/${params.id}/controls`)
      .then((r) => r.json())
      .then((d) => {
        setChild(d);
        setLimit(d?.spendingLimit?.toString() ?? "200");
        setLimitType(d?.limitType ?? "WEEKLY");
        setZones(d?.zoneRules?.filter((z: any) => z.isActive).map((z: any) => z.name) ?? []);
        setLoading(false);
      });
  }, [params.id]);

  const toggleZone = (name: string) => {
    setZones((prev) =>
      prev.includes(name) ? prev.filter((z) => z !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    await fetch(`/api/child/${params.id}/controls`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spendingLimit: parseFloat(limit), limitType, activeZones: zones }),
    });
    toast.success("Controls updated!");
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Child Controls" />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            {/* Spending Limit */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-blue-600" />
                <p className="text-sm font-bold text-gray-800">Spending Limit</p>
              </div>
              <input
                type="number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="0"
              />
              <div className="flex gap-2 mt-2">
                {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLimitType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      limitType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone Rules */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-purple-600" />
                <p className="text-sm font-bold text-gray-800">Allowed Zones</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Transactions outside these zones will be blocked or flagged.</p>
              <div className="flex flex-col gap-2">
                {DEMO_ZONES.map((zone) => {
                  const active = zones.includes(zone);
                  return (
                    <button
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        active ? "border-purple-300 bg-purple-50" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={14} className={active ? "text-purple-600" : "text-gray-400"} />
                        <span className={`text-sm font-medium ${active ? "text-purple-800" : "text-gray-600"}`}>{zone}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-purple-600 bg-purple-600" : "border-gray-300"}`}>
                        {active && <ShieldCheck size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulate zone violation */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-amber-900 mb-1">Demo: Simulate Zone Violation</p>
              <p className="text-xs text-amber-700 mb-3">
                Simulates a transaction attempt by the child from outside an allowed zone. Parent will receive an alert.
              </p>
              <button
                onClick={async () => {
                  const res = await fetch("/api/child/simulate-zone-violation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ childAccountId: params.id }),
                  });
                  if (res.ok) toast.error("🚨 Zone violation simulated! Check Alerts.");
                }}
                className="w-full bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl"
              >
                Simulate Zone Violation
              </button>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-2xl"
            >
              Save Controls
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
