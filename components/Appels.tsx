import { reader } from '@/lib/content';
import { Prose } from '@/components/Prose';

export async function getAppels() {
  const items = (await reader.collections.appels.all()).sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const today = new Date().toISOString().slice(0, 10);
  return Promise.all(
    items.map(async (a) => ({
      ...a,
      ouvert: Boolean(a.entry.ouvert) && !(a.entry.cloture && a.entry.cloture < today),
      corps: (await a.entry.descriptif()).node,
    })),
  );
}

/** Carte d'appel à contributions, au gabarit de la page Recherche d'origine. */
export function CarteAppel({ a }: { a: Awaited<ReturnType<typeof getAppels>>[number] }) {
  const e = a.entry;
  return (
    <div className={`flex flex-col gap-3 border border-ink/10 p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${a.ouvert ? 'bg-white' : 'bg-cream/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="kicker">{e.type}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${a.ouvert ? 'bg-terra/10 text-terra-deep' : 'bg-ink/8 text-ink/50'}`}>
          {a.ouvert ? 'Ouvert' : 'Clos'}
        </span>
      </div>
      <h3 className="font-brand text-base font-bold text-ink">{e.titre}</h3>
      {(e.dateEvenement || e.lieu) && (
        <p className="text-sm text-ink-soft">
          {e.dateEvenement}
          {e.dateEvenement && e.lieu && <br />}
          {e.lieu}
        </p>
      )}
      <Prose node={a.corps} className="!max-w-none text-sm leading-relaxed [&>p]:!text-left" />
      {e.dateLimite && <p className={`text-sm font-semibold ${a.ouvert ? 'text-terra-deep' : 'text-ink/45 line-through decoration-1'}`}>{e.dateLimite}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        {a.ouvert && e.formulaire && e.formulaire !== 'aucun' && (
          <a className="bg-terra px-4 py-2 font-brand text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-ink" href={`/candidature/${a.slug}`}>
            Candidater en ligne
          </a>
        )}
        {e.fichier && (
          <a className="text-sm font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href={e.fichier} target="_blank" rel="noreferrer">
            {e.fichierLibelle || 'Télécharger l’appel (PDF)'}
          </a>
        )}
        {e.contact && (
          <a className="text-sm font-semibold text-ink-soft underline underline-offset-2 hover:text-terra" href={`mailto:${e.contact}`}>
            {e.contact}
          </a>
        )}
      </div>
    </div>
  );
}
