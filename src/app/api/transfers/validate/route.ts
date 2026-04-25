import { NextRequest, NextResponse } from "next/server";
import { GetMockTable } from "@/lib/aws/mock-data";
import { validateChildTransferSchema } from "@/lib/validations/transfers";

const ALLOWED_CHILD_TRANSFER_TYPES = [
  "parent_allowance_transfer",
  "parent_topup",
  "approved_extra_allowance",
  "approved_school_request",
  "refund_from_approved_merchant"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateChildTransferSchema.parse(body);

    const child = GetMockTable("juniorwallet-child-profiles").find((c: any) => c.id === validated.recipientChildId);
    if (!child) return NextResponse.json({ allowed: true }); // Not a child account, let it pass

    if (child.status === "removed" || child.status === "suspended") {
      return NextResponse.json({ allowed: false, reason: "This child account is currently inactive and cannot receive funds." });
    }

    if (validated.transferType === "money_packet") {
      const auditLogs = GetMockTable("juniorwallet-audit-logs");
      auditLogs.push({ id: `audit_${Date.now()}`, actorId: validated.senderId, action: "money_packet_blocked_for_child", entityType: "child_profile", entityId: child.id, createdAt: new Date().toISOString() });
      return NextResponse.json({ allowed: false, reason: "JuniorWallet child accounts cannot receive money packets. Please use a parent-approved allowance transfer instead." });
    }

    const parentChildLinks = GetMockTable("juniorwallet-parent-child-links");
    const isLinkedParent = parentChildLinks.some((l: any) => l.parentId === validated.senderId && l.childId === validated.recipientChildId);

    if (!isLinkedParent) {
      const auditLogs = GetMockTable("juniorwallet-audit-logs");
      auditLogs.push({ id: `audit_${Date.now()}`, actorId: validated.senderId, action: "child_transfer_blocked", entityType: "child_profile", entityId: child.id, createdAt: new Date().toISOString() });
      return NextResponse.json({ allowed: false, reason: "For safety, child accounts can only receive money from their linked parent or approved guardian." });
    }

    if (!ALLOWED_CHILD_TRANSFER_TYPES.includes(validated.transferType)) {
      const auditLogs = GetMockTable("juniorwallet-audit-logs");
      auditLogs.push({ id: `audit_${Date.now()}`, actorId: validated.senderId, action: "child_transfer_blocked", entityType: "child_profile", entityId: child.id, createdAt: new Date().toISOString() });
      return NextResponse.json({ allowed: false, reason: "Child accounts can only receive parent-approved transfers." });
    }

    const auditLogs = GetMockTable("juniorwallet-audit-logs");
    auditLogs.push({ id: `audit_${Date.now()}`, actorId: validated.senderId, action: "child_transfer_validated", entityType: "child_profile", entityId: child.id, createdAt: new Date().toISOString() });

    return NextResponse.json({ allowed: true });
  } catch (error: any) {
    return NextResponse.json({ allowed: false, reason: error.message }, { status: 400 });
  }
}

