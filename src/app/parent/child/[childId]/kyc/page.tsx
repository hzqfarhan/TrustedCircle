"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck, Upload, FileText } from "lucide-react";

export default function ChildKycPage({ params }: { params: { childId: string } }) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [kycDoc, setKycDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return router.push("/login");

    fetch(`/api/children/${params.childId}/kyc?parentId=${currentUser.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) throw new Error("Not found");
        setKycDoc(data);
      })
      .catch(() => {
        toast.error("KYC Details not found");
        router.push(`/parent/child/${params.childId}/profile`);
      })
      .finally(() => setLoading(false));
  }, [currentUser, authLoading, params.childId, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !fileName) return;
    setUploading(true);

    // Mock upload payload
    const payload = {
      fileBase64: "dummy_base64_data",
      mimeType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      fileName: fileName,
      size: 1024 * 500, // 500kb
    };

    const res = await fetch(`/api/children/${params.childId}/kyc/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: currentUser.id, data: payload }),
    });

    if (res.ok) {
      toast.success("Document uploaded successfully. Under review.");
      router.push(`/parent/child/${params.childId}/profile`);
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to upload document");
    }
    setUploading(false);
  };

  if (loading || !kycDoc) return <MobileShell><LoadingState message="Loading KYC data..." /></MobileShell>;

  const needsUpload = kycDoc.status === "rejected" || kycDoc.status === "needs_resubmission" || kycDoc.status === "pending";

  return (
    <MobileShell>
      <WalletHeader showBack title="KYC Verification" />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

        {kycDoc.status === "pending" || kycDoc.status === "under_review" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex gap-3">
            <ShieldAlert size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">Verification in progress</p>
              <p className="text-xs text-amber-700 mt-1">
                Your child’s account is being reviewed. Some wallet features may be limited until verification is complete.
              </p>
            </div>
          </div>
        ) : kycDoc.status === "rejected" || kycDoc.status === "needs_resubmission" ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex gap-3">
            <ShieldAlert size={20} className="text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900">Document needs resubmission</p>
              <p className="text-xs text-red-700 mt-1">
                We couldn’t verify the uploaded document. Please upload a clearer image or choose another accepted document.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex gap-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Identity Verified</p>
              <p className="text-xs text-emerald-700 mt-1">
                Your child’s account is fully verified and protected.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Current Record</h3>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Document Type</p>
            <p className="text-sm font-bold text-gray-900 uppercase">{kycDoc.documentType}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Document Number</p>
            <p className="text-sm font-bold text-gray-900 font-mono tracking-wider">{kycDoc.documentNumberMasked}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Submitted</p>
            <p className="text-sm font-bold text-gray-900">
              {new Date(kycDoc.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Status</p>
            <p className="text-sm font-bold text-gray-900 uppercase">{kycDoc.status.replace("_", " ")}</p>
          </div>
        </div>

        {needsUpload && (
          <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Upload New Document</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden mb-4">
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
                  <p className="text-[10px] text-gray-400 mt-1">JPG, PNG or PDF (Max 10MB)</p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !fileName}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50 hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Submit Document"}
            </button>
          </form>
        )}

      </div>
      <BottomNav />
    </MobileShell>
  );
}
