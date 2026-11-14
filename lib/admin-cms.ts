import "server-only";
import { neon } from "@neondatabase/serverless";
import "@/lib/admin-db-retry";

/* ═══════════════════════════════════════════════════════════════════
   Stockage des contenus du site dans Neon (Postgres).
   Une ligne par contenu : collection + identifiant (slug) + champs (jsonb)
   + texte principal (Markdoc) + statut. Les champs portent les mêmes noms
   que dans keystatic.config.ts : le site lit donc indifféremment Neon ou
   les fichiers du dossier content/ (voir lib/content.ts).
   ═══════════════════════════════════════════════════════════════════ */

export type Statut = "publie" | "brouillon";
export type ContenuRow = {
  collection: string;
  slug: string;
  data: Record<string, unknown>;
  corps: string | null;
  statut: Statut;
  maj: string;
};

export const dbActive = () => Boolean(process.env.DATABASE_URL);

let _sql: ReturnType<typeof neon> | null = null;
export function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

let tablesPretes: Promise<void> | null = null;
/** Crée les tables du site si elles n'existent pas (idempotent). */
export function ensureTables(): Promise<void> {
  if (!tablesPretes) {
    tablesPretes = (async () => {
      const q = sql();
      await q`create table if not exists cms_contenus (
        collection text not null,
        slug text not null,
        data jsonb not null default '{}'::jsonb,
        corps text,
        statut text not null default 'publie',
        maj timestamptz not null default now(),
        primary key (collection, slug)
      )`;
      await q`create table if not exists cms_reglages (
        cle text primary key,
        data jsonb not null default '{}'::jsonb,
        maj timestamptz not null default now()
      )`;
      await q`create table if not exists cms_collections_migrees (
        collection text primary key,
        maj timestamptz not null default now()
      )`;
    })().catch((e) => {
      tablesPretes = null;
      throw e;
    });
  }
  return tablesPretes;
}

const mapRow = (r: Record<string, unknown>): ContenuRow => ({
  collection: r.collection as string,
  slug: r.slug as string,
  data: (r.data as Record<string, unknown>) ?? {},
  corps: (r.corps as string) ?? null,
  statut: (r.statut as Statut) ?? "publie",
  maj: r.maj ? new Date(r.maj as string).toISOString() : "",
});

/** Collections dont la source de vérité est Neon (après la migration). */
export async function collectionsMigrees(): Promise<Set<string>> {
  await ensureTables();
  const rows = (await sql()`select collection from cms_collections_migrees`) as { collection: string }[];
  return new Set(rows.map((r) => r.collection));
}

export async function listContenus(collection: string, avecBrouillons = false): Promise<ContenuRow[]> {
  await ensureTables();
  const rows = avecBrouillons
    ? await sql()`select * from cms_contenus where collection = ${collection} order by maj desc`
    : await sql()`select * from cms_contenus where collection = ${collection} and statut = 'publie'`;
  return (rows as Record<string, unknown>[]).map(mapRow);
}

export async function getContenu(collection: string, slug: string): Promise<ContenuRow | null> {
  await ensureTables();
  const [r] = (await sql()`select * from cms_contenus where collection = ${collection} and slug = ${slug}`) as Record<string, unknown>[];
  return r ? mapRow(r) : null;
}

export async function upsertContenu(
  collection: string,
  slug: string,
  data: Record<string, unknown>,
  corps: string | null,
  statut: Statut,
  ancienSlug?: string | null,
): Promise<void> {
  await ensureTables();
  const q = sql();
  if (ancienSlug && ancienSlug !== slug) {
    await q`delete from cms_contenus where collection = ${collection} and slug = ${ancienSlug}`;
  }
  await q`insert into cms_contenus (collection, slug, data, corps, statut, maj)
    values (${collection}, ${slug}, ${JSON.stringify(data)}::jsonb, ${corps}, ${statut}, now())
    on conflict (collection, slug) do update
      set data = excluded.data, corps = excluded.corps, statut = excluded.statut, maj = now()`;
}

export async function deleteContenu(collection: string, slug: string): Promise<void> {
  await ensureTables();
  await sql()`delete from cms_contenus where collection = ${collection} and slug = ${slug}`;
}

export async function countContenus(): Promise<Record<string, { total: number; brouillons: number }>> {
  await ensureTables();
  const rows = (await sql()`select collection, count(*)::int as total,
      count(*) filter (where statut <> 'publie')::int as brouillons
    from cms_contenus group by collection`) as { collection: string; total: number; brouillons: number }[];
  return Object.fromEntries(rows.map((r) => [r.collection, { total: r.total, brouillons: r.brouillons }]));
}

/* ═══════════════ Réglages (singleton) ═══════════════ */

export async function getReglages(cle = "reglages"): Promise<Record<string, unknown> | null> {
  await ensureTables();
  const [r] = (await sql()`select data from cms_reglages where cle = ${cle}`) as { data: Record<string, unknown> }[];
  return r ? r.data : null;
}

export async function setReglages(data: Record<string, unknown>, cle = "reglages"): Promise<void> {
  await ensureTables();
  await sql()`insert into cms_reglages (cle, data, maj) values (${cle}, ${JSON.stringify(data)}::jsonb, now())
    on conflict (cle) do update set data = excluded.data, maj = now()`;
}

/* ═══════════════ Migration ═══════════════ */

export type Export = {
  genere: string;
  collections: Record<string, { slug: string; data: Record<string, unknown>; corps: string | null }[]>;
  singletons: Record<string, Record<string, unknown>>;
};

/** Copie dans Neon les contenus exportés des fichiers. N'écrase pas un contenu déjà modifié
    dans l'admin, sauf si `ecraser` est vrai. Marque chaque collection comme migrée. */
export async function migrer(exp: Export, ecraser = false): Promise<Record<string, number>> {
  await ensureTables();
  const q = sql();
  const bilan: Record<string, number> = {};
  for (const [collection, items] of Object.entries(exp.collections)) {
    let n = 0;
    for (const it of items) {
      if (ecraser) {
        await q`insert into cms_contenus (collection, slug, data, corps, statut)
          values (${collection}, ${it.slug}, ${JSON.stringify(it.data)}::jsonb, ${it.corps}, 'publie')
          on conflict (collection, slug) do update set data = excluded.data, corps = excluded.corps, maj = now()`;
      } else {
        await q`insert into cms_contenus (collection, slug, data, corps, statut)
          values (${collection}, ${it.slug}, ${JSON.stringify(it.data)}::jsonb, ${it.corps}, 'publie')
          on conflict (collection, slug) do nothing`;
      }
      n++;
    }
    await q`insert into cms_collections_migrees (collection) values (${collection}) on conflict (collection) do nothing`;
    bilan[collection] = n;
  }
  for (const [cle, data] of Object.entries(exp.singletons)) {
    if (ecraser || !(await getReglages(cle))) await setReglages(data, cle);
  }
  return bilan;
}
