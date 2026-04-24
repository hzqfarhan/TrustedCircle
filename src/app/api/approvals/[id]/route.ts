import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { approverId, status } = await req.json();

  // Update approval
  await prisma.approval.updateMany({
    where: { requestId: params.id, approverId },
    data: { status },
  });

  // Check if withdrawal can be auto-released
  const withdrawal = await prisma.sharedFundWithdrawalRequest.findUnique({
    where: { id: params.id },
    include: {
      fund: true,
      approvals: true,
    },
  });

  if (!withdrawal) return NextResponse.json({ ok: true });

  const approvedCount = withdrawal.approvals.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = withdrawal.approvals.filter((a) => a.status === "REJECTED").length;
  const totalApprovers = withdrawal.approvals.length;

  const rule = withdrawal.fund.approvalRule;
  const requiredCount =
    rule === "ALL"
      ? totalApprovers
      : rule === "2_OF_3"
      ? 2
      : 1;

  if (approvedCount >= requiredCount) {
    // Release funds — mark completed
    await prisma.sharedFundWithdrawalRequest.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
    });
    await prisma.sharedFund.update({
      where: { id: withdrawal.fundId },
      data: { balance: { decrement: withdrawal.amount } },
    });
    // Credit the requester wallet
    await prisma.wallet.updateMany({
      where: { userId: withdrawal.requesterId },
      data: { balance: { increment: withdrawal.amount } },
    });
  } else if (rejectedCount > totalApprovers - requiredCount) {
    await prisma.sharedFundWithdrawalRequest.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    });
  }

  return NextResponse.json({ ok: true });
}
