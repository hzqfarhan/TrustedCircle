"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Upload, FileText } from "lucide-react";

export default function CreateChildPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("200");
  const [limitType, setLimitType] = useState("WEEKLY");
  const [loading, setLoading] = useState(false);
  const [idType, setIdType] = useState("MYKID");
  const [idNumber, setIdNumber] = useState("");
  const [fileName, setFileName] = useState("");

  const users: any[] = [];
  const childUsers = users.filter((u) => u.role === "CHILD");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChildId || !idNumber) {
      toast.error("Please fill in all required fields including KYC.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/child/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: currentUser.id,
        childId: selectedChildId,
        spendingLimit: parseFloat(spendingLimit),
        limitType,
      }),
    });

    if (res.ok) {
      toast.success("Child account linked!");
      router.push("/trusted-circle/child");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create");
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Link Child Account" />
      <div className="flex-1 overflow-y-auto p-4">
        {/* Verification Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 flex gap-2.5">
          <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-900">Identity Verification (KYC)</p>
            <p className="text-xs text-blue-700 mt-0.5">
              To comply with regulations, please provide your child's MyKID or Birth Certificate for verification.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Select Child Account *</label>
            {childUsers.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">No child accounts available in demo data.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {childUsers.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setSelectedChildId(u.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedChildId === u.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {u.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">Child Account · Demo</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">KYC Verification</h3>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ID Type *</label>
              <div className="flex gap-2">
                {["MYKID", "BIRTH_CERTIFICATE"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setIdType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                      idType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t === "MYKID" ? "MyKID" : "Birth Certificate"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ID Number *</label>
              <input
                type="text"
                placeholder={idType === "MYKID" ? "e.g. 120514-10-1234" : "e.g. CA123456"}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Upload Document Proof *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
                {fileName ? (
                  <>
                    <FileText size={24} className="text-blue-500 mb-2" />
                    <p className="text-xs font-semibold text-blue-600 text-center">{fileName}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Tap to change file</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-xs font-medium text-gray-600">Tap to upload file</p>
                    <p className="text-[10px] text-gray-400 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Spending Limit (RM)</label>
            <input
              type="number"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={spendingLimit}
              onChange={(e) => setSpendingLimit(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Limit Period</label>
            <div className="flex gap-2">
              {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setLimitType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    limitType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedChildId}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 hover:bg-blue-700 transition-colors mt-2"
          >
            {loading ? "Linking..." : "Link Child Account"}
          </button>
        </form>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
