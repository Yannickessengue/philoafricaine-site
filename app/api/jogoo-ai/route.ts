import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { rechercher } from '@/lib/corpus';

/* Sites consultés en ligne au moment de la question (outil de recherche web de l'API Claude). */
const SITES = ['plato.stanford.edu', 'iep.utm.edu', 'philpapers.org', 'persee.fr', 'journals.openedition.org', 'books.openedition.org', 'erudit.org', 'hal.science', 'codesria.org', 'cairn.info', 'philoafricaine.org'];

function codeValide(code: unknown) {
  const attendu = process.env.JOGOO_AI_CODE_CHERCHEURS?.trim();
  if (!attendu || typeof code !== 'string') return false;
  const a = Buffer.from(code.trim()), b = Buffer.from(attendu);
  return a.length === b.length && timingSafeEqual(a, b);
}

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
- Tu peux consulter quelques sites de référence (Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy, PhilPapers, Persée, OpenEdition, Érudit, HAL, CODESRIA, Cairn) avec l'outil de recherche web, surtout quand les documents ne suffisent pas ou pour la philosophie comparée. Nomme alors clairement la source en ligne (par exemple : « selon la Stanford Encyclopedia of Philosophy, article "African Ethics" ») sans lui donner de numéro entre crochets.
- Réponse structurée et concise : quelques paragraphes courts, éventuellement une liste. Pas plus de 450 mots.`;

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
  const chercheurs = codeValide(corps.code);
  const passages = await rechercher(`${question} ${derniere}`.trim(), 6, chercheurs);
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
  if (!cle) return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs });

  const documents = passages
    .map((p, i) => `<document numero="${i + 1}">\nTitre : ${p.notice.titre}\nAuteur : ${p.notice.auteur || 'non précisé'}\nType : ${p.notice.type} — ${p.notice.source}${p.notice.annee ? ` (${p.notice.annee})` : ''}\nAccès : ${p.notice.acces}\nExtrait :\n${p.extrait}\n</document>`)
    .join('\n\n');

  const appeler = (avecWeb: boolean) =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.JOGOO_AI_MODELE || 'claude-sonnet-5-5',
        max_tokens: 1800,
        system: SYSTEME,
        ...(avecWeb ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3, allowed_domains: SITES }] } : {}),
        messages: [...fil, { role: 'user', content: `<documents>\n${documents || '(aucun document du corpus ne correspond)'}\n</documents>\n\nQuestion : ${question}` }],
      }),
    });
  try {
    let r = await appeler(true);
    if (!r.ok) {
      console.error('JOGOO AI (avec recherche en ligne)', r.status, await r.text());
      r = await appeler(false);
    }
    if (!r.ok) {
      console.error('JOGOO AI', r.status, await r.text());
      return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs, erreur: 'L’assistant est momentanément indisponible ; voici les documents trouvés dans le corpus.' });
    }
    type Bloc = { type: string; text?: string; citations?: { type: string; url?: string; title?: string }[] };
    const j = (await r.json()) as { content?: Bloc[] };
    const blocs = (j.content ?? []).filter((b) => b.type === 'text');
    const reponse = blocs.map((b) => b.text ?? '').join('').trim();
    // sources en ligne citées dans la réponse
    const vus = new Set<string>();
    const enLigne = blocs
      .flatMap((b) => b.citations ?? [])
      .filter((c) => c.url && !vus.has(c.url) && vus.add(c.url))
      .slice(0, 6)
      .map((c, i) => ({
        n: sources.length + i + 1,
        titre: c.title || c.url!,
        auteur: '',
        type: 'En ligne',
        source: new URL(c.url!).hostname.replace(/^www\./, ''),
        annee: '',
        url: c.url!,
        acces: 'Lien externe',
        extrait: '',
      }));
    return NextResponse.json({ mode: 'assistant', reponse: reponse || AUCUNE_SOURCE, sources: [...sources, ...enLigne], chercheurs });
  } catch (e) {
    console.error('JOGOO AI', e);
    return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs, erreur: 'L’assistant est momentanément indisponible ; voici les documents trouvés dans le corpus.' });
  }
}
