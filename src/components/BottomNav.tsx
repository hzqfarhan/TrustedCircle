"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Send, Shield, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const parentNav = [
  { icon: Home, label: "Home", href: "/parent/dashboard" },
  { icon: Send, label: "Transfer", href: "/transfer" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: Bell, label: "Alerts", href: "/parent/alerts" },
  { icon: Settings, label: "Settings", href: "/parent/settings" },
];

const childNav = [
  { icon: Home, label: "Home", href: "/child/dashboard" },
  { icon: Send, label: "Transfer", href: "/transfer" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: Bell, label: "Alerts", href: "/child/settings" },
  { icon: Settings, label: "Settings", href: "/child/settings" },
];

const defaultNav = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Send, label: "Transfer", href: "/transfer" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: Bell, label: "Alerts", href: "/trusted-circle/alerts" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const navItems = currentUser?.role === "parent" ? parentNav
    : currentUser?.role === "child" ? childNav
    : defaultNav;

  return (
    <nav className="bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 safe-area-bottom shrink-0">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href || (href !== "/parent/dashboard" && href !== "/child/dashboard" && href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <div className="relative">
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 -m-1.5 rounded-xl bg-blue-50"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} className="relative" />
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
