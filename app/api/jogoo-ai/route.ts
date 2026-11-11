import { NextResponse } from 'next/server';
import { rechercher } from '@/lib/corpus';

/* JOGOO AI — assistant de recherche documentaire (recherche augmentée par documents).
   1. On cherche les passages pertinents dans le corpus du site ;
   2. si une clé ANTHROPIC_API_KEY est configurée, Claude rédige une réponse appuyée sur ces seuls passages ;
   3. sinon, on renvoie les documents trouvés (mode « bibliothèque »).
   La clé n'est jamais exposée au navigateur. */

const AUCUNE_SOURCE =
  'Je ne dispose pas, dans le corpus consultable, de sources suffisantes pour répondre avec précision. Essayez une autre formulation ou consultez la bibliothèque.';

const SYSTEME = `Tu es JOGOO AI, l'assistant de recherche en philosophie africaine du Groupe JOGOO (philoafricaine.org).
Règles impératives :
- Réponds en français (ou dans la langue de la question), avec rigueur, clarté et sans jargon inutile. Écris toujours « philosophie africaine » au singulier.
- Appuie-toi d'abord sur les documents fournis entre balises <documents> et signale chaque appui par son numéro entre crochets, par exemple [1] ou [2][3].
- Certains documents sont de simples notices (« Notice seule ») : ils indiquent qu'un ouvrage existe dans la bibliothèque du Groupe, sans son texte. Recommande-les comme lectures, mais ne prétends jamais en connaître le contenu à partir de la notice.
- Philosophie comparée : quand la question rapproche des penseurs africains et non africains (par exemple Eboussi Boulaga et Ricœur, Towa et Hegel), tu peux compléter avec ta culture philosophique générale, à condition de l'annoncer clairement (« Hors corpus : … ») et de ne lui attribuer aucun numéro de source.
- N'invente jamais de référence, de titre, de date, de page ni de citation. Ne mets entre guillemets que des phrases qui figurent mot pour mot dans les documents.
- Si ni les documents ni des connaissances générales sûres ne permettent de répondre, écris exactement : « ${AUCUNE_SOURCE} »
- Distingue ce que disent les textes de tes propres reformulations ; présente les débats et les positions de manière équilibrée.
- Propose, quand c'est utile, une ou deux pistes pour approfondir (documents du corpus à lire, notions à explorer).
- Réponse structurée et concise : quelques paragraphes courts, éventuellement une liste. Pas plus de 400 mots.`;

const historiques = new Map<string, number[]>();
function limite(ip: string) {
  const maintenant = Date.now();
  const h = (historiques.get(ip) ?? []).filter((t) => maintenant - t < 10 * 60_000);
  if (h.length >= 12) return true;
  h.push(maintenant);
  historiques.set(ip, h);
  return false;
}

type Message = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  const corps = await req.json().catch(() => ({}));
  const question = String(corps.question ?? '').trim().slice(0, 1200);
  const fil: Message[] = Array.isArray(corps.historique)
    ? corps.historique.slice(-6).map((m: Message) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content ?? '').slice(0, 3000) }))
    : [];
  if (question.length < 3) return NextResponse.json({ erreur: 'Posez une question un peu plus précise.' }, { status: 400 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnu';
  if (limite(ip)) return NextResponse.json({ erreur: 'Beaucoup de questions en peu de temps : merci de patienter quelques minutes.' }, { status: 429 });

  // On cherche aussi avec le fil de la conversation, pour les questions de relance
  const derniere = fil.filter((m) => m.role === 'user').slice(-1)[0]?.content ?? '';
  const passages = await rechercher(`${question} ${derniere}`.trim(), 6);
  const sources = passages.map((p, i) => ({
    n: i + 1,
    titre: p.notice.titre,
    auteur: p.notice.auteur,
    type: p.notice.type,
    source: p.notice.source,
    annee: p.notice.annee,
    url: p.notice.url,
    acces: p.notice.acces,
    extrait: p.extrait.slice(0, 420),
  }));

  const cle = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
  if (!cle) return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources });
  if (!passages.length) return NextResponse.json({ mode: 'assistant', reponse: AUCUNE_SOURCE, sources: [] });

  const documents = passages
    .map((p, i) => `<document numero="${i + 1}">\nTitre : ${p.notice.titre}\nAuteur : ${p.notice.auteur || 'non précisé'}\nType : ${p.notice.type} — ${p.notice.source}${p.notice.annee ? ` (${p.notice.annee})` : ''}\nAccès : ${p.notice.acces}\nExtrait :\n${p.extrait}\n</document>`)
    .join('\n\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.JOGOO_AI_MODELE || 'claude-sonnet-5-5',
        max_tokens: 1200,
        system: SYSTEME,
        messages: [...fil, { role: 'user', content: `<documents>\n${documents}\n</documents>\n\nQuestion : ${question}` }],
      }),
    });
    if (!r.ok) {
      console.error('JOGOO AI', r.status, await r.text());
      return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, erreur: 'L’assistant est momentanément indisponible ; voici les documents trouvés dans le corpus.' });
    }
    const j = await r.json();
    const reponse = (j.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim();
    return NextResponse.json({ mode: 'assistant', reponse, sources });
  } catch (e) {
    console.error('JOGOO AI', e);
    return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, erreur: 'L’assistant est momentanément indisponible ; voici les documents trouvés dans le corpus.' });
  }
}
