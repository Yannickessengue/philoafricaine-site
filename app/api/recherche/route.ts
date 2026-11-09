import { NextResponse } from 'next/server';
import { reader, getEditos, getActualites, getPublications, getRevue, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { adressesStatiques, pageStatique } from '@/lib/gabarits';

export const revalidate = 3600;

const texte = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

/** Index de recherche du site (pages d'origine + contenus de l'administration). */
export async function GET() {
  const [editos, actus, pubs, revue, flashs, auteurs] = await Promise.all([
    getEditos(),
    getActualites(),
    getPublications(),
    getRevue(),
    reader.collections.flash.all(),
    reader.collections.auteurs.all(),
  ]);
  const items: { t: string; u: string; k: string; x: string }[] = [];
  const corps = (c: string, s: string, n = 600) => extrait(corpsBrut(c, s), n);
  editos.forEach((e) => items.push({ t: e.entry.titre, u: `/edito/${e.slug}`, k: 'Édito', x: `${e.entry.accroche ?? ''} ${e.entry.signature ?? ''} ${corps('editos', e.slug, 1200)}` }));
  actus.forEach((a) => items.push({ t: a.entry.titre, u: `/actualites/${a.slug}`, k: 'Actualité', x: `${a.entry.resume ?? ''} ${a.entry.auteur ?? ''} ${corps('actualites', a.slug, 1200)}` }));
  pubs.forEach((p) => items.push({ t: p.entry.titre, u: `/publications/${p.slug}`, k: 'Note de lecture', x: `${p.entry.auteurOuvrage ?? ''} ${p.entry.motsCles ?? ''} ${p.entry.resume ?? ''}` }));
  auteurs.forEach((a) => items.push({ t: a.entry.nom, u: `/publications/auteurs/${a.slug}`, k: 'Auteur', x: corps('auteurs', a.slug, 300) }));
  revue.forEach((r) => items.push({ t: r.entry.titre, u: `/sous-sites/revue-jogoo/${r.slug}`, k: 'Revue JOGOO', x: `${r.entry.auteurs ?? ''} ${r.entry.motsCles ?? ''} ${r.entry.resume ?? ''}` }));
  flashs.forEach((f) => items.push({ t: f.entry.titre, u: `/flash#${f.slug}`, k: 'Flash', x: `${f.entry.auteur ?? ''} ${f.entry.lieu ?? ''} ${corps('flash', f.slug, 800)}` }));
  for (const adr of adressesStatiques()) {
    const s = pageStatique(adr)!;
    items.push({ t: s.titre, u: adr, k: adr.startsWith('/sous-sites') ? 'Sous-site' : 'Page', x: `${s.description} ${texte(s.html).slice(0, 2500)}` });
  }
  // Extrait court pour l'affichage, texte complet pour la recherche
  return NextResponse.json(items.map((i) => ({ ...i, x: sansEmail(i.x).replace(/\s+/g, ' ').trim().slice(0, 3000) })));
}
