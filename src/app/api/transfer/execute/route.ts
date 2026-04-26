import { NextRequest, NextResponse } from "next/server";
import { executeTransfer } from "@/lib/data/transfers";
import { createAlert } from "@/lib/data/alerts";

export async function POST(req: NextRequest) {
  const {
    senderId,
    amount,
    recipientName,
    note,
    riskScore,
    riskSeverity,
    riskReasons,
    riskActions,
  } = await req.json();

  // executeTransfer handles wallet balance deduction + transaction creation
  // Risk score and severity are stored directly on the transaction item (DynamoDB is schemaless)
  const txId = await executeTransfer({
    childId: senderId,
    amount,
    recipientId: senderId, // For self-transfers / merchant payments, recipient = sender
    merchant: recipientName,
    category: "discretionary",
    riskScore,
    riskSeverity,
  });

  // If high risk, create alert
  if (riskSeverity === "HIGH" || riskSeverity === "MEDIUM") {
    await createAlert({
      id: crypto.randomUUID(),
      childId: senderId,
      parentId: senderId, // Will be resolved via child profile lookup if needed
      title: "Transfer Flagged",
      message: `Transfer of RM ${Number(amount).toFixed(2)} to ${recipientName} was flagged as ${riskSeverity}. Risk score: ${riskScore}`,
      severity: riskSeverity === "HIGH" ? "critical" : "warning",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, transactionId: txId });
}
