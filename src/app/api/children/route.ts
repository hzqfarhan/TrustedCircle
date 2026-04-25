import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { hashDocumentNumber, maskDocumentNumber, getAgeGroup, calculateAge } from "@/lib/utils-kyc";
import { createChildSchema } from "@/lib/validations/children";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parentId = body.parentId; // From auth in real app
    if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const validated = createChildSchema.parse(body.data);

    const age = calculateAge(validated.dateOfBirth);
    if (age > 18) {
      return NextResponse.json({ error: "Child must be under 18" }, { status: 400 });
    }

    const childId = `child_${Date.now()}`;
    const now = new Date().toISOString();

    const childProfiles = getMockTable("juniorwallet-child-profiles");
    childProfiles.push({
      id: childId,
      userId: `user_${childId}`,
      parentId,
      fullName: validated.fullName,
      nickname: validated.nickname,
      email: validated.email,
      dateOfBirth: validated.dateOfBirth,
      ageGroup: getAgeGroup(age),
      relationship: validated.relationship,
      responsibilityScore: 100, // starting score
      currentBalance: 0,
      monthlyAllowance: 0,
      kycStatus: "kyc_pending",
      status: "pending_kyc",
      createdAt: now,
      updatedAt: now,
    });

    const links = getMockTable("juniorwallet-parent-child-links");
    links.push({
      id: `link_${Date.now()}`,
      parentId,
      childId,
      relationship: validated.relationship,
      createdAt: now,
    });

    const kycDocs = getMockTable("juniorwallet-child-kyc-documents");
    kycDocs.push({
      id: `kyc_${Date.now()}`,
      childId,
      parentId,
      documentType: validated.documentType,
      documentNumberMasked: maskDocumentNumber(validated.documentNumber),
      documentNumberHash: hashDocumentNumber(validated.documentNumber),
      documentFileKey: "pending_upload",
      status: "pending",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const auditLogs = getMockTable("juniorwallet-audit-logs");
    auditLogs.push({
      id: `audit_${Date.now()}`,
      actorId: parentId,
      action: "child_created",
      entityType: "child_profile",
      entityId: childId,
      newValue: { childId, nickname: validated.nickname, fullName: validated.fullName, kycStatus: "kyc_pending", documentNumberMasked: maskDocumentNumber(validated.documentNumber) },
      createdAt: now,
    });

    return NextResponse.json({ childId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = getMockTable("juniorwallet-child-profiles").filter(c => c.parentId === parentId && c.status !== "removed");
  return NextResponse.json(children);
}
