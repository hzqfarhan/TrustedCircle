import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const child = await prisma.childAccount.findUnique({
    where: { id: params.id },
    include: { zoneRules: true },
  });
  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { spendingLimit, limitType, activeZones } = await req.json();

  await prisma.childAccount.update({
    where: { id: params.id },
    data: { spendingLimit, limitType },
  });

  // Refresh zone rules
  await prisma.zoneRule.deleteMany({ where: { childAccountId: params.id } });
  const DEMO_ZONES = ["Home Area", "School Zone", "Nearby Mall", "Hospital Zone"];
  for (const z of DEMO_ZONES) {
    await prisma.zoneRule.create({
      data: {
        childAccountId: params.id,
        name: z,
        isActive: activeZones.includes(z),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
