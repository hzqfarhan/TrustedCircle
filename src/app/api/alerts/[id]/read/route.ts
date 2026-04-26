import { NextRequest, NextResponse } from "next/server";
import { markAlertRead } from "@/lib/data/alerts";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await markAlertRead(id);
  return NextResponse.json({ ok: true });
}
