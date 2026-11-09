import { getEditos, getAgenda, getRevue, reader, dateFr, sousEmbargo } from '@/lib/content';
import { getAppels } from '@/components/Appels';
import { toutesLesNotes } from '@/lib/notes';

/* Menu latéral des Actualités : rappelle les autres rubriques du site (rendez-vous, édito,
   appels, Revue, lectures, lettre d'information, réseaux). Il reste visible au défilement. */

const RESEAUX: [string, string, string][] = [
  ['Facebook', 'https://www.facebook.com/Philosophie-africaine-D%C3%A9bats-et-questions-169580879726591/', 'M14 8.5h2.2V5.2C15.8 5.1 14.7 5 13.6 5 11 5 9.3 6.6 9.3 9.4V12H6.3v3.5h3v8.5h3.6v-8.5h2.9l.5-3.5h-3.4V9.8c0-1 .3-1.7 1.8-1.7Z'],
  ['X', 'https://twitter.com/Philoafricaine', 'M17.5 5h2.9l-6.4 7.3L21.6 24h-5.9l-4.6-6-5.3 6H2.9l6.9-7.8L2.6 5h6l4.2 5.5L17.5 5Z'],
  ['LinkedIn', 'https://www.linkedin.com/in/falsafa-ya-africa-philosophie-africaine-389972146/', 'M8 10.5v10H5v-10h3ZM6.5 5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM11 10.5h2.9v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.1 3.9 4.9v5.4h-3v-4.8c0-1.1 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.6v4.8H11v-10Z'],
  ['YouTube', 'https://www.youtube.com/channel/UChS2D_zSk2vch6rN9QC52lw', 'M23 9.5c-.2-1.6-1-2.7-2.6-2.9C18 6.3 13 6.3 13 6.3s-5 0-7.4.3C4 6.8 3.2 7.9 3 9.5c-.3 2.3-.3 4.7 0 7 .2 1.6 1 2.7 2.6 2.9 2.4.3 7.4.3 7.4.3s5 0 7.4-.3c1.6-.2 2.4-1.3 2.6-2.9.3-2.3.3-4.7 0-7ZM11 16V10l5 3-5 3Z'],
];

