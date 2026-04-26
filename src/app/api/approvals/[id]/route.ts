import { NextRequest, NextResponse } from "next/server";
import {
  getApprovalsByRequest,
  updateApprovalStatus,
} from "@/lib/data/approvals";
import { getSharedFund, updateSharedFund } from "@/lib/data/funds";
import { getProfile, updateWalletBalance } from "@/lib/data/profiles";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const { approverId, status } = await req.json();

  // Find and update the specific approval for this request + approver
  const approvals = await getApprovalsByRequest(requestId);
  const approval = approvals.find((a) => a.requesterId === approverId);

  if (approval) {
    await updateApprovalStatus(
      approval.id,
      status as "APPROVED" | "REJECTED",
      approverId
    );
  }

  // Re-fetch all approvals for this request to check auto-release
  const updatedApprovals = await getApprovalsByRequest(requestId);
  const fundApproval = updatedApprovals[0];
  if (!fundApproval) return NextResponse.json({ ok: true });

  const fund = await getSharedFund(fundApproval.fundId);
  if (!fund) return NextResponse.json({ ok: true });

  const withdrawalRequest = fund.withdrawalRequests?.find(
    (w) => w.id === requestId
  );
  if (!withdrawalRequest) return NextResponse.json({ ok: true });

  const approvedCount = updatedApprovals.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = updatedApprovals.filter((a) => a.status === "REJECTED").length;
  const totalApprovers = updatedApprovals.length;

  const rule = fund.approvalRule || "2_OF_3";
  const requiredCount =
    rule === "ALL"
      ? totalApprovers
      : rule === "2_OF_3"
      ? 2
      : 1;

  if (approvedCount >= requiredCount) {
    // Release funds — mark completed
    const updatedRequests = fund.withdrawalRequests.map((w) =>
      w.id === requestId ? { ...w, status: "COMPLETED" as const } : w
    );
    await updateSharedFund(fund.id, {
      withdrawalRequests: updatedRequests,
      balance: (fund.balance || 0) - withdrawalRequest.amount,
    });

    // Credit the requester wallet
    const requester = await getProfile(withdrawalRequest.requesterId);
    if (requester) {
      const newBalance = (requester.walletBalance || 0) + withdrawalRequest.amount;
      await updateWalletBalance(withdrawalRequest.requesterId, newBalance);
    }
  } else if (rejectedCount > totalApprovers - requiredCount) {
    const updatedRequests = fund.withdrawalRequests.map((w) =>
      w.id === requestId ? { ...w, status: "REJECTED" as const } : w
    );
    await updateSharedFund(fund.id, { withdrawalRequests: updatedRequests });
  }

  return NextResponse.json({ ok: true });
}
