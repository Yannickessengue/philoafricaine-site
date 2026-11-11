// JOGOO AI : variables ANTHROPIC_API_KEY et JOGOO_AI_CORPUS_CLE (Vercel). Clé Anthropic renouvelée le 11/11/2026.
import 'server-only';
import { createDecipheriv } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Notice } from './corpus';

/* Bibliothèque privée de JOGOO AI : textes intégraux autorisés (Terroirs, cours, textes du Groupe…)
   et notices des ouvrages protégés de la bibliothèque du Groupe.
   Le fichier content/jogoo-ai/bibliotheque.enc est chiffré (AES-256-GCM) : le dépôt GitHub étant public,
   seul le serveur, qui possède la clé JOGOO_AI_CORPUS_CLE (variable Vercel), peut le lire.
   Ces textes servent uniquement à la recherche de l'assistant : ils ne sont jamais publiés en entier. */

const caches = new Map<string, Notice[]>();

/** Bibliothèque publique (textes autorisés + notices). */
export const bibliothequePrivee = () => lire('bibliotheque.enc');
/** Espace chercheurs (accès par code) : tous les livres en texte intégral, sauf les inédits d'Eboussi. */
export const bibliothequeChercheurs = () => lire('chercheurs.enc');

async function lire(fichier: string): Promise<Notice[]> {
  const deja = caches.get(fichier);
  if (deja) return deja;
  let cache: Notice[] = [];
  const cle = process.env.JOGOO_AI_CORPUS_CLE?.trim();
  if (!cle) return cache;
  try {
    const brut = await readFile(path.join(process.cwd(), 'content/jogoo-ai', fichier));
    const iv = brut.subarray(0, 12);
    const tag = brut.subarray(12, 28);
    const d = createDecipheriv('aes-256-gcm', Buffer.from(cle, 'base64'), iv);
    d.setAuthTag(tag);
    const json = gunzipSync(Buffer.concat([d.update(brut.subarray(28)), d.final()])).toString('utf8');
    cache = JSON.parse(json) as Notice[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') console.error('Bibliothèque privée illisible', fichier, e);
    cache = [];
  }
  caches.set(fichier, cache);
  return cache;
}
