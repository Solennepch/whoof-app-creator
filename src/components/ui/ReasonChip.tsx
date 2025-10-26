import { Sparkles } from "lucide-react";
/**
 * ReasonChip — badges explicatifs pour le matching/suggestions
 */
export function ReasonChip({ label }: { label: string }) {
  const plum = getComputedStyle(document.documentElement).getPropertyValue("--brand-plum")?.trim() || "#7B61FF";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1"
      style={{
        backgroundColor: `${plum}1A`,
        color: plum,
        borderColor: `${plum}26`,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
