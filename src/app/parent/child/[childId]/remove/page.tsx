"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

export default function RemoveChildPage({ params }: { params: Promise<{ childId: string }> }) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const resolvedParams = React.use(params);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return router.push("/login");

    fetch(`/api/children/${resolvedParams.childId}?parentId=${currentUser.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) throw new Error("Not found");
        setChild(data);
      })
      .catch(() => {
        toast.error("Child account not found");
        router.push("/parent/dashboard");
      })
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, resolvedParams.childId, router]);

  const handleRemove = async () => {
    if (!currentUser) return;
    if (confirmText.toLowerCase() !== "remove") {
      return toast.error("Please type 'remove' to confirm.");
    }

    setRemoving(true);

    const res = await fetch(`/api/children/${resolvedParams.childId}?parentId=${currentUser.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Child account removed");
      router.push("/parent/dashboard");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to remove");
    }
    setRemoving(false);
  };

  if (loading || !child) return <MobileShell><LoadingState message="Loading..." /></MobileShell>;

  return (
    <MobileShell>
      <WalletHeader showBack title="Remove Account" />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col items-center pt-8">
        
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 size={36} className="text-red-600" />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2">Remove Child Account</h2>
        <p className="text-sm text-gray-600 text-center mb-8 max-w-[280px]">
          Are you sure you want to remove <span className="font-bold text-gray-900">{child.nickname || child.fullName}</span>?
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 w-full mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              This will remove the child from your JuniorWallet family view, and block all future transfers to their account. 
              <br/><br/>
              <strong>Their transaction and audit history will be safely preserved.</strong>
            </p>
          </div>

          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Type <span className="text-red-600 font-bold">remove</span> to confirm:
          </label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-center"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="remove"
          />
        </div>

        <button
          onClick={handleRemove}
          disabled={removing || confirmText.toLowerCase() !== "remove"}
          className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50 hover:bg-red-700 transition-colors"
        >
          {removing ? "Removing..." : "Remove Account"}
        </button>
        
        <button
          onClick={() => router.back()}
          className="w-full mt-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl active:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

      </div>
    </MobileShell>
  );
}
