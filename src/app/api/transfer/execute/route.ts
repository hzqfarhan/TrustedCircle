import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  // Deduct from sender wallet
  await prisma.wallet.updateMany({
    where: { userId: senderId },
    data: { balance: { decrement: amount } },
  });

  const tx = await prisma.transaction.create({
    data: {
      amount,
      note: note || `Transfer to ${recipientName}`,
      status: "COMPLETED",
      senderId,
      category: "TRANSFER",
    },
  });

  if (riskScore !== undefined) {
    await prisma.riskAssessment.create({
      data: {
        transactionId: tx.id,
        score: riskScore,
        severity: riskSeverity,
        reasons: JSON.stringify(riskReasons),
        actions: JSON.stringify(riskActions),
      },
    });
  }

  // If high risk, create alert
  if (riskSeverity === "HIGH" || riskSeverity === "MEDIUM") {
    await prisma.alert.create({
      data: {
        userId: senderId,
        message: `Transfer of RM ${amount.toFixed(2)} to ${recipientName} was flagged as ${riskSeverity}. Risk score: ${riskScore}`,
        severity: riskSeverity,
      },
    });
  }

  return NextResponse.json({ ok: true, transactionId: tx.id });
}
