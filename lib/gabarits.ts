import fs from 'node:fs';
import path from 'node:path';

/** Fragments HTML du site d'origine (design/fragments), nettoyés par scripts/fragments.py. */
const DIR = path.join(process.cwd(), 'design', 'fragments');
const cache = new Map<string, string>();

/** Espaces fines insécables avant ; : ! ? » et après « dans le texte des fragments (hors balises, scripts et styles) :
    la ponctuation ne passe plus seule à la ligne. */
function insecables(html: string): string {
  return html
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/i)
    .map((bloc, i) =>
      i % 2
        ? bloc
        : bloc.replace(/>([^<]+)</g, (_, t: string) => `>${t.replace(/[ \u00a0]+([;:!?»])/g, '\u202f$1').replace(/«[ \u00a0]+/g, '«\u202f')}<`),
    )
    .join('');
}

export function fragment(nom: string): string {
  if (!cache.has(nom)) {
    const f = path.join(DIR, `${nom}.html`);
    cache.set(nom, fs.existsSync(f) ? insecables(fs.readFileSync(f, 'utf8')) : '');
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
