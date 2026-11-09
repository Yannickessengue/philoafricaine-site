import fs from 'node:fs';
import path from 'node:path';

/** Fragments HTML du site d'origine (design/fragments), nettoyés par scripts/fragments.py. */
const DIR = path.join(process.cwd(), 'design', 'fragments');
const cache = new Map<string, string>();

export function fragment(nom: string): string {
  if (!cache.has(nom)) {
    const f = path.join(DIR, `${nom}.html`);
    cache.set(nom, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
  }
  return cache.get(nom)!;
}

type Entree = { f: string; title: string; desc: string };
let index: Record<string, Entree> | null = null;
function lireIndex() {
  if (!index) index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
  return index!;
}

export function pageStatique(adresse: string) {
  const e = lireIndex()[adresse];
  if (!e) return null;
  return { html: fragment(e.f), titre: e.title.replace(/\s*[—–-]\s*Groupe JOGOO$/, '').replace(/,\s*Groupe JOGOO$/, ''), description: e.desc };
}
export function adressesStatiques() {
  return Object.keys(lireIndex());
}

/** Échappement HTML pour les gabarits construits à partir des contenus. */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
