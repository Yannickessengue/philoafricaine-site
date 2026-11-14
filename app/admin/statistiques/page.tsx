import Link from "next/link";
import {
  analyticsOverview,
  analyticsSeries,
  analyticsTopPages,
  analyticsReferrers,
  analyticsDevices,
  analyticsCountries,
  analyticsHasData,
} from "@/lib/admin-analytics";
import { PageHeader } from "@/components/admin/ui";
import { AreaTimeChart, BarList, Sparkline } from "@/components/admin/charts";
import { fmt } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

const PERIODS = [
  { d: 7, label: "7 jours" },
  { d: 30, label: "30 jours" },
  { d: 90, label: "90 jours" },
];

const DEVICE_LABEL: Record<string, string> = { mobile: "Mobile", desktop: "Ordinateur", tablet: "Tablette" };
const REGION = new Intl.DisplayNames(["fr"], { type: "region" });

/** Jolit un chemin en libellé lisible. */
function pathLabel(p: string): string {
  if (p === "/") return "Accueil";
  const seg = p.split("/").filter(Boolean);
  const known: Record<string, string> = {
    edito: "Édito",
    actualites: "Actualités",
    publications: "Publications",
    recherche: "Recherche",
    mediatheque: "Médiathèque",
    "le-groupe": "Le Groupe",
    "philosophie-africaine": "Philosophie africaine",
    contact: "Contact",
    flash: "Flash d’entrée",
    "sous-sites": "Sous-site",
    "appels-a-postes": "Appels à postes",
    auteurs: "Auteur",
  };
  const head = known[seg[0]] ?? seg[0];
  const tail = seg.slice(1).join(" / ").replace(/-/g, " ");
  return tail ? `${head} · ${tail}` : head;
}

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) {
    return <span className="text-xs font-semibold text-ink/35">nouveau</span>;
  }
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-terra-deep" : "text-ink/40"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)} %
    </span>
  );
}

function Kpi({
  label,
  value,
  delta,
  spark,
  live,
}: {
  label: string;
  value: string;
  delta?: React.ReactNode;
  spark?: number[];
  live?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ink/12 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/45">
        {live && <span className="h-2 w-2 animate-pulse rounded-full bg-terra" aria-hidden />}
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="display-title text-[2rem] leading-none text-ink">{value}</span>
        {delta}
      </div>
      {spark && spark.length > 1 && (
        <div className="mt-2">
          <Sparkline values={spark} />
        </div>
      )}
    </div>
  );
}

export default async function StatsPage(props: { params: Promise<Record<string, string>>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const days = Number(typeof sp?.p === "string" ? sp.p : 30) || 30;

  const hasData = await analyticsHasData();
  const [ov, series, pages, refs, devices, countries] = await Promise.all([
    analyticsOverview(days),
    analyticsSeries(days),
    analyticsTopPages(days),
    analyticsReferrers(days),
    analyticsDevices(days),
    analyticsCountries(days),
  ]);

  const viewSpark = series.map((s) => s.views);
  const visitorSpark = series.map((s) => s.visitors);

  const relabel = (rows: typeof pages, f: (l: string) => string) =>
    rows.map((r) => ({ ...r, label: f(r.label) }));
  const countryName = (code: string) => {
    try {
      return REGION.of(code) ?? code;
    } catch {
      return code;
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Audience"
        title="Statistiques de fréquentation"
        subtitle="Mesure première partie, sans cookie ni donnée personnelle."
      />

      {/* Sélecteur de période */}
      <div className="mt-6 inline-flex rounded-md border border-ink/15 p-0.5">
        {PERIODS.map((p) => (
          <Link
            key={p.d}
            href={`/admin/statistiques?p=${p.d}`}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              ov.days === p.d ? "bg-ink text-paper" : "text-ink/50 hover:text-ink"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {!hasData ? (
        <div className="mt-8 rounded-lg border border-dashed border-ink/20 bg-white p-12 text-center">
          <p className="text-sm text-ink-soft">Aucune visite enregistrée pour l’instant.</p>
          <p className="mt-2 text-xs text-ink/45">
            La mesure démarre dès la mise en ligne de cette version. Les chiffres apparaîtront ici au fil des visites.
          </p>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label={`Visiteurs · ${ov.days} j`}
              value={fmt(ov.visitors)}
              delta={<Delta cur={ov.visitors} prev={ov.visitorsPrev} />}
              spark={visitorSpark}
            />
            <Kpi
              label={`Pages vues · ${ov.days} j`}
              value={fmt(ov.views)}
              delta={<Delta cur={ov.views} prev={ov.viewsPrev} />}
              spark={viewSpark}
            />
            <Kpi label="Pages par visiteur" value={ov.perVisitor.toLocaleString("fr-FR")} />
            <Kpi label="Visiteurs en direct" value={fmt(ov.live)} live />
          </div>

          {/* Courbe */}
          <div className="mt-4 rounded-lg border border-ink/12 bg-white p-5">
            <h2 className="mb-3 font-brand text-[0.82rem] font-bold uppercase tracking-[0.06em] text-ink">
              Fréquentation
            </h2>
            <AreaTimeChart data={series} />
          </div>

          {/* Répartitions */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Pages les plus vues">
              <BarList rows={relabel(pages, pathLabel)} empty="Aucune page vue sur la période." />
            </Panel>
            <Panel title="Sources de trafic">
              <BarList
                rows={relabel(refs, (l) => l.replace(/^m\./, ""))}
                empty="Aucune source externe — accès directs uniquement."
              />
            </Panel>
            <Panel title="Appareils">
              <BarList rows={relabel(devices, (l) => DEVICE_LABEL[l] ?? l)} />
            </Panel>
            <Panel title="Pays">
              <BarList
                rows={relabel(countries, countryName)}
                empty="Localisation indisponible sur cet hébergement."
              />
            </Panel>
          </div>

          <p className="mt-6 text-xs text-ink/40">
            Aucun cookie n’est déposé. L’adresse IP sert seulement à distinguer les visiteurs sur une journée
            (empreinte renouvelée chaque jour, jamais conservée). Les robots sont exclus.
          </p>
        </>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink/12 bg-white p-5">
      <h2 className="mb-4 font-brand text-[0.82rem] font-bold uppercase tracking-[0.06em] text-ink">{title}</h2>
      {children}
    </div>
  );
}
