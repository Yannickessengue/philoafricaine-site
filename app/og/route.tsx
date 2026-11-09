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
  const [m8, m6, gi] = await Promise.all([police('montserrat-latin-800-normal.woff'), police('montserrat-latin-600-normal.woff'), police('eb-garamond-latin-400-italic.woff')]);
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
    enDonnees('/medias/site/jogoo/coq-penseur-t.png'),
  ]);
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
      fonts: [
        { name: 'Montserrat', data: m8, weight: 800, style: 'normal' },
        { name: 'Montserrat', data: m6, weight: 600, style: 'normal' },
        { name: 'Garamond', data: gi, weight: 400, style: 'italic' },
      ],
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
