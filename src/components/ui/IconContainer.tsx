import { ReactNode } from "react";
/**
 * IconContainer — assure la cohérence visuelle (Lucide + arrondis 2xl + dégradé subtil)
 */
export function IconContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl ring-1 ring-black/5 shadow-sm"
      style={{
        background: "linear-gradient(135deg, var(--brand-plum, #7B61FF)20, var(--brand-raspberry, #FF5DA2)20)",
        color: "color-mix(in oklab, var(--ink, #111827) 80%, transparent)",
      }}
    >
      {children}
    </div>
  );
}
