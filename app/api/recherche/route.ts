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
  const NOUVEAUX: [string, string, string][] = [
    ['/sous-sites/jogoo-ai', 'JOGOO AI — Assistant de recherche en philosophies africaines', 'Intelligence artificielle, assistant, IA, interroger des textes, bibliothèque, philosophes, concepts, ressources.'],
    ['/sous-sites/jogoo-ai/bibliotheque', 'Bibliothèque JOGOO AI', 'Notices d’ouvrages, articles, notes de lecture, archives, filtres par auteur, langue, accès.'],
    ['/sous-sites/fonds-eboussi-boulaga/eboussi-studies', 'Revue Eboussi Studies', 'Revue du Fonds Eboussi Boulaga, n° 1 Reprise de soi et décolonisation des savoirs.'],
    ['/sous-sites/philo-africaine-magazine', 'Philo Africaine Magazine', 'Du philosophique au philosophant 2.0. Numéro inaugural : Mythologies africaines et pensée philosophique. Rubriques, contribuer, acheter et s’abonner.'],
    ['/sous-sites/philo-africaine-magazine/dossier', 'Le dossier MAPP — Philo Africaine Magazine', 'Journées MAPP des 29 et 30 avril 2025, huit notices de communication : Savadogo, Amenguele Nyimi, Madounyem, Sidi Mohamed, Nzenti Kopa, Chafai, Sriti, El Fahmy, Tchinemang, Ibou Dramé Sylla. Mythe, raison, Towa.'],
    ['/sous-sites/philo-africaine-magazine/acheter', 'Acheter et s’abonner — Philo Africaine Magazine', 'Tarifs, commande, abonnement : 3 000 FCFA, 5 €, numérique 2 €.'],
    ['/sous-sites/editions-jogoo', 'Éditions JOGOO', 'Penser l’Afrique, publier le monde. Maison d’édition en préfiguration du Groupe JOGOO.'],
    ['/sous-sites/editions-jogoo/catalogue', 'Catalogue — Éditions JOGOO', 'Dix collections : Sankofa, Muntu, Savoirs endogènes, Transversalités, T(r)opiques, Écologie des savoirs, Herméneutique, éthique et bioéthique, Transtopicités, Revues. Projets de livres.'],
    ['/sous-sites/editions-jogoo/publier', 'Publier chez nous — Éditions JOGOO', 'Présenter un projet de livre, manuscrit, collectif, traduction.'],
    ['/sous-sites/sankofa-communications', 'Sankofa Communications', 'L’Afrique du futur. Agence de communication pour la recherche : événementiel scientifique, création visuelle, traduction, édition.'],
    ['/sous-sites/sankofa-communications/devis', 'Demander un devis — Sankofa Communications', 'Devis colloque, affiche, programme, traduction, interprétariat.'],
  ];
  NOUVEAUX.forEach(([u, t, x]) => items.push({ t, u, k: 'Sous-site', x }));
  for (const adr of adressesStatiques()) {
    if (/^\/sous-sites\/(philo-africaine-magazine|editions-jogoo|sankofa-communications)/.test(adr)) continue;
    const s = pageStatique(adr)!;
    items.push({ t: s.titre, u: adr, k: adr.startsWith('/sous-sites') ? 'Sous-site' : 'Page', x: `${s.description} ${texte(s.html).slice(0, 2500)}` });
  }
  // Extrait court pour l'affichage, texte complet pour la recherche
  return NextResponse.json(items.map((i) => ({ ...i, x: sansEmail(i.x).replace(/\s+/g, ' ').trim().slice(0, 3000) })));
}
