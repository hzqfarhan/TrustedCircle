import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json([]);

  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(alerts);
}

