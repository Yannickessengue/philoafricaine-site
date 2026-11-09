'use client';

import { useEffect, useRef } from 'react';

/** Constellation animée : nœuds et liaisons dorées / bordeaux, comme un réseau de savoirs. */
export function Constellation({ className = '' }: { className?: string }) {
  const toile = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = toile.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; or: boolean };
    let pts: P[] = [];
    const souris = { x: -999, y: -999 };
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 11000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.6 + 0.6, or: Math.random() > 0.3 }));
    };
    const dessin = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduit) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(217,154,14,${(1 - d / 130) * 0.22})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const p = pts[i];
        const proche = Math.hypot(p.x - souris.x, p.y - souris.y) < 120;
        ctx.fillStyle = p.or ? `rgba(255,201,74,${proche ? 1 : 0.75})` : 'rgba(176,36,36,0.85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (proche ? 2 : 1), 0, Math.PI * 2); ctx.fill();
      }
      if (!reduit) raf = requestAnimationFrame(dessin);
    };
    init(); dessin();
    const taille = () => { init(); if (reduit) dessin(); };
    const bouge = (e: MouseEvent) => { const r = c.getBoundingClientRect(); souris.x = e.clientX - r.left; souris.y = e.clientY - r.top; };
    window.addEventListener('resize', taille);
    window.addEventListener('mousemove', bouge);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', taille); window.removeEventListener('mousemove', bouge); };
  }, []);
  return <canvas ref={toile} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

/** Le coq cyborg : disque du logo dans un anneau d'interface, balayage, circuits et texte en orbite. */
export function CoqCyborg({ taille = 300 }: { taille?: number }) {
  return (
    <div className="relative mx-auto" style={{ width: taille, height: taille }}>
      {/* halo */}
      <div className="ai-pouls absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,201,74,0.35),rgba(106,13,13,0.15)_55%,transparent_70%)] blur-xl" aria-hidden="true" />
      {/* anneaux d'interface */}
      <svg viewBox="0 0 200 200" className="ai-tour absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <path id="orbite" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="#d99a0e" strokeOpacity=".45" strokeWidth=".6" strokeDasharray="1 3" />
        <text fill="#ffc94a" fillOpacity=".8" fontSize="6.2" letterSpacing="3.2" fontFamily="var(--font-brand)">
          <textPath href="#orbite">JOGOO · AI · EXPLORER · COMPRENDRE · ANALYSER · CITER · </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 200 200" className="ai-tour-inverse absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#b02424" strokeOpacity=".7" strokeWidth="1.4" strokeDasharray="40 14 6 14" />
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i * Math.PI) / 18;
          const r1 = 84, r2 = i % 3 === 0 ? 90 : 87;
          return <line key={i} x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)} x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)} stroke="#d99a0e" strokeOpacity=".6" strokeWidth=".7" />;
        })}
      </svg>
      {/* circuits */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[
          'M30 150 L48 150 L58 140', 'M170 52 L152 52 L142 62', 'M20 92 L40 92', 'M180 120 L160 120 L154 114', 'M64 24 L64 40 L72 48', 'M136 178 L136 162 L128 154',
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#ffc94a" strokeWidth="1" className="ai-flux" strokeOpacity=".85" />
            <circle cx={Number(d.split(' ')[0].slice(1))} cy={Number(d.split(' ')[1])} r="2" fill="#ffc94a" />
          </g>
        ))}
      </svg>
      {/* coq */}
      <div className="absolute inset-[17%] overflow-hidden rounded-full shadow-[0_0_0_2px_rgba(217,154,14,0.6),0_0_40px_rgba(255,201,74,0.45),inset_0_0_30px_rgba(0,0,0,0.25)]">
        <img src="/medias/site/jogoo/disque-jogoo-ai.png" alt="JOGOO AI, le coq cyborg" className="ai-glitch h-full w-full object-cover" />
        <span className="ai-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-[rgba(255,201,74,0.28)] to-transparent" aria-hidden="true" />
        <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(13,27,42,0.10)_0_1px,transparent_1px_3px)] mix-blend-multiply" aria-hidden="true" />
      </div>
    </div>
  );
}
