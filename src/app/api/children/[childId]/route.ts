import { NextRequest, NextResponse } from "next/server";
import { getMockTable } from "@/lib/aws/mock-data";
import { deepToCamel } from "@/lib/aws/dynamodb";
import { updateChildSchema } from "@/lib/validations/children";

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.ChildId === childId && c.Status !== "removed");
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });
  return NextResponse.json(deepToCamel(child));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const body = await req.json();
    const validated = updateChildSchema.parse(body.data);
    const parentId = body.parentId;
    
    const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.ChildId === childId && c.ParentId === parentId);
    if (!child) return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });

    const oldNickname = child.Nickname;
    child.Nickname = validated.nickname;
    child.Email = validated.email;
    child.Relationship = validated.relationship;
    child.UpdatedAt = new Date().toISOString();

    if (oldNickname !== validated.nickname) {
      const auditLogs = getMockTable("juniorwallet-audit-logs");
      auditLogs.push({
        Id: `audit_${Date.now()}`,
        ActorId: parentId,
        Action: "child_nickname_updated",
        EntityType: "child_profile",
        EntityId: childId,
        OldValue: { Nickname: oldNickname },
        NewValue: { Nickname: child.Nickname },
        CreatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(deepToCamel(child));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const child = getMockTable("juniorwallet-child-profiles").find((c: any) => c.ChildId === childId && c.ParentId === parentId);
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  child.Status = "removed";
  child.RemovedAt = new Date().toISOString();
  child.RemovedBy = parentId;

  const auditLogs = getMockTable("juniorwallet-audit-logs");
  auditLogs.push({
    Id: `audit_${Date.now()}`,
    ActorId: parentId,
    Action: "child_removed",
    EntityType: "child_profile",
    EntityId: childId,
    CreatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
