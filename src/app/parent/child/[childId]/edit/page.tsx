"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditChildPage({ params }: { params: Promise<{ childId: string }> }) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resolvedParams = React.use(params);
  
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    relationship: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return router.push("/login");

    fetch(`/api/children/${resolvedParams.childId}?parentId=${currentUser.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) throw new Error("Not found");
        setChild(data);
        setForm({
          nickname: data.nickname || "",
          email: data.email || "",
          relationship: data.relationship || "father",
        });
      })
      .catch(() => {
        toast.error("Child account not found");
        router.push("/parent/dashboard");
      })
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, params.childId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    const res = await fetch(`/api/children/${resolvedParams.childId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: currentUser.id, data: form }),
    });

    if (res.ok) {
      toast.success("Profile updated!");
      router.push(`/parent/child/${resolvedParams.childId}/profile`);
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update");
    }
    setSaving(false);
  };

  if (loading || !child) return <MobileShell><LoadingState message="Loading..." /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Edit Profile" />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            
            {/* Editable Fields */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nickname</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
              <input
                type="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your Relationship</label>
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

          {/* Locked Fields Info */}
          <div className="bg-gray-100/50 rounded-2xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1.5"><Lock size={12} /> Locked by KYC</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400">Full Legal Name</p>
                <p className="text-xs font-semibold text-gray-500">{child.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Date of Birth</p>
                <p className="text-xs font-semibold text-gray-500">{child.dateOfBirth}</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-tight">These fields are locked for security once submitted. Contact support to reverify identity if changes are needed.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50 hover:bg-blue-700 mt-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
