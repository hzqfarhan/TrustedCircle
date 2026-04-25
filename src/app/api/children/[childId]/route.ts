import { NextRequest, NextResponse } from "next/server";
import { GetChildProfile, UpdateChildProfile } from "@/lib/data/children";
import { CreateAuditLog } from "@/lib/data/audit-logs";
import { updateChildSchema } from "@/lib/validations/children";
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const child = await GetChildProfile(childId);
  if (!child || child.status === "removed") return NextResponse.json({ error: "Child not found" }, { status: 404 });
  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const body = await req.json();
    const validated = updateChildSchema.parse(body.data);
    const parentId = body.parentId;
    
    const child = await GetChildProfile(childId);
    if (!child || child.parentId !== parentId) return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });

    const oldNickname = child.nickname;
    
    await UpdateChildProfile(childId, {
      nickname: validated.nickname,
      email: validated.email,
      relationship: validated.relationship,
    });

    if (oldNickname !== validated.nickname) {
      await CreateAuditLog({
        id: `audit_${uuid()}`,
        actorId: parentId,
        action: "child_nickname_updated",
        entityType: "child_profile",
        entityId: childId,
        oldValue: { nickname: oldNickname },
        newValue: { nickname: validated.nickname },
        createdAt: new Date().toISOString(),
      });
    }

    const updated = await GetChildProfile(childId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const child = await GetChildProfile(childId);
  if (!child || child.parentId !== parentId) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  await UpdateChildProfile(childId, {
    status: "removed",
  });

  await CreateAuditLog({
    id: `audit_${uuid()}`,
    actorId: parentId,
    action: "child_removed",
    entityType: "child_profile",
    entityId: childId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

