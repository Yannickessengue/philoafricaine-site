import "server-only";
import { listContenus, getContenu } from "@/lib/admin-cms";
import { ENTITIES } from "@/lib/admin-cms-schema";

/** Toutes les entrées d'une rubrique (brouillons compris), pour l'admin. */
export async function fetchList(entity: string): Promise<Record<string, unknown>[]> {
  const e = ENTITIES[entity];
  if (!e) return [];
  const rows = await listContenus(entity, true);
  const dateKey = e.list.find((c) => c.kind === "date")?.key;
  const out: Record<string, unknown>[] = rows.map((r) => ({ ...r.data, id: r.slug, __statut: r.statut }));
  return out.sort((a, b) =>
    dateKey
      ? String(b[dateKey] ?? "").localeCompare(String(a[dateKey] ?? ""))
      : String(a[e.titleField] ?? "").localeCompare(String(b[e.titleField] ?? ""), "fr"),
  );
}

export async function fetchOne(entity: string, slug: string): Promise<Record<string, unknown> | null> {
  const e = ENTITIES[entity];
  if (!e) return null;
  const r = await getContenu(entity, slug);
  if (!r) return null;
  return {
    ...r.data,
    ...(e.contentField ? { [e.contentField]: r.corps ?? "" } : {}),
    __slug: r.slug,
    __statut: r.statut,
  };
}
