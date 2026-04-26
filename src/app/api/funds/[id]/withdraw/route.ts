import { NextRequest, NextResponse } from "next/server";
import { getSharedFund, requestWithdrawal } from "@/lib/data/funds";
import { createApproval } from "@/lib/data/approvals";
import { createAlert } from "@/lib/data/alerts";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { amount, description, requesterId } = await req.json();

  const fund = await getSharedFund(id);

  if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

  // Create withdrawal request
  const requestId = await requestWithdrawal(
    id,
    requesterId,
    parseFloat(amount),
    description
  );

  // Create approval entries for all non-requester members
  const approvers = (fund.members || []).filter((m) => m.userId !== requesterId);
  for (const member of approvers) {
    await createApproval({
      fundId: id,
      requestId,
      requesterId: member.userId,
      type: "WITHDRAWAL",
    });

    // Create alert for each approver
    await createAlert({
      id: crypto.randomUUID(),
      childId: member.userId,
      parentId: member.userId,
      title: "Withdrawal Approval Request",
      message: `Withdrawal request of RM ${amount} from "${fund.name}" is waiting for your approval.`,
      severity: "warning",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    id: requestId,
    fundId: id,
    amount: parseFloat(amount),
    description,
    requesterId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });
}
