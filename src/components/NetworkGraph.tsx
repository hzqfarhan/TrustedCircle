"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils-tc";

interface NetworkGraphProps {
  users: any[];
  currentUser: any;
  edgeStyle?: "solid" | "dotted" | "dashed";
  customAvatarMap?: Record<string, string>;
  onNodeClick?: (user: any) => void;
}

const ROLE_DOT_COLORS: Record<string, string> = {
  PARENT: "bg-blue-500",
  CHILD: "bg-purple-500",
  COMPANION: "bg-teal-500",
  FRIEND: "bg-amber-500",
  GENERAL: "bg-gray-400",
};

export function NetworkGraph({ users, currentUser, edgeStyle = "solid", customAvatarMap = {}, onNodeClick }: NetworkGraphProps) {
  const activeUser = currentUser;
  const others = users.filter((u) => u.id !== currentUser?.id);

  // Layout calculation
  const centerX = 150;
  const centerY = 150;
  const radius = 110;

  const nodes = useMemo(() => {
    if (!activeUser) return [];

    const result = [];
    result.push({
      ...activeUser,
      x: centerX,
      y: centerY,
      isCenter: true,
    });

    const angleStep = (2 * Math.PI) / others.length;
    others.forEach((u, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      result.push({
        ...u,
        x,
        y,
        isCenter: false,
      });
    });

    return result;
  }, [activeUser, others]);

  if (!currentUser) return null;

  return (
    <div className="relative w-full aspect-square bg-white rounded-3xl border border-blue-100 overflow-hidden flex items-center justify-center p-4 shadow-sm">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #cbd5e1 2px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />

      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
        <AnimatePresence>
          {/* Edges */}
          {nodes.filter((n) => !n.isCenter).map((n) => (
            <motion.line
              key={`edge-${currentUser.id}-${n.id}`}
              x1={centerX}
              y1={centerY}
              x2={n.x}
              y2={n.y}
              stroke="#cbd5e1" // slate-300
              strokeWidth="2"
              strokeDasharray={edgeStyle === "dotted" ? "4 4" : edgeStyle === "dashed" ? "8 8" : "0"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          ))}
        </AnimatePresence>

        {/* Nodes overlay via foreignObject */}
        {nodes.map((n, i) => {
          const isCenter = n.isCenter;
          const nodeSize = isCenter ? 72 : 48;
          const foWidth = 140; // Wider to accommodate text without wrapping
          const foHeight = 140; // Taller for avatar + text
          const foX = n.x - foWidth / 2;
          const foY = n.y - nodeSize / 2;

          return (
            <foreignObject
              key={`node-${n.id}`}
              x={foX}
              y={foY}
              width={foWidth}
              height={foHeight}
              className="overflow-visible"
            >
              <div className="w-full h-full flex flex-col items-center justify-start">
                <motion.div
                  layoutId={`node-avatar-${n.id}`}
                  onClick={() => onNodeClick && onNodeClick(n)}
                  className={cn(
                    "relative cursor-pointer rounded-full bg-white flex items-center justify-center border-4 transition-all shrink-0",
                    isCenter ? "border-blue-600 shadow-blue-500/40 shadow-xl z-20" : "border-white shadow-md hover:scale-110 z-10 hover:border-blue-200"
                  )}
                  style={{ width: nodeSize, height: nodeSize }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: isCenter ? 0 : i * 0.05 }}
                >
                  {(n.avatar || customAvatarMap[n.id]) ? (
                    <img src={n.avatar || customAvatarMap[n.id]} alt={n.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-500 text-lg">{n.name[0]}</span>
                  )}
                </motion.div>
                
                {/* Name and Pill Badge */}
                <motion.div 
                  className="mt-1.5 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isCenter ? 0.2 : i * 0.05 + 0.2 }}
                >
                  <span className={cn(
                    "font-bold text-gray-900 leading-none text-center tracking-tight",
                    isCenter ? "text-[11px]" : "text-[9px]"
                  )}>
                    {n.name} {n.id === currentUser.id && "(YOU)"}
                  </span>
                  <span className={cn(
                    "bg-[#1a4bba] text-white font-bold rounded-full text-center tracking-wide",
                    isCenter ? "text-[8px] px-2.5 py-[3px]" : "text-[7px] px-2 py-[2px]"
                  )}>
                    {ROLE_LABELS[n.role] || n.role}
                  </span>
                </motion.div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
      
    </div>
  );
}
