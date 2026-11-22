import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Les vidéos des « 10 minutes du chant du coq » pèsent trop lourd pour le dépôt :
 * elles vivent sur Vercel Blob. Les contenus continuent de référencer
 * /medias/minutes/<fichier>.mp4 ; cette route renvoie vers le stockage.
 *
 * MEDIAS_BLOB_BASE : URL publique du magasin, sans barre finale,
 * par exemple https://xxxxxxxx.public.blob.vercel-storage.com
 *
 * Quand le fichier existe dans public/medias/minutes (site de test), Next le sert
 * directement et cette route n'est jamais appelée.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const base = process.env.MEDIAS_BLOB_BASE?.replace(/\/+$/, '');
  if (!base || !/^[\w.-]+\.(mp4|webm|jpg|png)$/i.test(fichier)) {
    return new NextResponse('Introuvable', { status: 404 });
  }
  return NextResponse.redirect(`${base}/minutes/${fichier}`, 307);
}
