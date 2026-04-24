import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role");

  if (!userId) return NextResponse.json({});

  if (role === "PARENT") {
    const child = await prisma.childAccount.findFirst({
      where: { parentId: userId },
      include: {
        zoneRules: true,
        child: { include: { wallet: true } },
      },
    });

    if (!child) return NextResponse.json({ childAccount: null });

    const [recentTransactions, alerts] = await Promise.all([
      prisma.transaction.findMany({
        where: { senderId: child.childId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.alert.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      childAccount: { ...child, child: undefined },
      childUser: child.child,
      wallet: child.child.wallet,
      recentTransactions,
      alerts,
    });
  }

  if (role === "CHILD") {
    const child = await prisma.childAccount.findUnique({
      where: { childId: userId },
      include: { zoneRules: true },
    });
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    const recentTransactions = await prisma.transaction.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ childAccount: child, recentTransactions, wallet, alerts: [] });
  }

  return NextResponse.json({});
}
