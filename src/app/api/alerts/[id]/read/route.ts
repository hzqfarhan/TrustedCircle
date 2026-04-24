import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.alert.update({ where: { id: params.id }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
