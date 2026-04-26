import { NextRequest, NextResponse } from "next/server";
import { getChildProfile } from "@/lib/data/children";
import { createTransaction } from "@/lib/data/transactions";
import { createAlert } from "@/lib/data/alerts";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { childAccountId } = body;

  const child = await getChildProfile(childAccountId);

  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();

  // Create a blocked transaction
  await createTransaction({
    id: crypto.randomUUID(),
    childId: child.id,
    amount: 25.0,
    merchant: "Kedai Runcit (Outside Zone)",
    category: "risky",
    classification: "risky",
    needWant: "want",
    transactionType: "spend",
    riskFlag: true,
    note: "Blocked — outside allowed zone",
    createdAt: now,
  });

  // Notify parent
  await createAlert({
    id: crypto.randomUUID(),
    childId: child.id,
    parentId: child.parentId,
    title: "Zone Violation",
    message:
      "⚠️ Zone Violation: Your child attempted a transaction at 'Kedai Runcit' — outside allowed zones. Transaction was blocked.",
    severity: "critical",
    read: false,
    createdAt: now,
  });

  return NextResponse.json({ ok: true });
}
