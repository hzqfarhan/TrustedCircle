import { NextRequest, NextResponse } from "next/server";
import { getChildProfile, isParentOfChild } from "@/lib/data/children";
import { createAuditLog } from "@/lib/data/audit-logs";
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

    const child = await getChildProfile(validated.recipientChildId);
    if (!child) return NextResponse.json({ allowed: true }); // Not a child account, let it pass

    if (child.status === "removed" || child.status === "suspended") {
      return NextResponse.json({ allowed: false, reason: "This child account is currently inactive and cannot receive funds." });
    }

    if (validated.transferType === "money_packet") {
      await createAuditLog(validated.senderId, "money_packet_blocked_for_child", "child_profile", child.id);
      return NextResponse.json({ allowed: false, reason: "JuniorWallet child accounts cannot receive money packets. Please use a parent-approved allowance transfer instead." });
    }

    const isLinked = await isParentOfChild(validated.senderId, validated.recipientChildId);

    if (!isLinked) {
      await createAuditLog(validated.senderId, "child_transfer_blocked", "child_profile", child.id);
      return NextResponse.json({ allowed: false, reason: "For safety, child accounts can only receive money from their linked parent or approved guardian." });
    }

    if (!ALLOWED_CHILD_TRANSFER_TYPES.includes(validated.transferType)) {
      await createAuditLog(validated.senderId, "child_transfer_blocked", "child_profile", child.id);
      return NextResponse.json({ allowed: false, reason: "Child accounts can only receive parent-approved transfers." });
    }

    await createAuditLog(validated.senderId, "child_transfer_validated", "child_profile", child.id);

    return NextResponse.json({ allowed: true });
  } catch (error: any) {
    return NextResponse.json({ allowed: false, reason: error.message }, { status: 400 });
  }
}
