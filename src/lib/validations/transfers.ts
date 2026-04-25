import { z } from "zod";

export const validateChildTransferSchema = z.object({
  senderId: z.string(),
  recipientChildId: z.string(),
  transferType: z.enum([
    "parent_allowance_transfer",
    "parent_topup",
    "approved_extra_allowance",
    "approved_school_request",
    "refund_from_approved_merchant",
    "money_packet",
    "open_transfer",
    "peer_to_peer",
    "campaign_payout_without_parent_approval",
    "unlinked_sender_transfer",
    "child_to_child_transfer"
  ]),
});
