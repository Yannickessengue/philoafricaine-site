import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { getMagazine, sousEmbargo, finEmbargo, dateFr } from './content';

const pages = new Map<string, number>();

/** Nombre de pages du PDF d'un numéro (lu une fois, puis gardé en mémoire). */
async function compterPages(pdf?: string | null) {
  if (!pdf) return 0;
  const file = path.join(process.cwd(), 'magazine-pdf', path.basename(pdf));
  if (!fs.existsSync(file)) return 0;
  if (!pages.has(file)) {
    const doc = await PDFDocument.load(fs.readFileSync(file), { updateMetadata: false });
    pages.set(file, doc.getPageCount());
  }
  return pages.get(file)!;
}

export async function numerosEnLigne() {
  const liste = await getMagazine();
  return Promise.all(
    liste.map(async (n) => {
      const e = n.entry;
      const embargo = sousEmbargo(e.datePublication!, e.embargoMois);
      return {
        slug: n.slug,
        ...e,
        embargo,
        fin: dateFr(finEmbargo(e.datePublication!, e.embargoMois).toISOString().slice(0, 10)),
        total: await compterPages(e.pdf),
      };
    }),
  );
}
