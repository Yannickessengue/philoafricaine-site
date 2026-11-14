import 'server-only';
import { cache } from 'react';
import Markdoc from '@markdoc/markdoc';
import keystaticConfig from '@/keystatic.config';
import { dbActive, collectionsMigrees, listContenus, getReglages, type ContenuRow } from './admin-cms';

/* Lecteur « hybride » : même interface que le lecteur Keystatic (all, read, list, readOrThrow),
   mais, pour chaque rubrique migrée dans Neon (back-office /admin), les contenus viennent de la base.
   Tant que la migration n'est pas faite, ou si la base est injoignable, le site lit les fichiers. */

const contentField = (collection: string): string | null => {
  const c = (keystaticConfig.collections as Record<string, { format?: unknown }>)[collection];
  const f = c?.format as { contentField?: string } | undefined;
  return f?.contentField ?? null;
};

const migrees = cache(async (): Promise<Set<string> | null> => {
  if (!dbActive()) return null;
  try {
    return await collectionsMigrees();
  } catch (e) {
    console.error('[contenus] Neon injoignable, lecture des fichiers :', e);
    return null;
  }
});

const lignes = cache(async (collection: string): Promise<ContenuRow[] | null> => {
  const m = await migrees();
  if (!m || !m.has(collection)) return null;
  try {
    return await listContenus(collection);
  } catch (e) {
    console.error(`[contenus] lecture de « ${collection} » dans Neon impossible :`, e);
    return null;
  }
});

function versEntree(collection: string, r: ContenuRow) {
  const cf = contentField(collection);
  const entry: Record<string, unknown> = { ...r.data };
  if (cf) {
    const source = r.corps ?? '';
    entry[cf] = async () => ({ node: Markdoc.parse(source) });
  }
  return entry;
}

type Lecteur = ReturnType<typeof import('@keystatic/core/reader').createReader<typeof keystaticConfig['collections'], typeof keystaticConfig['singletons']>>;

export function lecteurHybride<R extends Lecteur>(fichiers: R): R {
  const collections = new Proxy(fichiers.collections as Record<string, any>, {
    get(cibles, nom: string) {
      const f = cibles[nom];
      if (!f) return f;
      return {
        ...f,
        async all(...args: unknown[]) {
          const rows = await lignes(nom);
          if (!rows) return f.all(...args);
          return rows.map((r) => ({ slug: r.slug, entry: versEntree(nom, r) }));
        },
        async list(...args: unknown[]) {
          const rows = await lignes(nom);
          if (!rows) return f.list(...args);
          return rows.map((r) => r.slug);
        },
        async read(slug: string, ...args: unknown[]) {
          const rows = await lignes(nom);
          if (!rows) return f.read(slug, ...args);
          const r = rows.find((x) => x.slug === slug);
          return r ? versEntree(nom, r) : null;
        },
        async readOrThrow(slug: string, ...args: unknown[]) {
          const rows = await lignes(nom);
          if (!rows) return f.readOrThrow(slug, ...args);
          const r = rows.find((x) => x.slug === slug);
          if (!r) throw new Error(`Contenu introuvable : ${nom}/${slug}`);
          return versEntree(nom, r);
        },
      };
    },
  });

  const singletons = new Proxy(fichiers.singletons as Record<string, any>, {
    get(cibles, nom: string) {
      const f = cibles[nom];
      if (!f) return f;
      return {
        ...f,
        async read(...args: unknown[]) {
          if (dbActive()) {
            try {
              const d = await getReglages(nom);
              if (d) return d;
            } catch (e) {
              console.error(`[contenus] réglages « ${nom} » dans Neon impossibles :`, e);
            }
          }
          return f.read(...args);
        },
        async readOrThrow(...args: unknown[]) {
          if (dbActive()) {
            try {
              const d = await getReglages(nom);
              if (d) return d;
            } catch {}
          }
          return f.readOrThrow(...args);
        },
      };
    },
  });

  return { ...fichiers, collections, singletons } as R;
}
