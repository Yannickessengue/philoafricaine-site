import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { rechercher } from '@/lib/corpus';

/* Sites consultés en ligne au moment de la question (outil de recherche web de l'API Claude). */
const SITES = ['plato.stanford.edu', 'iep.utm.edu', 'philpapers.org', 'persee.fr', 'journals.openedition.org', 'books.openedition.org', 'erudit.org', 'hal.science', 'codesria.org', 'cairn.info', 'philoafricaine.org'];

/* Ouvrages de référence pour les définitions : encyclopédies de philosophie générale. */
const ENCYCLOPEDIES = ['plato.stanford.edu', 'iep.utm.edu'];
/* Question de définition (« qu'est-ce que… », « que signifie… », « la notion de… », ou simple mot-clé) */
const DEFINITION = /(qu['’]\s*est[- ]ce\s+qu|que\s+(signifie|veut\s+dire)|d[ée]fini(r|tion|ssez)|\b(la\s+)?notion\s+d|\bconcept\s+d|\bsens\s+d[eu]|what\s+is|meaning\s+of|\bdefin)/i;
const estDefinition = (q: string) => DEFINITION.test(q) || q.trim().split(/\s+/).length <= 3;

const CONSIGNE_DEFINITION = `- Question de définition : commence par un paragraphe « Définition générale » qui donne le sens de la notion en philosophie générale. Cherche pour cela l'article correspondant de la Stanford Encyclopedia of Philosophy (à défaut, de l'Internet Encyclopedia of Philosophy) et nomme-le (« Stanford Encyclopedia of Philosophy, article "…" ») ; si le Vocabulaire technique et critique de la philosophie d'André Lalande figure parmi les documents, cite d'abord sa définition. Reformule en français, sans traduire de longs passages. Puis, dans un second temps (« En philosophie africaine »), montre comment la notion est reprise, discutée ou transformée, en t'appuyant sur les documents numérotés.`;

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
- Réponse structurée : paragraphes courts, éventuellement une liste.`;

const LONGUEURS = {
  courte: { consigne: 'Format demandé : réponse courte et directe, 120 à 200 mots au plus, avec les renvois aux sources.', jetons: 700 },
  developpee: { consigne: 'Format demandé : réponse développée et approfondie, 350 à 550 mots, avec les renvois aux sources.', jetons: 1800 },
} as const;

const historiques = new Map<string, number[]>();
function limite(ip: string) {
  const maintenant = Date.now();
  const h = (historiques.get(ip) ?? []).filter((t) => maintenant - t < 10 * 60_000);
  if (h.length >= 12) return true;
  h.push(maintenant);
  historiques.set(ip, h);
  return false;
}

/* Titres issus de noms de fichiers : on retire les traces de sites de téléchargement et les extensions. */
const nettoyerTitre = (t: string) =>
  t
    .replace(/[\s_-]*\(?b-ok\.(xyz|cc|org)\)?/gi, '')
    .replace(/[\s_-]*\(?\b(z-?lib(rary)?\.(org|is|io)|b-ok\.(xyz|cc|org)|1lib\.\w+|libgen\.\w+|ok\.xyz)\)?/gi, '')
    .replace(/\.(pdf|epub|docx?|djvu)$/i, '')
    .replace(/[\s_-]+$/, '')
    .trim();

type Message = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  const t0 = Date.now();
  const corps = await req.json().catch(() => ({}));
  // Préchauffage : charge (et déchiffre) le corpus pendant que l'utilisateur tape sa question
  if (corps.prechauffer) {
    await rechercher('philosophie africaine', 1, codeValide(corps.code)).catch(() => []);
    return NextResponse.json({ ok: true, ms: Date.now() - t0 });
  }
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
    titre: nettoyerTitre(p.notice.titre),
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
    .map((p, i) => `<document numero="${i + 1}">\nTitre : ${nettoyerTitre(p.notice.titre)}\nAuteur : ${p.notice.auteur || 'non précisé'}\nType : ${p.notice.type} — ${p.notice.source}${p.notice.annee ? ` (${p.notice.annee})` : ''}\nAccès : ${p.notice.acces}\nExtrait :\n${p.extrait}\n</document>`)
    .join('\n\n');

  const longueur = corps.longueur === 'developpee' ? 'developpee' : 'courte';
  const corpusSuffit = passages.length >= 4 && (passages[0]?.score ?? 0) >= 10;
  const definition = estDefinition(question);
  // Recherche en ligne : toujours pour une définition (encyclopédies), sinon seulement si le corpus répond mal
  const web = definition || !corpusSuffit;
  const appeler = (avecWeb: boolean, flux: boolean) =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.JOGOO_AI_MODELE || 'claude-sonnet-5-5',
        max_tokens: LONGUEURS[longueur].jetons,
        system: `${SYSTEME}${definition ? `\n${CONSIGNE_DEFINITION}` : ''}\n- ${LONGUEURS[longueur].consigne}`,
        stream: flux,
        ...(avecWeb ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2, allowed_domains: definition && corpusSuffit ? ENCYCLOPEDIES : SITES }] } : {}),
        messages: [...fil, { role: 'user', content: `<documents>\n${documents || '(aucun document du corpus ne correspond)'}\n</documents>\n\nQuestion : ${question}` }],
      }),
    });
  type Citation = { type: string; url?: string; title?: string };
  const sourcesEnLigne = (citations: Citation[]) => {
    const vus = new Set<string>();
    return citations
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
  };
  const indisponible = 'L’assistant est momentanément indisponible ; voici les documents trouvés dans le corpus.';

  /* Réponse au fil de l'écriture (flux NDJSON) : le navigateur affiche le texte dès les premiers mots. */
  if (corps.flux) {
    const enc = new TextEncoder();
    const flux = new ReadableStream({
      async start(ctrl) {
        const envoyer = (o: object) => ctrl.enqueue(enc.encode(JSON.stringify(o) + '\n'));
        envoyer({ t: 'meta', sources, chercheurs, recherche: Date.now() - t0 });
        try {
          let r = await appeler(web, true);
          if (!r.ok || !r.body) {
            console.error('JOGOO AI (flux, avec recherche en ligne)', r.status, await r.text());
            r = await appeler(false, true);
          }
          if (!r.ok || !r.body) {
            console.error('JOGOO AI (flux)', r.status, await r.text());
            envoyer({ t: 'fin', mode: 'bibliotheque', sources, erreur: indisponible });
            return ctrl.close();
          }
          const lecteur = r.body.getReader();
          const dec = new TextDecoder();
          let tampon = '', texte = '', premier = 0;
          const citations: Citation[] = [];
          for (;;) {
            const { value, done } = await lecteur.read();
            if (done) break;
            tampon += dec.decode(value, { stream: true });
            let k;
            while ((k = tampon.indexOf('\n')) >= 0) {
              const ligne = tampon.slice(0, k).trim();
              tampon = tampon.slice(k + 1);
              if (!ligne.startsWith('data:')) continue;
              let ev: { type?: string; delta?: { type?: string; text?: string; citation?: Citation }; content_block?: { type?: string } };
              try { ev = JSON.parse(ligne.slice(5)); } catch { continue; }
              if (ev.type === 'content_block_start' && ev.content_block?.type === 'server_tool_use') envoyer({ t: 'etat', d: 'Consultation des sites de référence…' });
              if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
                if (!premier) premier = Date.now() - t0;
                texte += ev.delta.text;
                envoyer({ t: 'texte', d: ev.delta.text });
              }
              if (ev.type === 'content_block_delta' && ev.delta?.type === 'citations_delta' && ev.delta.citation) citations.push(ev.delta.citation);
            }
          }
          if (!texte.trim()) envoyer({ t: 'texte', d: AUCUNE_SOURCE });
          envoyer({ t: 'fin', mode: 'assistant', sources: [...sources, ...sourcesEnLigne(citations)], premier, total: Date.now() - t0 });
        } catch (e) {
          console.error('JOGOO AI (flux)', e);
          envoyer({ t: 'fin', mode: 'bibliotheque', sources, erreur: indisponible });
        }
        ctrl.close();
      },
    });
    return new Response(flux, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' } });
  }

  try {
    // La recherche en ligne ajoute 5 à 15 s : on ne la lance que si le corpus répond mal à la question
    let r = await appeler(web, false);
    if (!r.ok) {
      console.error('JOGOO AI (avec recherche en ligne)', r.status, await r.text());
      r = await appeler(false, false);
    }
    if (!r.ok) {
      console.error('JOGOO AI', r.status, await r.text());
      return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs, erreur: indisponible });
    }
    type Bloc = { type: string; text?: string; citations?: Citation[] };
    const j = (await r.json()) as { content?: Bloc[] };
    const blocs = (j.content ?? []).filter((b) => b.type === 'text');
    const reponse = blocs.map((b) => b.text ?? '').join('').trim();
    return NextResponse.json({ mode: 'assistant', reponse: reponse || AUCUNE_SOURCE, sources: [...sources, ...sourcesEnLigne(blocs.flatMap((b) => b.citations ?? []))], chercheurs });
  } catch (e) {
    console.error('JOGOO AI', e);
    return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs, erreur: indisponible });
  }
}
