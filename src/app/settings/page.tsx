"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { VoiceAssistButton } from "@/components/VoiceAssistButton";
import { useState, useEffect } from "react";
import { IsVoiceEnabled, SetVoiceEnabled } from "@/lib/voice";
import Link from "next/link";
import { ChevronRight, Volume2, Shield, AlertTriangle, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const [voiceOn, setVoiceOn] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [threshold, setThreshold] = useState("1000");

  useEffect(() => {
    setVoiceOn(IsVoiceEnabled());
    setLargeText(localStorage.getItem("tc_large_text") === "true");
    setThreshold(localStorage.getItem("tc_threshold") || "1000");
  }, []);

  const handleVoiceToggle = (v: boolean) => {
    setVoiceOn(v);
    SetVoiceEnabled(v);
    toast.success(v ? "Voice alerts enabled" : "Voice alerts disabled");
  };

  const handleLargeText = (v: boolean) => {
    setLargeText(v);
    localStorage.setItem("tc_large_text", v ? "true" : "false");
    toast.success(v ? "Large text on" : "Large text off");
  };

  const handleThreshold = () => {
    localStorage.setItem("tc_threshold", threshold);
    toast.success(`High-amount threshold set to RM${threshold}`);
  };

  const settingsGroups = [
    {
      title: "Protection",
      items: [
        {
          icon: <AlertTriangle size={16} className="text-amber-600" />,
          label: "High-Amount Threshold",
          desc: "Transfers above this require extra auth",
          content: (
            <div className="flex gap-2 items-center mt-2">
              <span className="text-gray-500 text-sm">RM</span>
              <input
                type="number"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                min="100"
              />
              <button
                onClick={handleThreshold}
                className="bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          ),
        },
      ],
    },
    {
      title: "Accessibility & Voice",
      items: [
        {
          icon: <Volume2 size={16} className="text-blue-600" />,
          label: "Voice Alerts",
          desc: "Narrate high-risk alerts and warnings",
          toggle: { value: voiceOn, onChange: handleVoiceToggle },
        },
        {
          icon: <Settings size={16} className="text-purple-600" />,
          label: "Large Text Mode",
          desc: "Increase text size across the app",
          toggle: { value: largeText, onChange: handleLargeText },
        },
      ],
    },
    {
      title: "Quick Links",
      items: [
        { icon: <Shield size={16} className="text-teal-600" />, label: "Roles & Permissions", desc: "View permission matrix", href: "/trusted-circle/roles" },
        { icon: <Shield size={16} className="text-blue-600" />, label: "Circle Members", desc: "Manage your trusted circle", href: "/trusted-circle/members" },
      ],
    },
  ];

  return (
    <MobileShell>
      <WalletHeader showBack title="Settings" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group.title}</p>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {group.items.map((item: any, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    {item.toggle && (
                      <Switch
                        checked={item.toggle.value}
                        onCheckedChange={item.toggle.onChange}
                      />
                    )}
                    {item.href && (
                      <Link href={item.href}>
                        <ChevronRight size={16} className="text-gray-300" />
                      </Link>
                    )}
                  </div>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Voice Demo */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Voice Demo</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600 mb-3">Test voice narration with a sample warning</p>
            <VoiceAssistButton
              text="Warning! High risk transaction detected. Amount is 8 times higher than your usual transfers. Recipient account is in the fraud alert list. Please do not proceed without trusted verification."
            />
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

