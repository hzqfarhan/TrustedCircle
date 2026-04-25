"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cn } from "@/lib/utils";
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
  const parentX = 150;
  const parentY = 80;
  const childrenY = 230;

  const nodes = useMemo(() => {
    if (!activeUser) return [];

    const result = [];
    result.push({
      ...activeUser,
      x: parentX,
      y: parentY,
      isCenter: true,
    });

    const padding = 70; // padding from left and right edges
    const totalWidth = 300 - padding * 2;
    
    if (others.length === 1) {
      result.push({ ...others[0], x: 150, y: childrenY, isCenter: false });
    } else {
      const step = totalWidth / (others.length - 1);
      others.forEach((u, i) => {
        const x = padding + i * step;
        result.push({
          ...u,
          x,
          y: childrenY,
          isCenter: false,
        });
      });
    }

    return result;
  }, [activeUser, others]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const draggedNodeRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPositions(prev => {
      let changed = false;
      const next = { ...prev };
      nodes.forEach(n => {
        if (!next[n.id]) {
          next[n.id] = { x: n.x, y: n.y };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [nodes]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (draggedNodeRef.current && svgRef.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isDraggingRef.current = true;
        }

        if (isDraggingRef.current) {
          const CTM = svgRef.current.getScreenCTM();
          if (CTM) {
            const x = (e.clientX - CTM.e) / CTM.a;
            const y = (e.clientY - CTM.f) / CTM.d;
            setPositions(prev => ({
              ...prev,
              [draggedNodeRef.current!]: { x, y }
            }));
          }
        }
      }
    };

    const handleUp = () => {
      if (draggedNodeRef.current) {
        setTimeout(() => {
          draggedNodeRef.current = null;
        }, 50);
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    // Removed e.preventDefault() to allow onClick to fire
    e.stopPropagation();
    draggedNodeRef.current = id;
    isDraggingRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleNodeClick = (e: React.MouseEvent, user: any) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
      return;
    }
    onNodeClick && onNodeClick(user);
  };

  if (!currentUser) return null;

  return (
    <div className="relative w-full aspect-square bg-blue-50 rounded-3xl border border-blue-100 overflow-hidden flex items-center justify-center p-4 shadow-sm">
      <svg ref={svgRef} className="w-full h-full overflow-visible touch-none" viewBox="0 0 300 300">
        <AnimatePresence>
          {/* Edges */}
          {nodes.filter((n) => !n.isCenter).map((n) => {
            const centerNode = nodes.find(x => x.isCenter);
            const centerPos = centerNode ? (positions[centerNode.id] || centerNode) : { x: parentX, y: parentY };
            const nPos = positions[n.id] || n;
            return (
            <motion.line
              key={`edge-${currentUser.id}-${n.id}`}
              x1={centerPos.x}
              y1={centerPos.y}
              x2={nPos.x}
              y2={nPos.y}
              stroke="#cbd5e1" // slate-300
              strokeWidth="2"
              strokeDasharray={edgeStyle === "dotted" ? "4 4" : edgeStyle === "dashed" ? "8 8" : "0"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )})}
        </AnimatePresence>

        {/* Nodes overlay via foreignObject */}
        {nodes.map((n, i) => {
          const isCenter = n.isCenter;
          const nodeSize = isCenter ? 72 : 48;
          const foWidth = 140; // Wider to accommodate text without wrapping
          const foHeight = 140; // Taller for avatar + text
          
          const pos = positions[n.id] || n;
          const foX = pos.x - foWidth / 2;
          const foY = pos.y - nodeSize / 2;

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
                  onPointerDown={(e) => handlePointerDown(e, n.id)}
                  onClick={(e) => handleNodeClick(e, n)}
                  className={ Cn(
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
                  <span className={ Cn(
                    "font-bold text-gray-900 leading-none text-center tracking-tight",
                    isCenter ? "text-[11px]" : "text-[9px]"
                  )}>
                    {n.name} {n.id === currentUser.id && "(YOU)"}
                  </span>
                  <span className={ Cn(
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

