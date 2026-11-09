import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { githubActif, lireJson, ecrireJson } from '@/lib/github';

type Commentaire = { nom: string; texte: string; date: string; masque?: boolean };
type Fichier = { edito?: string; liste: Commentaire[] };

const valide = (s: string) => /^[a-z0-9-]{1,120}$/.test(s);
const chemin = (slug: string) => `donnees/commentaires/${slug}.json`;

async function lire(slug: string): Promise<{ data: Fichier; sha?: string }> {
  if (githubActif()) {
    const { data, sha } = await lireJson<Fichier>(chemin(slug));
    return { data: data ?? { liste: [] }, sha };
  }
  const f = path.join(process.cwd(), chemin(slug));
  return { data: fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { liste: [] } };
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('edito') ?? '';
  if (!valide(slug)) return NextResponse.json({ liste: [] });
  try {
    const { data } = await lire(slug);
    return NextResponse.json({ ouvert: githubActif(), liste: data.liste.filter((c) => !c.masque) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ouvert: false, liste: [] });
  }
}

const derniers = new Map<string, number>();

export async function POST(req: Request) {
  const corps = await req.json().catch(() => ({}));
  const slug = String(corps.edito ?? '');
  const nom = String(corps.nom ?? '').trim().slice(0, 60);
  const texte = String(corps.texte ?? '').trim().slice(0, 4000);
  if (corps.site) return NextResponse.json({ ok: true }); // piège à robots
  if (!valide(slug) || nom.length < 2 || texte.length < 3) return NextResponse.json({ erreur: 'Nom et commentaire requis.' }, { status: 400 });
  if (!githubActif()) return NextResponse.json({ erreur: 'Les commentaires ne sont pas encore activés.' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'inconnu';
  if (Date.now() - (derniers.get(ip) ?? 0) < 20000) return NextResponse.json({ erreur: 'Merci de patienter quelques secondes.' }, { status: 429 });
  derniers.set(ip, Date.now());
  const c: Commentaire = { nom, texte, date: new Date().toISOString() };
  for (let essai = 0; essai < 3; essai++) {
    try {
      const { data, sha } = await lire(slug);
      data.edito = slug;
      data.liste.push(c);
      await ecrireJson(chemin(slug), data, `Commentaire sur « ${slug} »`, sha);
      return NextResponse.json({ ok: true, commentaire: c });
    } catch (e) {
      if (essai === 2) return NextResponse.json({ erreur: 'Envoi impossible pour le moment.' }, { status: 502 });
    }
  }
}
