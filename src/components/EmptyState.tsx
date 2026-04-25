"use client";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        {icon || <Inbox size={24} className="text-gray-300" />}
      </div>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-[240px]">{description}</p>}
    </div>
  );
}

