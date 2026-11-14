import Link from "next/link";
import { notFound } from "next/navigation";
import { ENTITIES } from "@/lib/admin-cms-schema";
import { fetchList } from "@/lib/admin-cms-fetch";
import { dbActive } from "@/lib/admin-cms";
import { PageHeader, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CmsListPage(props: { params: Promise<{ entity: string }> }) {
  const { entity } = await props.params;
  const schema = ENTITIES[entity];
  if (!schema) notFound();

  if (!dbActive()) {
    return <p className="mt-10 text-sm text-terra-deep">La base de données n’est pas configurée (variable DATABASE_URL manquante).</p>;
  }
  const rows = await fetchList(entity);

  return (
    <div>
      <PageHeader
        kicker="Contenus"
        title={schema.plural}
        subtitle={
          rows.length === 0
            ? undefined
            : `${rows.length} ${rows.length > 1 ? "éléments" : "élément"}`
        }
        action={{ href: `/admin/${schema.route}/nouveau`, label: `+ ${schema.singular}` }}
      />

      {rows.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-ink/20 bg-white p-12 text-center">
          <p className="text-sm text-ink-soft">Aucun contenu dans la base pour l’instant. Si le site en affiche déjà, lancez d’abord la migration depuis le tableau de bord.</p>
          <Link
            href={`/admin/${schema.route}/nouveau`}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-ink px-4 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra"
          >
            Créer le premier
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-ink/12 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream/50 text-left text-[0.68rem] uppercase tracking-wide text-ink/45">
                {schema.list.map((c) => (
                  <th key={c.key} className="px-4 py-2.5 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-semibold">Statut</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-b border-ink/8 last:border-0 hover:bg-cream/40">
                  {schema.list.map((c, i) => {
                    const val = r[c.key];
                    return (
                      <td key={c.key} className="px-4 py-3">
                        {i === 0 ? (
                          <Link href={`/admin/${schema.route}/${encodeURIComponent(String(r.id))}`} className="font-semibold text-ink hover:text-terra-deep">
                            {String(val ?? "—") || "(sans titre)"}
                          </Link>
                        ) : c.kind === "status" ? (
                          <StatusPill status={val === "published" ? "published" : "draft"} />
                        ) : c.kind === "bool" ? (
                          <span className={val ? "text-terra-deep" : "text-ink/30"}>{val ? "oui" : "—"}</span>
                        ) : c.kind === "date" ? (
                          <span className="text-ink-soft">
                            {val ? new Date(String(val)).toLocaleDateString("fr-FR") : "—"}
                          </span>
                        ) : (
                          <span className="text-ink-soft">{String(val ?? "—") || "—"}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <StatusPill status={r.__statut === "brouillon" ? "draft" : "published"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/${schema.route}/${encodeURIComponent(String(r.id))}`} className="text-xs font-semibold text-terra-deep hover:text-terra">
                      Éditer
                    </Link>
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
