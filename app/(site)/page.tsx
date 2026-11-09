import { getEditos, getActualites, getAgenda, reader, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Html } from '@/components/Html';
import { CarrouselFlash } from '@/components/CarrouselFlash';
import { LecteurPodcast, MosaiqueVideos } from '@/components/Medias';
import { SOUS_SITES } from '@/lib/liste-sous-sites';
import { fragment } from '@/lib/gabarits';

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
  const podcasts = podcastsBruts.filter((p) => p.entry.audio).sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const videosTriees = videos.sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0)).slice(0, 6);
  const edito = editos[0];
  const precedents = editos.slice(1, 10);
  const actu = actus[0];
  const mois = new Date().toISOString().slice(0, 7);
  const prochains = agenda.filter((a) => a.entry.date!.slice(0, 7) >= mois);
  const rdv = prochains[0];
  const ouverts = postes.filter((p) => !p.entry.pourvu).length;
  const flashsTries = flashs.sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));

  return (
    <>
      {/* Intro animée, accroche, colloque : identiques à l'original */}
      <Html html={fragment('home-00')} />
      <Html html={fragment('home-01')} />
      <Html html={fragment('home-02')} />

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
                  <img alt={edito.entry.imageDescription ?? ''} src={edito.entry.image} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                )}
              </div>
              <div className="flex flex-col p-8 sm:p-10">
                <p className="kicker">{dateFr(edito.entry.date)}</p>
                <p className="mt-4 font-serif text-lg italic leading-relaxed text-ink sm:text-xl">{extrait(edito.entry.accroche || corpsBrut('editos', edito.slug), 520)}</p>
                {edito.entry.signature && (
                  <div className="mt-6 flex items-center gap-3">
                    {edito.entry.portrait && <img alt="" src={edito.entry.portrait} className="h-11 w-11 rounded-full object-cover" />}
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
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_1fr_0.85fr]">
          <div className="flex flex-col gap-4">
            {actu && (
              <a className="group relative isolate flex flex-1 flex-col justify-between overflow-hidden bg-ink p-8 text-paper" href={`/actualites/${actu.slug}`}>
                {actu.entry.image && (
                  <img
                    alt=""
                    aria-hidden="true"
                    src={actu.entry.image}
                    className="absolute inset-0 -z-10 h-full w-full object-cover object-[85%_15%] opacity-25 -scale-x-100 transition-transform duration-500 group-hover:scale-105 group-hover:-scale-x-105"
                  />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/85 to-ink/40 transition-colors group-hover:from-terra-deep group-hover:via-terra-deep/85" />
                <p className="kicker text-gold">Actualité</p>
                <div className="mt-8">
                  <h3 className="display-title text-2xl leading-[1.05] text-paper sm:text-[1.7rem]">{actu.entry.titre}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-paper/75">{actu.entry.resume || extrait(corpsBrut('actualites', actu.slug), 260)}</p>
                  <p className="mt-4 text-sm text-paper/60">
                    {dateFr(actu.entry.date)}
                    {actu.entry.auteur ? ` · ${actu.entry.auteur}` : ''}
                  </p>
                  <span className="mt-6 inline-block bg-terra px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors group-hover:bg-white group-hover:text-ink">
                    En savoir plus
                  </span>
                </div>
              </a>
            )}
            {rdv && (
              <a className="group relative isolate flex flex-1 flex-col justify-between overflow-hidden bg-terra-deep p-8 text-paper" href="/actualites#agenda">
                <p className="kicker text-gold">Prochain rendez-vous</p>
                <div className="mt-6">
                  <p className="font-brand text-xs font-bold uppercase tracking-wide text-paper/70">
                    {rdv.entry.dateAffichee || dateFr(rdv.entry.date)}
                    {rdv.entry.aConfirmer && <span className="ml-2 font-normal normal-case text-paper/60">· date à confirmer</span>}
                  </p>
                  <h3 className="display-title mt-2 text-2xl leading-[1.05] text-paper sm:text-[1.7rem]">{rdv.entry.intitule}</h3>
                  {rdv.entry.lieu && <p className="mt-3 text-sm text-paper/70">{rdv.entry.lieu}</p>}
                </div>
                <span className="mt-6 inline-block w-fit bg-paper px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:bg-gold">
                  Voir l’agenda
                </span>
              </a>
            )}
          </div>
          <Html html={fragment('home-04-colonnes')} />
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

      {/* Les sous-sites : logos et noms seulement */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display-title text-3xl text-terra sm:text-4xl">Les sous-sites</h2>
          <a className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/plan-du-site">
            Plan du site →
          </a>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {SOUS_SITES.map(([href, nom, logo]) => (
            <a key={href} href={href} className="group flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-white p-6 text-center shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(26,26,26,0.05),0_24px_44px_-24px_rgba(26,26,26,0.4)]">
              <img src={logo} alt="" loading="lazy" className="h-24 w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-105 sm:h-36 lg:h-40" />
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

      {/* Agenda et recherche */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-x-14 gap-y-12 px-5 py-16 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
              <p className="kicker text-gold">À l’agenda</p>
              <a className="text-xs font-semibold uppercase tracking-wide text-paper/60 hover:text-gold" href="/actualites#agenda">
                Tout voir →
              </a>
            </div>
            <ol className="mt-2 divide-y divide-white/10">
              {prochains.slice(0, 3).map((a) => (
                <li key={a.slug}>
                  <a className="group flex gap-4 py-4" href="/actualites#agenda">
                    <time className="w-24 shrink-0 font-brand text-xs font-semibold uppercase tracking-wide text-gold" dateTime={a.entry.date ?? undefined}>
                      {a.entry.dateAffichee || dateFr(a.entry.date)}
                    </time>
                    <span className="text-[0.95rem] leading-snug text-paper/90 group-hover:text-white">
                      {a.entry.intitule}
                      {a.entry.lieu && <span className="mt-0.5 block text-xs text-paper/50">{a.entry.lieu}</span>}
                    </span>
                  </a>
                </li>
              ))}
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
