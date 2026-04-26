import { NextRequest, NextResponse } from "next/server";
import { getChildrenByParent, getChildProfileByUserId } from "@/lib/data/children";
import { getTransactionsByChild } from "@/lib/data/transactions";
import { getUnreadAlertsByParent } from "@/lib/data/alerts";
import { getRulesByChild } from "@/lib/data/rules";
import { getProfile } from "@/lib/data/profiles";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role");

  if (!userId) return NextResponse.json({});

  if (role === "PARENT") {
    const children = await getChildrenByParent(userId);
    const child = children[0] ?? null;

    if (!child) return NextResponse.json({ childAccount: null });

    const [recentTransactions, alerts, rules, childUser] = await Promise.all([
      getTransactionsByChild(child.id, 10),
      getUnreadAlertsByParent(userId),
      getRulesByChild(child.id),
      getProfile(child.userId),
    ]);

    return NextResponse.json({
      childAccount: { ...child, zoneRules: rules },
      childUser,
      wallet: childUser ? { userId: childUser.id, balance: childUser.walletBalance ?? 0 } : null,
      recentTransactions,
      alerts,
    });
  }

  if (role === "CHILD") {
    const child = await getChildProfileByUserId(userId);
    const [recentTransactions, rules, profile] = await Promise.all([
      getTransactionsByChild(userId, 10),
      child ? getRulesByChild(child.id) : Promise.resolve([]),
      getProfile(userId),
    ]);

    return NextResponse.json({
      childAccount: child ? { ...child, zoneRules: rules } : null,
      recentTransactions,
      wallet: profile ? { userId: profile.id, balance: profile.walletBalance ?? 0 } : null,
      alerts: [],
    });
  }

  return NextResponse.json({});
}
