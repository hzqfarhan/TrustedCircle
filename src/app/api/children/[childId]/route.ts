import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { updateChildSchema } from "@/lib/validations/children";

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.id === childId && c.status !== "removed");
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });
  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const body = await req.json();
    const validated = updateChildSchema.parse(body.data);
    const parentId = body.parentId;
    
    const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.id === childId && c.parentId === parentId);
    if (!child) return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });

    const oldNickname = child.nickname;
    child.nickname = validated.nickname;
    child.email = validated.email;
    child.relationship = validated.relationship;
    child.updatedAt = new Date().toISOString();

    if (oldNickname !== validated.nickname) {
      const auditLogs = getMockTable("juniorwallet-audit-logs");
      auditLogs.push({
        id: `audit_${Date.now()}`,
        actorId: parentId,
        action: "child_nickname_updated",
        entityType: "child_profile",
        entityId: childId,
        oldValue: { nickname: oldNickname },
        newValue: { nickname: child.nickname },
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(child);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.id === childId && c.parentId === parentId);
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  child.status = "removed";
  child.removedAt = new Date().toISOString();
  child.removedBy = parentId;

  const auditLogs = getMockTable("juniorwallet-audit-logs");
  auditLogs.push({
    id: `audit_${Date.now()}`,
    actorId: parentId,
    action: "child_removed",
    entityType: "child_profile",
    entityId: childId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
