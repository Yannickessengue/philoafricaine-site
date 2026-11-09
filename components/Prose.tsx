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
