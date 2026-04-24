import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { amount, description, requesterId } = await req.json();

  const fund = await prisma.sharedFund.findUnique({
    where: { id: params.id },
    include: { members: { include: { user: true } } },
  });

  if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

  // Create withdrawal request
  const withdrawal = await prisma.sharedFundWithdrawalRequest.create({
    data: {
      fundId: params.id,
      amount: parseFloat(amount),
      description,
      requesterId,
      status: "PENDING",
    },
  });

  // Create approval entries for all non-requester members
  const approvers = fund.members.filter((m) => m.userId !== requesterId);
  for (const member of approvers) {
    await prisma.approval.create({
      data: {
        requestId: withdrawal.id,
        approverId: member.userId,
        status: "PENDING",
      },
    });

    // Create alert for each approver
    await prisma.alert.create({
      data: {
        userId: member.userId,
        message: `Withdrawal request of RM ${amount} from "${fund.name}" is waiting for your approval.`,
        severity: "MEDIUM",
      },
    });
  }

  return NextResponse.json(withdrawal);
}
