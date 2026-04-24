"use client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_COLORS, ROLE_LABELS, initials } from "@/lib/utils-tc";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function RoleSwitcher() {
  const { currentUser, users, setCurrentUserId } = useAuth();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-full transition-colors text-white"
      >
        {currentUser.avatar ? (
          <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover border border-white/20" />
        ) : (
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-white/80",
              "text-blue-800"
            )}
          >
            {initials(currentUser.name)}
          </div>
        )}
        <span className="text-xs font-medium">{currentUser.name}</span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Acting as
              </p>
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUserId(u.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left",
                  u.id === currentUser.id && "bg-blue-50"
                )}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"
                    )}
                  >
                    {initials(u.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[11px] text-gray-400">{ROLE_LABELS[u.role] || u.role}</p>
                </div>
                {u.id === currentUser.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
