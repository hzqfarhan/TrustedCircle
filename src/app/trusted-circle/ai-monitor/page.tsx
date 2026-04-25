"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { RiskScoreCard } from "@/components/AlertBanner";
import { VoiceAssistButton } from "@/components/VoiceAssistButton";
import { BuildRiskNarration } from "@/lib/voice";
import { FormatRM, FormatDate } from "@/lib/utils-tc";
import { useEffect, useState } from "react";
import { Cpu, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AssessRisk } from "@/lib/risk-engine";
import { toast } from "sonner";

const demoScenarios = [
  {
    label: "High Risk: Flagged Recipient",
    params: {
      amount: 2500,
      userAvgAmount: 100,
      isNewRecipient: true,
      isFlaggedRecipient: true,
      transactionHour: 2,
    },
    transfer: { to: "Scammer Account", amount: 2500 },
  },
  {
    label: "Medium Risk: Large Amount",
    params: {
      amount: 1500,
      userAvgAmount: 200,
      isNewRecipient: true,
      isFlaggedRecipient: false,
      transactionHour: 14,
    },
    transfer: { to: "Ahmad Razif", amount: 1500 },
  },
  {
    label: "Low Risk: Normal Transfer",
    params: {
      amount: 50,
      userAvgAmount: 80,
      isNewRecipient: false,
      isFlaggedRecipient: false,
      transactionHour: 10,
    },
    transfer: { to: "Kedai Buku", amount: 50 },
  },
  {
    label: "Child Zone Violation",
    params: {
      amount: 30,
      userAvgAmount: 15,
      isNewRecipient: false,
      isFlaggedRecipient: false,
      isChildOutsideZone: true,
      transactionHour: 15,
    },
    transfer: { to: "Kedai Runcit (Outside Zone)", amount: 30 },
  },
];

export default function AIMonitorPage() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeTransfer, setActiveTransfer] = useState<any>(null);

  const runScenario = (i: number) => {
    const s = demoScenarios[i];
    const r = AssessRisk(s.params as any);
    setResult(r);
    setActiveScenario(i);
    setActiveTransfer(s.transfer);
    toast.info(`Scenario: ${s.label}`);
  };

  const narration = result && activeTransfer
    ? BuildRiskNarration(result.severity, result.reasons, activeTransfer.amount)
    : "";

  return (
    <MobileShell>
      <WalletHeader showBack title="AI Risk Monitor" />
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div
          className="mx-4 mt-3 rounded-3xl p-4 mb-4"
          style={{ background: "linear-gradient(135deg, #0F2B6B 0%, #1a3aad 100%)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={20} className="text-teal-300" />
            <p className="text-white font-bold">AI Behavioral Monitor</p>
          </div>
          <p className="text-blue-200 text-xs leading-relaxed">
            Deterministic rule-based risk scoring engine. Analyses each transaction against your behavioral baseline to detect anomalies.
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="px-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Demo Scenarios</p>
          <div className="flex flex-col gap-2">
            {demoScenarios.map((s, i) => (
              <button
                key={i}
                onClick={() => runScenario(i)}
                className={`text-left p-3.5 rounded-2xl border transition-colors ${
                  activeScenario === i
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                  <div className={`w-2 h-2 rounded-full ${activeScenario === i ? "bg-blue-500" : "bg-gray-200"}`} />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  { FormatRM(s.transfer.amount)} → {s.transfer.to}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Result */}
        {result && (
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 mt-4"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assessment Result</p>
            <RiskScoreCard
              score={result.score}
              severity={result.severity}
              reasons={result.reasons}
              actions={result.recommendedActions}
            />
            <div className="mt-3">
              <VoiceAssistButton text={narration} />
            </div>
          </motion.div>
        )}

        {/* Explainer */}
        <div className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-2">How it works</p>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              { rule: "Amount 3×–5× above average", score: "+15–25" },
              { rule: "Exceeds RM1000 threshold", score: "+20" },
              { rule: "New recipient", score: "+15" },
              { rule: "CCID-flagged account", score: "+35" },
              { rule: "Midnight–5am transaction", score: "+10" },
              { rule: "Child outside zone", score: "+40" },
              { rule: "Repeated failed attempts", score: "+15" },
            ].map((r) => (
              <div key={r.rule} className="flex justify-between">
                <span>{r.rule}</span>
                <span className="font-bold text-red-500">{r.score}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <p className="font-medium text-gray-700">Thresholds: 0–24 LOW · 25–59 MEDIUM · 60+ HIGH</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

