"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AddChildPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    nickname: "",
    email: "",
    dateOfBirth: "",
    relationship: "father",
    documentType: "mykid",
    documentFile: "",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!form.consent) return toast.error("Parental consent is required");

    setLoading(true);

    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: currentUser.id, data: form }),
    });

    if (res.ok) {
      toast.success("Child account created and KYC pending!");
      router.push("/parent/dashboard");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create child account");
    }
    setLoading(false);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Add Child Account" />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 flex gap-2.5">
          <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-900">Add Child Account</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Create a safe JuniorWallet account for your child. We’ll use their MyKid or Birth Certificate to verify the account belongs to your family.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Child Details</h3>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Legal Name *</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nickname *</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address *</label>
              <p className="text-[10px] text-gray-400 mb-2">Children under 12 may not have their own phone number, so JuniorWallet uses email for child account access and notifications.</p>
              <input
                type="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date of Birth *</label>
              <input
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your Relationship *</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                required
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">KYC Verification</h3>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ID Type *</label>
              <div className="flex gap-2">
                {["mykid", "birth_certificate"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setForm({ ...form, documentType: t })}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                      form.documentType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t === "mykid" ? "MyKID" : "Birth Certificate"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Upload Document *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm({ ...form, documentFile: file.name });
                  }
                }}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Please upload a clear image or PDF of the child's ID.</p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="mt-1"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
            <p className="text-[11px] text-gray-500 leading-tight">
              I confirm that I am the parent or legal guardian of this child and I have permission to create this JuniorWallet account.
            </p>
          </label>

          <button
            type="submit"
            disabled={loading || !form.consent}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50 hover:bg-blue-700 transition-colors mt-2"
          >
            {loading ? "Adding Child..." : "Add Child"}
          </button>
        </form>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

