import Link from 'next/link';
import { getEditos, getActualites, getPublications, getAgenda, getRevue, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Cadre } from '@/components/Cadre';
import { Carte, Section } from '@/components/ui';
import { StatutAcces } from '@/components/Revue';

export const revalidate = 86400;

const sousSites = [
  ['/sous-sites/revue-jogoo', 'Revue JOGOO', 'Revue semestrielle de philosophie africaine et de culture, évaluée en double aveugle.'],
  ['/sous-sites/editions-jogoo', 'Éditions JOGOO', 'La maison d’édition du Groupe : essais, actes, collections.'],
  ['/sous-sites/fonds-eboussi-boulaga', 'Fonds Eboussi Boulaga', 'Fonds documentaire et archivistique consacré au philosophe.'],
  ['/sous-sites/eboussi-studies', 'Eboussi Studies', 'Revue annuelle et plurilingue autour de l’œuvre d’Eboussi Boulaga.'],
  ['/sous-sites/philo-africaine-magazine', 'Philo Africaine Magazine', 'Magazine semestriel de médiation intellectuelle.'],
  ['/sous-sites/sankofa-communications', 'Sankofa Communications', 'L’agence de communication au service des chercheurs.'],
];

export default async function Accueil() {
  const [editos, actus, pubs, agenda, revue] = await Promise.all([getEditos(), getActualites(), getPublications(), getAgenda(), getRevue()]);
  const edito = editos[0];
  const mois = new Date().toISOString().slice(0, 7);
  const prochains = agenda.filter((a) => a.entry.date! >= mois).slice(0, 4);

  return (
    <>
      {/* L'édito de la semaine */}
      {edito && (
        <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
          <Link href={`/edito/${edito.slug}`} className="group grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Cadre src={edito.entry.image} alt={edito.entry.imageDescription} format="16/10" priorite />
            </div>
            <div className="lg:col-span-5 lg:pt-4">
              <p className="label label-accent">L’édito · {dateFr(edito.entry.date)}</p>
              {edito.entry.surtitre && <p className="mt-6 font-serif italic text-mute">{edito.entry.surtitre}</p>}
              <h1 className="titre titre-xl mt-2 !text-[clamp(2rem,3.6vw,3.3rem)]"><span className="lien">{edito.entry.titre}</span></h1>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-ink-soft">{extrait(edito.entry.accroche ?? '', 330)}</p>
              {edito.entry.signature && <p className="mt-6 font-serif text-sm italic text-ink">{sansEmail(edito.entry.signature).split(',')[0]}</p>}
              <span className="fleche mt-8">Lire l’édito</span>
            </div>
          </Link>
        </section>
      )}

      {/* Actualités */}
      <Section titre="Actualités" lien="/actualites" libelle="Toutes les actualités" className="mt-24">
        <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
          {actus.slice(0, 3).map((a) => (
            <Carte key={a.slug} href={`/actualites/${a.slug}`} image={a.entry.image} alt={a.entry.imageDescription}
              kicker={dateFr(a.entry.date)} titre={a.entry.titre}
              texte={a.entry.resume || extrait(corpsBrut('actualites', a.slug), 150)} />
          ))}
        </div>
      </Section>

      {/* Revue JOGOO */}
      <section className="mt-28 bg-night text-paper">
        <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="group block">
              <Cadre src="/medias/site/jogoo/revue/couverture-n1.jpg" alt="Couverture du n° 1 de la revue JOGOO" format="2/3" className="mx-auto max-w-sm" />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <p className="label !text-gold">Revue JOGOO · Numéro 1 · Octobre 2026</p>
            <h2 className="titre titre-xl mt-5 !text-paper">L’être africain</h2>
            <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-paper/75">
              « Résonner et raisonner comme un instrument d’éveil des consciences au matin, par le moyen de la philosophie. »
            </p>
            <ol className="mt-10 divide-y divide-paper/15 border-y border-paper/15">
              {revue.slice(0, 5).map((r, i) => (
                <li key={r.slug}>
                  <Link href={`/sous-sites/revue-jogoo/${r.slug}`} className="group grid grid-cols-[2.4rem_1fr] gap-4 py-5 sm:grid-cols-[2.6rem_1fr_auto] sm:items-baseline">
                    <span className="font-serif italic text-gold">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-serif text-[1.1rem]"><span className="lien">{r.entry.titre}</span></span>
                      <span className="mt-1 block text-sm text-paper/55">{r.entry.auteurs}</span>
                    </span>
                    <span className="col-start-2 sm:col-start-auto [&_.label]:!text-paper/60"><StatutAcces date={r.entry.datePublication!} mois={r.entry.embargoMois} /></span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="bouton bouton-clair mt-10">Sommaire complet</Link>
          </div>
        </div>
      </section>

      {/* Publications et agenda */}
      <div className="mx-auto mt-28 grid max-w-7xl gap-20 px-5 sm:px-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-ink pb-4">
            <h2 className="titre titre-l">Publications</h2>
            <Link href="/publications" className="fleche pb-2">Notes de lecture</Link>
          </div>
          <ul>
            {pubs.slice(0, 5).map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link href={`/publications/${p.slug}`} className="group grid gap-1 py-6 sm:grid-cols-[1fr_auto] sm:gap-8">
                  <span>
                    <span className="titre titre-m block italic"><span className="lien">{p.entry.titre}</span></span>
                    {p.entry.resume && <span className="mt-2 block text-[0.92rem] leading-relaxed text-ink-soft">{p.entry.resume}</span>}
                  </span>
                  <span className="label whitespace-nowrap sm:pt-2">{p.entry.auteurOuvrage}{p.entry.annee && ` · ${p.entry.annee}`}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="lg:col-span-5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-ink pb-4">
            <h2 className="titre titre-l">Agenda</h2>
            <Link href="/agenda" className="fleche pb-2">Tout l’agenda</Link>
          </div>
          <ul>
            {prochains.map((e) => (
              <li key={e.slug} className="grid grid-cols-[6.5rem_1fr] gap-5 border-b border-line py-6">
                <span className="font-serif text-[0.95rem] italic leading-snug text-terra">{e.entry.dateAffichee}</span>
                <span>
                  <span className="block font-serif leading-snug text-ink">{e.entry.intitule}</span>
                  {e.entry.lieu && <span className="mt-1.5 block text-[0.8rem] text-mute">{e.entry.lieu}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Le Groupe et ses sous-sites */}
      <section className="mx-auto mt-28 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label label-accent">Le Groupe JOGOO</p>
            <h2 className="titre titre-l mt-4">Un portail, six maisons</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              « Jogoo » désigne le coq en swahili. Depuis les Journées philosophiques de Lubumbashi, le coq de l’aube répond à la chouette de Minerve : penser au matin, à partir de l’Afrique.
            </p>
            <Link href="/le-groupe" className="fleche mt-8">Découvrir le Groupe</Link>
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-8">
            {sousSites.map(([href, titre, texte]) => (
              <li key={href} className="bg-paper">
                <Link href={href} className="group block h-full p-7">
                  <span className="titre titre-m block"><span className="lien">{titre}</span></span>
                  <span className="mt-2 block text-[0.9rem] leading-relaxed text-ink-soft">{texte}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
