import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { deepToCamel } from "@/lib/aws/dynamodb";
import { uploadChildKycSchema } from "@/lib/validations/kyc";

export async function POST(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const body = await req.json();
    const validated = uploadChildKycSchema.parse(body.data);
    const parentId = body.parentId;

    const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.ChildId === childId && c.ParentId === parentId);
    if (!child) return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });

    const kycDocs = getMockTable("juniorwallet-child-kyc-documents");
    const docId = `kyc_${Date.now()}`;
    const now = new Date().toISOString();

    // Mock S3 upload
    const fakeS3Key = `kyc-documents/${parentId}/${childId}/${docId}_${validated.fileName}`;

    // Get the most recent doc if any, to carry over the masked number
    const existingDoc = kycDocs.filter((d: any) => d.ChildId === childId).sort((a: any, b: any) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())[0];

    kycDocs.push({
      KycDocumentId: docId,
      ChildId: childId,
      ParentId: parentId,
      DocumentType: existingDoc?.DocumentType || "mykid",
      DocumentNumberMasked: existingDoc?.DocumentNumberMasked || "******-**-xxxx",
      DocumentNumberHash: existingDoc?.DocumentNumberHash || "hash_xxxx",
      DocumentFileKey: fakeS3Key,
      Status: "under_review",
      SubmittedAt: now,
      CreatedAt: now,
      UpdatedAt: now,
    });

    child.KycStatus = "kyc_under_review";
    child.UpdatedAt = now;

    const auditLogs = getMockTable("juniorwallet-audit-logs");
    auditLogs.push({
      Id: `audit_${Date.now()}`,
      ActorId: parentId,
      Action: "child_kyc_uploaded",
      EntityType: "child_kyc",
      EntityId: docId,
      CreatedAt: now,
    });

    return NextResponse.json({ success: true, docId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
