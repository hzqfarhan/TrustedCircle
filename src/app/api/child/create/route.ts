import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { parentId, childId, spendingLimit, limitType } = await req.json();

  // Check if already linked
  const existing = await prisma.childAccount.findUnique({ where: { childId } });
  if (existing) {
    return NextResponse.json({ error: "This child account is already linked." }, { status: 400 });
  }

  const child = await prisma.childAccount.create({
    data: {
      parentId,
      childId,
      spendingLimit: parseFloat(spendingLimit),
      limitType,
      zoneRules: {
        create: [
          { name: "Home Area", isActive: true },
          { name: "School Zone", isActive: true },
        ],
      },
    },
  });

  return NextResponse.json(child);
}

