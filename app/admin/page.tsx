import Link from "next/link";
import { listForModeration } from "@/lib/admin-comments";
import { subscriberStats } from "@/lib/admin-newsletter";
import { countContenus, collectionsMigrees, dbActive } from "@/lib/admin-cms";
import { ENTITIES, ENTITY_KEYS } from "@/lib/admin-cms-schema";
import { applicationStats } from "@/lib/admin-applications";
import { analyticsOverview, analyticsSeries, analyticsHasData } from "@/lib/admin-analytics";
import { PageHeader } from "@/components/admin/ui";
import { AreaTimeChart } from "@/components/admin/charts";
import { Migration } from "@/components/admin/migration";
import { fmt } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

/** Une requête qui échoue (table absente, base injoignable) n'empêche pas d'afficher le tableau de bord. */
async function sur<T>(p: Promise<T>, repli: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error("[admin]", e);
    return repli;
  }
}

export default async function AdminDashboard() {
  if (!dbActive()) {
    return (
      <div>
        <PageHeader kicker="Groupe JOGOO" title="Tableau de bord" />
        <p className="mt-8 text-sm text-terra-deep">
          La base de données n’est pas configurée : ajoutez la variable DATABASE_URL (Neon) dans Vercel, puis redéployez.
        </p>
      </div>
    );
  }
  const [comments, subs, counts, migrees, apps, statsHasData] = await Promise.all([
    sur(listForModeration(30), []),
    sur(subscriberStats(), { confirmed: 0, pending: 0 } as Awaited<ReturnType<typeof subscriberStats>>),
    sur(countContenus(), {} as Record<string, { total: number; brouillons: number }>),
    sur(collectionsMigrees(), new Set<string>()),
    sur(applicationStats(), { new: 0 } as Awaited<ReturnType<typeof applicationStats>>),
    sur(analyticsHasData(), false),
  ]);
  const [statsOv, statsSeries] = statsHasData
    ? await Promise.all([analyticsOverview(30), analyticsSeries(30)])
    : [null, null];
  const visible = comments.filter((c) => c.status === "visible" && !c.deleted).length;
  const recent = comments.slice(0, 4);
  const aMigrer = ENTITY_KEYS.filter((k) => !migrees.has(k));

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sections = ENTITY_KEYS.map((k) => {
    const c = counts[k] ?? { total: 0, brouillons: 0 };
    return {
      label: ENTITIES[k].plural,
      route: ENTITIES[k].route,
      count: c.total,
      sub: !migrees.has(k) ? "à migrer" : c.brouillons ? `${c.brouillons} brouillon${c.brouillons > 1 ? "s" : ""}` : "tous publiés",
    };
  });

  return (
    <div>
      <PageHeader kicker="Groupe JOGOO" title="Tableau de bord" subtitle={`Nous sommes le ${today}.`} />

      <Migration aMigrer={aMigrer.map((k) => ENTITIES[k].plural)} />

      {/* Bandeau audience */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Candidatures à traiter" value={apps.new} href="/admin/candidatures" accent="terra" />
        <MiniStat label="Commentaires visibles" value={visible} href="/admin/commentaires" accent="terra" />
        <MiniStat label="Abonnés à la lettre" value={subs.confirmed} href="/admin/newsletter" accent="gold" />
        <MiniStat label="En attente de confirmation" value={subs.pending} href="/admin/newsletter" accent="muted" />
      </div>

      {/* Fréquentation */}
      {statsOv && statsSeries && (
        <div className="mt-4 rounded-lg border border-ink/12 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/8 pb-3">
            <h2 className="font-brand text-sm font-bold uppercase tracking-wide text-ink">Fréquentation · 30 jours</h2>
            <Link href="/admin/statistiques" className="text-xs font-semibold text-terra-deep hover:text-terra">
              Toutes les statistiques →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-10 gap-y-2">
            <span className="text-sm">
              <span className="display-title text-2xl leading-none text-ink">{fmt(statsOv.visitors)}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-ink/45">visiteurs</span>
            </span>
            <span className="text-sm">
              <span className="display-title text-2xl leading-none text-ink">{fmt(statsOv.views)}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-ink/45">pages vues</span>
            </span>
            {statsOv.live > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-terra-deep">
                <span className="h-2 w-2 animate-pulse rounded-full bg-terra" aria-hidden />
                {statsOv.live} en direct
              </span>
            )}
          </div>
          <div className="mt-3">
            <AreaTimeChart data={statsSeries} />
          </div>
        </div>
      )}

      {/* Contenus */}
      <h2 className="mt-10 border-b border-ink/10 pb-2 font-brand text-sm font-bold uppercase tracking-wide text-ink">
        Contenus du site
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <div key={s.route} className="group flex flex-col border border-ink/12 bg-white p-4 transition-colors hover:border-terra">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{s.label}</span>
              <Link
                href={`/admin/${s.route}/nouveau`}
                title={`Ajouter — ${s.label}`}
                className="grid h-6 w-6 place-items-center rounded-full border border-ink/15 text-ink/40 transition-colors hover:border-terra hover:bg-terra hover:text-white"
              >
                +
              </Link>
            </div>
            <div className="mt-3 display-title text-3xl leading-none text-ink">{s.count}</div>
            <div className="mt-1 text-xs text-ink/45">{s.sub}</div>
            <Link
              href={`/admin/${s.route}`}
              className="mt-3 text-xs font-semibold text-terra-deep transition-colors hover:text-terra"
            >
              Gérer →
            </Link>
          </div>
        ))}
      </div>

      {/* Derniers commentaires */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between border-b border-ink/10 pb-2">
          <h2 className="font-brand text-sm font-bold uppercase tracking-wide text-ink">Derniers commentaires</h2>
          <Link href="/admin/commentaires" className="text-xs font-semibold text-terra-deep hover:text-terra">
            Tout voir
          </Link>
        </div>
        <ul className="mt-1 divide-y divide-ink/8">
          {recent.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex items-baseline gap-2">
                <span className="font-brand text-sm font-bold text-ink">{c.author}</span>
                <span className="text-xs text-ink/40">{c.slug}</span>
                {c.status === "hidden" && (
                  <span className="text-[0.65rem] font-semibold uppercase text-terra-deep">masqué</span>
                )}
                <span className="ml-auto text-xs text-ink/35">
                  {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{c.body || "—"}</p>
            </li>
          ))}
          {recent.length === 0 && <li className="py-6 text-center text-sm text-ink/50">Aucun commentaire.</li>}
        </ul>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent: "terra" | "gold" | "muted";
}) {
  const dot = accent === "terra" ? "bg-terra" : accent === "gold" ? "bg-gold" : "bg-ink/20";
  return (
    <Link href={href} className="flex items-center gap-3 border border-ink/12 bg-white p-4 transition-colors hover:border-terra">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className="display-title text-2xl leading-none text-ink">{value}</span>
      <span className="text-xs uppercase tracking-wide text-ink/45">{label}</span>
    </Link>
  );
}
