"use client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_COLORS, ROLE_LABELS, Initials } from "@/lib/utils-tc";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function RoleSwitcher() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-full transition-colors text-white"
      >
        {currentUser.avatarUrl ? (
          <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-5 h-5 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-white/80 text-blue-800">
            { Initials(currentUser.fullName)}
          </div>
        )}
        <span className="text-xs font-medium">{currentUser.fullName}</span>
        <ChevronDown size={12} className={ Cn("transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-3"
          >
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
              Logged in as
            </p>
            <div className="flex items-center gap-2">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700">
                  { Initials(currentUser.fullName)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{currentUser.fullName}</p>
                <p className="text-[11px] text-gray-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

