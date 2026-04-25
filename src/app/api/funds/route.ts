import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json([], { status: 200 });

  const funds = await prisma.sharedFund.findMany({
    where: userId ? { members: { some: { userId } } } : {},
    include: {
      _count: { select: { members: true } },
      members: { include: { user: { select: { id: true, name: true, role: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(funds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, goalAmount, approvalRule, ownerId } = body;

  const fund = await prisma.sharedFund.create({
    data: {
      name,
      description,
      goalAmount: goalAmount ? parseFloat(goalAmount) : null,
      approvalRule: approvalRule || "2_OF_3",
      ownerId,
      members: {
        create: [{ userId: ownerId, role: "ADMIN" }],
      },
    },
  });

  return NextResponse.json(fund);
}

