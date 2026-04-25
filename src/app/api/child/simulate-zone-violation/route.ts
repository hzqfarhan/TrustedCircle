import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { childAccountId } = await req.json();

  const child = await prisma.childAccount.findUnique({
    where: { id: childAccountId },
    include: { parent: true },
  });

  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create a blocked transaction
  await prisma.transaction.create({
    data: {
      amount: 25.0,
      note: "Kedai Runcit (Outside Zone)",
      status: "BLOCKED",
      senderId: child.childId,
      category: "MERCHANT",
    },
  });

  // Notify parent
  await prisma.alert.create({
    data: {
      userId: child.parentId,
      message:
        "⚠️ Zone Violation: Your child attempted a transaction at 'Kedai Runcit' — outside allowed zones. Transaction was blocked.",
      severity: "HIGH",
    },
  });

  return NextResponse.json({ ok: true });
}

