import { getEditos, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { EnTete } from '@/components/ui';

export const metadata = { title: 'L’édito de la semaine', description: 'Un texte de réflexion, pour donner le premier cri de la semaine.' };

export default async function Editos() {
  const editos = await getEditos();
  const [une, ...autres] = editos;
  const resume = (e: (typeof editos)[number], n: number) => extrait(e.entry.accroche || corpsBrut('editos', e.slug), n);
  return (
    <>
      <EnTete kicker="Chaque dimanche" titre="L’édito de la semaine" intro="Un texte de réflexion, pour donner le premier cri de la semaine." icone="tete" />
      <div className="mx-auto max-w-4xl px-5 py-16">
        {une && (
          <a className="group grid overflow-hidden border border-ink/12 bg-white lg:grid-cols-2" href={`/edito/${une.slug}`}>
            <div className="cadre aspect-[7/5]">
              {une.entry.image && <img alt={une.entry.imageDescription ?? ''} src={une.entry.image} className="transition-transform duration-500 group-hover:scale-[1.03]" />}
            </div>
            <div className="flex flex-col p-8">
              <p className="kicker">{dateFr(une.entry.date)}</p>
              <h2 className="display-title mt-2 text-2xl text-ink group-hover:text-terra sm:text-3xl">{une.entry.titre}</h2>
              <p className="mt-3 font-serif text-base italic leading-relaxed text-ink/75">{resume(une, 420)}</p>
              {une.entry.signature && (
                <div className="mt-5 flex items-center gap-3">
                  {une.entry.portrait && <img alt="" src={une.entry.portrait} className="h-10 w-10 rounded-full object-cover" />}
                  <span className="text-xs leading-tight text-ink-soft">{sansEmail(une.entry.signature)}</span>
                </div>
              )}
            </div>
          </a>
        )}
        {autres.length > 0 && (
          <>
            <h2 className="display-title mt-16 text-2xl text-terra">Les éditos précédents</h2>
            <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {autres.map((e) => (
                <li key={e.slug}>
                  <a className="group flex items-center gap-5 py-5" href={`/edito/${e.slug}`}>
                    <span className="cadre h-16 w-24 shrink-0 border border-ink/10">{e.entry.image && <img alt="" src={e.entry.image} loading="lazy" />}</span>
                    <span className="min-w-0">
                      <span className="kicker">{dateFr(e.entry.date)}</span>
                      <span className="mt-1 block font-brand text-[1.02rem] font-bold leading-snug text-ink group-hover:text-terra">{e.entry.titre}</span>
                      <span className="mt-1 line-clamp-1 block text-sm text-ink-soft">{resume(e, 240)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
