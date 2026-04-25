"use client";
import Link from "next/link";
import { ChevronLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface WalletHeaderProps {
  showBack?: boolean;
  title?: string;
  rightElement?: React.ReactNode;
  notificationCount?: number;
}

export function WalletHeader({
  showBack,
  title,
  rightElement,
  notificationCount = 0,
}: WalletHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
        )}
        {title && (
          <h1 className="font-semibold text-gray-900 text-base">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <Link href="/trusted-circle/alerts" className="relative">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
            <Bell size={17} className="text-gray-700" />
          </div>
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

