"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { RiskScoreCard, AlertBanner } from "@/components/AlertBanner";
import { VoiceAssistButton } from "@/components/VoiceAssistButton";
import { BuildRiskNarration } from "@/lib/voice";
import { FormatRM } from "@/lib/utils-tc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Send, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FLAGGED_IDS = ["SCAMMER_123", "MULE_001", "FRAUD_456"];

type Step = "form" | "risk" | "otp" | "done";

export default function TransferPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ recipient: "", accountId: "", amount: "", note: "", transferType: "open_transfer" });
  const [risk, setRisk] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    // 1. Validation Guard for Child Accounts
    const valRes = await fetch("/api/transfers/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser.id,
        recipientChildId: form.accountId,
        transferType: form.transferType || "open_transfer",
      }),
    });
    
    const valData = await valRes.json();
    if (!valData.allowed) {
      toast.error(valData.reason || "Transfer blocked by safety rules.");
      setLoading(false);
      return;
    }

    // 2. AI Risk Analysis
    const res = await fetch("/api/transfer/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser.id,
        amount: parseFloat(form.amount),
        recipientAccountId: form.accountId,
        recipientName: form.recipient,
      }),
    });

    const data = await res.json();
    setRisk(data);
    setLoading(false);

    if (data.severity === "LOW") {
      setStep("done");
      toast.success("Transfer completed!");
    } else {
      setStep("risk");
    }
  };

  const handleProceedAfterRisk = () => {
    setStep("otp");
  };

  const handleOTP = async () => {
    setLoading(true);
    // Simulate OTP check
    await new Promise((r) => setTimeout(r, 1000));
    if (otp === "123456" || otp.length === 6) {
      // Create transaction
      await fetch("/api/transfer/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser?.id,
          amount: parseFloat(form.amount),
          recipientName: form.recipient,
          note: form.note,
          riskScore: risk?.score,
          riskSeverity: risk?.severity,
          riskReasons: risk?.reasons,
          riskActions: risk?.recommendedActions,
        }),
      });
      setStep("done");
      toast.success("Transfer completed after verification!");
    } else {
      toast.error("Invalid OTP. Use any 6-digit code for demo.");
    }
    setLoading(false);
  };

  const narration = risk
    ? BuildRiskNarration(risk.severity, risk.reasons, parseFloat(form.amount))
    : "";

  return (
    <MobileShell>
      <WalletHeader showBack title="Transfer" />
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Select Recipient *</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={form.accountId}
                    onChange={(e) => {
                      const selectedName = e.target.options[e.target.selectedIndex].text;
                      setForm({ ...form, accountId: e.target.value, recipient: selectedName.split(" (")[0] });
                    }}
                    required
                  >
                    <option value="" disabled>Select a recipient...</option>
                    {currentUser?.role === "child" ? (
                      <option value="demo_parent">Paan (Parent)</option>
                    ) : (
                      <>
                        <option value="cp_aiman">Aiman (Child)</option>
                        <option value="SCAMMER_123">Unknown Account (Demo Risk Trigger)</option>
                      </>
                    )}
                  </select>
                  {currentUser?.role === "child" && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      As a child account, you can only transfer to your linked parent.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Transfer Type</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={form.transferType}
                    onChange={(e) => setForm({ ...form, transferType: e.target.value })}
                  >
                    <option value="open_transfer">Standard Transfer</option>
                    <option value="parent_allowance_transfer">Parent Allowance Transfer</option>
                    <option value="money_packet">Money Packet (Ang Pao)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (RM) *</label>
                  <input
                    type="number"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-2xl font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min="1"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Demo: Amount ≥ RM1000 triggers medium/high risk
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note</label>
                  <input
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Review Transfer
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === "risk" && risk && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 flex flex-col gap-4"
            >
              <AlertBanner
                severity={risk.severity}
                message={`AI detected ${risk.severity.toLowerCase()} risk on this transfer. Please review before continuing.`}
              />

              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Transferring to</p>
                <p className="font-bold text-gray-900">{form.recipient}</p>
                <p className="text-gray-400 text-xs">{form.accountId}</p>
                <p className="text-blue-700 font-black text-2xl mt-2">{ FormatRM(parseFloat(form.amount))}</p>
              </div>

              <RiskScoreCard
                score={risk.score}
                severity={risk.severity}
                reasons={risk.reasons}
                actions={risk.recommendedActions}
              />

              <VoiceAssistButton text={narration} />

              {risk.severity === "HIGH" ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className="text-red-500" />
                    <p className="text-sm font-bold text-red-800">High Risk — Extra verification needed</p>
                  </div>
                  <p className="text-xs text-red-600 mb-3">
                    This transfer requires OTP verification and trusted member approval to proceed.
                  </p>
                  <button
                    onClick={handleProceedAfterRisk}
                    className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-2xl text-sm"
                  >
                    Proceed with Verification →
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("form")}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedAfterRisk}
                    className="flex-1 bg-amber-600 text-white font-semibold py-3 rounded-2xl text-sm"
                  >
                    Verify & Send
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 flex flex-col gap-4"
            >
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <Send size={24} className="text-blue-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg">OTP Verification</p>
                <p className="text-gray-400 text-sm mt-1">
                  Enter the 6-digit code sent to your registered number.<br />
                  <span className="text-blue-600 font-medium">Demo: use any 6 digits</span>
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-11 h-14 text-center text-xl font-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/, "");
                      const next = otp.split("");
                      next[i] = val;
                      setOtp(next.join("").slice(0, 6));
                      if (val) {
                        const nextEl = document.querySelectorAll<HTMLElement>("input[maxlength='1']");
                        nextEl[i + 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleOTP}
                disabled={loading || otp.length < 6}
                className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Confirm Transfer"}
              </button>

              <button onClick={() => setStep("risk")} className="text-gray-400 text-sm text-center">
                ← Back
              </button>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <p className="text-xl font-black text-gray-900 mb-1">Transfer Complete!</p>
              <p className="text-gray-400 text-sm mb-1">
                { FormatRM(parseFloat(form.amount))} sent to {form.recipient}
              </p>
              {risk && (
                <p className="text-xs text-gray-400">Risk score: {risk.score} ({risk.severity})</p>
              )}
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 bg-blue-600 text-white font-semibold px-8 py-3 rounded-2xl"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

