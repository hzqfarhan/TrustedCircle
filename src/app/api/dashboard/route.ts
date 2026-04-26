import { NextRequest, NextResponse } from "next/server";
import { getTransactionsByChild } from "@/lib/data/transactions";
import { getSharedFundsByUser } from "@/lib/data/funds";
import {
  getUnreadAlertsByParent,
  getUnreadAlertsByChild,
} from "@/lib/data/alerts";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [transactions, funds, parentAlerts, childAlerts] = await Promise.all([
    getTransactionsByChild(userId, 10),
    getSharedFundsByUser(userId),
    getUnreadAlertsByParent(userId),
    getUnreadAlertsByChild(userId),
  ]);

  // Merge and deduplicate alerts from both parent and child indexes
  const alertMap = new Map<string, (typeof parentAlerts)[0]>();
  for (const alert of parentAlerts) alertMap.set(alert.id, alert);
  for (const alert of childAlerts) alertMap.set(alert.id, alert);
  const alerts = Array.from(alertMap.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return NextResponse.json({ transactions, funds, alerts });
}
