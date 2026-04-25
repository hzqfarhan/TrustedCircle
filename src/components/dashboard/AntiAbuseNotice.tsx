import { ShieldAlert } from "lucide-react";

export function AntiAbuseNotice() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-4">
      <ShieldAlert size={20} className="text-blue-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-blue-900">JuniorWallet Core Principle</p>
        <p className="text-xs text-blue-800 leading-relaxed mt-1">
          JuniorWallet does not reward high spending. Responsible budgeting, savings, and staying within limits build trust.
        </p>
      </div>
    </div>
  );
}
