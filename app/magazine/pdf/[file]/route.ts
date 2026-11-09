import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { PDFDocument } from 'pdf-lib';
import { reader, sousEmbargo, finEmbargo, dateFr } from '@/lib/content';

/* PDF de Philo Africaine Magazine.
   - ?apercu=1 : les premières pages seulement (toujours accessibles) ;
   - sans paramètre : le numéro complet, refusé pendant l'embargo (12 mois par défaut).
   Les requêtes partielles (Range) sont acceptées, pour que la visionneuse charge les pages au fil de la lecture. */

const apercus = new Map<string, Uint8Array>();

async function trouver(file: string) {
  if (!/^[\w.-]+\.pdf$/.test(file)) return null;
  const numeros = await reader.collections.magazine.all();
  return numeros.find((n) => n.entry.pdf === `/magazine/pdf/${file}`) ?? null;
}

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const numero = await trouver(file);
  const chemin = path.join(process.cwd(), 'magazine-pdf', file);
  if (!numero || !fs.existsSync(chemin)) return new Response('Fichier introuvable', { status: 404 });
  const { datePublication, embargoMois, pagesApercu } = numero.entry;
  const url = new URL(req.url);
  const enteteBase = { 'content-type': 'application/pdf', 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=3600, s-maxage=86400' };

  if (url.searchParams.has('apercu')) {
    const cle = `${file}:${pagesApercu}`;
    if (!apercus.has(cle)) {
      const source = await PDFDocument.load(fs.readFileSync(chemin));
      const doc = await PDFDocument.create();
      const n = Math.min(Math.max(1, pagesApercu ?? 5), source.getPageCount());
      const pages = await doc.copyPages(source, Array.from({ length: n }, (_, i) => i));
      pages.forEach((p) => doc.addPage(p));
      doc.setTitle(`Philo Africaine Magazine n° ${numero.slug} — aperçu`);
      apercus.set(cle, await doc.save());
    }
    const data = apercus.get(cle)!;
    return new Response(new Uint8Array(data), { headers: { ...enteteBase, 'content-length': String(data.length), 'content-disposition': `inline; filename="apercu-${file}"` } });
  }

  if (sousEmbargo(datePublication!, embargoMois)) {
    const fin = dateFr(finEmbargo(datePublication!, embargoMois).toISOString().slice(0, 10));
    return new Response(`Ce numéro de Philo Africaine Magazine est sous embargo jusqu’au ${fin}.`, { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const taille = fs.statSync(chemin).size;
  const plage = req.headers.get('range')?.match(/bytes=(\d*)-(\d*)/);
  if (plage) {
    const debut = plage[1] ? Number(plage[1]) : Math.max(0, taille - Number(plage[2]));
    const fin = plage[1] && plage[2] ? Math.min(Number(plage[2]), taille - 1) : taille - 1;
    if (debut >= taille || debut > fin) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${taille}` } });
    const flux = Readable.toWeb(fs.createReadStream(chemin, { start: debut, end: fin })) as ReadableStream;
    return new Response(flux, { status: 206, headers: { ...enteteBase, 'content-length': String(fin - debut + 1), 'content-range': `bytes ${debut}-${fin}/${taille}` } });
  }
  const flux = Readable.toWeb(fs.createReadStream(chemin)) as ReadableStream;
  return new Response(flux, { headers: { ...enteteBase, 'content-length': String(taille), 'content-disposition': `inline; filename="${file}"` } });
}
