import { memo } from "react";

/**
 * TagChip - Badges colorés pour les profils de chiens
 * Système de couleurs automatique basé sur des catégories
 */

type TagCategory = "personality" | "size" | "special" | "default";

// Fonction pour déterminer la catégorie du tag
const getTagCategory = (label: string): TagCategory => {
  const lowerLabel = label.toLowerCase();
  
  // Mots-clés pour la personnalité
  const personalityKeywords = [
    "affectueux", "calme", "énergique", "joueur", "sociable", "protecteur",
    "doux", "curieux", "timide", "dynamique", "indépendant", "fidèle",
    "câlin", "gentil", "intelligent", "obéissant", "actif"
  ];
  
  // Mots-clés pour la taille/gabarit
  const sizeKeywords = [
    "petit", "moyen", "grand", "très petit", "très grand", "taille",
    "gabarit", "compact", "imposant", "miniature", "géant"
  ];
  
  // Mots-clés pour les particularités
  const specialKeywords = [
    "adoption", "spa", "refuge", "sauvetage", "stérilisé", "vacciné",
    "pucé", "lof", "éduqué", "race", "croisé", "sans jardin", "appartement"
  ];
  
  if (personalityKeywords.some(keyword => lowerLabel.includes(keyword))) {
    return "personality";
  }
  if (sizeKeywords.some(keyword => lowerLabel.includes(keyword))) {
    return "size";
  }
  if (specialKeywords.some(keyword => lowerLabel.includes(keyword))) {
    return "special";
  }
  
  return "default";
};

// Couleurs pour chaque catégorie
const getCategoryColors = (category: TagCategory) => {
  switch (category) {
    case "personality":
      return "bg-pink-400 text-white";
    case "size":
      return "bg-purple-400 text-white";
    case "special":
      return "bg-cyan-400 text-white";
    default:
      return "bg-orange-400 text-white";
  }
};

export const TagChip = memo(function TagChip({ label }: { label: string }) {
  const category = getTagCategory(label);
  const colors = getCategoryColors(category);
  
  return (
    <span 
      className={`text-xs px-3 py-1 rounded-full backdrop-blur ${colors} font-medium`}
    >
      {label}
    </span>
  );
});
