"use client";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { CheckCircle2, XCircle } from "lucide-react";

const ROLES = ["PARENT", "CHILD"];

const PERMISSIONS = [
  "View shared fund",
  "Contribute",
  "Request withdrawal",
  "Approve withdrawal",
  "Monitor child",
  "Receive risk alerts",
  "Verify high-amount transfer",
  "Emergency-only access",
];

const ROLE_PERMS: Record<string, boolean[]> = {
  PARENT: [true, true, true, true, true, true, true, false],
  CHILD: [false, false, false, false, false, false, false, true],
};

const ROLE_LABELS: Record<string, string> = {
  PARENT: "Parent",
  CHILD: "Child",
};

export default function RolesPage() {
  return (
    <MobileShell>
      <WalletHeader showBack title="Roles & Permissions" />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          These permissions are pre-configured per role. Role assignment is managed by the account owner.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-0 border-b border-gray-100 bg-gray-50">
            <div className="col-span-2 p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide">Permission</div>
            {ROLES.map((r) => (
              <div key={r} className="p-2 text-center text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                {ROLE_LABELS[r]}
              </div>
            ))}
          </div>

          {/* Rows */}
          {PERMISSIONS.map((perm, i) => (
            <div key={perm} className={`grid grid-cols-4 gap-0 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
              <div className="col-span-2 p-3 text-[11px] text-gray-700 font-medium flex items-center">{perm}</div>
              {ROLES.map((role) => {
                const has = ROLE_PERMS[role]?.[i] ?? false;
                return (
                  <div key={role} className="p-2 flex items-center justify-center">
                    {has ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <XCircle size={14} className="text-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Roles Description */}
        <div className="mt-4 flex flex-col gap-2">
          {ROLES.map((role) => (
            <div key={role} className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {ROLE_LABELS[role][0]}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{ROLE_LABELS[role]}</p>
                <p className="text-[11px] text-gray-400">
                  {role === "PARENT" && "Full control over circle, child accounts, and approvals."}
                  {role === "CHILD" && "Restricted wallet. Monitored by parents."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

