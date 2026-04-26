import { NextRequest, NextResponse } from "next/server";
import { getChildProfile, updateChildProfile } from "@/lib/data/children";
import { getRulesByChild, createRule, updateRule } from "@/lib/data/rules";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [child, zoneRules] = await Promise.all([
    getChildProfile(id),
    getRulesByChild(id),
  ]);
  return NextResponse.json({ ...child, zoneRules });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { spendingLimit, limitType, activeZones } = await req.json();

  await updateChildProfile(id, { monthlyAllowance: spendingLimit });

  // Refresh zone rules: update existing, create missing, deactivate removed
  const existingRules = await getRulesByChild(id);
  const DEMO_ZONES = ["Home Area", "School Zone", "Nearby Mall", "Hospital Zone"];

  for (const zone of DEMO_ZONES) {
    const existing = existingRules.find((r) => r.category === zone);
    const isActive = activeZones.includes(zone);
    if (existing) {
      await updateRule(existing.id, { isActive });
    } else {
      await createRule({
        id: crypto.randomUUID(),
        childId: id,
        category: zone,
        limitType: "daily",
        amount: 0,
        isActive,
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Deactivate any rules not in DEMO_ZONES
  for (const rule of existingRules) {
    if (!DEMO_ZONES.includes(rule.category)) {
      await updateRule(rule.id, { isActive: false });
    }
  }

  return NextResponse.json({ ok: true });
}
