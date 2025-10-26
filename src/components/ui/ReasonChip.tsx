import { Sparkles } from "lucide-react";
/**
 * ReasonChip — badges explicatifs pour le matching/suggestions
 */
export function ReasonChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold bg-accent/10 text-accent ring-1 ring-accent/20 transition-bounce hover:bg-accent/20 hover:scale-105">
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
