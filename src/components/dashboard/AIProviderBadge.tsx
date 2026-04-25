import { Sparkles, Brain, Cloud } from "lucide-react";

export function AIProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;

  if (provider === "alibaba-pai") {
    return (
      <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2 py-1 rounded-full w-fit">
        <Cloud size={12} />
        <span className="text-[10px] font-bold uppercase">Alibaba PAI</span>
      </div>
    );
  }

  if (provider === "hybrid") {
    return (
      <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2 py-1 rounded-full w-fit">
        <Sparkles size={12} />
        <span className="text-[10px] font-bold uppercase">Hybrid AI Engine</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit">
      <Brain size={12} />
      <span className="text-[10px] font-bold uppercase">Local MVP Engine</span>
    </div>
  );
}
