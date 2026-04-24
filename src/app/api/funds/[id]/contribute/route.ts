import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { amount, userId } = await req.json();

  // Update fund balance
  await prisma.sharedFund.update({
    where: { id: params.id },
    data: { balance: { increment: parseFloat(amount) } },
  });

  // Record contribution
  await prisma.sharedFundContribution.create({
    data: { fundId: params.id, amount: parseFloat(amount) },
  });

  // Deduct from user wallet
  await prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: parseFloat(amount) } },
  });

  return NextResponse.json({ ok: true });
}
