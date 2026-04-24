"use client";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Approver {
  id: string;
  name: string;
  status: string; // PENDING | APPROVED | REJECTED
}

export function ApprovalTracker({ approvers, rule }: { approvers: Approver[]; rule: string }) {
  const approved = approvers.filter((a) => a.status === "APPROVED").length;
  const rejected = approvers.filter((a) => a.status === "REJECTED").length;
  const total = approvers.length;

  const requiredCount =
    rule === "ALL"
      ? total
      : rule === "2_OF_3"
      ? 2
      : rule === "PARENT_ONLY"
      ? 1
      : 1;

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Approval Progress
        </p>
        <span className="text-xs text-gray-500">
          {approved}/{requiredCount} required
        </span>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: requiredCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < approved ? "bg-emerald-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {approvers.map((a) => {
          const Icon =
            a.status === "APPROVED"
              ? CheckCircle2
              : a.status === "REJECTED"
              ? XCircle
              : Clock;
          const color =
            a.status === "APPROVED"
              ? "text-emerald-600"
              : a.status === "REJECTED"
              ? "text-red-500"
              : "text-amber-500";

          return (
            <div key={a.id} className="flex items-center gap-2">
              <Icon size={15} className={color} />
              <span className="text-sm text-gray-700">{a.name}</span>
              <span
                className={cn(
                  "ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full",
                  a.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700"
                    : a.status === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {a.status}
              </span>
            </div>
          );
        })}
      </div>

      {rejected > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
          <p className="text-xs text-red-700 font-medium">
            Withdrawal rejected by {rejected} member{rejected > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
