"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { fmt } from "@/lib/admin-format";

export type Point = { date: string; views: number; visitors: number };

const C = {
  views: "#c94c27", // terra — série remplie (aire)
  visitors: "#3f3a38", // encre douce — ligne seule, distincte de la terra
  grid: "#e9dfd8",
  axis: "#8a807a",
  ink: "#1a1a1a",
};

function niceMax(v: number): number {
  if (v <= 5) return 5;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
}

function frDate(iso: string, withYear = false) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/* ────────────────────────── Graphique temporel ────────────────────────── */

export function AreaTimeChart({ data }: { data: Point[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(760);
  const [hover, setHover] = useState<number | null>(null);
  const H = 280;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length < 2) {
    return (
      <div className="grid h-[240px] place-items-center rounded-lg border border-ink/10 bg-white text-sm text-ink/40">
        Pas encore assez de données pour tracer une courbe.
      </div>
    );
  }

  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const iw = w - padL - padR;
  const ih = H - padT - padB;

  const maxV = niceMax(Math.max(1, ...data.map((d) => d.views)));
  const x = (i: number) => padL + (iw * i) / (data.length - 1);
  const y = (v: number) => padT + ih - (ih * v) / maxV;

  const lineOf = (key: "views" | "visitors") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const areaPath = `${lineOf("views")} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxV * f));
  const xEvery = Math.max(1, Math.round(data.length / 6));

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * w;
    const i = Math.round(((px - padL) / iw) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  }

  const hp = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.min(w - 150, Math.max(4, x(hover) - 75)) : 0;

  return (
    <div ref={wrapRef} className="relative">
      {/* légende */}
      <div className="mb-2 flex items-center gap-4 text-xs text-ink/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ background: C.views }} /> Pages vues
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3" style={{ background: C.visitors }} /> Visiteurs
        </span>
      </div>

      <svg width={w} height={H} className="block overflow-visible" role="img" aria-label="Fréquentation dans le temps">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.views} stopOpacity={0.16} />
            <stop offset="100%" stopColor={C.views} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* grille + axe Y */}
        {yTicks.map((t, k) => (
          <g key={k}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize={10} fill={C.axis} className="tabular-nums">
              {fmt(t)}
            </text>
          </g>
        ))}

        {/* axe X */}
        {data.map((d, i) =>
          i % xEvery === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={C.axis}>
              {frDate(d.date)}
            </text>
          ) : null,
        )}

        <path d={areaPath} fill="url(#areaFill)" className="[animation:chartfade_.6s_ease]" />
        <path
          d={lineOf("views")}
          fill="none"
          stroke={C.views}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          className="[animation:chartdraw_.8s_ease]"
          style={{ strokeDasharray: 1 }}
        />
        <path
          d={lineOf("visitors")}
          fill="none"
          stroke={C.visitors}
          strokeWidth={2}
          strokeDasharray="1"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          className="[animation:chartdraw_.8s_ease_.1s_both]"
        />

        {/* étiquettes directes en bout de courbe */}
        <text x={x(data.length - 1) - 4} y={y(data[data.length - 1].views) - 7} textAnchor="end" fontSize={10} fontWeight={600} fill={C.views}>
          Vues
        </text>
        <text x={x(data.length - 1) - 4} y={y(data[data.length - 1].visitors) + 14} textAnchor="end" fontSize={10} fontWeight={600} fill={C.visitors}>
          Visiteurs
        </text>

        {/* survol */}
        {hp && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke={C.ink} strokeOpacity={0.25} strokeWidth={1} />
            <circle cx={x(hover)} cy={y(hp.views)} r={4} fill="#fff" stroke={C.views} strokeWidth={2} />
            <circle cx={x(hover)} cy={y(hp.visitors)} r={4} fill="#fff" stroke={C.visitors} strokeWidth={2} />
          </g>
        )}

        <rect
          x={padL}
          y={padT}
          width={iw}
          height={ih}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hp && hover != null && (
        <div
          className="pointer-events-none absolute top-6 z-10 w-[150px] rounded-md border border-ink/12 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: tipLeft }}
        >
          <p className="font-semibold text-ink">{frDate(hp.date, true)}</p>
          <p className="mt-1 flex items-center justify-between text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: C.views }} /> Vues
            </span>
            <span className="tabular-nums font-semibold text-ink">{fmt(hp.views)}</span>
          </p>
          <p className="mt-0.5 flex items-center justify-between text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-2" style={{ background: C.visitors }} /> Visiteurs
            </span>
            <span className="tabular-nums font-semibold text-ink">{fmt(hp.visitors)}</span>
          </p>
        </div>
      )}

      <style>{`
        @keyframes chartdraw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        @keyframes chartfade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

/* ────────────────────────── Sparkline ────────────────────────── */

export function Sparkline({ values, color = C.views }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 28;
  const max = Math.max(1, ...values);
  const pts = values
    .map((v, i) => `${((w * i) / (values.length - 1)).toFixed(1)},${(h - (h - 3) * (v / max) - 1.5).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="block" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ────────────────────────── Barres horizontales ────────────────────────── */

export function BarList({
  rows,
  empty = "Aucune donnée.",
}: {
  rows: { label: string; value: number; share: number }[];
  empty?: string;
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink/40">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink">{r.label}</span>
            <span className="shrink-0 tabular-nums text-ink/50">
              {fmt(r.value)}
              <span className="ml-1.5 text-xs text-ink/35">{Math.round(r.share * 100)}%</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, background: C.views }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
