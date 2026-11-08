import React from 'react';
import Markdoc, { type Node } from '@markdoc/markdoc';
import { fields } from '@keystatic/core';

const markdocConfig = fields.markdoc.createMarkdocConfig({});

/** Affiche un texte rédigé dans l'éditeur riche (gras, italique, intertitres, listes, images…). */
export function Prose({ node, className = '' }: { node: Node; className?: string }) {
  const renderable = Markdoc.transform(node, markdocConfig);
  return <div className={`prose-jogoo ${className}`}>{Markdoc.renderers.react(renderable, React)}</div>;
}

/** Affiche un texte simple (paragraphes séparés par une ligne vide, **gras**, *italique*). */
export function TexteSimple({ texte, className = '' }: { texte?: string | null; className?: string }) {
  if (!texte) return null;
  const node = Markdoc.parse(texte);
  return <Prose node={node} className={className} />;
}
