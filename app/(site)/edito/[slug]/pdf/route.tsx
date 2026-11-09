import fs from 'node:fs/promises';
import path from 'node:path';
import Markdoc, { type Node } from '@markdoc/markdoc';
import { Document, Font, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { reader, sansEmail } from '@/lib/content';
import { SITE } from '@/lib/site';

/**
 * Version PDF de l’édito, générée côté serveur et téléchargée directement
 * (l’ancien site passait par la fenêtre d’impression du navigateur, ce qui échouait souvent sur mobile).
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await reader.collections.editos.list();
  return slugs.map((slug) => ({ slug }));
}

const P = (f: string) => path.join(process.cwd(), 'lib/pdf', f);
let polices = false;
function enregistrerPolices() {
  if (polices) return;
  Font.register({
    family: 'Garamond',
    fonts: [
      { src: P('eb-garamond-latin-400-normal.ttf') },
      { src: P('eb-garamond-latin-400-italic.ttf'), fontStyle: 'italic' },
      { src: P('eb-garamond-latin-700-normal.ttf'), fontWeight: 700 },
      { src: P('eb-garamond-latin-700-italic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: 'Montserrat',
    fonts: [
      { src: P('montserrat-latin-600-normal.ttf'), fontWeight: 600 },
      { src: P('montserrat-latin-800-normal.ttf'), fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((mot) => [mot]);
  polices = true;
}

const TERRA = '#a8361b';
const OR = '#c8901c';
const ENCRE = '#1a1a1a';
const s = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 64, paddingHorizontal: 62, fontFamily: 'Garamond', fontSize: 11.5, lineHeight: 1.5, color: ENCRE },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 26, borderBottomWidth: 0.6, borderBottomColor: '#d8cfc0' },
  kicker: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: TERRA },
  titre: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 24, lineHeight: 1.15, marginTop: 10 },
  sousTitre: { fontStyle: 'italic', fontSize: 14, color: '#555', marginTop: 8 },
  auteur: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  portrait: { width: 40, height: 40, borderRadius: 20, objectFit: 'cover', marginRight: 10 },
  nom: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 9.5 },
  meta: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 7.5, color: '#777', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  accroche: { fontWeight: 700, fontSize: 12.5, lineHeight: 1.45, marginTop: 18 },
  image: { marginTop: 16, width: '100%', maxHeight: 260, objectFit: 'cover' },
  legende: { fontSize: 8.5, fontStyle: 'italic', color: '#777', marginTop: 4 },
  exergue: { marginTop: 18, marginHorizontal: 30, paddingVertical: 10, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: '#d8cfc0', fontStyle: 'italic', fontSize: 12, textAlign: 'center' },
  exergueAuteur: { fontSize: 8.5, textAlign: 'center', color: '#777', marginTop: 4 },
  p: { marginTop: 8, textAlign: 'justify' },
  h2: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 13, marginTop: 18, color: ENCRE },
  h3: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 11.5, marginTop: 14, color: TERRA },
  li: { flexDirection: 'row', marginTop: 4 },
  puce: { width: 14, color: TERRA },
  section: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: OR, marginTop: 24, marginBottom: 2 },
  ref: { fontSize: 9.5, marginTop: 4 },
  pied: { position: 'absolute', bottom: 28, left: 62, right: 62, flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 7, color: '#999' },
});

/** Texte en ligne Markdoc → éléments <Text> (gras, italique, liens). */
function enLigne(n: Node, k = 0): ReactNode {
  switch (n.type) {
    case 'text':
      return String(n.attributes.content ?? '');
    case 'softbreak':
      return ' ';
    case 'hardbreak':
      return '\n';
    case 'em':
      return (
        <Text key={k} style={{ fontStyle: 'italic' }}>
          {n.children.map(enLigne)}
        </Text>
      );
    case 'strong':
      return (
        <Text key={k} style={{ fontWeight: 700 }}>
          {n.children.map(enLigne)}
        </Text>
      );
    case 'link':
      return (
        <Link key={k} src={String(n.attributes.href)} style={{ color: TERRA }}>
          {n.children.map(enLigne)}
        </Link>
      );
    default:
      return n.children?.map(enLigne);
  }
}

/** Blocs Markdoc → éléments PDF. */
function blocs(n: Node, k = 0): ReactNode {
  switch (n.type) {
    case 'document':
      return n.children.map(blocs);
    case 'paragraph':
      return (
        <Text key={k} style={s.p}>
          {n.children.map(enLigne)}
        </Text>
      );
    case 'heading':
      return (
        <Text key={k} style={Number(n.attributes.level) <= 2 ? s.h2 : s.h3} minPresenceAhead={40}>
          {n.children.map(enLigne)}
        </Text>
      );
    case 'list':
      return (
        <View key={k} style={{ marginTop: 6 }}>
          {n.children.map((item, i) => (
            <View key={i} style={s.li} wrap={false}>
              <Text style={s.puce}>{n.attributes.ordered ? `${i + 1}.` : '•'}</Text>
              <Text style={{ flex: 1 }}>{item.children.map((c) => (c.type === 'paragraph' || c.type === 'inline' ? c.children.map(enLigne) : enLigne(c)))}</Text>
            </View>
          ))}
        </View>
      );
    case 'blockquote':
      return (
        <View key={k} style={{ marginTop: 10, marginLeft: 20, paddingLeft: 10, borderLeftWidth: 1.5, borderLeftColor: OR }}>
          {n.children.map(blocs)}
        </View>
      );
    case 'inline':
      return (
        <Text key={k} style={s.p}>
          {n.children.map(enLigne)}
        </Text>
      );
    case 'hr':
      return <View key={k} style={{ marginVertical: 12, borderBottomWidth: 0.6, borderBottomColor: '#d8cfc0' }} />;
    default:
      return n.children?.length ? <View key={k}>{n.children.map(blocs)}</View> : null;
  }
}

async function image(origine: string, chemin?: string | null) {
  if (!chemin) return null;
  if (/\.(jpe?g|png)$/i.test(chemin)) {
    try {
      return await fs.readFile(path.join(process.cwd(), 'public', chemin));
    } catch {}
  }
  try {
    const r = await fetch(new URL(chemin, origine));
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !/image\/(png|jpe?g)/.test(type)) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await reader.collections.editos.read(slug);
  if (!e) return new Response('Édito introuvable', { status: 404 });
  enregistrerPolices();
  const origine = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(req.url).origin;
  const { node } = await e.contenu();
  const signature = sansEmail(e.signature);
  const [nom, ...fonction] = signature.split(/\s+·\s+|,\s+/);
  const [photo, portrait, logo] = await Promise.all([image(origine, e.image), image(origine, e.portrait), image(origine, '/medias/site/jogoo/logo-jogoo-header.png')]);
  const date = e.date ? new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
  const refs = (e.references ?? '').split(/\n\s*\n/).map((r) => r.trim()).filter(Boolean);
  const url = `${SITE}/edito/${slug}`;

  const doc = (
    <Document title={e.titre} author={nom || 'Groupe JOGOO'} subject="Édito de la semaine — Groupe JOGOO" creator="philoafricaine.org" language="fr">
      <Page size="A4" style={s.page}>
        <View style={s.entete} fixed>
          {logo ? <Image src={logo} style={{ height: 22 }} /> : <Text style={s.kicker}>Groupe JOGOO</Text>}
          <Text style={[s.meta, { marginTop: 0 }]}>Philosophie africaine. Débats &amp; questions</Text>
        </View>

        <Text style={s.kicker}>Édito de la semaine{e.surtitre ? ` · ${e.surtitre}` : ''}</Text>
        <Text style={s.titre}>{e.titre}</Text>
        {e.soustitre && <Text style={s.sousTitre}>{e.soustitre}</Text>}
        <View style={s.auteur}>
          {portrait && <Image src={portrait} style={s.portrait} />}
          <View style={{ flex: 1 }}>
            {nom && <Text style={s.nom}>{nom}</Text>}
            {fonction.length > 0 && <Text style={[s.meta, { textTransform: 'none', letterSpacing: 0 }]}>{fonction.join(', ')}</Text>}
            {date && <Text style={s.meta}>{date}</Text>}
          </View>
        </View>

        {e.accroche && <Text style={s.accroche}>{e.accroche.replace(/\*/g, '')}</Text>}
        {photo && (
          <View wrap={false}>
            <Image src={photo} style={s.image} />
            {e.imageDescription && <Text style={s.legende}>{e.imageDescription}</Text>}
          </View>
        )}
        {e.exergue && (
          <View wrap={false}>
            <Text style={s.exergue}>« {e.exergue} »</Text>
            {e.exergueAuteur && <Text style={s.exergueAuteur}>{e.exergueAuteur}</Text>}
          </View>
        )}

        <View style={{ marginTop: 10 }}>{blocs(node)}</View>

        {e.conclusion && (
          <View>
            <Text style={s.section}>Conclusion</Text>
            {blocs(Markdoc.parse(e.conclusion))}
          </View>
        )}
        {refs.length > 0 && (
          <View>
            <Text style={s.section}>Références</Text>
            {refs.map((r, i) => (
              <Text key={i} style={s.ref}>
                {Markdoc.parse(r).children.map((c) => c.children.map(enLigne))}
              </Text>
            ))}
          </View>
        )}
        <Text style={[s.p, { marginTop: 22, fontSize: 9, color: '#777' }]}>
          À lire et commenter en ligne : <Link src={url} style={{ color: TERRA }}>{url.replace(/^https?:\/\//, '')}</Link> — © Groupe JOGOO, CC BY-NC-ND 3.0 FR.
        </Text>

        <View style={s.pied} fixed>
          <Text>{e.titre.length > 70 ? e.titre.slice(0, 68) + '…' : e.titre}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  const pdf = await renderToBuffer(doc);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="edito-${slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
