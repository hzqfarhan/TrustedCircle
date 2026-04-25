import { Sparkles, Brain, Cloud } from "lucide-react";

export function AIProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;

  if (provider === "alibaba-pai") {
    return (
      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full w-fit">
        <Cloud size={10} />
        <span className="text-[9px] font-bold uppercase whitespace-nowrap">Alibaba PAI</span>
      </div>
    );
  }

  if (provider === "hybrid") {
    return (
      <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full w-fit">
        <Sparkles size={10} />
        <span className="text-[9px] font-bold uppercase whitespace-nowrap">Hybrid AI</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full w-fit">
      <Brain size={10} />
      <span className="text-[9px] font-bold uppercase whitespace-nowrap">Local MVP</span>
    </div>
  );
}

