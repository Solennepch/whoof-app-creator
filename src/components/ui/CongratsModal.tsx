"use client";
import { useEffect, useRef } from "react";
import { PartyPopper } from "lucide-react";

interface Props { open: boolean; level: number; onClose: () => void; }

export function CongratsModal({ open, level, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    let raf:number;
    const particles = Array.from({length: 80}, () => ({
      x: c.width/2, y: c.height/2,
      vx: (Math.random()-0.5)*6, vy: (Math.random()-0.8)*6-2,
      a: 1, r: 10, rot: Math.random()*Math.PI
    }));
    const bone = (x:number,y:number,r:number,rot:number)=>{ ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--brand-yellow")?.trim() || "#FFC14D";
      // Rect stylisé (remplace roundRect si indisponible)
      const rr = (ctx as any).roundRect ? "roundRect" : null;
      if (rr) (ctx as any).roundRect(-r, -r/3, r*2, r*0.66, r/3); else { ctx.beginPath(); ctx.rect(-r, -r/3, r*2, r*0.66); }
      ctx.fill(); ctx.restore(); };
    const tick = () => {
      ctx.clearRect(0,0,c.width,c.height);
      particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.a*=0.985; p.rot+=0.1; bone(p.x,p.y,p.r,p.rot); });
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="rounded-2xl relative overflow-hidden bg-white p-5 shadow-soft ring-1 ring-black/5" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center gap-2 justify-center mb-1">
          <PartyPopper className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl">Félicitations !</h2>
        </div>
        <p>Tu as atteint le <b>niveau {level}</b>. Continue et débloque de nouveaux badges !</p>
        <canvas ref={canvasRef} width={480} height={240} className="absolute inset-0 pointer-events-none opacity-70 -z-10" />
        <button onClick={onClose} className="mt-3 rounded-2xl px-3 py-2 text-sm text-white" style={{ backgroundColor: "var(--brand-plum, #7B61FF)" }}>Fermer</button>
      </div>
    </div>
  );
}
