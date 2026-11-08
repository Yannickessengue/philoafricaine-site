import Link from 'next/link';
import { getEditos, getActualites, getPublications, getAgenda, dateFr, extrait } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Cadre } from '@/components/Cadre';
import { Carte } from '@/components/ui';

export const revalidate = 86400;

const sousSites = [
  ['/sous-sites/revue-jogoo', 'Revue JOGOO', 'Revue semestrielle de philosophie africaine et de culture', '/medias/site/jogoo/logo-revue-jogoo.png'],
  ['/sous-sites/editions-jogoo', 'Éditions JOGOO', 'Maison d’édition du Groupe', '/medias/site/jogoo/logo-editions-jogoo.png'],
  ['/sous-sites/fonds-eboussi-boulaga', 'Fonds Eboussi Boulaga', 'Fonds documentaire et archivistique', '/medias/site/jogoo/logo-fonds-eboussi.png'],
  ['/sous-sites/eboussi-studies', 'Eboussi Studies', 'Revue annuelle plurilingue', '/medias/site/jogoo/logo-eboussi-studies.png'],
  ['/sous-sites/sankofa-communications', 'Sankofa Communications', 'Agence de communication', '/medias/site/jogoo/logo-sankofa-full.png'],
  ['/sous-sites/philo-africaine-magazine', 'Philo Africaine Magazine', 'Magazine semestriel de médiation', '/medias/site/jogoo/logo-philo-africaine-magazine.png'],
];

export default async function Accueil() {
  const [editos, actus, pubs, agenda] = await Promise.all([getEditos(), getActualites(), getPublications(), getAgenda()]);
  const edito = editos[0];
  const today = new Date().toISOString().slice(0, 7);
  const prochains = agenda.filter((a) => a.entry.date! >= today).slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden bg-terra-deep text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[3fr_2fr] md:py-24">
          <div>
            <p className="kicker !text-gold">Groupe JOGOO · depuis 2010</p>
            <h1 className="display-title mt-4 text-4xl sm:text-6xl">Philosophie africaine.<br />Débats & questions.</h1>
            <p className="mt-6 max-w-xl font-serif text-lg italic text-paper/80">
              Le coq de l’aube répond à la chouette de Minerve : un projet de réflexion sur la pensée philosophique, en dialogue avec la pensée noire et les questions de l’humain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/le-groupe" className="bg-gold px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider text-ink hover:bg-gold-soft">Découvrir le Groupe</Link>
              <Link href="/edito" className="border border-paper/40 px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider hover:bg-paper/10">Lire l’édito</Link>
            </div>
          </div>
          <div className="mx-auto w-56 sm:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/medias/site/jogoo/coq-penseur-t.png" alt="Le coq penseur, emblème du Groupe JOGOO" className="w-full" />
          </div>
        </div>
      </section>

      {edito && (
        <section className="mx-auto max-w-6xl px-5 pt-16">
          <p className="kicker">L’édito de la semaine</p>
          <article className="mt-4 grid items-start border border-ink/12 bg-white lg:grid-cols-2">
            <Link href={`/edito/${edito.slug}`}><Cadre src={edito.entry.image} alt={edito.entry.imageDescription} format="16/10" /></Link>
            <div className="p-7 sm:p-10">
              {edito.entry.surtitre && <p className="kicker !text-gold-deep">{edito.entry.surtitre}</p>}
              <h2 className="display-title mt-2 text-2xl text-ink sm:text-3xl"><Link href={`/edito/${edito.slug}`} className="hover:text-terra">{edito.entry.titre}</Link></h2>
              <p className="mt-2 text-xs text-ink/55">{dateFr(edito.entry.date)}</p>
              <p className="mt-5 leading-relaxed text-ink-soft">{extrait(edito.entry.accroche ?? '', 360)}</p>
              <Link href={`/edito/${edito.slug}`} className="mt-6 inline-block bg-terra px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider text-paper hover:bg-terra-deep">Lire l’édito</Link>
            </div>
          </article>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="flex items-end justify-between">
          <h2 className="display-title text-3xl text-terra">Actualités</h2>
          <Link href="/actualites" className="font-brand text-xs font-bold uppercase tracking-wider text-terra-deep">Toutes les actualités →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actus.slice(0, 3).map((a) => (
            <Carte key={a.slug} href={`/actualites/${a.slug}`} image={a.entry.image} alt={a.entry.imageDescription} titre={a.entry.titre}
              meta={dateFr(a.entry.date)} texte={a.entry.resume || extrait(corpsBrut('actualites', a.slug), 150)} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="grid items-start gap-10 bg-ink p-8 text-paper sm:p-12 md:grid-cols-[1fr_2fr]">
          <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="mx-auto block w-48"><Cadre src="/medias/site/jogoo/revue/couverture-n1.jpg" alt="Revue JOGOO n° 1" format="2/3" /></Link>
          <div>
            <p className="kicker !text-gold">Revue JOGOO · n° 1 · octobre 2026</p>
            <h2 className="display-title mt-3 text-3xl">L’être africain</h2>
            <p className="mt-4 max-w-xl font-serif italic text-paper/75">Une revue semestrielle de philosophie africaine et de culture, évaluée en double aveugle. Les articles sont en libre accès six mois après la parution du numéro.</p>
            <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="mt-6 inline-block bg-gold px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider text-ink">Sommaire du numéro</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="flex items-end justify-between">
          <h2 className="display-title text-3xl text-terra">Publications</h2>
          <Link href="/publications" className="font-brand text-xs font-bold uppercase tracking-wider text-terra-deep">Toutes les notes de lecture →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pubs.slice(0, 3).map((p) => (
            <Carte key={p.slug} href={`/publications/${p.slug}`} image={p.entry.couverture} alt={p.entry.titre} kicker="Note de lecture" titre={p.entry.titre}
              meta={[p.entry.auteurOuvrage, p.entry.annee].filter(Boolean).join(' · ')} texte={p.entry.resume} />
          ))}
        </div>
      </section>

      {prochains.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-16">
          <div className="flex items-end justify-between">
            <h2 className="display-title text-3xl text-terra">Agenda</h2>
            <Link href="/agenda" className="font-brand text-xs font-bold uppercase tracking-wider text-terra-deep">Tout l’agenda →</Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {prochains.map((e) => (
              <li key={e.slug} className="border-l-4 border-gold bg-white p-5">
                <p className="font-brand text-xs font-bold uppercase tracking-wide text-terra">{e.entry.dateAffichee}</p>
                <p className="mt-1 font-serif text-ink">{e.entry.intitule}</p>
                {e.entry.lieu && <p className="mt-1 text-xs text-ink/55">{e.entry.lieu}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <h2 className="display-title text-3xl text-terra">Les sous-sites</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sousSites.map(([href, titre, texte, logo]) => (
            <Link key={href} href={href} className="flex items-center gap-4 border border-ink/10 bg-white p-5 hover:border-terra">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="max-h-14 max-w-14 object-contain" />
              </div>
              <div>
                <p className="font-display text-sm font-extrabold uppercase text-ink">{titre}</p>
                <p className="text-xs text-ink/60">{texte}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
