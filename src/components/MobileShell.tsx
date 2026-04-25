"use client";
import { motion } from "framer-motion";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 sm:static sm:min-h-screen bg-gray-100 flex sm:items-center sm:justify-center p-0 sm:p-4 z-0">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full sm:max-w-[430px] sm:h-[900px] sm:rounded-[2.5rem] sm:shadow-2xl bg-[#f5f7fa] relative flex flex-col overflow-hidden sm:border sm:border-gray-200"
      >
        {children}
      </motion.div>
    </div>
  );
}
