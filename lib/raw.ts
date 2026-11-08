import fs from 'node:fs';
import path from 'node:path';

/** Texte brut d'une entrée (pour les extraits des cartes). */
export function corpsBrut(collection: string, slug: string) {
  try {
    const t = fs.readFileSync(path.join(process.cwd(), 'content', collection, slug + '.mdoc'), 'utf8');
    return t.replace(/^---\n[\s\S]*?\n---\n/, '');
  } catch {
    return '';
  }
}
