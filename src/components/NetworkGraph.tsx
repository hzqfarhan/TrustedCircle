"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils-tc";

interface NetworkGraphProps {
  users: any[];
  currentUser: any;
  edgeStyle?: "solid" | "dotted" | "dashed";
  customAvatarMap?: Record<string, string>;
  onNodeClick?: (user: any) => void;
}

// All layout in a virtual 400×300 coordinate space
const VW = 400;
const VH = 300;
const PARENT_CX = VW / 2;       // 200
const PARENT_CY = 70;
const CHILDREN_CY = 220;
const CHILD_SPREAD = 110;        // px offset from center
const PARENT_SIZE = 72;
const CHILD_SIZE = 52;

interface NodeLayout {
  user: any;
  cx: number;
  cy: number;
  isCenter: boolean;
  size: number;
}

export function NetworkGraph({
  users,
  currentUser,
  edgeStyle = "solid",
  customAvatarMap = {},
  onNodeClick,
}: NetworkGraphProps) {
  const others = users.filter((u) => u.id !== currentUser?.id);

  const nodes: NodeLayout[] = useMemo(() => {
    if (!currentUser) return [];

    const result: NodeLayout[] = [
      { user: currentUser, cx: PARENT_CX, cy: PARENT_CY, isCenter: true, size: PARENT_SIZE },
    ];

    if (others.length === 1) {
      result.push({ user: others[0], cx: PARENT_CX, cy: CHILDREN_CY, isCenter: false, size: CHILD_SIZE });
    } else if (others.length >= 2) {
      const totalSpread = CHILD_SPREAD * 2;
      const step = totalSpread / (others.length - 1);
      others.forEach((u, i) => {
        result.push({
          user: u,
          cx: PARENT_CX - CHILD_SPREAD + i * step,
          cy: CHILDREN_CY,
          isCenter: false,
          size: CHILD_SIZE,
        });
      });
    }
    return result;
  }, [currentUser, others]);

  if (!currentUser) return null;

  const parentNode = nodes.find((n) => n.isCenter)!;
  const childNodes = nodes.filter((n) => !n.isCenter);

  return (
    <div className="relative w-full bg-gradient-to-b from-blue-50/80 to-white rounded-3xl border border-blue-100/60 overflow-visible shadow-sm">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ display: "block" }}
      >
        {/* Connecting Lines */}
        {childNodes.map((child) => {
          const x1 = parentNode.cx;
          const y1 = parentNode.cy + parentNode.size / 2 + 2;
          const x2 = child.cx;
          const y2 = child.cy - child.size / 2 - 2;
          return (
            <motion.line
              key={`edge-${child.user.id}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={
                edgeStyle === "dotted" ? "4 4" : edgeStyle === "dashed" ? "8 8" : "0"
              }
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const { user, cx, cy, isCenter, size } = node;
          const avatarSrc = user.avatar || customAvatarMap[user.id];
          const r = size / 2;
          const borderW = isCenter ? 3.5 : 3;

          return (
            <g
              key={user.id}
              onClick={() => onNodeClick?.(user)}
              className="cursor-pointer"
            >
              {/* Avatar background circle + border */}
              <motion.circle
                cx={cx} cy={cy} r={r + borderW}
                fill={isCenter ? "#2563eb" : "#ffffff"}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: isCenter ? 0 : 0.1 + i * 0.08 }}
              />
              {isCenter && (
                <circle cx={cx} cy={cy} r={r + borderW + 4} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="6" />
              )}
              <motion.circle
                cx={cx} cy={cy} r={r}
                fill="#ffffff"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: isCenter ? 0 : 0.1 + i * 0.08 }}
              />

              {/* Avatar image */}
              <clipPath id={`clip-${user.id}`}>
                <circle cx={cx} cy={cy} r={r - 1} />
              </clipPath>
              {avatarSrc ? (
                <motion.image
                  href={avatarSrc}
                  x={cx - r + 1} y={cy - r + 1}
                  width={(r - 1) * 2} height={(r - 1) * 2}
                  clipPath={`url(#clip-${user.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isCenter ? 0.1 : 0.2 + i * 0.08 }}
                />
              ) : (
                <text
                  x={cx} y={cy + (isCenter ? 8 : 6)}
                  textAnchor="middle"
                  fontSize={isCenter ? 24 : 18}
                  fontWeight="bold"
                  fill="#9ca3af"
                >
                  {user.name?.[0] || "?"}
                </text>
              )}

              {/* Name label */}
              <motion.text
                x={cx}
                y={cy + r + borderW + 18}
                textAnchor="middle"
                fontSize={isCenter ? 13 : 11}
                fontWeight="700"
                fill="#111827"
                letterSpacing="-0.3"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isCenter ? 0.15 : 0.25 + i * 0.08 }}
              >
                {user.name}{user.id === currentUser.id ? " (YOU)" : ""}
              </motion.text>

              {/* Role badge */}
              <motion.g
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isCenter ? 0.2 : 0.3 + i * 0.08 }}
              >
                <rect
                  x={cx - (isCenter ? 24 : 18)}
                  y={cy + r + borderW + 24}
                  width={isCenter ? 48 : 36}
                  height={isCenter ? 16 : 14}
                  rx={isCenter ? 8 : 7}
                  fill="#1a4bba"
                />
                <text
                  x={cx}
                  y={cy + r + borderW + (isCenter ? 36 : 34)}
                  textAnchor="middle"
                  fontSize={isCenter ? 8 : 7}
                  fontWeight="700"
                  fill="white"
                  letterSpacing="0.5"
                >
                  {ROLE_LABELS[user.role] || user.role}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
