export type Locale = "fr" | "en";
const dict: Record<Locale, Record<string,string>> = {
  fr: { like: "J’aime", liked: "Aimé", level: "Niveau", close: "Fermer" },
  en: { like: "Like", liked: "Liked", level: "Level", close: "Close" },
};
export const t = (k: string, locale: Locale = "fr") => dict[locale][k] ?? k;