function Bloc({ titre, lien, children, sombre = false }: { titre: string; lien?: [string, string]; children: React.ReactNode; sombre?: boolean }) {
  return (
    <section className={`border p-5 ${sombre ? 'border-ink bg-ink text-paper' : 'border-ink/12 bg-white'}`}>
      <div className={`flex items-baseline justify-between gap-3 border-b pb-2 ${sombre ? 'border-white/15' : 'border-ink/10'}`}>
        <h2 className={`kicker ${sombre ? 'text-gold' : ''}`}>{titre}</h2>
        {lien && (
          <a href={lien[0]} className={`shrink-0 text-[0.68rem] font-semibold uppercase tracking-wide ${sombre ? 'text-paper/60 hover:text-gold' : 'text-ink/45 hover:text-terra'}`}>
            {lien[1]} →
          </a>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export async function Lateral({ sansAgenda = false }: { sansAgenda?: boolean }) {
  const [editos, agenda, revue, appels, postes, notes, reglages] = await Promise.all([
    getEditos(),
    getAgenda(),
    getRevue(),
    getAppels(),
    reader.collections.postes.all(),
    toutesLesNotes(),
    reader.singletons.reglages.read(),
  ]);
  const edito = editos[0];
  const mois = new Date().toISOString().slice(0, 7);
  const rdv = agenda.filter((a) => a.entry.date!.slice(0, 7) >= mois).slice(0, 3);
  const appelsOuverts = appels.filter((a) => a.ouvert).length;
  const postesOuverts = postes.filter((p) => !p.entry.pourvu).length;
  const presentation = revue[0];
  const embargo = presentation ? sousEmbargo(presentation.entry.datePublication!, presentation.entry.embargoMois) : false;
  const whatsapp = (reglages?.whatsapp ?? '+242 06 445 99 09').replace(/[^\d]/g, '');

  return (
    <aside aria-label="À voir aussi sur le site" className="space-y-5">
      {edito && (
        <Bloc titre="L’édito de la semaine" lien={['/edito', 'Tous']}>
          <a href={`/edito/${edito.slug}`} className="group block">
            {edito.entry.image && (
              <span className="cadre mb-3 block aspect-[16/9]">
                <img alt="" src={edito.entry.image} loading="lazy" className="transition-transform duration-500 group-hover:scale-[1.04]" />
              </span>
            )}
            <span className="block font-brand text-[0.95rem] font-bold leading-snug text-ink group-hover:text-terra">{edito.entry.titre}</span>
            <span className="mt-1 block text-xs text-ink/50">{dateFr(edito.entry.date)}</span>
          </a>
        </Bloc>
      )}

      {!sansAgenda && rdv.length > 0 && (
        <Bloc titre="Prochains rendez-vous" lien={['/actualites#agenda', 'Agenda']}>
          <ol className="space-y-3">
            {rdv.map((a) => (
              <li key={a.slug} className="flex gap-3">
                <span className="w-1 shrink-0 bg-terra" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-brand text-[0.68rem] font-bold uppercase tracking-wide text-terra-deep">{a.entry.dateAffichee || dateFr(a.entry.date)}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink">{a.entry.intitule}</span>
                  {a.entry.lieu && <span className="block text-xs text-ink/50">{a.entry.lieu}</span>}
                </span>
              </li>
            ))}
          </ol>
        </Bloc>
      )}

      <Bloc titre="Recherche" lien={['/recherche', 'Voir']}>
        <a href="/recherche/appels-a-postes" className="group flex items-center gap-3 py-1">
          <span className="display-title w-10 shrink-0 text-3xl leading-none text-terra">{postesOuverts}</span>
          <span className="text-sm leading-snug text-ink group-hover:text-terra">
            poste{postesOuverts > 1 ? 's' : ''} de direction de programme ouvert{postesOuverts > 1 ? 's' : ''}
          </span>
        </a>
        <a href="/recherche/appels-a-contributions" className="group mt-2 flex items-center gap-3 border-t border-ink/10 pt-3">
          <span className="display-title w-10 shrink-0 text-3xl leading-none text-terra">{appelsOuverts}</span>
          <span className="text-sm leading-snug text-ink group-hover:text-terra">
            appel{appelsOuverts > 1 ? 's' : ''} à contributions ouvert{appelsOuverts > 1 ? 's' : ''}
            {appelsOuverts === 0 && <span className="block text-xs text-ink/45">Voir les derniers appels</span>}
          </span>
        </a>
      </Bloc>

      <Bloc titre="Revue JOGOO" lien={['/sous-sites/revue-jogoo', 'Ouvrir']}>
        <a href="/sous-sites/revue-jogoo/dossier-fondateur" className="group flex items-center gap-4">
          <img alt="Revue JOGOO" src="/medias/site/jogoo/logo-revue-jogoo.png" loading="lazy" className="h-14 w-auto shrink-0" />
          <span className="min-w-0">
            <span className="block font-serif text-[0.95rem] italic leading-snug text-ink group-hover:text-terra-deep">N° 1 — « L’être africain »</span>
            <span className="mt-0.5 block text-xs text-ink/50">{embargo ? 'Résumés en ligne · texte intégral après embargo' : 'Texte intégral en libre accès'}</span>
          </span>
        </a>
      </Bloc>

      {notes.length > 0 && (
        <Bloc titre="Notes de lecture" lien={['/publications', 'Toutes']}>
          <ul className="divide-y divide-ink/10">
            {notes.slice(0, 3).map((n) => (
              <li key={n.slug}>
                <a href={`/publications/${n.slug}`} className="group block py-2.5 first:pt-0">
                  <span className="block text-[0.85rem] font-semibold leading-snug text-ink group-hover:text-terra">{n.titre}</span>
                  {n.auteur && <span className="block font-serif text-xs italic text-ink/55">{n.auteur}</span>}
                </a>
              </li>
            ))}
          </ul>
        </Bloc>
      )}

      <Bloc titre="Lettre d’information" sombre>
        <p className="text-sm leading-relaxed text-paper/75">Recevez les éditos, les actualités et les appels du Groupe JOGOO.</p>
        <form data-newsletter="" className="mt-3">
          <input data-piege="" aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" type="text" defaultValue="" />
          <div className="flex">
            <input type="email" required placeholder="Votre e-mail" aria-label="Votre adresse électronique" className="h-10 min-w-0 flex-1 border border-white/25 bg-white/5 px-3 text-sm text-paper outline-none placeholder:text-paper/40 focus:border-gold" />
            <button type="submit" className="h-10 shrink-0 bg-gold px-3 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-gold-soft">
              OK
            </button>
          </div>
          <p data-note="" className="mt-2 text-xs text-paper/45">
            Gratuit, sans compte.
          </p>
        </form>
      </Bloc>

      <Bloc titre="Nous suivre">
        <div className="flex flex-wrap gap-2">
          {RESEAUX.map(([nom, href, d]) => (
            <a key={nom} href={href} target="_blank" rel="noreferrer" aria-label={nom} className="flex h-9 w-9 items-center justify-center border border-ink/15 text-ink/70 transition-colors hover:border-terra hover:bg-terra hover:text-white">
              <svg width="15" height="15" viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
                <path d={d} />
              </svg>
            </a>
          ))}
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 border border-ink/15 px-3 text-xs font-semibold text-ink/70 transition-colors hover:border-terra hover:bg-terra hover:text-white">
            WhatsApp
          </a>
        </div>
        <a href={`mailto:${reglages?.email ?? 'philoafricaine@gmail.com'}`} className="mt-3 block text-sm text-terra-deep underline underline-offset-2 hover:text-terra">
          {reglages?.email ?? 'philoafricaine@gmail.com'}
        </a>
      </Bloc>
    </aside>
  );
}
