import { typo } from './typo';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

const byDateDesc = <T extends { entry: { date?: string | null } }>(a: T, b: T) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '');

export async function getEditos() {
  return (await reader.collections.editos.all()).sort(byDateDesc);
}
export async function getActualites() {
  return (await reader.collections.actualites.all()).sort(byDateDesc);
}
export async function getPublications() {
  const all = await reader.collections.publications.all();
  return all.sort((a, b) => Number(b.entry.une) - Number(a.entry.une) || a.entry.titre.localeCompare(b.entry.titre));
}
export async function getAgenda() {
  const all = await reader.collections.agenda.all();
  return all.sort((a, b) => a.entry.date!.localeCompare(b.entry.date!) || a.entry.ordre! - b.entry.ordre!);
}
export async function getRevue() {
  const all = await reader.collections.revue.all();
  return all.sort((a, b) => a.entry.ordre! - b.entry.ordre!);
}
export async function getPages() {
  return reader.collections.pages.all();
}
export async function getPageByPath(path: string) {
  const pages = await getPages();
  return pages.find((p) => p.entry.adresse === path);
}

/* ---------- Embargo de la Revue JOGOO ---------- */
export function finEmbargo(datePublication: string, mois: number | null) {
  const d = new Date(datePublication + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + (mois ?? 0));
  return d;
}
export function sousEmbargo(datePublication: string, mois: number | null, now = new Date()) {
  return (mois ?? 0) > 0 && now < finEmbargo(datePublication, mois);
}

/* ---------- Dates et textes ---------- */
export function dateFr(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', { ...opts, timeZone: 'UTC' })
    .format(new Date(iso + 'T00:00:00Z'))
    .replace(/^1 /, '1er ');
}

export function extrait(markdown: string, max = 260) {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const t = plain.length > max ? plain.slice(0, plain.lastIndexOf(' ', max)).replace(/[\s«(,;:—–-]+$/, '') + '…' : plain;
  return typo(t);
}

export function motsCles(s?: string | null) {
  return (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
}

/** Retire une adresse e-mail d'une signature (« Nom - nom@exemple.org » → « Nom »). */
export function sansEmail(s?: string | null) {
  return (s ?? '').replace(/\s*[-–·,]?\s*[\w.+-]+@[\w-]+\.[\w.-]+/g, '').trim();
}

/* ——— Philo Africaine Magazine : numéros en ligne ——— */
export async function getMagazine() {
  const items = await reader.collections.magazine.all();
  return items.sort((a, b) => (b.entry.datePublication ?? '').localeCompare(a.entry.datePublication ?? ''));
}
