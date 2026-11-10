import { getAgenda, dateFr } from '@/lib/content';
import { Externe } from '@/components/Consentement';

export const metadata = {
  title: 'En direct',
  description: 'Conférences, séminaires et webinaires du Groupe JOGOO et du Fonds Eboussi Boulaga, à suivre en direct.',
};
export const revalidate = 3600;

const CHAINE = 'UChS2D_zSk2vch6rN9QC52lw';
const YOUTUBE = 'https://www.youtube.com/@groupejogoo/streams';
const FACEBOOK = 'https://www.facebook.com/Philosophie-africaine-Débats-et-questions-169580879726591/';

/** Salle de diffusion permanente : la réunion Zoom est retransmise sur YouTube (et Facebook) et s’affiche ici. */
export default async function Direct() {
  const mois = new Date().toISOString().slice(0, 7);
  const prochains = (await getAgenda()).filter((a) => a.entry.enDirect && a.entry.date!.slice(0, 7) >= mois);
  return (
    <section className="bg-[#120f0d] text-paper">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <p className="inline-flex items-center gap-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e53935] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e53935]" />
          </span>
          En direct
        </p>
        <h1 className="display-title mt-3 text-4xl text-paper sm:text-6xl">La salle de diffusion</h1>
        <p className="mt-4 max-w-2xl font-serif text-lg italic text-paper/75">
          Conférences, séminaires et webinaires retransmis en direct depuis Zoom. Le lecteur s’allume dès que la diffusion commence ; rechargez la page à l’heure annoncée.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="aspect-video w-full overflow-hidden border border-paper/10 bg-black">
            <Externe service="YouTube" lien={YOUTUBE}>
              <iframe
                title="Diffusion en direct du Groupe JOGOO"
                src={`https://www.youtube.com/embed/live_stream?channel=${CHAINE}&rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </Externe>
          </div>
          <aside className="space-y-6 text-sm">
            <div>
              <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-gold">Prochaines diffusions</p>
              {prochains.length ? (
                <ul className="mt-3 space-y-4">
                  {prochains.map((a) => (
                    <li key={a.slug} className="border-l-2 border-terra pl-3">
                      <p className="text-xs uppercase tracking-wide text-paper/55">
                        {a.entry.aConfirmer ? 'Date à préciser' : a.entry.dateAffichee || dateFr(a.entry.date)}
                        {a.entry.heure ? ` · ${a.entry.heure}` : ''}
                      </p>
                      <p className="mt-1 leading-snug text-paper/90">{a.entry.intitule}</p>
                      {a.entry.inscription && (
                        <a href={`/inscription/${a.slug}`} className="mt-1.5 inline-block text-xs font-bold uppercase tracking-wide text-gold underline underline-offset-2 hover:text-white">
                          S’inscrire
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-paper/60">Aucune diffusion annoncée pour le moment.</p>
              )}
            </div>
            <div className="border-t border-paper/10 pt-5">
              <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-gold">Suivre ailleurs</p>
              <p className="mt-2 leading-relaxed text-paper/70">La même diffusion est visible sur notre chaîne YouTube et notre page Facebook. Pour intervenir, rejoignez la réunion Zoom (lien envoyé aux inscrits).</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={YOUTUBE} target="_blank" rel="noreferrer" className="bg-paper px-3.5 py-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink hover:bg-gold">YouTube ↗</a>
                <a href={FACEBOOK} target="_blank" rel="noreferrer" className="border border-paper/30 px-3.5 py-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.1em] text-paper hover:bg-paper hover:text-ink">Facebook ↗</a>
              </div>
            </div>
            <a href="/actualites#agenda" className="inline-block font-semibold text-paper/80 underline underline-offset-2 hover:text-gold">← Tout l’agenda</a>
          </aside>
        </div>
      </div>
    </section>
  );
}
