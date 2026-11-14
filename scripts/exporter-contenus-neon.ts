/* Exporte les contenus du dossier content/ vers donnees/contenus-neon.json,
   fichier embarqué dans le back-office pour le bouton « Migrer vers Neon ».
   Usage : npx tsx scripts/exporter-contenus-neon.ts */
import fs from 'node:fs';
import path from 'node:path';
import { createReader } from '@keystatic/core/reader';
import config from '../keystatic.config';

const EXCLUES = new Set(['commentaires']); // modération via GitHub, hors back-office

async function main() {
  const reader = createReader(process.cwd(), config);
  const out: { genere: string; collections: Record<string, unknown[]>; singletons: Record<string, unknown> } = {
    genere: new Date().toISOString(),
    collections: {},
    singletons: {},
  };
  for (const [nom, def] of Object.entries(config.collections!)) {
    if (EXCLUES.has(nom)) continue;
    const cf = (def.format as { contentField?: string } | undefined)?.contentField ?? null;
    const dossier = (def.path as string).replace(/\*.*$/, '');
    const items = await (reader.collections as any)[nom].all();
    out.collections[nom] = items.map(({ slug, entry }: { slug: string; entry: Record<string, unknown> }) => {
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(entry)) if (k !== cf && typeof v !== 'function') data[k] = v ?? null;
      let corps: string | null = null;
      if (cf) {
        const f = path.join(dossier, `${slug}.mdoc`);
        const brut = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
        const m = brut.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
        corps = (m ? m[1] : brut).trim();
      }
      return { slug, data, corps };
    });
  }
  for (const nom of Object.keys(config.singletons ?? {})) {
    const v = await (reader.singletons as any)[nom].read();
    if (v) out.singletons[nom] = v;
  }
  fs.mkdirSync('donnees', { recursive: true });
  fs.writeFileSync('donnees/contenus-neon.json', JSON.stringify(out));
  for (const [k, v] of Object.entries(out.collections)) console.log(k.padEnd(14), (v as unknown[]).length);
}
main();
