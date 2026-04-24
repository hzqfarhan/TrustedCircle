import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ ok: false });
  await prisma.alert.updateMany({ where: { userId }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
