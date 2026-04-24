import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assessRisk } from "@/lib/risk-engine";

export async function POST(req: NextRequest) {
  const { senderId, amount, recipientAccountId, recipientName } = await req.json();

  // Get sender's transaction history for average
  const senderTxs = await prisma.transaction.findMany({
    where: { senderId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const avg =
    senderTxs.length > 0
      ? senderTxs.reduce((acc, t) => acc + t.amount, 0) / senderTxs.length
      : 100;

  // Check if flagged
  const flagged = await prisma.flaggedRecipient.findUnique({
    where: { accountId: recipientAccountId },
  });

  const isNewRecipient = !senderTxs.some(
    (t) => t.note?.includes(recipientName) || t.note?.includes(recipientAccountId)
  );

  const result = assessRisk({
    amount,
    userAvgAmount: avg,
    isNewRecipient,
    isFlaggedRecipient: !!flagged,
    transactionHour: new Date().getHours(),
    highThresholdAmount: 1000,
  });

  return NextResponse.json(result);
}
