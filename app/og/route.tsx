import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Image d’aperçu pour les partages (Facebook, WhatsApp, LinkedIn, X…), 1200 × 630.
 * Paramètres : t = titre, k = rubrique, i = image de la page (chemin local), a = auteur.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const titre = (q.get('t') || 'Philosophie africaine. Débats & questions').slice(0, 140);
  const kicker = (q.get('k') || 'Groupe JOGOO').slice(0, 60);
  const auteur = (q.get('a') || '').slice(0, 80);
  const image = q.get('i');
  const police = (f: string) => fs.readFile(path.join(process.cwd(), 'lib/og', f));
  const [m8, m6, gi, lb, lbi] = await Promise.all([
    police('montserrat-latin-800-normal.woff'),
    police('montserrat-latin-600-normal.woff'),
    police('eb-garamond-latin-400-italic.woff'),
    police('libre-baskerville-latin-700-normal.woff'),
    police('libre-baskerville-latin-400-italic.woff'),
  ]);
  const polices = [
    { name: 'Montserrat', data: m8, weight: 800 as const, style: 'normal' as const },
    { name: 'Montserrat', data: m6, weight: 600 as const, style: 'normal' as const },
    { name: 'Garamond', data: gi, weight: 400 as const, style: 'italic' as const },
    { name: 'Baskerville', data: lb, weight: 700 as const, style: 'normal' as const },
    { name: 'Baskerville', data: lbi, weight: 400 as const, style: 'italic' as const },
  ];
  const enDonnees = async (chemin: string) => {
    try {
      const r = await fetch(new URL(chemin, req.url));
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !/image\/(png|jpe?g)/.test(type)) return null;
      return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`;
    } catch {
      return null;
    }
  };
  const [photo, logo, coq] = await Promise.all([
    image && image.startsWith('/') ? enDonnees(image) : Promise.resolve(null),
    enDonnees('/medias/site/jogoo/logo-jogoo-blanc.png'),
    enDonnees('/medias/site/jogoo/coq-penseur-gauche.png'),
  ]);
  if (q.get('v') === 'edito') {
    const sousTitre = (q.get('st') || '').slice(0, 140);
    const f0 = q.get('f') || '';
    const fonction = f0.length > 85 ? f0.slice(0, 83).replace(/[\s,;]+\S*$/, '') + '…' : f0;
    const date = q.get('d') || '';
    const portraitChemin = q.get('p');
    const portrait = portraitChemin && portraitChemin.startsWith('/') ? await enDonnees(portraitChemin) : null;
    const initiales = auteur
      .split(/\s+/)
      .filter((m) => /^[A-ZÉ]/.test(m) && !/^Pr\.?$/.test(m))
      .slice(0, 2)
      .map((m) => m[0])
      .join('');
    const tailleTitre = titre.length > 80 ? 44 : titre.length > 50 ? 52 : 60;
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0d0b09', color: '#f7f1e6', fontFamily: 'Montserrat' }}>
          {photo && <img src={photo} style={{ position: 'absolute', right: 0, top: 0, width: 760, height: 630, objectFit: 'cover', opacity: 0.85 }} />}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', backgroundImage: 'linear-gradient(90deg, #0d0b09 0%, #0d0b09 38%, rgba(13,11,9,0.82) 58%, rgba(13,11,9,0.25) 100%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', backgroundImage: 'linear-gradient(0deg, rgba(13,11,9,0.95) 0%, rgba(13,11,9,0) 38%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', width: 1200, height: 630, padding: '52px 64px 44px' }}>
            {logo ? <img src={logo} height={50} style={{ height: 50, alignSelf: 'flex-start' }} /> : <div style={{ fontSize: 28, fontWeight: 800 }}>Groupe JOGOO</div>}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', maxWidth: 760 }}>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#e8b23a' }}>{kicker}</div>
              <div style={{ marginTop: 14, fontFamily: 'Baskerville', fontWeight: 700, fontSize: tailleTitre, lineHeight: 1.12, color: '#ffffff' }}>{titre}</div>
              {sousTitre && <div style={{ marginTop: 14, fontFamily: 'Baskerville', fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: 'rgba(247,241,230,0.82)' }}>{sousTitre}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 34, paddingTop: 22, borderTop: '1px solid rgba(247,241,230,0.18)' }}>
              {portrait ? (
                <img src={portrait} width={58} height={58} style={{ width: 58, height: 58, borderRadius: 29, objectFit: 'cover' }} />
              ) : (
                initiales && <div style={{ width: 58, height: 58, borderRadius: 29, background: '#a8361b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>{initiales}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 18, maxWidth: 720 }}>
                {auteur && <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>{auteur}</div>}
                {fonction && <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600, color: 'rgba(247,241,230,0.6)' }}>{fonction}</div>}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 17, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(247,241,230,0.6)' }}>{date}</div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: polices, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
    );
  }

  const taille = titre.length > 90 ? 50 : titre.length > 55 ? 60 : 72;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1a1a1a', fontFamily: 'Montserrat', color: '#f7f1e6' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: photo ? 700 : 820, padding: '56px 60px', background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1610 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 6, background: '#e8b23a' }} />
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase', color: '#e8b23a' }}>{kicker}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: taille, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{titre}</div>
            {auteur && <div style={{ marginTop: 18, fontFamily: 'Garamond', fontStyle: 'italic', fontSize: 34, color: 'rgba(247,241,230,0.75)' }}>{auteur}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {logo ? <img src={logo} height={58} style={{ height: 58 }} /> : <div style={{ fontSize: 30, fontWeight: 800 }}>Groupe JOGOO</div>}
            <div style={{ fontSize: 22, fontWeight: 600, color: 'rgba(247,241,230,0.55)' }}>philoafricaine.org</div>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, position: 'relative', background: photo ? '#000' : 'radial-gradient(circle at 60% 30%, #7a2a12 0%, #1a1a1a 70%)', overflow: 'hidden' }}>
          {photo ? (
            <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            coq && <img src={coq} style={{ position: 'absolute', right: -60, bottom: -40, height: 560 }} />
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: polices,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
