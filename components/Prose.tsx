import React from 'react';
import Markdoc, { Tag, type Node, type RenderableTreeNode } from '@markdoc/markdoc';
import { fields } from '@keystatic/core';
import { typo } from '@/lib/typo';

const base = fields.markdoc.createMarkdocConfig({});
// Un simple retour à la ligne dans l'éditeur reste un retour à la ligne à l'affichage.
const markdocConfig = { ...base, nodes: { ...base.nodes, softbreak: { transform: () => new Tag('br') } } };

const texte = (n: RenderableTreeNode): string =>
  typeof n === 'string' ? n : Tag.isTag(n) ? n.children.map(texte).join('') : '';

/** Un paragraphe très court placé juste avant un intertitre devient un surtitre. */
function surtitres(n: RenderableTreeNode): RenderableTreeNode {
  if (typeof n === 'string') return typo(n);
  if (!Tag.isTag(n)) return n;
  const enfants = n.children.map(surtitres);
  enfants.forEach((c, i) => {
    const suivant = enfants[i + 1];
    if (Tag.isTag(c) && c.name === 'p' && Tag.isTag(suivant) && /^h[2-4]$/.test(suivant.name)) {
      const t = texte(c).trim();
      if (t.length > 0 && t.length <= 48 && !/[.!?…]$/.test(t)) c.attributes = { ...c.attributes, className: 'surtitre' };
    }
  });
  n.children = enfants;
  return n;
}

/** Affiche un texte rédigé dans l'éditeur riche (gras, italique, intertitres, listes, images…). */
export function Prose({ node, className = '' }: { node: Node; className?: string }) {
  const renderable = surtitres(Markdoc.transform(node, markdocConfig));
  return <div className={`prose-jogoo ${className}`}>{Markdoc.renderers.react(renderable, React)}</div>;
}

/** Affiche un texte simple (paragraphes séparés par une ligne vide, **gras**, *italique*). */
export function TexteSimple({ texte, className = '' }: { texte?: string | null; className?: string }) {
  if (!texte) return null;
  return <Prose node={Markdoc.parse(texte)} className={className} />;
}

/* ——— Rendu « à la manière de l'original » : chaque balise reçoit les classes du gabarit d'origine ——— */
export type Classes = Partial<Record<'p' | 'pFort' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'li' | 'blockquote' | 'img' | 'a' | 'hr' | 'table', string>>;

function habiller(n: RenderableTreeNode, c: Classes): RenderableTreeNode {
  if (typeof n === 'string') return typo(n);
  if (!Tag.isTag(n)) return n;
  n.children = n.children.map((x) => habiller(x, c));
  const seulGras = n.name === 'p' && n.children.length === 1 && Tag.isTag(n.children[0]) && n.children[0].name === 'strong';
  const k = seulGras && c.pFort ? c.pFort : (c as Record<string, string | undefined>)[n.name];
  if (k) n.attributes = { ...n.attributes, className: k };
  if (seulGras && c.pFort) n.children = (n.children[0] as Tag).children;
  return n;
}

/** Transforme un texte de l'éditeur en blocs : avant le premier intertitre (chapeau), puis une section par intertitre H2. */
export function decouper(node: Node) {
  const arbre = Markdoc.transform(node, markdocConfig) as Tag;
  const enfants = Tag.isTag(arbre) ? arbre.children : [arbre];
  const chapeau: RenderableTreeNode[] = [];
  const sections: { titre: RenderableTreeNode | null; corps: RenderableTreeNode[] }[] = [];
  for (const e of enfants) {
    if (Tag.isTag(e) && e.name === 'h2') sections.push({ titre: e, corps: [] });
    else if (sections.length) sections[sections.length - 1].corps.push(e);
    else chapeau.push(e);
  }
  return { chapeau, sections };
}

export function rendre(noeuds: RenderableTreeNode | RenderableTreeNode[], c: Classes) {
  const liste = (Array.isArray(noeuds) ? noeuds : [noeuds]).map((x) => habiller(x, c));
  return Markdoc.renderers.react(liste, React);
}

export function versNoeud(texte?: string | null) {
  return Markdoc.parse(texte ?? '');
}

/** Premiers blocs d'un texte, jusqu'à environ `max` caractères (pour les listes). */
export function debut(node: Node, max: number) {
  const arbre = Markdoc.transform(node, markdocConfig) as Tag;
  const enfants = Tag.isTag(arbre) ? arbre.children : [arbre];
  const garde: RenderableTreeNode[] = [];
  let n = 0;
  for (const e of enfants) {
    if (n >= max && garde.length) break;
    garde.push(e);
    n += texte(e).length;
  }
  return { noeuds: garde, tronque: garde.length < enfants.length };
}
