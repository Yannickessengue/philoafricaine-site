import Link from "next/link";
import { listApplications, STATUS_LABEL, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin-applications";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const DOT: Record<ApplicationStatus, string> = {
  new: "bg-terra",
  review: "bg-gold",
  shortlist: "bg-terra-deep",
  rejected: "bg-ink/25",
  archived: "bg-ink/15",
};

export default async function AdminApplicationsPage(props: { params: Promise<Record<string, string>>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const filter = typeof sp?.statut === "string" && APPLICATION_STATUSES.includes(sp.statut as ApplicationStatus)
    ? (sp.statut as ApplicationStatus)
    : undefined;
  const rows = await listApplications(filter);
  const all = filter ? await listApplications() : rows;
  const counts = APPLICATION_STATUSES.map((s) => ({ s, n: all.filter((r) => r.status === s).length }));

  return (
    <div>
      <PageHeader
        kicker="Communauté"
        title="Candidatures"
        subtitle={`${all.length} candidature${all.length > 1 ? "s" : ""} reçue${all.length > 1 ? "s" : ""}.`}
      />

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <FilterChip label="Toutes" href="/admin/candidatures" active={!filter} n={all.length} />
        {counts.map(({ s, n }) => (
          <FilterChip
            key={s}
            label={STATUS_LABEL[s]}
            href={`/admin/candidatures?statut=${s}`}
            active={filter === s}
            n={n}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-ink/20 bg-white p-12 text-center text-sm text-ink/50">
          Aucune candidature{filter ? ` « ${STATUS_LABEL[filter]} »` : ""}.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-ink/12 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream/50 text-left text-[0.68rem] uppercase tracking-wide text-ink/45">
                <th className="px-4 py-2.5 font-semibold">Candidat·e</th>
                <th className="px-4 py-2.5 font-semibold">Poste</th>
                <th className="px-4 py-2.5 font-semibold">Pièces</th>
                <th className="px-4 py-2.5 font-semibold">Reçue</th>
                <th className="px-4 py-2.5 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink/8 last:border-0 hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/candidatures/${r.id}`} className="font-semibold text-ink hover:text-terra-deep">
                      {r.fullName}
                    </Link>
                    <div className="text-xs text-ink/40">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {r.posteN ? <span className="text-terra-deep">#{r.posteN}</span> : "—"} {r.posteTitle}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/50">
                    CV{r.letterUrl ? " · LM" : ""}{r.portfolioUrl ? " · Port." : ""}
                    {r.links.length ? ` · ${r.links.length} lien${r.links.length > 1 ? "s" : ""}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                      <span className={`h-1.5 w-1.5 rounded-full ${DOT[r.status]}`} aria-hidden />
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href, active, n }: { label: string; href: string; active: boolean; n: number }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-terra hover:text-terra-deep"
      }`}
    >
      {label}
      <span className={active ? "text-paper/60" : "text-ink/35"}>{n}</span>
    </Link>
  );
}
