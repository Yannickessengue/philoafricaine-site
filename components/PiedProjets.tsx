import { SOUS_SITES } from '@/lib/liste-sous-sites';

const court = (nom: string) =>
  nom.replace(' Communications', '').replace('Philo Africaine Magazine', 'Le Magazine').replace('Fonds Eboussi Boulaga', 'Fonds Eboussi');

/** Tout en bas de chaque page : accès rapide aux six projets (pensé d’abord pour le téléphone). */
export function PiedProjets() {
  return (
    <nav aria-label="Nos projets : accès rapide" className="border-t border-paper/10 bg-[#120f0d] pb-24 pt-6 lg:pb-8">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-3 font-brand text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Nos projets</p>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {SOUS_SITES.map(([href, nom, logo, e]) => (
            <li key={href}>
              <a href={href} className="group flex h-full flex-col items-center gap-2 bg-paper px-2 pb-2.5 pt-3 text-center transition-colors hover:bg-white">
                <span className="flex h-11 w-full items-center justify-center">
                  <img src={logo} alt="" loading="lazy" style={{ ['--e' as string]: e }} className="h-[calc(2.4rem*var(--e))] w-auto max-w-[85%] object-contain" />
                </span>
                <span className="font-brand text-[0.68rem] font-bold leading-tight text-ink group-hover:text-terra sm:text-xs">{court(nom)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
