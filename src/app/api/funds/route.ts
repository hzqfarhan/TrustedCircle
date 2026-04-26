import { NextRequest, NextResponse } from "next/server";
import {
  getSharedFundsByUser,
  createSharedFund,
  addFundMember,
  getSharedFund,
} from "@/lib/data/funds";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json([], { status: 200 });

  const funds = await getSharedFundsByUser(userId);
  return NextResponse.json(funds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, goalAmount, approvalRule, ownerId } = body;

  const fundId = await createSharedFund({
    name,
    description,
    goalAmount: goalAmount ? parseFloat(goalAmount) : undefined,
    approvalRule: approvalRule || "2_OF_3",
    ownerId,
  });

  await addFundMember(fundId, { userId: ownerId, role: "ADMIN" });

  const fund = await getSharedFund(fundId);
  return NextResponse.json(fund);
}
