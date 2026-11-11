import { getEditos, getActualites, getAgenda, getRevue, reader, dateFr, extrait, sansEmail } from '@/lib/content';
import { getMinutes, integrationVideo, MINUTE } from '@/lib/minutes';
import { Fil } from '@/components/Fil';
import { Compteurs } from '@/components/Compteurs';
import { corpsBrut } from '@/lib/raw';
import { Html } from '@/components/Html';
import { CarrouselFlash } from '@/components/CarrouselFlash';
import { LecteurPodcast, MosaiqueVideos } from '@/components/Medias';
import { SOUS_SITES } from '@/lib/liste-sous-sites';
import { fragment } from '@/lib/gabarits';
import { toutesLesNotes } from '@/lib/notes';
import { AgendaAccueil } from '@/components/AgendaAccueil';
import { DefileHistoire } from '@/components/DefileHistoire';

export const revalidate = 3600;


const Fleche = () => <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>;

export default async function Accueil() {
  const [editos, actus, agenda, flashs, postes, videos, podcastsBruts] = await Promise.all([
    getEditos(),
    getActualites(),
    getAgenda(),
    reader.collections.flash.all(),
    reader.collections.postes.all(),
    reader.collections.videos.all(),
    reader.collections.podcasts.all(),
  ]);
  const [revue, minutes, appels, notes, histoire] = await Promise.all([getRevue(), getMinutes(), reader.collections.appels.all(), toutesLesNotes(), reader.collections.chronologie.all()]);
  const jourHistoire = new Date().toISOString().slice(0, 10);
  const moments = histoire
    .filter((h) => (h.entry.date ?? '') <= jourHistoire)
    .sort((a, b) => (b.entry.date ?? '').localeCompare(a.entry.date ?? ''))
    .map((h) => ({
      slug: h.slug,
      annee: (h.entry.date ?? '').slice(0, 4),
      date: h.entry.dateAffichee ?? '',
      titre: h.entry.titre,
      lieu: h.entry.lieu && h.entry.lieu !== '—' ? h.entry.lieu : '',
      image: (h.entry.miniature || (h.entry.photos.length > 2 ? h.entry.photos[Math.min(h.entry.photos.length - 1, 3)] : h.entry.affiche || h.entry.photos[0] || ''))?.replace(/\.jpg$/, '-v.jpg') || null,
      enSalle: /présentiel|hybride/i.test(h.entry.format ?? ''),
    }));
  const livres = notes
    .filter((n) => n.couverture)
    .sort((x, y) => Number(y.une) - Number(x.une) || (y.annee ?? '').localeCompare(x.annee ?? ''))
    .slice(0, 9);
  const minute = minutes[0];
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const appelsOuverts = appels
    .filter((a) => a.entry.ouvert && (!a.entry.cloture || a.entry.cloture >= aujourdhui))
    .sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const appelUne = appelsOuverts[0];
  const podcasts = podcastsBruts.filter((p) => p.entry.audio).sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const videosTriees = videos.sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0)).slice(0, 6);
  const edito = editos[0];
  const precedents = editos.slice(1, 10);
  const actu = actus[0];
  const mois = new Date().toISOString().slice(0, 7);
  const prochains = agenda.filter((a) => a.entry.date!.slice(0, 7) >= mois);
  const ouverts = postes.filter((p) => !p.entry.pourvu).length;
  // Conférence à la une : prochaine diffusion en direct dans les dix jours
  const dans10 = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  const aLaUne = agenda
    .filter((a) => a.entry.enDirect && !a.entry.aConfirmer && a.entry.date! >= aujourdhui && a.entry.date! <= dans10)
    .sort((a, b) => a.entry.date!.localeCompare(b.entry.date!))[0];
  const uneTitre = aLaUne ? aLaUne.entry.intitule.split(' · ') : [];
  const flashsTries = flashs.sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));

  return (
    <>
      {/* Intro animée, accroche, colloque : identiques à l'original */}
      <Html html={fragment('home-00')} />
      <Html html={fragment('home-01')} />
      <Fil
        elements={[
          ...(editos[0] ? [{ etiquette: 'Édito', texte: editos[0].entry.titre, href: `/edito/${editos[0].slug}` }] : []),
          ...(minute
            ? [{ etiquette: 'Vidéo', texte: `La minute du chant du coq : ${minute.entry.titre}`, href: `${MINUTE.base}/${minute.slug}` }]
            : [{ etiquette: 'Nouveau', texte: 'La minute du chant du coq : un concept, un philosophe, cinq minutes', href: MINUTE.base }]),
          ...actus.slice(0, 3).map((a) => ({ etiquette: 'Actualité', texte: a.entry.titre, href: `/actualites/${a.slug}` })),
          { etiquette: 'Revue', texte: 'Revue JOGOO n° 1 : « L’être africain »', href: '/sous-sites/revue-jogoo' },
          ...appelsOuverts.slice(0, 2).map((a) => ({ etiquette: 'Appel', texte: a.entry.titre, href: a.entry.formulaire && a.entry.formulaire !== 'aucun' ? `/candidature/${a.slug}` : '/recherche/appels-a-contributions' })),
          ...prochains.slice(0, 2).map((a) => ({ etiquette: 'Agenda', texte: `${a.entry.intitule}${a.entry.dateAffichee ? ` · ${a.entry.dateAffichee}` : ''}`, href: a.entry.inscription ? `/inscription/${a.slug}` : '/actualites#agenda' })),
          ...(podcasts[0] ? [{ etiquette: 'Podcast', texte: 'Écouter Marcien Towa', href: '/podcasts' }] : []),
        ]}
      />
      {/* Conférence à la une, à suivre en direct sur le site */}
      {aLaUne && (
        <section className="relative isolate overflow-hidden border-b-4 border-terra bg-[#1a1512] text-paper">
          <img
            src="/medias/site/jogoo/fonds-eboussi/portrait-dessine-orange.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-auto object-cover opacity-35 [mask-image:linear-gradient(to_left,black_45%,transparent)] md:block"
          />
          <div className="mx-auto max-w-6xl px-5 py-12 sm:py-14">
            <p className="inline-flex items-center gap-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e53935] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e53935]" />
              </span>
              {aLaUne.entry.date === aujourdhui ? 'Aujourd’hui · en direct sur le site' : 'À suivre en direct sur le site'}
            </p>
            {uneTitre.length > 1 && <p className="mt-4 max-w-2xl font-serif text-lg italic text-paper/75">{uneTitre[0]}</p>}
            <h2 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-paper sm:text-[2.6rem]">{uneTitre.slice(uneTitre.length > 1 ? 1 : 0).join(' · ')}</h2>
            <p className="mt-5 font-brand text-sm font-bold uppercase tracking-[0.12em] text-gold">
              {aLaUne.entry.dateAffichee || dateFr(aLaUne.entry.date)}
              {aLaUne.entry.heure ? ` · ${aLaUne.entry.heure}` : ''}
            </p>
            {aLaUne.entry.presentation && <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-paper/80">{aLaUne.entry.presentation}</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/direct" className="inline-flex items-center gap-2 bg-terra px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-white hover:text-ink">
                <span className="h-2 w-2 rounded-full bg-white" /> Regarder en direct sur le site
              </a>
              {aLaUne.entry.inscription && (
                <a href={`/inscription/${aLaUne.slug}`} className="border border-paper/40 px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-paper hover:bg-paper hover:text-ink">
                  S’inscrire (lien Zoom)
                </a>
              )}
              {aLaUne.entry.fichier && (
                <a href={aLaUne.entry.fichier} target="_blank" rel="noreferrer" className="px-2 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-paper/75 underline underline-offset-4 hover:text-gold">
                  Le résumé (PDF)
                </a>
              )}
            </div>
          </div>
        </section>
      )}
      {/* La minute du chant du coq */}
      <section className="relative isolate overflow-hidden bg-[#140f0c] text-paper">
        <img loading="lazy" decoding="async" src="/medias/site/jogoo/coq-penseur-gauche.png" alt="" className="coq-flotte pointer-events-none absolute bottom-0 right-[-3rem] -z-10 h-[92%] max-h-[24rem] opacity-80 sm:right-6" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_50%,rgba(168,54,27,0.5),transparent_60%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="flex items-center gap-3 font-brand text-xs font-bold uppercase tracking-[0.24em] text-gold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terra" />
              </span>
              {minute ? 'Nouvel épisode' : 'Nouvelle rubrique'}
            </p>
            <h2 className="mt-3 font-brand text-3xl font-black uppercase leading-[0.95] text-white sm:text-5xl">
              La minute <span className="font-serif font-bold normal-case italic text-gold">du chant du coq</span>
            </h2>
            <p className="mt-4 max-w-md font-serif text-lg italic text-paper/80">{minute ? minute.entry.definition || MINUTE.devise : MINUTE.devise}</p>
            <a href={minute ? `${MINUTE.base}/${minute.slug}` : MINUTE.base} className="mt-6 inline-block bg-terra px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-terra-deep">
              {minute ? `Regarder : ${minute.entry.titre} →` : 'Découvrir la rubrique →'}
            </a>
          </div>
          {minute && (minute.entry.affiche || integrationVideo(minute.entry.video)?.vignette) && (
            <a href={`${MINUTE.base}/${minute.slug}`} className="group relative block aspect-video overflow-hidden shadow-2xl">
              <img loading="lazy" decoding="async" src={minute.entry.affiche || integrationVideo(minute.entry.video)!.vignette!} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-terra text-white" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7Z" />
                </svg>
              </span>
            </a>
          )}
        </div>
      </section>

      {/* L'édito de la semaine */}
      {edito && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker">L’édito de la semaine</p>
                <h2 className="display-title mt-2 text-3xl text-ink sm:text-4xl">{edito.entry.titre}</h2>
              </div>
              <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/edito">
                Tous les éditos →
              </a>
            </div>
            <a className="group mt-8 grid overflow-hidden border border-ink/12 bg-white lg:grid-cols-2" href={`/edito/${edito.slug}`}>
              <div className="cadre relative aspect-[7/5] overflow-hidden bg-ink">
                {edito.entry.image && (
                  <img loading="lazy" decoding="async" alt={edito.entry.imageDescription ?? ''} src={edito.entry.image} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                )}
              </div>
              <div className="flex flex-col p-8 sm:p-10">
                <p className="kicker">{dateFr(edito.entry.date)}</p>
                <p className="mt-4 font-serif text-lg italic leading-relaxed text-ink sm:text-xl">{extrait(edito.entry.accroche || corpsBrut('editos', edito.slug), 520)}</p>
                {edito.entry.signature && (
                  <div className="mt-6 flex items-center gap-3">
                    {edito.entry.portrait && <img loading="lazy" decoding="async" alt="" src={edito.entry.portrait} className="h-11 w-11 rounded-full object-cover" />}
                    <span className="text-sm leading-tight text-ink-soft">{sansEmail(edito.entry.signature)}</span>
                  </div>
                )}
                <span className="mt-auto pt-8 text-sm font-semibold text-terra-deep">
                  Lire l’édito
                  <Fleche />
                </span>
              </div>
            </a>
            {precedents.length > 0 && (
              <>
                <p className="kicker mb-4 mt-12">Les éditos précédents</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {precedents.map((e) => (
                    <a key={e.slug} className="group flex gap-4 border border-ink/12 bg-white p-5 transition-colors hover:border-terra" href={`/edito/${e.slug}`}>
                      <span className="cadre h-16 w-20 shrink-0 border border-ink/10">
                        {e.entry.image && <img alt="" src={e.entry.image} loading="lazy" />}
                      </span>
                      <span className="min-w-0">
                        <span className="kicker">{dateFr(e.entry.date)}</span>
                        <span className="mt-1 block font-brand text-sm font-bold leading-snug text-ink group-hover:text-terra">{e.entry.titre}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Actualités & rendez-vous */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">À la une</p>
            <h2 className="display-title mt-2 text-3xl text-ink sm:text-4xl">Actualités &amp; rendez-vous</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Actualité principale, prochain événement, appel à contributions, publications et ressources nouvelles du réseau JOGOO.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_1.1fr_0.85fr]">
          <div className="flex flex-col gap-4">
            {actu && (
              <a className="group relative isolate flex flex-1 flex-col justify-between overflow-hidden bg-ink p-6 text-paper sm:p-7" href={`/actualites/${actu.slug}`}>
                {actu.entry.image && (
                  <img
                    alt=""
                    aria-hidden="true"
                    src={actu.entry.image}
                    className="absolute inset-0 -z-10 h-full w-full object-cover object-[85%_15%] opacity-70 -scale-x-100 transition-transform duration-500 group-hover:scale-105 group-hover:-scale-x-105"
                  />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/95 via-ink/55 to-transparent transition-colors group-hover:from-terra-deep group-hover:via-terra-deep/85" />
                <p className="kicker text-gold">Actualité</p>
                <div className="mt-4">
                  <h3 className="display-title text-2xl leading-[1.05] text-paper sm:text-[1.7rem]">{actu.entry.titre}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-paper/85">{actu.entry.resume || extrait(corpsBrut('actualites', actu.slug), 260)}</p>
                  <p className="mt-2 text-sm text-paper/70">
                    {dateFr(actu.entry.date)}
                    {actu.entry.auteur ? ` · ${actu.entry.auteur}` : ''}
                  </p>
                  <span className="mt-4 inline-block bg-terra px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors group-hover:bg-white group-hover:text-ink">
                    En savoir plus
                  </span>
                </div>
              </a>
            )}
            {appelUne && (
              <a className="group relative isolate flex flex-1 flex-col justify-between overflow-hidden bg-terra-deep p-6 text-paper sm:p-7" href={appelUne.entry.formulaire && appelUne.entry.formulaire !== 'aucun' ? `/candidature/${appelUne.slug}` : '/recherche/appels-a-contributions'}>
                <p className="kicker text-gold">Appel à contributions</p>
                <div className="mt-3">
                  <p className="font-brand text-xs font-bold uppercase tracking-wide text-paper/70">{appelUne.entry.type}</p>
                  <h3 className="display-title mt-2 text-2xl leading-[1.05] text-paper sm:text-[1.6rem]">{appelUne.entry.titre}</h3>
                  {appelUne.entry.dateLimite && <p className="mt-3 text-sm font-semibold text-gold">{appelUne.entry.dateLimite}</p>}
                </div>
                <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-block w-fit bg-paper px-5 py-2 text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:bg-gold">Candidater en ligne</span>
                  {appelsOuverts.length > 1 && <span className="text-sm text-paper/75">et {appelsOuverts.length - 1} autre{appelsOuverts.length > 2 ? 's' : ''} appel{appelsOuverts.length > 2 ? 's' : ''} ouvert{appelsOuverts.length > 2 ? 's' : ''}</span>}
                </span>
              </a>
            )}
          </div>
          <div className="flex h-full flex-col border border-ink/12 bg-white">
            <div className="flex items-baseline justify-between border-b border-ink/10 px-6 py-4">
              <p className="kicker">Publications</p>
              <span className="text-xs text-ink-soft">Notes de lecture</span>
            </div>
            <ul className="grid flex-1 grid-cols-3 content-start gap-x-4 gap-y-5 p-5">
              {livres.map((n) => (
                <li key={n.slug}>
                  <a href={`/publications/${n.slug}`} className="group block" title={n.titre}>
                    <span className="block aspect-[2/3] overflow-hidden border border-ink/10 bg-cream shadow-[0_8px_18px_-10px_rgba(0,0,0,0.45)] transition duration-300 group-hover:-translate-y-1">
                      <img src={n.couverture!} alt={`Couverture : ${n.titre}`} loading="lazy" className="h-full w-full object-cover" />
                    </span>
                    <span className="mt-2 block line-clamp-2 text-[0.72rem] font-semibold leading-snug text-ink group-hover:text-terra">{n.auteur}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a className="group border-t border-ink/10 px-6 py-3 text-sm font-semibold text-terra-deep hover:text-terra" href="/publications">
              Toutes les publications
              <Fleche />
            </a>
          </div>
          <AgendaAccueil rdv={prochains.slice(0, 4)} total={prochains.length} />
        </div>
      </section>

      {/* Le Groupe JOGOO en N flashs : carrousel animé */}
      <section className="border-y border-ink/10 bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Manifeste</p>
              <h2 className="mt-1 display-title text-2xl text-ink sm:text-3xl">Le Groupe JOGOO en {flashsTries.length} flashs</h2>
            </div>
            <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/flash">
              Lire les {flashsTries.length} textes →
            </a>
          </div>
          <CarrouselFlash
            flashs={flashsTries.map((f) => ({ ancre: f.slug, titre: f.entry.titre, auteur: f.entry.auteur, lieu: f.entry.lieu, image: f.entry.image, alt: f.entry.imageDescription }))}
          />
        </div>
      </section>

      {/* Le Groupe en chiffres */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Compteurs
            chiffres={[
              { n: new Date().getFullYear() - 2010, libelle: 'ans de débats' },
              { n: 6, libelle: 'projets' },
              { n: 10, libelle: 'axes de recherche' },
              { n: editos.length, libelle: 'éditos publiés' },
              { n: revue.length, libelle: 'articles de revue' },
              { n: podcasts.length + videos.length, libelle: 'vidéos et podcasts' },
            ]}
          />
        </div>
      </section>

      {/* Notre histoire : frise qui défile (collection chronologie) */}
      {moments.length > 0 && (
        <section className="border-b border-ink/10 bg-paper">
          <div className="mx-auto max-w-6xl px-5 pt-14 pb-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker">Depuis 2010</p>
                <h2 className="mt-1 display-title text-2xl text-ink sm:text-3xl">Notre histoire</h2>
                <p className="mt-2 max-w-xl text-sm text-ink/65">Conférences, colloques, journées d’étude et webinaires, d’Abidjan à Yaoundé, de Cotonou à Toulouse et Montréal.</p>
              </div>
              <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/notre-histoire">
                Toute la chronologie →
              </a>
            </div>
          </div>
          <div className="pb-14 pl-5 sm:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]">
            <DefileHistoire moments={moments} />
          </div>
        </section>
      )}

      {/* Nos projets : logos et noms seulement */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display-title text-3xl text-terra sm:text-4xl">Nos projets</h2>
          <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/plan-du-site">
            Plan du site →
          </a>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {SOUS_SITES.map(([href, nom, logo, e]) => (
            <a key={href} href={href} className="group flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-white p-6 text-center shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(26,26,26,0.05),0_24px_44px_-24px_rgba(26,26,26,0.4)]">
              <span className="flex h-28 w-full items-center justify-center sm:h-40 lg:h-44">
                <img src={logo} alt="" loading="lazy" style={{ ['--e' as string]: e }} className="h-[calc(5.5rem*var(--e))] w-auto max-w-[88%] object-contain transition-transform duration-500 group-hover:scale-105 sm:h-[calc(8.5rem*var(--e))] lg:h-[calc(9.5rem*var(--e))]" />
              </span>
              <span className="font-brand text-sm font-bold leading-tight text-ink group-hover:text-terra sm:text-base">{nom}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Vidéos et podcasts */}
      {(videosTriees.length > 0 || podcasts.length > 0) && (
        <section className="bg-cream/60">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker">Falsafa ya Africa</p>
                <h2 className="display-title mt-2 text-3xl text-ink sm:text-4xl">Voir et écouter</h2>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/mediatheque">
                  Toutes les vidéos →
                </a>
                <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/podcasts">
                  Tous les podcasts →
                </a>
              </div>
            </div>
            <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-2">
              <MosaiqueVideos videos={videosTriees.map((v) => ({ titre: v.entry.titre, url: v.entry.url ?? '', rubrique: v.entry.rubrique }))} />
              <LecteurPodcast
                episodes={podcasts.map((p) => ({
                  titre: p.entry.titre,
                  serie: p.entry.serie,
                  audio: p.entry.audio ?? '',
                  duree: p.entry.duree,
                  description: p.entry.description,
                  source: p.entry.source,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Appels et recherche (l’agenda est dans la colonne « Agenda » plus haut) */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-x-14 gap-y-12 px-5 py-16 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
              <p className="kicker text-gold">Appels à contributions</p>
              <a className="text-xs font-semibold uppercase tracking-wide text-paper/60 hover:text-gold" href="/recherche/appels-a-contributions">
                Tout voir →
              </a>
            </div>
            <ol className="mt-2 divide-y divide-white/10">
              {appelsOuverts.slice(0, 4).map((a) => {
                const enLigne = a.entry.formulaire && a.entry.formulaire !== 'aucun';
                return (
                  <li key={a.slug}>
                    <a className="group block py-4" href={enLigne ? `/candidature/${a.slug}` : '/recherche/appels-a-contributions'}>
                      <span className="font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold">{a.entry.type}</span>
                      <span className="mt-1 block text-[0.95rem] leading-snug text-paper/90 group-hover:text-white">{a.entry.titre}</span>
                      <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-paper/50">
                        {a.entry.dateLimite && <span>{a.entry.dateLimite}</span>}
                        {enLigne && <span className="font-semibold text-gold/90 group-hover:text-gold">Candidater en ligne →</span>}
                      </span>
                    </a>
                  </li>
                );
              })}
              {!appelsOuverts.length && <li className="py-4 text-sm text-paper/60">Aucun appel ouvert pour le moment.</li>}
            </ol>
          </div>
          <Html html={fragment('home-07-droite').replace(/(<span class="display-title text-6xl leading-none text-gold">)\d+/, `$1${ouverts}`)} />
        </div>
      </section>

      {/* Citation, lettre d'information et réseaux */}
      <Html html={fragment('home-08')} />
      <Html html={fragment('home-09')} />
    </>
  );
}
