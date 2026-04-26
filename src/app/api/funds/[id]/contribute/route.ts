import { NextRequest, NextResponse } from "next/server";
import { contributeToFund } from "@/lib/data/funds";
import { getProfile, updateWalletBalance } from "@/lib/data/profiles";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { amount, userId } = await req.json();

  // Update fund balance and record contribution
  await contributeToFund(id, parseFloat(amount), userId);

  // Deduct from user wallet
  const profile = await getProfile(userId);
  if (profile) {
    const newBalance = (profile.walletBalance || 0) - parseFloat(amount);
    await updateWalletBalance(userId, newBalance);
  }

  return NextResponse.json({ ok: true });
}
