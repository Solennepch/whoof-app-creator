"use client";
import { Heart } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useRef, useState } from "react";

export function LikeButton({ initial=false, onToggle }:{ initial?:boolean; onToggle?:(liked:boolean)=>void }) {
  const [liked, setLiked] = useState(initial);
  const controls = useAnimation();
  const particlesRef = useRef<HTMLDivElement>(null);

  const burst = () => {
    const root = particlesRef.current!;
    for (let i = 0; i < 14; i++) {
      const span = document.createElement("span");
      span.textContent = "🦴";
      span.className = "absolute text-sm select-none";
      const angle = (i / 14) * Math.PI * 2;
      const dist = 20 + Math.random() * 24;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      span.style.transform = `translate(${x}px, ${y}px)`;
      span.style.opacity = "0";
      root.appendChild(span);
      requestAnimationFrame(() => {
        span.animate([{ transform: "translate(0,0) scale(0.8)", opacity: 1 }, { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => span.remove();
      });
    }
  };

  const handleClick = async () => {
    const next = !liked;
    setLiked(next);
    onToggle?.(next);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      await controls.start({ scale: [1, 1.25, 1], transition: { duration: 0.28 } });
      burst();
    }
  };

  return (
    <button
      aria-pressed={liked}
      aria-label={liked ? "Retirer J’aime" : "Mettre J’aime"}
      onClick={handleClick}
      className="relative inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white shadow-sm hover:shadow ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-plum/60"
      style={{ color: "var(--ink, #111827)" }}
    >
      <motion.span animate={controls}>
        <Heart
          className="h-5 w-5"
          style={{
            stroke: liked ? "var(--brand-raspberry, #FF5DA2)" : "currentColor",
            fill: liked ? "var(--brand-raspberry, #FF5DA2)" : "transparent",
          }}
          strokeWidth={2}
        />
      </motion.span>
      <span className="text-sm font-medium">{liked ? "Aimé" : "J’aime"}</span>
      <div ref={particlesRef} className="pointer-events-none absolute inset-0" />
    </button>
  );
}
