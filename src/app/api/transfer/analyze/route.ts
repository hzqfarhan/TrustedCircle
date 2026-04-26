import { NextRequest, NextResponse } from "next/server";
import { getTransactionsByChild } from "@/lib/data/transactions";
import { assessRisk } from "@/lib/risk-engine";
export async function POST(req: NextRequest) {
  const { senderId, amount, recipientAccountId, recipientName } = await req.json();

  // Get sender's transaction history for average
  const senderTxs = await getTransactionsByChild(senderId, 20);

  const avg =
    senderTxs.length > 0
      ? senderTxs.reduce((acc, t) => acc + t.amount, 0) / senderTxs.length
      : 100;

  // CCID/PDRM fraud list checks are deferred to future Lambda integration.
  // Local fallback assumes recipient is not flagged.
  const isFlaggedRecipient = false;

  const isNewRecipient = !senderTxs.some(
    (t) => t.merchant?.includes(recipientName) || t.note?.includes(recipientAccountId)
  );

  const result = assessRisk({
    amount,
    userAvgAmount: avg,
    isNewRecipient,
    isFlaggedRecipient,
    transactionHour: new Date().getHours(),
    highThresholdAmount: 1000,
  });

  return NextResponse.json(result);
}
