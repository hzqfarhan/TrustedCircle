import { NextRequest, NextResponse } from "next/server";
import { getAlertsByParent, markAlertRead } from "@/lib/data/alerts";

export async function PATCH(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ ok: false });
  const alerts = await getAlertsByParent(userId);
  const unread = alerts.filter(a => !a.read);
  await Promise.all(unread.map(a => markAlertRead(a.id)));
  return NextResponse.json({ ok: true });
}
