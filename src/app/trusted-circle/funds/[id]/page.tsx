"use client";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { ApprovalTracker } from "@/components/ApprovalTracker";
import { MemberAvatarGroup } from "@/components/MemberAvatarGroup";
import { formatRM, formatDate, APPROVAL_RULE_LABELS } from "@/lib/utils-tc";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownLeft, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function FundDetailPage({ params }: { params: { id: string } }) {
  const { currentUser } = useAuth();
  const [fund, setFund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");

  const loadFund = () => {
    fetch(`/api/funds/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setFund(d); setLoading(false); });
  };

  useEffect(() => { loadFund(); }, [params.id]);

  const handleContribute = async () => {
    if (!amount || !currentUser) return;
    const res = await fetch(`/api/funds/${params.id}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), userId: currentUser.id }),
    });
    if (res.ok) {
      toast.success(`Contributed RM ${amount}`);
      setAmount("");
      setContributing(false);
      loadFund();
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <WalletHeader showBack title="Fund Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileShell>
    );
  }

  if (!fund) {
    return (
      <MobileShell>
        <WalletHeader showBack title="Fund Not Found" />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Fund not found.</div>
      </MobileShell>
    );
  }

  const progress = fund.goalAmount ? (fund.balance / fund.goalAmount) * 100 : null;
  const members = fund.members?.map((m: any) => ({ ...m.user, role: m.role })) ?? [];
  const pendingWithdrawals = fund.withdrawals?.filter((w: any) => w.status === "PENDING") ?? [];

  return (
    <MobileShell>
      <WalletHeader showBack title={fund.name} />
      <div className="flex-1 overflow-y-auto">
        {/* Balance Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #0068FF 0%, #0044CC 100%)" }}
        >
          <p className="text-blue-200 text-xs">{fund.description || "Shared Fund"}</p>
          <p className="text-white text-3xl font-black mt-1">{formatRM(fund.balance)}</p>
          {fund.goalAmount && (
            <>
              <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress!, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-blue-200 text-[10px]">{progress?.toFixed(0)}% of goal</p>
                <p className="text-blue-200 text-[10px]">Goal: {formatRM(fund.goalAmount)}</p>
              </div>
            </>
          )}
          <p className="text-blue-300 text-[11px] mt-2">
            Approval: {APPROVAL_RULE_LABELS[fund.approvalRule] || fund.approvalRule}
          </p>
        </motion.div>

        {/* Members */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Users size={15} className="text-blue-600" /> Members
            </p>
          </div>
          <MemberAvatarGroup members={members} />
          <div className="mt-2 flex flex-col gap-1.5">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{m.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contribute */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">Add Contribution</p>
          {contributing ? (
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="RM amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
              <button
                onClick={handleContribute}
                className="bg-blue-600 text-white text-sm font-semibold px-4 rounded-xl"
              >
                Add
              </button>
              <button
                onClick={() => setContributing(false)}
                className="text-gray-500 text-sm px-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setContributing(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-semibold py-2.5 rounded-xl text-sm"
            >
              <Plus size={16} /> Contribute
            </button>
          )}
        </div>

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <div className="mx-4 mt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pending Withdrawals</p>
            <div className="flex flex-col gap-2">
              {pendingWithdrawals.map((w: any) => (
                <div key={w.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-amber-900">{formatRM(w.amount)}</p>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      PENDING
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">{w.description || "Withdrawal requested"}</p>
                  <ApprovalTracker
                    rule={fund.approvalRule}
                    approvers={
                      w.approvals?.map((a: any) => ({
                        id: a.approver.id,
                        name: a.approver.name,
                        status: a.status,
                      })) ?? []
                    }
                  />
                  {/* Can current user approve? */}
                  {currentUser &&
                    w.approvals?.find((a: any) => a.approver.id === currentUser.id && a.status === "PENDING") && (
                      <div className="mt-3 flex gap-2">
                        <ApproveRejectButtons requestId={w.id} approverId={currentUser.id} onDone={loadFund} />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Withdrawal */}
        <div className="mx-4 mt-3 mb-4">
          <Link href={`/trusted-circle/funds/${params.id}/withdraw`}>
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors">
              <ArrowDownLeft size={16} className="text-red-500" />
              Request Withdrawal
            </button>
          </Link>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

function ApproveRejectButtons({
  requestId,
  approverId,
  onDone,
}: {
  requestId: string;
  approverId: string;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const act = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    await fetch(`/api/approvals/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approverId, status }),
    });
    toast.success(status === "APPROVED" ? "Approved!" : "Rejected");
    onDone();
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => act("APPROVED")}
        disabled={loading}
        className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act("REJECTED")}
        disabled={loading}
        className="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold py-2 rounded-xl disabled:opacity-50"
      >
        Reject
      </button>
    </>
  );
}
