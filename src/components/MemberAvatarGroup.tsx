"use client";
import { initials, ROLE_COLORS } from "@/lib/utils-tc";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export function MemberAvatarGroup({ members, max = 4 }: { members: Member[]; max?: number }) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((m) => (
        <div key={m.id} title={m.name} className="shrink-0">
          {m.avatar ? (
            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
          ) : (
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold",
                ROLE_COLORS[m.role] || "bg-gray-100 text-gray-600"
              )}
            >
              {initials(m.name)}
            </div>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
          +{overflow}
        </div>
      )}
    </div>
  );
}
