import { notFound } from 'next/navigation';
import { reader, dateFr, motsCles } from '@/lib/content';
import { getMinutes, integrationVideo, MINUTE } from '@/lib/minutes';
import { partage } from '@/lib/apercu';
import { SITE } from '@/lib/site';
import { Prose } from '@/components/Prose';
import { Partage } from '@/components/Partage';
import { VideoMinute } from '@/components/VideoMinute';

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await reader.collections.minutes.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const m = await reader.collections.minutes.read((await params).slug);
  if (!m) return {};
  const titre = `${m.titre} · ${MINUTE.titre}`;
  return { title: titre, description: m.definition ?? undefined, ...partage(m.titre, m.definition, MINUTE.titre, m.affiche ?? m.portrait, m.philosophe) };
}

export default async function Episode({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [m, tous] = await Promise.all([reader.collections.minutes.read(slug), getMinutes()]);
  if (!m) notFound();
  const { node } = await m.contenu();
  const integration = integrationVideo(m.video);
  const refs = (m.references ?? '').split(/\n\s*\n/).map((r) => r.trim()).filter(Boolean);
  const autres = tous.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-8">
          <a href={MINUTE.base} className="font-brand text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold hover:text-white">
            ← {MINUTE.titre}
          </a>
          <div className="mt-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
            <VideoMinute titre={m.titre} fichier={m.fichierVideo} integration={integration} lien={m.video} affiche={m.affiche} />
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-12">
        <p className="kicker">
          {MINUTE.titre}
          {m.numero ? ` · n° ${m.numero}` : ''} · {dateFr(m.date)}
          {m.duree ? ` · ${m.duree}` : ''}
        </p>
        <h1 className="display-title mt-3 text-4xl text-ink sm:text-6xl">{m.titre}</h1>
        {m.definition && <p className="mt-5 text-left font-serif text-xl italic leading-relaxed text-ink [text-align:left] sm:text-2xl">{m.definition}</p>}
        <div className="mt-6 flex items-center gap-4">
          {m.portrait && <img src={m.portrait} alt="" className="h-14 w-14 rounded-full object-cover" />}
          <div>
            <p className="font-brand font-bold text-ink">{m.philosophe}</p>
            {m.fonction && <p className="text-sm text-ink-soft">{m.fonction}</p>}
          </div>
        </div>
        <Partage url={`${SITE}${MINUTE.base}/${slug}`} titre={`${m.titre} — ${MINUTE.titre}`} accroche={m.definition ?? undefined} hashtags={['LaMinuteDuChantDuCoq', 'PhilosophieAfricaine', ...motsCles(m.motsCles)]} commentaires={false} className="mt-8" />
        <Prose node={node} className="mt-10" />
        {refs.length > 0 && (
          <section className="mt-12">
            <h2 className="kicker">Pour aller plus loin</h2>
            <ul className="mt-3 space-y-2 text-[0.95rem] text-ink-soft">
              {refs.map((r, i) => (
                <li key={i}>{r.replace(/\*/g, '')}</li>
              ))}
            </ul>
          </section>
        )}
        <a href={`/sous-sites/jogoo-ai?q=${encodeURIComponent(`Que dit le corpus sur la notion de « ${m.titre} » ?`)}`} className="mt-12 flex items-center gap-4 bg-[#070d16] p-6 text-paper hover:bg-[#0b1626]">
          <img src="/medias/site/jogoo/disque-jogoo-ai.png" alt="" className="h-14 w-14 rounded-full" />
          <span>
            <span className="block font-brand text-lg font-bold text-white">Creuser « {m.titre} » avec JOGOO AI</span>
            <span className="block text-sm text-paper/65">Les textes du Groupe qui en parlent, avec leurs sources.</span>
          </span>
        </a>
      </article>
      {autres.length > 0 && (
        <section className="bg-cream/60">
          <div className="mx-auto max-w-5xl px-5 py-12">
            <p className="kicker mb-4">Autres épisodes</p>
            <div className="grid gap-6 sm:grid-cols-3">
              {autres.map((x) => (
                <a key={x.slug} href={`${MINUTE.base}/${x.slug}`} className="group block">
                  <span className="block font-brand text-lg font-bold text-ink group-hover:text-terra">{x.entry.titre}</span>
                  <span className="text-sm text-ink-soft">{x.entry.philosophe}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
