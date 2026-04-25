export function FormatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function FormatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function Initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


export const ROLE_LABELS: Record<string, string> = {
  PARENT: "Parent",
  CHILD: "Child",
  COMPANION: "Companion",
  FRIEND: "Friend",
  GENERAL: "General",
};

export const ROLE_COLORS: Record<string, string> = {
  PARENT: "bg-blue-100 text-blue-700",
  CHILD: "bg-purple-100 text-purple-700",
  COMPANION: "bg-teal-100 text-teal-700",
  FRIEND: "bg-amber-100 text-amber-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

export const APPROVAL_RULE_LABELS: Record<string, string> = {
  ALL: "All Members Must Approve",
  "2_OF_3": "2 of 3 Members",
  SELECTED: "Selected Party Only",
  PARENT_ONLY: "Parent + Companion",
};

