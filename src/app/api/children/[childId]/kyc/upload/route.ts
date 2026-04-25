import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { uploadChildKycSchema } from "@/lib/validations/kyc";

export async function POST(req: NextRequest, { params }: { params: { childId: string } }) {
  try {
    const body = await req.json();
    const validated = uploadChildKycSchema.parse(body.data);
    const parentId = body.parentId;

    const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.id === params.childId && c.parentId === parentId);
    if (!child) return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });

    const kycDocs = getMockTable("juniorwallet-child-kyc-documents");
    const docId = `kyc_${Date.now()}`;
    const now = new Date().toISOString();

    // Mock S3 upload
    const fakeS3Key = `kyc-documents/${parentId}/${params.childId}/${docId}_${validated.fileName}`;

    // Get the most recent doc if any, to carry over the masked number
    const existingDoc = kycDocs.filter((d: any) => d.childId === params.childId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    kycDocs.push({
      id: docId,
      childId: params.childId,
      parentId,
      documentType: existingDoc?.documentType || "mykid",
      documentNumberMasked: existingDoc?.documentNumberMasked || "******-**-xxxx",
      documentNumberHash: existingDoc?.documentNumberHash || "hash_xxxx",
      documentFileKey: fakeS3Key,
      status: "under_review",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    child.kycStatus = "kyc_under_review";
    child.updatedAt = now;

    const auditLogs = getMockTable("juniorwallet-audit-logs");
    auditLogs.push({
      id: `audit_${Date.now()}`,
      actorId: parentId,
      action: "child_kyc_uploaded",
      entityType: "child_kyc",
      entityId: docId,
      createdAt: now,
    });

    return NextResponse.json({ success: true, docId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
