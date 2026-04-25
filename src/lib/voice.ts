"use client";

export function Speak(text: string, rate = 0.95, pitch = 1.0) {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-MY";
  utterance.rate = rate;
  utterance.pitch = pitch;
  window.speechSynthesis.Speak(utterance);
}

export function BuildRiskNarration(
  severity: string,
  reasons: string[],
  amount: number
): string {
  const intro =
    severity === "HIGH"
      ? `Warning! High risk transaction detected. Amount: Ringgit Malaysia ${amount.toFixed(0)}.`
      : severity === "MEDIUM"
      ? `Caution. Moderate risk detected on this transfer of Ringgit Malaysia ${amount.toFixed(0)}.`
      : `Low risk detected. Transfer of Ringgit Malaysia ${amount.toFixed(0)} appears normal.`;

  const reasonText =
    reasons.length > 0 ? ` Reasons: ${reasons.slice(0, 2).join(". ")}.` : "";

  const outro =
    severity === "HIGH"
      ? " Please do not proceed. Contact your trusted circle for verification."
      : severity === "MEDIUM"
      ? " Please verify via O T P or trusted member approval."
      : " You may proceed safely.";

  return intro + reasonText + outro;
}

export function IsVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("tc_voice_enabled") === "true";
}

export function SetVoiceEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tc_voice_enabled", enabled ? "true" : "false");
}

