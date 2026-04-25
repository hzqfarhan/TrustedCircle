"use client";
import { getCategoryColor, getCategoryLabel } from "@/lib/ai/classification";
import type { TransactionCategory } from "@/types";

export function CategoryBadge({ category }: { category: TransactionCategory }) {
  const colors = getCategoryColor(category);
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
      {getCategoryLabel(category)}
    </span>
  );
}
