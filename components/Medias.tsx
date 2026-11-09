'use client';

import { useEffect, useRef, useState } from 'react';
import { Externe } from './Consentement';

const idYoutube = (url: string) => url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
/** Adresse intégrable : YouTube (sans cookies) ou WebTV de l’université de Rouen (permaliens UbiCast). */
const integration = (url: string) => {
  const yt = idYoutube(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`;
  const ubi = url.match(/^(https:\/\/webtv\.univ-rouen\.fr\/permalink\/[\w-]+)\/?$/);
  return ubi ? `${ubi[1]}/iframe/?autoplay=1` : undefined;
};

export type VideoAccueil = { titre: string; url: string; rubrique?: string | null };

/** Une vidéo en grand, les autres en vignettes autour ; une vignette cliquée passe à l’affiche. */
export function MosaiqueVideos({ videos }: { videos: VideoAccueil[] }) {
  const [une, setUne] = useState(0);
  const [lecture, setLecture] = useState(false);
  if (!videos.length) return null;
  const v = videos[une];
  const id = idYoutube(v.url);
  const src = integration(v.url);
  const choisir = (i: number) => {
    setUne(i);
    setLecture(true);
  };
  const Repli = () => (
    <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#7a2a12,#1a1a1a_70%)]" aria-hidden="true">
      <img src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="" className="w-1/3 max-w-[9rem] opacity-25" />
    </span>
  );
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-ink shadow-[0_24px_50px_-28px_rgba(0,0,0,0.7)]">
        {lecture && src ? (
          <div className="absolute inset-0">
            <Externe service={id ? 'YouTube' : 'la WebTV de l’université de Rouen'} lien={v.url}>
              <iframe
                key={src}
                className="absolute inset-0 h-full w-full"
                src={src}
                title={v.titre}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </Externe>
          </div>
        ) : (
          <button type="button" onClick={() => (src ? setLecture(true) : window.open(v.url, '_blank', 'noopener'))} className="group absolute inset-0 block text-left" aria-label={`Lire la vidéo : ${v.titre}`}>
            <Repli />
            {id && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-terra text-white shadow-xl transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              {v.rubrique && <span className="font-brand text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold">{v.rubrique}</span>}
              <span className="mt-1 block font-brand text-base font-bold leading-snug text-white sm:text-xl">{v.titre}</span>
            </span>
          </button>
        )}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:auto-rows-fr">
        {videos.slice(0, 6).map((x, i) => {
          const vid = idYoutube(x.url);
          const actif = i === une;
          return (
            <button
              key={x.url}
              type="button"
              onClick={() => choisir(i)}
              aria-current={actif ? 'true' : undefined}
              className={`group relative block aspect-video min-h-[4.5rem] overflow-hidden bg-ink text-left lg:aspect-auto ${actif ? 'ring-2 ring-terra ring-offset-2 ring-offset-cream' : ''}`}
              aria-label={`Lire : ${x.titre}`}
              title={x.titre}
            >
              <Repli />
              {vid && <img src={`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
              <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors ${actif ? 'bg-terra' : 'bg-black/45 group-hover:bg-terra'}`} aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
              </span>
              {actif && <span className="absolute left-2 top-2 bg-terra px-1.5 py-0.5 font-brand text-[0.55rem] font-bold uppercase tracking-[0.12em] text-white">À l’affiche</span>}
              <span className="absolute inset-x-0 bottom-0 p-2.5 font-brand text-[0.68rem] font-bold leading-snug text-white sm:text-[0.72rem]"><span className="line-clamp-2">{x.titre}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type Episode = { titre: string; serie?: string | null; audio: string; duree?: string | null; description?: string | null; source?: string | null };

const horloge = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Lecteur de podcast : épisode en cours, barre de progression, vitesse, liste des épisodes. */
export function LecteurPodcast({ episodes, complet = false }: { episodes: Episode[]; complet?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [n, setN] = useState(0);
  const [joue, setJoue] = useState(false);
  const [t, setT] = useState(0);
  const [total, setTotal] = useState(0);
  const [vitesse, setVitesse] = useState(1);
  const lancer = useRef(false);
  const ep = episodes[n];

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.playbackRate = vitesse;
  }, [vitesse, n]);

  useEffect(() => {
    if (!lancer.current) return;
    lancer.current = false;
    audio.current?.play().catch(() => setJoue(false));
  }, [n]);

  if (!ep) return null;

  const basculer = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setJoue(false));
    else a.pause();
  };
  const choisir = (i: number) => {
    if (i === n) return basculer();
    lancer.current = true;
    setN(i);
    setT(0);
    setTotal(0);
  };
  const sauter = (d: number) => {
    const a = audio.current;
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0) - 0.5, a.currentTime + d));
  };
  const VITESSES = [1, 1.25, 1.5, 0.75];

  return (
    <div className={`bg-ink text-left text-paper [&_p]:text-left [&_p]:hyphens-none ${complet ? 'grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]' : 'flex h-full flex-col shadow-none sm:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.7)]'}`}>
      <audio
        ref={audio}
        src={ep.audio}
        preload="none"
        onPlay={() => setJoue(true)}
        onPause={() => setJoue(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setTotal(e.currentTarget.duration)}
        onEnded={() => (n < episodes.length - 1 ? choisir(n + 1) : setJoue(false))}
      />
      <div className={`relative overflow-hidden p-5 sm:p-6 ${complet ? 'lg:sticky lg:top-20 lg:self-start lg:p-10' : ''}`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-terra/30 blur-3xl" aria-hidden="true" />
        {complet && <img src="/medias/podcasts/couverture-podcast.jpg" alt="" className="relative mb-6 w-28 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)] sm:w-36" />}
        <p className="relative flex items-center gap-2 font-brand text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold">
          <span className={`flex h-3 items-end gap-[2px] ${joue ? '' : 'opacity-50'}`} aria-hidden="true">
            {[0, 1, 2, 3].map((b) => (
              <span key={b} className={`w-[3px] bg-gold ${joue ? 'podcast-barre' : 'h-1'}`} style={{ animationDelay: `${b * 0.15}s` }} />
            ))}
          </span>
          Podcast · {ep.serie ?? 'Philosophie africaine'}
        </p>
        <p className="relative mt-3 font-brand text-lg font-bold leading-snug text-white">{ep.titre}</p>
        {ep.description && <p className="relative mt-2 text-[0.86rem] leading-relaxed text-paper/70">{ep.description}</p>}
        {ep.source && <p className="relative mt-2 font-serif text-[0.8rem] italic text-paper/45">{ep.source}</p>}

        <div className="relative mt-5 flex items-center gap-3">
          <button type="button" onClick={() => sauter(-15)} className="flex h-9 w-9 items-center justify-center text-paper/70 hover:text-gold" aria-label="Reculer de 15 secondes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /><text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
          </button>
          <button type="button" onClick={basculer} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terra text-white shadow-lg transition-transform hover:scale-105" aria-label={joue ? 'Pause' : 'Écouter'}>
            {joue ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z" /></svg>
            )}
          </button>
          <button type="button" onClick={() => sauter(15)} className="flex h-9 w-9 items-center justify-center text-paper/70 hover:text-gold" aria-label="Avancer de 15 secondes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /><text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={total || 0}
              step={0.1}
              value={Math.min(t, total || 0)}
              onChange={(e) => {
                const a = audio.current;
                if (a) a.currentTime = Number(e.target.value);
              }}
              aria-label="Position dans l’épisode"
              className="podcast-barre-lecture w-full"
              style={{ ['--p' as string]: `${total ? (t / total) * 100 : 0}%` }}
            />
            <div className="mt-1 flex justify-between font-brand text-[0.66rem] tabular-nums text-paper/50">
              <span>{horloge(t)}</span>
              <span>{total ? horloge(total) : ep.duree}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVitesse(VITESSES[(VITESSES.indexOf(vitesse) + 1) % VITESSES.length])}
            className="shrink-0 bg-white/10 px-2 py-1 font-brand text-[0.68rem] font-bold tabular-nums text-paper hover:bg-white/20"
            aria-label="Vitesse de lecture"
          >
            {vitesse}×
          </button>
        </div>
      </div>

      <ol className={`${complet ? 'border-t lg:border-l lg:border-t-0' : 'max-h-[14.5rem] flex-1 overflow-y-auto border-t'} border-white/10`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {episodes.map((e, i) => (
          <li key={e.audio}>
            <button
              type="button"
              onClick={() => choisir(i)}
              aria-current={i === n ? 'true' : undefined}
              className={`flex w-full ${complet ? 'items-start py-5' : 'items-center py-3'} gap-3 px-5 text-left transition-colors sm:px-6 ${i === n ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i === n ? 'bg-gold text-ink' : 'bg-white/10 text-paper/70'}`} aria-hidden="true">
                {i === n && joue ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`${complet ? 'text-[0.95rem]' : 'line-clamp-2 text-[0.8rem]'} block font-brand font-semibold leading-snug ${i === n ? 'text-gold' : 'text-paper/85'}`}>{e.titre}</span>
                {complet && e.description && <span className="mt-1.5 block text-[0.84rem] leading-relaxed text-paper/60">{e.description}</span>}
                {complet && e.source && <span className="mt-1 block font-serif text-[0.78rem] italic text-paper/40">{e.source}</span>}
              </span>
              {e.duree && <span className="shrink-0 font-brand text-[0.66rem] tabular-nums text-paper/45">{e.duree}</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
