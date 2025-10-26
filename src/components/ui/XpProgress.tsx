"use client";
import { motion, useSpring, useTransform } from "framer-motion";
import React from "react";

export function levelForXp(xp: number) {
  const table = [0, 500, 1200, 2200, 3600, 5400];
  let level = 1;
  for (let i = 0; i < table.length; i++) if (xp >= table[i]) level = i + 1;
  return level;
}

export function XpProgress({ current, min, max, t = (k:string)=>({level:"Niveau"}[k]||k) }:
  { current:number; min:number; max:number; t?: (k:string)=>string }) {
  const pct = Math.max(0, Math.min(1, (current - min) / (max - min)));
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  React.useEffect(() => { spring.set(pct); }, [pct]);
  const width = useTransform(spring, (v) => `${Math.round(v * 100)}%`);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{t("level")} {levelForXp(current)}</span>
        <span className="text-sm text-gray-500">{current - min}/{max - min} XP</span>
      </div>
      <div className="h-3 w-full rounded-2xl" style={{ backgroundColor: "var(--paper, #F9FAFB)" }}>
        <motion.div style={{ width, backgroundColor: "var(--brand-plum, #7B61FF)" }} className="h-full rounded-2xl" />
      </div>
    </div>
  );
}
