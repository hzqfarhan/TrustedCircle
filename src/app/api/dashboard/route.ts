import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [transactions, funds, alerts] = await Promise.all([
    prisma.transaction.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
    }),
    prisma.sharedFund.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.alert.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ transactions, funds, alerts });
}
