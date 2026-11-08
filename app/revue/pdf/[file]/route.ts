import fs from 'node:fs/promises';
import path from 'node:path';
import { reader, sousEmbargo, finEmbargo, dateFr } from '@/lib/content';

// Les PDF de la Revue ne sont servis qu'une fois l'embargo levé.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w.-]+\.pdf$/.test(file)) return new Response('Fichier introuvable', { status: 404 });
  const articles = await reader.collections.revue.all();
  const article = articles.find((a) => a.entry.pdf === `/revue/pdf/${file}`);
  if (!article) return new Response('Fichier introuvable', { status: 404 });
  const { datePublication, embargoMois } = article.entry;
  if (sousEmbargo(datePublication!, embargoMois)) {
    const fin = dateFr(finEmbargo(datePublication!, embargoMois).toISOString().slice(0, 10));
    return new Response(`Cet article de la Revue JOGOO est sous embargo jusqu’au ${fin}.`, {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'revue-pdf', file));
    return new Response(new Uint8Array(data), {
      headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${file}"`, 'cache-control': 'public, max-age=3600' },
    });
  } catch {
    return new Response('Fichier introuvable', { status: 404 });
  }
}
