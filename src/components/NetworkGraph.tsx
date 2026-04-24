"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NetworkGraphProps {
  users: any[];
  currentUser: any;
  edgeStyle?: "solid" | "dotted" | "dashed";
  customAvatarMap?: Record<string, string>;
}

const ROLE_DOT_COLORS: Record<string, string> = {
  PARENT: "bg-blue-500",
  CHILD: "bg-purple-500",
  COMPANION: "bg-teal-500",
  FRIEND: "bg-amber-500",
  GENERAL: "bg-gray-400",
};

export function NetworkGraph({ users, currentUser, edgeStyle = "solid", customAvatarMap = {} }: NetworkGraphProps) {
  const [activeCenterId, setActiveCenterId] = useState(currentUser?.id);

  const activeUser = users.find((u) => u.id === activeCenterId) || currentUser;
  const others = users.filter((u) => u.id !== activeCenterId);

  // Layout calculation
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

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
      {/* Removed Background Grid Pattern */}

      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
        <AnimatePresence>
          {/* Edges */}
          {nodes.filter((n) => !n.isCenter).map((n) => (
            <motion.line
              key={`edge-${activeCenterId}-${n.id}`}
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
          const foX = n.x - nodeSize / 2;
          const foY = n.y - nodeSize / 2;

          return (
            <foreignObject
              key={`node-${n.id}`}
              x={foX}
              y={foY}
              width={nodeSize}
              height={nodeSize}
              className="overflow-visible"
            >
              <motion.div
                layoutId={`node-avatar-${n.id}`}
                onClick={() => setActiveCenterId(n.id)}
                className={cn(
                  "relative cursor-pointer rounded-full bg-white flex items-center justify-center border-4 transition-all",
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
                
                {/* Role indicator dot removed */}
              </motion.div>
            </foreignObject>
          );
        })}

        {/* Labels overlayed via SVG text */}
        {nodes.map((n) => {
          const isCenter = n.isCenter;
          const labelY = n.y + (isCenter ? 48 : 36);
          return (
            <motion.text
              key={`label-${n.id}`}
              layoutId={`node-label-${n.id}`}
              x={n.x}
              y={labelY}
              textAnchor="middle"
              fill={isCenter ? "#1e293b" : "#64748b"}
              fontSize={isCenter ? "14px" : "11px"}
              fontWeight={isCenter ? "bold" : "600"}
              fontFamily="Inter, sans-serif"
            >
              {n.name} {n.id === currentUser.id && "(YOU)"}
            </motion.text>
          );
        })}
      </svg>
      
      {/* Reset button if looking at someone else's network */}
      {activeCenterId !== currentUser.id && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveCenterId(currentUser.id)}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm"
        >
          Reset View
        </motion.button>
      )}
    </div>
  );
}
