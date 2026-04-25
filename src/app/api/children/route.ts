import { NextRequest, NextResponse } from "next/server";
import { GetChildrenByParent, CreateChildProfile, CreateParentChildLink } from "@/lib/data/children";
import { CreateAuditLog } from "@/lib/data/audit-logs";
import { PutItem, Tables } from "@/lib/aws/dynamodb";
import { HashDocumentNumber, MaskDocumentNumber, GetAgeGroup, CalculateAge } from "@/lib/utils-kyc";
import { createChildSchema } from "@/lib/validations/children";
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parentId = body.parentId; // From auth in real app
    if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const validated = createChildSchema.parse(body.data);

    const age = CalculateAge(validated.dateOfBirth);
    if (age > 18) {
      return NextResponse.json({ error: "Child must be under 18" }, { status: 400 });
    }

    const childId = `child_${uuid()}`;
    const now = new Date().toISOString();

    await CreateChildProfile({
      id: childId,
      userId: `user_${childId}`,
      parentId,
      fullName: validated.fullName,
      nickname: validated.nickname,
      email: validated.email,
      dateOfBirth: validated.dateOfBirth,
      ageGroup: GetAgeGroup(age),

      relationship: validated.relationship,
      responsibilityScore: 100, // starting score
      currentBalance: 0,
      monthlyAllowance: 0,
      kycStatus: "kyc_pending",
      status: "pending_kyc",
      createdAt: now,
      updatedAt: now,
    });

    await CreateParentChildLink({
      id: `link_${uuid()}`,
      parentId,
      childId,
      relationship: validated.relationship,
      createdAt: now,
    });

    await PutItem(Tables.kycDocuments, {
      id: `kyc_${uuid()}`,
      childId,
      parentId,
      documentType: validated.documentType,
      documentNumberMasked: "FILE_UPLOADED",
      documentNumberHash: "FILE_HASH_" + uuid(),
      documentFileKey: validated.documentFile,
      status: "pending",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await CreateAuditLog({
      id: `audit_${uuid()}`,
      actorId: parentId,
      action: "child_created",
      entityType: "child_profile",
      entityId: childId,
      newValue: { childId, nickname: validated.nickname, fullName: validated.fullName, kycStatus: "kyc_pending", documentFile: validated.documentFile },
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

  const children = await GetChildrenByParent(parentId);
  return NextResponse.json(children.filter(c => c.status !== "removed"));
}

