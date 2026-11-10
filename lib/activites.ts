import 'server-only';
import { reader } from '@/lib/content';
import { FORMULAIRES, type Champ, type Genre } from '@/lib/formulaires';

export type Activite = {
  slug: string;
  sorte: 'inscription' | 'candidature';
  genre: Genre;
  titre: string;
  type: string;
  quand: string;
  lieu: string;
  limite: string;
  fichier: string | null;
  ouvert: boolean;
  organisateur: string;
  champs: Champ[];
};

const ORGANISATEURS: Record<string, string> = {
  jogoo: 'Groupe JOGOO',
  fonds: 'Fonds Eboussi Boulaga',
  revue: 'Revue JOGOO',
  editions: 'Éditions JOGOO',
};

const valide = (s: string) => /^[a-z0-9-]{1,160}$/.test(s);
const aujourdhui = () => new Date().toISOString().slice(0, 10);

/** Rendez-vous de l’agenda ouvert à l’inscription. */
export async function getInscription(slug: string): Promise<Activite | null> {
  if (!valide(slug)) return null;
  const e = await reader.collections.agenda.read(slug);
  if (!e || !e.inscription) return null;
  const f = FORMULAIRES.inscription;
  return {
    slug,
    sorte: 'inscription',
    genre: 'inscription',
    titre: e.intitule,
    type: 'Inscription',
    quand: [e.dateAffichee || e.date, e.heure].filter(Boolean).join(' · '),
    lieu: e.lieu ?? '',
    limite: '',
    fichier: e.fichier ?? null,
    ouvert: !e.date || e.aConfirmer || e.date >= aujourdhui() || (e.dateAffichee ?? '').includes('–'),
    organisateur: ORGANISATEURS[e.organisateur ?? 'jogoo'] ?? 'Groupe JOGOO',
    champs: f.champs,
  };
}

/** Appel à contributions doté d’un formulaire de candidature. */
export async function getCandidature(slug: string): Promise<Activite | null> {
  if (!valide(slug)) return null;
  const e = await reader.collections.appels.read(slug);
  if (!e || !e.formulaire || e.formulaire === 'aucun') return null;
  const genre = e.formulaire as Genre;
  const seances = (e.seances ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
  const champs = FORMULAIRES[genre].champs.map((c) => (c.nom === 'seance' ? { ...c, options: [...seances, 'Indifférent'] } : c));
  return {
    slug,
    sorte: 'candidature',
    genre,
    titre: e.titre,
    type: e.type ?? 'Appel à contributions',
    quand: e.dateEvenement ?? '',
    lieu: e.lieu ?? '',
    limite: e.dateLimite ?? '',
    fichier: e.fichier ?? null,
    ouvert: Boolean(e.ouvert) && !(e.cloture && e.cloture < aujourdhui()),
    organisateur: e.lieu?.includes('Fonds Eboussi') ? 'Fonds Eboussi Boulaga' : 'Groupe JOGOO',
    champs,
  };
}

export async function slugsInscription() {
  return (await reader.collections.agenda.all()).filter((a) => a.entry.inscription).map((a) => a.slug);
}
export async function slugsCandidature() {
  return (await reader.collections.appels.all()).filter((a) => a.entry.formulaire && a.entry.formulaire !== 'aucun').map((a) => a.slug);
}
