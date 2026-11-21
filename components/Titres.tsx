import { Fragment } from 'react';
import donnees from '@/donnees/titres-oeuvres.json';

/**
 * Met en italique les titres d'œuvres (livres, revues, films) dans un texte brut.
 * Les champs libres du CMS — intitulés d'agenda, séries de podcasts, repères de
 * chronologie — sont affichés tels quels : cette fonction applique la règle
 * typographique du site sans demander aux rédacteurs d'écrire du Markdown.
 * Pour les champs rendus en Markdoc, écrire *Titre* suffit.
 */
const echapper = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TITRES: string[] = [...donnees.titres].sort((a, b) => b.length - a.length);
const SOUS: string[] = donnees.sous;
const MOTIF = new RegExp(`(${TITRES.map(echapper).join('|')})(${SOUS.map(echapper).join('|')})?`, 'g');

export function italiques(texte?: string | null) {
  if (!texte) return texte ?? null;
  const morceaux: Array<string | { t: string }> = [];
  let dernier = 0;
  for (const m of texte.matchAll(MOTIF)) {
    const i = m.index ?? 0;
    if (i > dernier) morceaux.push(texte.slice(dernier, i));
    morceaux.push({ t: m[0] });
    dernier = i + m[0].length;
  }
  if (!morceaux.length) return texte;
  if (dernier < texte.length) morceaux.push(texte.slice(dernier));
  return (
    <>
      {morceaux.map((x, i) => (typeof x === 'string' ? <Fragment key={i}>{x}</Fragment> : <em key={i}>{x.t}</em>))}
    </>
  );
}
