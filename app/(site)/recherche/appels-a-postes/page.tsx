import { reader } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { EnTete } from '@/components/ui';
import { Postes } from '@/components/Postes';
import { CANDIDATURES_CLOSES } from '@/lib/postes';

export const metadata = { title: 'Directeur / directrice de programmes de recherche', description: 'Appels à postes du Groupe JOGOO : directions de programmes de recherche sur dix axes.' };

const COMMUNES = [
  'Participation aux réunions de coordination du Groupe JOGOO',
  'Contribution à la revue scientifique du Groupe',
  'Encadrement des chercheurs juniors',
  'Développement de réseaux de collaboration et recherche de financements',
  'Représentation du Groupe dans les événements scientifiques',
  'Évaluation périodique des programmes et rédaction de rapports d’activité',
];

export default async function AppelsPostes() {
  const postes = (await reader.collections.postes.all())
    .sort((a, b) => (a.entry.numero ?? 0) - (b.entry.numero ?? 0))
    .map((p) => ({
      numero: p.entry.numero ?? 0,
      intitule: p.entry.intitule,
      pourvu: Boolean(p.entry.pourvu),
      missions: corpsBrut('postes', p.slug).split('\n').map((l) => l.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean),
    }));
  const ouverts = CANDIDATURES_CLOSES ? 0 : postes.filter((p) => !p.pourvu).length;
  return (
    <>
      <EnTete
        kicker="Recherche · Carrières"
        titre="Directeur / directrice de programmes de recherche"
        intro="Le mot « Jogoo » veut dire « coq » en swahili, pour marquer le caractère fonctionnel du projet : une philosophie du matin qui se donne pour mission de réveiller et d’éveiller les consciences sur des problèmes et des problématiques de l’humain."
        icone="action"
      />
      <div className="mx-auto max-w-4xl px-5 py-14 sm:py-16">
        <div className="grid gap-6 rounded-xl border border-ink/12 bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="kicker">{CANDIDATURES_CLOSES ? 'Candidatures closes' : 'Candidature en ligne'}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {CANDIDATURES_CLOSES
                ? 'Programmes lancés en octobre 2025. L’appel à candidatures est clos : les dossiers reçus sont en cours d’examen et chaque candidat·e recevra une réponse par e-mail. Les fiches de poste restent consultables.'
                : 'Programmes lancés en octobre 2025. Présentez-vous en quelques lignes, puis joignez votre CV, votre lettre de motivation et, si vous le souhaitez, un portfolio : la rédaction accuse réception par e-mail.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-cream/60 px-4 py-3 text-center">
            <span className="font-serif text-3xl leading-none text-terra">{ouverts}</span>
            <span className="text-xs uppercase leading-tight tracking-wide text-ink/50">
              poste{ouverts > 1 ? 's' : ''}
              <br />
              ouvert{ouverts > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <section className="mt-10">
          <h2 className="display-title text-2xl text-terra sm:text-3xl">Responsabilités communes</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
            {COMMUNES.map((c) => (
              <li key={c} className="pl-4 -indent-4">
                <span className="text-terra">✱</span> {c}
              </li>
            ))}
          </ul>
        </section>
        <Postes postes={postes} clos={CANDIDATURES_CLOSES} />
      </div>
    </>
  );
}
