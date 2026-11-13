import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { rechercher, definitionLalande, termeDefini } from '@/lib/corpus';

/* Sites consultés en ligne au moment de la question (outil de recherche web de l'API Claude). */
const SITES = ['plato.stanford.edu', 'iep.utm.edu', 'philpapers.org', 'persee.fr', 'journals.openedition.org', 'books.openedition.org', 'erudit.org', 'hal.science', 'codesria.org', 'cairn.info', 'scielo.org', 'redalyc.org', 'clacso.org', 'philoafricaine.org'];

/* Ouvrages de référence pour les définitions : encyclopédies de philosophie générale. */
const ENCYCLOPEDIES = ['plato.stanford.edu', 'iep.utm.edu'];
/* Question de définition (« qu'est-ce que… », « que signifie… », « la notion de… », ou simple mot-clé) */
const DEFINITION = /(qu['’]\s*est[- ]ce\s+qu|que\s+(signifie|veut\s+dire)|d[ée]fini(r|tion|ssez)|\b(la\s+)?notion\s+d|\bconcept\s+d|\bsens\s+d[eu]|what\s+is|meaning\s+of|\bdefin)/i;
const estDefinition = (q: string) => DEFINITION.test(q) || q.trim().split(/\s+/).length <= 3;

const CONSIGNE_DEFINITION = `- Question de définition : commence par un paragraphe « Définition générale » qui donne le sens de la notion en philosophie générale. Cherche pour cela l'article correspondant de la Stanford Encyclopedia of Philosophy (à défaut, de l'Internet Encyclopedia of Philosophy) et nomme-le (« Stanford Encyclopedia of Philosophy, article "…" ») ; si le Vocabulaire technique et critique de la philosophie d'André Lalande figure parmi les documents, cite d'abord sa définition. Reformule en français, sans traduire de longs passages. Puis montre comment la notion est reprise, discutée ou transformée en philosophie africaine et, si c'est pertinent, dans les pensées noires, du Sud global et décoloniales, en t'appuyant sur les documents numérotés.`;

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

const SYSTEME = `Tu es JOGOO AI, l'assistant de recherche du Groupe JOGOO (philoafricaine.org). Ton domaine de référence est la philosophie africaine, mais tu couvres plus largement les pensées noires (Afrique, Caraïbes, Amériques noires, diasporas), les pensées du Sud global, la décolonisation des savoirs, ainsi que les grandes traditions philosophiques classiques avec lesquelles elles dialoguent.
Distingue clairement ces registres dans tes réponses, avec de courts intertitres en gras quand la question s'y prête :
- « Tradition philosophique classique » (Antiquité, philosophie européenne moderne et contemporaine, concepts généraux) ;
- « En philosophie africaine » ;
- « Pensées noires, Sud global et décolonisation des savoirs » (par exemple Césaire, Fanon, Glissant, la négritude, les pensées afro-américaines et caribéennes, les études décoloniales latino-américaines, les épistémologies du Sud).
N'utilise que les registres utiles à la question ; ne force pas une section vide.
Règles impératives :
- Réponds en français (ou dans la langue de la question), avec rigueur, clarté et sans jargon inutile. Écris toujours « philosophie africaine » au singulier.
- Appuie-toi d'abord sur les documents fournis entre balises <documents> et signale chaque appui par son numéro entre crochets, par exemple [1] ou [2][3].
- Certains documents sont de simples notices (« Notice seule ») : ils indiquent qu'un ouvrage existe dans la bibliothèque du Groupe, sans son texte. Recommande-les comme lectures, mais ne prétends jamais en connaître le contenu à partir de la notice.
- Philosophie comparée : quand la question rapproche des penseurs africains et non africains (par exemple Eboussi Boulaga et Ricœur, Towa et Hegel), tu peux compléter avec ta culture philosophique générale, à condition de l'annoncer clairement (« Hors corpus : … ») et de ne lui attribuer aucun numéro de source.
- N'invente jamais de référence, de titre, de date, de page ni de citation. Ne mets entre guillemets que des phrases qui figurent mot pour mot dans les documents.
- Si ni les documents ni des connaissances générales sûres ne permettent de répondre, écris exactement : « ${AUCUNE_SOURCE} »
- Distingue ce que disent les textes de tes propres reformulations ; présente les débats et les positions de manière équilibrée.
- Propose, quand c'est utile, une ou deux pistes pour approfondir (documents du corpus à lire, notions à explorer).
- Tu peux consulter quelques sites de référence (Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy, PhilPapers, Persée, OpenEdition, Érudit, HAL, CODESRIA, Cairn, SciELO, Redalyc, CLACSO) avec l'outil de recherche web, surtout quand les documents ne suffisent pas ou pour la philosophie comparée. Nomme alors clairement la source en ligne (par exemple : « selon la Stanford Encyclopedia of Philosophy, article "African Ethics" ») sans lui donner de numéro entre crochets.
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

/* Titres issus de noms de fichiers : on ne garde que le titre de l’ouvrage
   (sans traces de sites de téléchargement, mentions de scan, de version ni de poste de travail). */
const TITRES_CONNUS: [RegExp, string][] = [
  [/^s[ée]minaire\W+lire la crise du muntu/i, 'Séminaire « Lire La Crise du Muntu » (dossier)'],
  [/^la crise du muntu\b/i, 'La Crise du Muntu. Authenticité africaine et philosophie'],
  [/^christianisme sans f[ée]tiche/i, 'Christianisme sans fétiche. Révélation et domination'],
  [/^lignes de r[ée]sistance/i, 'Lignes de résistance'],
  [/^la d[ée]mocratie de transit/i, 'La Démocratie de transit au Cameroun'],
  [/^les conf[ée]rences nationales/i, 'Les Conférences nationales en Afrique noire. Une affaire à suivre'],
  [/^l.affaire de la philosophie africaine/i, 'L’Affaire de la philosophie africaine. Au-delà des querelles'],
  [/^muntu in crisis/i, 'Muntu in Crisis. African Authenticity and Philosophy'],
];
const capitale = (t: string) => (/[a-zà-ÿ]/.test(t) ? t : t.toLowerCase().replace(/^\p{L}/u, (c) => c.toUpperCase()));
const nettoyerTitre = (t: string, auteur = '') => {
  let x = t
    .replace(/[\s_-]*\(?b-ok\.(xyz|cc|org)\)?/gi, '')
    .replace(/[\s_-]*\(?\b(z-?lib(rary)?\.(org|is|io)|b-ok\.(xyz|cc|org)|1lib\.\w+|libgen\.\w+|ok\.xyz)\)?/gi, '')
    .replace(/\.(pdf|epub|docx?|djvu)$/i, '')
    .replace(/[-_ ]*DESKTOP-[A-Z0-9]+/gi, '')
    .replace(/\b(scann?(é|e|er)?|scan|corr\d*|nb\d+(-\d+)?|v\d+|final|d[ée]finitif|copie|bat|ocr)\b/gi, '')
    .replace(/\(\d+\)/g, '')
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\s_-]+$/, '')
    .trim();
  // « F EBOUSSI-BOULAGA - TITRE » : on retire l’auteur placé en tête du nom de fichier
  const nom = auteur.split(',')[0]?.trim();
  if (nom) {
    const motif = nom.replace(/[-\s]+/g, '[-\\s]+').replace(/[éè]/gi, '[eéè]');
    x = x.replace(new RegExp(`^(?:[A-Z]\\.?\\s+)?${motif}\\s*[-–:]\\s*`, 'i'), '');
  }
  for (const [re, titre] of TITRES_CONNUS) if (re.test(x)) return titre;
  return capitale(x.replace(/\s+-\s+/g, ' · ').replace(/^[\s·-]+|[\s·-]+$/g, ''));
};

/** Page d’un extrait, quand le texte intégral garde ses sauts de page (\f). */
function pageDe(texte: string, extrait: string): number | null {
  if (!texte.includes('\f')) return null;
  const i = texte.indexOf(extrait.slice(0, 120));
  if (i < 0) return null;
  let n = 1;
  for (let k = texte.indexOf('\f'); k >= 0 && k < i; k = texte.indexOf('\f', k + 1)) n++;
  return n;
}

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
  // Question de définition (espace chercheurs) : l'article du Vocabulaire de Lalande passe en premier
  if (chercheurs && estDefinition(question)) {
    const lal = await definitionLalande(termeDefini(question)).catch(() => null);
    if (lal) passages.splice(0, passages.length, lal, ...passages.filter((p) => p.notice.id !== lal.notice.id).slice(0, 5));
  }
  // Un même ouvrage (souvent présent en plusieurs fichiers) n’apparaît qu’une fois, avec ses pages
  type Groupe = { notice: (typeof passages)[number]['notice']; extraits: string[]; pages: number[]; score: number };
  const groupes: Groupe[] = [];
  for (const p of passages) {
    const titre = nettoyerTitre(p.notice.titre, p.notice.auteur);
    const cle = `${titre.toLowerCase()}|${p.notice.auteur.toLowerCase()}`;
    let g = groupes.find((x) => `${nettoyerTitre(x.notice.titre, x.notice.auteur).toLowerCase()}|${x.notice.auteur.toLowerCase()}` === cle);
    if (!g) groupes.push((g = { notice: p.notice, extraits: [], pages: [], score: p.score }));
    else if (g.notice.acces === 'Notice seule (bibliothèque du Groupe)' && p.notice.acces !== g.notice.acces) g.notice = p.notice;
    if (p.notice.acces !== 'Notice seule (bibliothèque du Groupe)') {
      g.extraits.push(p.extrait);
      const pg = pageDe(p.notice.texte, p.extrait);
      if (pg && !g.pages.includes(pg)) g.pages.push(pg);
    }
  }
  const pagesDe = (g: Groupe) => (g.pages.length ? (g.pages.length > 1 ? 'pp. ' : 'p. ') + g.pages.sort((a, b) => a - b).join(', ') : '');
  const sources = groupes.map((g, i) => ({
    n: i + 1,
    titre: nettoyerTitre(g.notice.titre, g.notice.auteur),
    pages: pagesDe(g),
    auteur: g.notice.auteur,
    type: g.notice.type,
    source: g.notice.source,
    annee: g.notice.annee,
    url: g.notice.url,
    acces: g.notice.acces,
    extrait: g.notice.acces === 'Notice seule (bibliothèque du Groupe)' ? '' : (g.extraits[0] ?? '').slice(0, 420),
  }));

  const cle = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
  if (!cle) return NextResponse.json({ mode: 'bibliotheque', reponse: null, sources, chercheurs });

  const documents = groupes
    .map(
      (g, i) =>
        `<document numero="${i + 1}">\nTitre : ${nettoyerTitre(g.notice.titre, g.notice.auteur)}\nAuteur : ${g.notice.auteur || 'non précisé'}\nType : ${g.notice.type} — ${g.notice.source}${g.notice.annee ? ` (${g.notice.annee})` : ''}${pagesDe(g) ? `\nPages : ${pagesDe(g)}` : ''}\nAccès : ${g.notice.acces}\nExtrait :\n${g.extraits.length ? g.extraits.join('\n[…]\n') : `Notice : ${nettoyerTitre(g.notice.titre, g.notice.auteur)}, ${g.notice.auteur || 'auteur à préciser'}. Ouvrage présent dans la bibliothèque du Groupe JOGOO ; texte non consultable par l’assistant.`}\n</document>`,
    )
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
        // Marge pour la réflexion et la recherche en ligne : la longueur de la réponse est réglée par la consigne
        max_tokens: LONGUEURS[longueur].jetons + (avecWeb ? 3000 : 1500),
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
          let arret = '';
          const diag: string[] = [];
          for (;;) {
            const { value, done } = await lecteur.read();
            if (done) break;
            tampon += dec.decode(value, { stream: true });
            let k;
            while ((k = tampon.indexOf('\n')) >= 0) {
              const ligne = tampon.slice(0, k).trim();
              tampon = tampon.slice(k + 1);
              if (!ligne.startsWith('data:')) continue;
              let ev: { type?: string; delta?: { type?: string; text?: string; citation?: Citation; stop_reason?: string }; content_block?: { type?: string; content?: unknown }; error?: unknown };
              try { ev = JSON.parse(ligne.slice(5)); } catch { continue; }
              if (ev.type === 'message_delta' && ev.delta?.stop_reason) arret = ev.delta.stop_reason;
              if (ev.type === 'error') diag.push(JSON.stringify(ev.error).slice(0, 300));
              if (ev.type === 'content_block_start' && ev.content_block?.type === 'web_search_tool_result') diag.push(JSON.stringify(ev.content_block.content).slice(0, 300));
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
          if (!texte.trim() || arret !== 'end_turn') console.error('JOGOO AI (flux) arrêt', arret, diag.join(' | '));
          envoyer({ t: 'fin', mode: 'assistant', sources: [...sources, ...sourcesEnLigne(citations)], premier, total: Date.now() - t0, ...(corps.diag ? { arret, diag } : {}) });
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
