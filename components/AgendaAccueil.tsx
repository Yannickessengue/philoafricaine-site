type Rdv = {
  slug: string;
  entry: {
    intitule: string;
    date: string | null;
    dateAffichee?: string | null;
    lieu?: string | null;
    aConfirmer?: boolean;
    heure?: string | null;
    organisateur?: string | null;
    inscription?: boolean;
    enDirect?: boolean;
    fichier?: string | null;
  };
};

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const ORG: Record<string, string> = { fonds: 'Fonds Eboussi Boulaga', revue: 'Revue JOGOO', editions: 'Éditions JOGOO', jogoo: 'Groupe JOGOO' };

function Pave({ e }: { e: Rdv['entry'] }) {
  const [a, m, j] = (e.date ?? '').split('-').map(Number);
  return (
    <span className="flex h-[3.6rem] w-[3.3rem] shrink-0 flex-col items-center justify-center bg-ink text-center text-paper">
      {e.aConfirmer ? (
        <>
          <span className="font-brand text-[0.8rem] font-black uppercase leading-none">{MOIS[m - 1]}</span>
          <span className="mt-0.5 font-brand text-[0.55rem] text-paper/60">{a}</span>
          <span className="mt-0.5 whitespace-nowrap font-brand text-[0.48rem] font-bold uppercase text-gold">à préciser</span>
        </>
      ) : (
        <>
          <span className="font-brand text-xl font-black leading-none">{j}</span>
          <span className="mt-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-wide text-gold">{MOIS[m - 1]}</span>
          <span className="font-brand text-[0.55rem] text-paper/55">{a}</span>
        </>
      )}
    </span>
  );
}

/** Colonne « Agenda » de l’accueil : les rendez-vous à venir, distincts des actualités. */
export function AgendaAccueil({ rdv, total }: { rdv: Rdv[]; total: number }) {
  const direct = rdv.some((r) => r.entry.enDirect);
  return (
    <div className="flex h-full flex-col border border-ink/12 border-t-4 border-t-gold bg-cream/70">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
        <p className="kicker">Agenda</p>
        {direct ? (
          <a href="/direct" className="inline-flex items-center gap-1.5 font-brand text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink hover:text-terra">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e53935] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e53935]" />
            </span>
            Direct
          </a>
        ) : (
          <span className="text-xs text-ink-soft">À venir</span>
        )}
      </div>
      {rdv.length ? (
        <ol className="flex-1 divide-y divide-ink/10">
          {rdv.map(({ slug, entry: e }) => {
            const [avant, ...apres] = e.intitule.split(' · ');
            const titre = apres.length ? apres.join(' · ') : avant;
            const org = apres.length ? avant : ORG[e.organisateur ?? 'jogoo'];
            return (
              <li key={slug} className="flex gap-3.5 px-5 py-4">
                <Pave e={e} />
                <div className="min-w-0">
                  <p className="font-brand text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terra-deep">{org}</p>
                  <a href={e.inscription ? `/inscription/${slug}` : '/actualites#agenda'} className="mt-0.5 line-clamp-3 block text-left font-serif text-[0.97rem] leading-snug text-ink [hyphens:none] hover:text-terra">
                    {titre}
                  </a>
                  <p className="mt-1 text-left text-xs leading-snug text-ink/55">{e.aConfirmer ? 'Date à préciser' : e.dateAffichee}{e.lieu ? ` · ${e.lieu.split(' · ')[0]}` : ''}</p>
                  {(e.inscription || e.enDirect) && (
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] font-bold uppercase tracking-[0.06em]">
                      {e.inscription && (
                        <a href={`/inscription/${slug}`} className="text-terra-deep underline decoration-terra/40 underline-offset-2 hover:text-terra">
                          S’inscrire
                        </a>
                      )}
                      {e.enDirect && (
                        <a href="/direct" className="text-ink underline decoration-ink/30 underline-offset-2 hover:text-terra">
                          Suivre en direct
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="flex-1 px-5 py-6 text-sm text-ink-soft">Aucun rendez-vous annoncé pour le moment.</p>
      )}
      <a className="border-t border-ink/10 px-5 py-3 text-sm font-semibold text-terra-deep hover:text-terra" href="/actualites#agenda">
        {total > rdv.length ? `Tout l’agenda (${total})` : 'Tout l’agenda'} →
      </a>
    </div>
  );
}
