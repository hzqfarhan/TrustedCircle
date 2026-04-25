"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, Settings, ScanLine, CircleDollarSign } from "lucide-react";
import { Cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const parentNav = [
  { icon: Home, label: "Home", href: "/parent/dashboard" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: ScanLine, label: "Scan QR", href: "/parent/scan", isCenter: true },
  { icon: CircleDollarSign, label: "GOfinance", href: "/parent/cash-flow" },
  { icon: Settings, label: "Settings", href: "/parent/settings" },
];

const childNav = [
  { icon: Home, label: "Home", href: "/child/dashboard" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: ScanLine, label: "Scan QR", href: "/parent/scan", isCenter: true },
  { icon: CircleDollarSign, label: "GOfinance", href: "/parent/cash-flow" },
  { icon: Settings, label: "Settings", href: "/child/settings" },
];

const defaultNav = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Shield, label: "Circle", href: "/trusted-circle" },
  { icon: ScanLine, label: "Scan QR", href: "/parent/scan", isCenter: true },
  { icon: CircleDollarSign, label: "GOfinance", href: "/parent/cash-flow" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const navItems = currentUser?.role === "parent" ? parentNav
    : currentUser?.role === "child" ? childNav
      : defaultNav;

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-center safe-area-bottom shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] rounded-t-[32px] relative z-50">
      <div className="w-full max-w-md h-[72px] grid grid-cols-5 items-center px-1">
        {navItems.map(({ icon: Icon, label, href, isCenter }) => {
          const active = pathname === href || (href !== "/parent/dashboard" && href !== "/child/dashboard" && href !== "/dashboard" && pathname.startsWith(href));

          if (isCenter) {
            return (
              <div key={href} className="flex flex-col items-center justify-end h-full w-full relative pb-[10px]">
                <div className="absolute -top-5 left-0 w-full flex justify-center">
                  <Link 
                    href={href} 
                    className="w-[58px] h-[58px] bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 text-white border-[4px] border-white active:scale-95 transition-transform duration-300 z-20"
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </Link>
                </div>
                <span className="text-[10px] font-bold text-gray-500">{label}</span>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center h-full w-full gap-1 relative group"
            >
              <div className={Cn(
                "relative flex items-center justify-center w-[42px] h-[32px] rounded-xl transition-colors duration-300",
                active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
              )}>
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-50/80 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
              </div>
              <span className={Cn(
                "text-[10px] transition-colors duration-300",
                active ? "font-bold text-blue-600" : "font-medium text-gray-400"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

