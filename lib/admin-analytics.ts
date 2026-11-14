import "server-only";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import "@/lib/admin-db-retry";

const sql = neon(process.env.DATABASE_URL!);

/* ═══════════════ Mesure (écriture) ═══════════════ */

const BOT_RE =
  /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|embedly|quora|pinterest|vkshare|whatsapp|telegram|discord|preview|lighthouse|headlesschrome|python-requests|curl|wget|axios|node-fetch|monitor|uptime|pingdom|semrush|ahrefs|dataprovider|screaming/i;

function deviceOf(ua: string): string {
  if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

function normalizePath(p: string): string {
  try {
    const clean = p.split("#")[0].split("?")[0].trim();
    if (!clean.startsWith("/")) return "/";
    const noTrail = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
    return noTrail.slice(0, 300);
  } catch {
    return "/";
  }
}

const IGNORED = /^\/(admin|api|imprimable|_next|favicon|robots|sitemap|jogoo)\b/;

export function shouldTrack(path: string): boolean {
  return path.startsWith("/") && !IGNORED.test(path);
}

/** Empreinte visiteur qui tourne chaque jour — aucune donnée personnelle conservée. */
function visitorDay(ip: string | null, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${process.env.COMMENT_IP_SALT ?? ""}:hit:${day}:${ip ?? "?"}:${ua}`)
    .digest("hex")
    .slice(0, 16);
}

export async function recordHit(input: {
  path: string;
  refHost: string | null;
  ip: string | null;
  ua: string;
  country: string | null;
}): Promise<void> {
  const ua = input.ua || "";
  if (!ua || BOT_RE.test(ua)) return;

  const path = normalizePath(input.path);
  if (!shouldTrack(path)) return;

  const vd = visitorDay(input.ip, ua);

  // Anti-doublon : même visiteur, même page dans les 15 dernières secondes (rafraîchissements, Strict Mode).
  const [dup] = (await sql`
    select 1 from page_views
    where visitor_day = ${vd} and path = ${path} and created_at > now() - interval '15 seconds'
    limit 1
  `) as unknown[];
  if (dup) return;

  const ref = (input.refHost || "").toLowerCase().replace(/^www\./, "").slice(0, 120) || null;
  const country = input.country && /^[A-Za-z]{2}$/.test(input.country) ? input.country.toUpperCase() : null;

  await sql`
    insert into page_views (path, ref_host, visitor_day, device, country)
    values (${path}, ${ref}, ${vd}, ${deviceOf(ua)}, ${country})
  `;
}

/* ═══════════════ Restitution (lecture) ═══════════════ */

export type Point = { date: string; views: number; visitors: number };
export type Overview = {
  views: number;
  visitors: number;
  viewsPrev: number;
  visitorsPrev: number;
  perVisitor: number;
  live: number;
  days: number;
};
export type BarRow = { label: string; value: number; share: number };

const clampDays = (d: number) => (d === 7 || d === 30 || d === 90 || d === 365 ? d : 30);

export async function analyticsOverview(daysIn: number): Promise<Overview> {
  const days = clampDays(daysIn);
  const [cur] = (await sql`
    select count(*)::int as views, count(distinct visitor_day)::int as visitors
    from page_views where created_at > now() - (${days}::int * interval '1 day')
  `) as { views: number; visitors: number }[];
  const [prev] = (await sql`
    select count(*)::int as views, count(distinct visitor_day)::int as visitors
    from page_views
    where created_at > now() - (${days * 2}::int * interval '1 day')
      and created_at <= now() - (${days}::int * interval '1 day')
  `) as { views: number; visitors: number }[];
  const [{ live }] = (await sql`
    select count(distinct visitor_day)::int as live
    from page_views where created_at > now() - interval '5 minutes'
  `) as { live: number }[];

  return {
    views: cur.views,
    visitors: cur.visitors,
    viewsPrev: prev.views,
    visitorsPrev: prev.visitors,
    perVisitor: cur.visitors ? Math.round((cur.views / cur.visitors) * 10) / 10 : 0,
    live,
    days,
  };
}

export async function analyticsSeries(daysIn: number): Promise<Point[]> {
  const days = clampDays(daysIn);
  const rows = (await sql`
    with span as (
      select generate_series(
        (now() at time zone 'UTC')::date - (${days - 1}::int * interval '1 day'),
        (now() at time zone 'UTC')::date,
        interval '1 day'
      )::date as d
    ),
    agg as (
      select (created_at at time zone 'UTC')::date as d,
             count(*)::int as views,
             count(distinct visitor_day)::int as visitors
      from page_views
      where created_at > now() - (${days}::int * interval '1 day')
      group by 1
    )
    select to_char(span.d, 'YYYY-MM-DD') as date,
           coalesce(agg.views, 0) as views,
           coalesce(agg.visitors, 0) as visitors
    from span left join agg on agg.d = span.d
    order by span.d
  `) as { date: string; views: number; visitors: number }[];
  return rows.map((r) => ({ date: r.date, views: Number(r.views), visitors: Number(r.visitors) }));
}

async function bars(
  days: number,
  column: "path" | "ref_host" | "device" | "country",
  limit: number,
): Promise<BarRow[]> {
  const rows = (await sql.query(
    `select ${column} as label, count(*)::int as value
     from page_views
     where created_at > now() - ($1::int * interval '1 day') and ${column} is not null
     group by ${column} order by value desc limit $2`,
    [days, limit],
  )) as { label: string; value: number }[];
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return rows.map((r) => ({ label: r.label, value: r.value, share: r.value / total }));
}

export async function analyticsTopPages(daysIn: number, limit = 8) {
  return bars(clampDays(daysIn), "path", limit);
}
export async function analyticsReferrers(daysIn: number, limit = 6) {
  return bars(clampDays(daysIn), "ref_host", limit);
}
export async function analyticsDevices(daysIn: number) {
  return bars(clampDays(daysIn), "device", 4);
}
export async function analyticsCountries(daysIn: number, limit = 6) {
  return bars(clampDays(daysIn), "country", limit);
}

/** Y a-t-il au moins une visite enregistrée ? (pour l’état vide). */
export async function analyticsHasData(): Promise<boolean> {
  const [r] = (await sql`select 1 from page_views limit 1`) as unknown[];
  return !!r;
}
