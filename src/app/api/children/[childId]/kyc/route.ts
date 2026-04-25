import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = getMockTable("juniorwallet-child-kyc-documents");
  // Get the most recent document for this child
  const childDocs = docs.filter((d: any) => d.childId === childId && d.parentId === parentId);
  if (childDocs.length === 0) return NextResponse.json({ error: "No KYC document found" }, { status: 404 });

  const latestDoc = childDocs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  const auditLogs = getMockTable("juniorwallet-audit-logs");
  auditLogs.push({
    id: `audit_${Date.now()}`,
    actorId: parentId,
    action: "child_kyc_viewed",
    entityType: "child_kyc",
    entityId: latestDoc.id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(latestDoc);
}
