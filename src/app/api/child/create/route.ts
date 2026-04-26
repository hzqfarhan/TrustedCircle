import { NextRequest, NextResponse } from "next/server";
import { getChildProfileByUserId, createChildProfile, createParentChildLink } from "@/lib/data/children";
import { createRule } from "@/lib/data/rules";

export async function POST(req: NextRequest) {
  const { parentId, childId, spendingLimit, limitType } = await req.json();

  // Check if already linked
  const existing = await getChildProfileByUserId(childId);
  if (existing) {
    return NextResponse.json({ error: "This child account is already linked." }, { status: 400 });
  }

  const now = new Date().toISOString();

  const child = {
    id: childId,
    userId: childId,
    parentId,
    fullName: "", // Will be populated from Profile
    ageGroup: "teen",
    responsibilityScore: 50,
    currentBalance: parseFloat(spendingLimit) || 0,
    monthlyAllowance: parseFloat(spendingLimit) || 0,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  };

  await createChildProfile(child);

  await createParentChildLink({
    id: crypto.randomUUID(),
    parentId,
    childId,
    relationship: "parent-child",
    createdAt: now,
  });

  // Create default zone rules
  const defaultZones = [
    { name: "Home Area", isActive: true },
    { name: "School Zone", isActive: true },
  ];
  for (const zone of defaultZones) {
    await createRule({
      id: crypto.randomUUID(),
      childId,
      category: zone.name,
      limitType: "daily",
      amount: 0,
      isActive: zone.isActive,
      createdBy: parentId,
      createdAt: now,
      updatedAt: now,
    });
  }

  return NextResponse.json(child);
}
