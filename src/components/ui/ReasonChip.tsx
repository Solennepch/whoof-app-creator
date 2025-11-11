import { Sparkles } from "lucide-react";
import { memo } from "react";

/**
 * ReasonChip — badges explicatifs pour le matching/suggestions
 * Système de couleurs automatique basé sur 4 catégories
 */

// Fonction pour déterminer les couleurs en fonction du label
const getChipColors = (label: string): { bg: string; text: string } => {
  const lowerLabel = label.toLowerCase();
  
  // 1. STATUTS SPÉCIAUX (bleu) - à vérifier en premier car plus spécifique
  const statutsKeywords = ["adoption", "spa", "coup de cœur", "recommandé", "sauvetage"];
  if (statutsKeywords.some(keyword => lowerLabel.includes(keyword))) {
    return { bg: "#D6EDFF", text: "#0065A3" };
  }
  
  // 2. GABARIT/TAILLE (violet)
  const gabaritkeywords = ["gabarit", "compact", "petit", "moyen", "grand", "très petit", "très grand", "taille"];
  if (gabaritkeywords.some(keyword => lowerLabel.includes(keyword))) {
    return { bg: "#E0D4FF", text: "#5E2BB8" };
  }
  
  // 3. BESOINS/HABITUDES/COMPATIBILITÉS (vert)
  const besoinsKeywords = [
    "compatible", "enfants", "chats", "balades", "sportif", "jardin", 
    "appartement", "espace", "besoin", "aime", "ok"
  ];
  if (besoinsKeywords.some(keyword => lowerLabel.includes(keyword))) {
    return { bg: "#D8F7E3", text: "#138C52" };
  }
  
  // 4. PERSONNALITÉ (rose) - par défaut pour tous les autres adjectifs
  // Ex: "Affectueux", "Calme", "Énergique", "Joueur", "Sociable", "Protecteur", etc.
  return { bg: "#FFD8F0", text: "#C71585" };
};

export const ReasonChip = memo(function ReasonChip({ label }: { label: string }) {
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
});
