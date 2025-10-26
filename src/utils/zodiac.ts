export type ZodiacSign = 
  | "Bélier" 
  | "Taureau" 
  | "Gémeaux" 
  | "Cancer" 
  | "Lion" 
  | "Vierge" 
  | "Balance" 
  | "Scorpion" 
  | "Sagittaire" 
  | "Capricorne" 
  | "Verseau" 
  | "Poissons";

export function getZodiacSign(birthDate: Date | string): ZodiacSign {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Bélier";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taureau";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gémeaux";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Lion";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Vierge";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Balance";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpion";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittaire";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorne";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Verseau";
  return "Poissons";
}

export function getZodiacEmoji(sign: ZodiacSign): string {
  const emojiMap: Record<ZodiacSign, string> = {
    "Bélier": "♈",
    "Taureau": "♉",
    "Gémeaux": "♊",
    "Cancer": "♋",
    "Lion": "♌",
    "Vierge": "♍",
    "Balance": "♎",
    "Scorpion": "♏",
    "Sagittaire": "♐",
    "Capricorne": "♑",
    "Verseau": "♒",
    "Poissons": "♓",
  };
  return emojiMap[sign];
}
