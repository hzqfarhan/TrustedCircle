import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { deepToCamel } from "@/lib/aws/dynamodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = getMockTable("juniorwallet-child-kyc-documents");
  // Get the most recent document for this child
  const childDocs = docs.filter((d: any) => d.ChildId === childId && d.ParentId === parentId);
  if (childDocs.length === 0) return NextResponse.json({ error: "No KYC document found" }, { status: 404 });

  const latestDoc = childDocs.sort((a: any, b: any) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())[0];

  const auditLogs = getMockTable("juniorwallet-audit-logs");
  auditLogs.push({
    Id: `audit_${Date.now()}`,
    ActorId: parentId,
    Action: "child_kyc_viewed",
    EntityType: "child_kyc",
    EntityId: latestDoc.KycDocumentId,
    CreatedAt: new Date().toISOString(),
  });

  return NextResponse.json(deepToCamel(latestDoc));
}
