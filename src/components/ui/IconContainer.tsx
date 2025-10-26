import { ReactNode } from "react";
/**
 * IconContainer — assure la cohérence visuelle (Lucide + arrondis 2xl + dégradé subtil)
 */
export function IconContainer({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl gradient-hero text-white shadow-glow transition-bounce hover:scale-110">
      {children}
    </div>
  );
}
