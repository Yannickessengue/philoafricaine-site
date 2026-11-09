import type { ReactNode } from 'react';
import { typo } from '@/lib/typo';

/* Rendu sur le site des éléments insérés dans l'éditeur : image avec légende, encadré, citation. */

const placeImage: Record<string, string> = {
  pleine: 'my-8 w-full clear-both',
  gauche: 'my-2 w-full sm:float-left sm:mr-7 sm:mb-4 sm:mt-1 sm:w-[45%]',
  droite: 'my-2 w-full sm:float-right sm:ml-7 sm:mb-4 sm:mt-1 sm:w-[45%]',
  centre: 'mx-auto my-8 w-full max-w-sm clear-both',
};

export function Illustration({ image, description, legende, credit, position = 'pleine' }: { image?: string; description?: string; legende?: string; credit?: string; position?: string }) {
  if (!image) return null;
  return (
    <figure className={`illustration ${placeImage[position] ?? placeImage.pleine}`}>
      <img src={image} alt={description || legende || ''} loading="lazy" className="!my-0 block h-auto w-full border border-ink/10 !bg-transparent" />
      {(legende || credit) && (
        <figcaption className="!mt-2 !text-left text-[0.8rem] italic leading-snug text-ink/60">
          {legende && typo(legende)}
          {credit && <span className="not-italic text-ink/40">{legende ? ' — ' : ''}{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

const styles: Record<string, string> = {
  sable: 'border-l-4 border-gold bg-cream',
  terra: 'border-l-4 border-terra bg-terra/[0.07]',
  sombre: 'bg-ink text-paper [&_p]:!text-paper/85 [&_li]:!text-paper/85 [&_a]:!text-gold [&_strong]:!text-paper',
  filet: 'border-y-2 border-terra',
};
const placeEncadre: Record<string, string> = {
  pleine: 'my-8 clear-both',
  droite: 'my-4 sm:float-right sm:ml-7 sm:mb-4 sm:w-[44%] sm:[&_p]:!text-left sm:[&_li]:!text-left',
  gauche: 'my-4 sm:float-left sm:mr-7 sm:mb-4 sm:w-[44%] sm:[&_p]:!text-left sm:[&_li]:!text-left',
};

export function Encadre({ titre, style = 'sable', position = 'pleine', children }: { titre?: string; style?: string; position?: string; children?: ReactNode }) {
  return (
    <aside className={`encadre px-6 py-5 text-[0.95rem] [&>*:last-child]:!mb-0 [&_p]:!mb-3 ${styles[style] ?? styles.sable} ${placeEncadre[position] ?? placeEncadre.pleine}`}>
      {titre && <p className={`!mb-2 font-brand !text-[0.72rem] font-bold uppercase tracking-[0.13em] !text-left ${style === 'sombre' ? '!text-gold' : '!text-terra-deep'}`}>{typo(titre)}</p>}
      {children}
    </aside>
  );
}

export function Citation({ texte, auteur }: { texte?: string; auteur?: string }) {
  if (!texte) return null;
  return (
    <figure className="clear-both my-10 border-y border-ink/15 py-6 text-center">
      <blockquote className="!m-0 !border-0 !p-0 font-serif text-[1.35rem] italic leading-snug !text-ink sm:text-[1.6rem]">« {typo(texte)} »</blockquote>
      {auteur && <figcaption className="!mt-3 !text-center font-brand text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-terra-deep">{typo(auteur)}</figcaption>}
    </figure>
  );
}

export const composantsRendu = { Illustration, Encadre, Citation };
