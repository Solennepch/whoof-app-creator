import { Sparkles } from "lucide-react";

/**
 * ReasonChip — badges explicatifs pour le matching/suggestions
 */

// Fonction pour déterminer les couleurs en fonction du label
const getChipColors = (label: string): { bg: string; text: string } => {
  const lowerLabel = label.toLowerCase();
  
  // Catégorie énergie (orange pastel) : Jeune, Énergique, Joueuse, Dynamique
  if (
    lowerLabel.includes("jeune") ||
    lowerLabel.includes("énergique") ||
    lowerLabel.includes("joueuse") ||
    lowerLabel.includes("dynamique")
  ) {
    return { bg: "#FFD8F0", text: "#C71585" };
  }
  
  // Catégorie taille (violet pastel) : gabarit, Compact
  if (
    lowerLabel.includes("gabarit") ||
    lowerLabel.includes("compact") ||
    lowerLabel.includes("petit") ||
    lowerLabel.includes("moyen") ||
    lowerLabel.includes("grand")
  ) {
    return { bg: "#E0D4FF", text: "#5E2BB8" };
  }
  
  // Catégorie affection/tempérament (pêche pastel) : reste
  return { bg: "#FEE7B8", text: "#C37A00" };
};

export function ReasonChip({ label }: { label: string }) {
  const colors = getChipColors(label);
  
  return (
    <span 
      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text 
      }}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
