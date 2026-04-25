"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { LoadingState } from "@/components/LoadingState";
import { FormatRM } from "@/lib/utils-tc";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Pencil, ShieldCheck, ShieldAlert, FileText, Trash2, User } from "lucide-react";

export default function ChildProfilePage({ params }: { params: Promise<{ childId: string }> }) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  }, [currentUser, authLoading, params.childId, router]);

  if (loading || !child) return <MobileShell><LoadingState message="Loading profile..." /></MobileShell>;

  const age = child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / 31557600000) : '?';

  return (
    <MobileShell>
      <WalletHeader showBack title="Child Profile" />
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-3">
            {child.nickname?.[0]?.toUpperCase() || child.fullName[0]}
          </div>
          <h2 className="text-xl font-black text-gray-900">{child.nickname || child.fullName}</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">{child.fullName}</p>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            {child.kycStatus === 'kyc_pending' || child.kycStatus === 'kyc_under_review' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                <ShieldAlert size={12} /> KYC Pending Review
              </span>
            ) : child.kycStatus === 'verified' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <ShieldCheck size={12} /> KYC Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                <FileText size={12} /> {child.kycStatus}
              </span>
            )}
          </div>
        </div>

        {/* Details List */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Birthday</p>
            <p className="text-sm font-bold text-gray-900">{child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Age</p>
            <p className="text-sm font-bold text-gray-900">{age} years ({child.ageGroup})</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Email Address</p>
            <p className="text-sm font-bold text-gray-900">{child.email || 'N/A'}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Current Balance</p>
            <p className="text-sm font-bold text-blue-600">{ FormatRM(child.currentBalance)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Responsibility Score</p>
            <p className="text-sm font-bold text-emerald-600">{child.responsibilityScore}/100</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link href={`/parent/child/${child.id}/edit`}>
            <button className="w-full bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between active:bg-gray-50">
              <div className="flex items-center gap-3">
                <Pencil size={18} className="text-blue-500" />
                <span className="text-sm font-bold text-gray-800">Edit Details</span>
              </div>
            </button>
          </Link>
          
          <Link href={`/parent/child/${child.id}/kyc`}>
            <button className="w-full bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between active:bg-gray-50">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-blue-500" />
                <span className="text-sm font-bold text-gray-800">KYC Details & Upload</span>
              </div>
            </button>
          </Link>

          <Link href={`/parent/child/${child.id}/remove`}>
            <button className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between active:bg-red-100 mt-4">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-500" />
                <span className="text-sm font-bold text-red-700">Remove Child Account</span>
              </div>
            </button>
          </Link>
        </div>

      </div>
      <BottomNav />
    </MobileShell>
  );
}
