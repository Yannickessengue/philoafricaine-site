import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { EVENEMENTS, chercher, parReference, reference, type Evenement, type Participant } from '@/lib/attestations-colloque';
import { SITE } from '@/lib/site';

/**
 * Attestation de participation au colloque Eboussi Boulaga (Toulouse, octobre 2026).
 * POST { nom, civilite } : vérifie le nom dans le registre des intervenant·e·s, puis renvoie le PDF.
 * GET ?ref=CEB26-012 : vérification publique d’une attestation (nom et interventions, en JSON).
 * Signatures manuscrites : lib/pdf/att-signature-goddard.png et att-signature-bitang.png, ou variables
 * d’environnement ATTESTATION_SIGNATURE_GODDARD / ATTESTATION_SIGNATURE_BITANG (image en « data URL »).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const P = (f: string) => path.join(process.cwd(), 'lib/pdf', f);
const img = (f: string) => fs.readFileSync(P(f));
/** Signature déposée dans lib/pdf (att-signature-<nom>.png), si elle existe. */
const signature = (n: string) => (fs.existsSync(P(`att-signature-${n}.png`)) ? img(`att-signature-${n}.png`) : undefined);
/** Signature fournie par une variable d’environnement, en « data URL ». */
const depuisEnv = (v?: string) => (v ? Buffer.from(v.replace(/^data:image\/[a-z+]+;base64,/i, ''), 'base64') : undefined);
let pret = false;
function polices() {
  if (pret) return;
  Font.register({
    family: 'Garamond',
    fonts: [{ src: P('att-garamond-400.ttf') }, { src: P('att-garamond-400i.ttf'), fontStyle: 'italic' }, { src: P('att-garamond-700.ttf'), fontWeight: 700 }],
  });
  Font.register({ family: 'Jost', fonts: [{ src: P('att-jost-500.ttf'), fontWeight: 500 }, { src: P('att-jost-600.ttf'), fontWeight: 600 }] });
  Font.registerHyphenationCallback((mot) => [mot]);
  pret = true;
}

const BRIQUE = '#c7451f';
const OR = '#e09a1c';
const ENCRE = '#191513';
const GRIS = '#6f655f';
const s = StyleSheet.create({
  page: { paddingVertical: 28, paddingHorizontal: 52, fontFamily: 'Garamond', fontSize: 12, color: ENCRE, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' },
  milieu: { flexGrow: 1, justifyContent: 'center', paddingVertical: 2 },
  cadre: { position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderWidth: 0.7, borderColor: BRIQUE },
  cadre2: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderWidth: 0.35, borderColor: OR },
  logos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  sur: { fontFamily: 'Jost', fontWeight: 600, fontSize: 9, letterSpacing: 2.4, textTransform: 'uppercase', color: BRIQUE, textAlign: 'center', marginTop: 8 },
  titre: { fontSize: 33, letterSpacing: 2.8, textAlign: 'center', marginTop: 4, lineHeight: 1.1 },
  corps: { textAlign: 'center', lineHeight: 1.15, paddingHorizontal: 26, fontSize: 16.5, color: '#3c3531' },
  nom: { fontSize: 32, fontWeight: 700, textAlign: 'center', color: BRIQUE, marginTop: 14 },
  aff: { fontStyle: 'italic', fontSize: 16, textAlign: 'center', color: GRIS, marginTop: 3 },
  liste: { marginTop: 14, paddingHorizontal: 16 },
  ligne: { textAlign: 'center', lineHeight: 1.15, marginTop: 7 },
  nature: { fontFamily: 'Jost', fontWeight: 600, fontSize: 9.6, letterSpacing: 1.3, textTransform: 'uppercase', color: GRIS },
  bas: { marginTop: 2 },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  signataire: { width: 290 },
  paraphe: { height: 46, width: 170, objectFit: 'contain', marginBottom: 2 },
  trait: { height: 0.5, backgroundColor: '#b9aea6', marginBottom: 5 },
  sNom: { fontWeight: 700, fontSize: 14.5 },
  sRole: { fontSize: 11.5, color: GRIS, lineHeight: 1.35, marginTop: 1.5 },
  pied: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'Jost', fontWeight: 500, fontSize: 8, color: '#8d827b' },
});

const CIVILITES = ['', 'Pr', 'Dr', 'M.', 'Mme'];

function Attestation({ p, refe, civilite, ev }: { p: Participant; refe: string; civilite: string; ev: Evenement }) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
  /* la taille des interventions s’adapte à la quantité de texte, pour remplir la page sans déborder */
  const masse = p.interventions.reduce((n, i) => n + 26 + (i.titre ?? '').length + (i.cadre ?? '').length + i.nature.length, 0);
  const taille = masse > 420 ? 12.5 : masse > 260 ? 13.6 : masse > 150 ? 15 : 16;
  const [gauche, droite] = ev.signataires;
  const sb = depuisEnv(process.env[`ATTESTATION_SIGNATURE_${gauche.signature.toUpperCase()}`]) ?? signature(gauche.signature);
  const sg = depuisEnv(process.env[`ATTESTATION_SIGNATURE_${droite.signature.toUpperCase()}`]) ?? signature(droite.signature);
  return (
    <Document title={`Attestation de participation · ${p.nom}`} author="Groupe JOGOO" subject={ev.titre}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.cadre} fixed />
        <View style={s.cadre2} fixed />
        <View style={s.logos}>
          {ev.logos.map((l) => (
            <Image key={l.fichier} src={img(l.fichier)} style={{ height: l.hauteur }} />
          ))}
        </View>
        <Text style={s.sur}>{ev.surtitre}</Text>
        <Text style={s.titre}>ATTESTATION DE PARTICIPATION</Text>
        <View style={s.milieu}>
        <Text style={s.corps}>
          {ev.avant}{' '}
          <Text style={{ fontWeight: 700, color: ENCRE }}>« {ev.titre.replace(/ \?/g, ' ?').replace(/ :/g, ' :')} »</Text>, {ev.apres}
        </Text>
        <Text style={s.nom}>
          {civilite ? `${civilite} ` : ''}
          {p.nom}
        </Text>
        {p.affiliation ? <Text style={s.aff}>{p.affiliation}</Text> : null}
        <View style={s.liste}>
          {p.interventions.map((i, k) => (
            <Text key={k} style={[s.ligne, { fontSize: taille }]}>
              <Text style={s.nature}>{i.nature}</Text>
              {i.titre ? (
                <Text>
                  {'  '}
                  <Text style={{ fontStyle: 'italic' }}>« {i.titre} »</Text>
                </Text>
              ) : null}
              {i.cadre ? <Text style={{ color: GRIS }}>{i.titre ? ` (${i.cadre})` : `  ${i.cadre}`}</Text> : null}
            </Text>
          ))}
        </View>
        </View>
        <View style={s.bas}>
          <Text style={{ textAlign: 'center', fontSize: 12, color: GRIS, marginBottom: sg || sb ? 4 : 26 }}>Fait à {ev.lieu}, le {date}, pour servir et valoir ce que de droit.</Text>
          <View style={s.signatures}>
            <View style={s.signataire}>
              {sb ? <Image src={sb} style={s.paraphe} /> : null}
              <View style={s.trait} />
              <Text style={s.sNom}>{gauche.nom}</Text>
              <Text style={s.sRole}>{gauche.role}</Text>
            </View>
            <View style={[s.signataire, { alignItems: 'flex-end' }]}>
              {sg ? <Image src={sg} style={[s.paraphe, { objectPosition: 'right' }]} /> : null}
              <View style={[s.trait, { width: 290 }]} />
              <Text style={s.sNom}>{droite.nom}</Text>
              <Text style={[s.sRole, { textAlign: 'right' }]}>{droite.role}</Text>
            </View>
          </View>
          <View style={s.pied}>
            <Text>Attestation n° {refe}</Text>
            <Text>
              Vérification : {SITE.replace(/^https?:\/\//, '')}{ev.page}?ref={refe}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const fichier = (n: string) =>
  n
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export async function POST(req: Request) {
  let d: { nom?: string; civilite?: string; evenement?: string };
  try {
    d = await req.json();
  } catch {
    return NextResponse.json({ erreur: 'Demande illisible.' }, { status: 400 });
  }
  const nom = String(d.nom ?? '').trim().slice(0, 160);
  const civilite = CIVILITES.includes(String(d.civilite ?? '')) ? String(d.civilite ?? '') : '';
  if (nom.length < 4) return NextResponse.json({ erreur: 'Indiquez votre prénom et votre nom.' }, { status: 400 });
  const ev = EVENEMENTS[String(d.evenement ?? 'colloque-eboussi')];
  if (!ev) return NextResponse.json({ erreur: 'Événement inconnu.' }, { status: 400 });
  const r = chercher(nom, ev.participants);
  if (r === 'aucun')
    return NextResponse.json(
      { erreur: `Ce nom ne figure pas au programme. Vérifiez l’orthographe (prénom et nom, tels qu’au programme) ou écrivez à ${ev.contact}.` },
      { status: 404 },
    );
  if (r === 'plusieurs') return NextResponse.json({ erreur: 'Plusieurs personnes correspondent : saisissez votre nom complet, tel qu’il figure au programme.' }, { status: 409 });
  polices();
  const refe = reference(r.index, ev.prefixe);
  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(<Attestation p={r.p} refe={refe} civilite={civilite} ev={ev} />);
  } catch (e) {
    console.error('attestation', refe, e);
    return NextResponse.json({ erreur: `L’attestation n’a pas pu être produite. Écrivez à ${ev.contact} en indiquant le numéro ${refe}.` }, { status: 500 });
  }
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="attestation-${ev.cle}-${fichier(r.p.nom)}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Attestation': refe,
    },
  });
}

/* Diagnostic temporaire : /api/attestation?diagnostic=1 — à retirer une fois la panne Vercel comprise. */
async function diagnostic() {
  const etapes: Record<string, unknown> = { node: process.version, cwd: process.cwd() };
  try {
    etapes.fichiers = fs.readdirSync(path.join(process.cwd(), 'lib/pdf')).map((f) => `${f}:${fs.statSync(P(f)).size}`);
  } catch (e) {
    etapes.fichiers = `ERREUR ${(e as Error).message}`;
  }
  const essai = async (nom: string, doc: React.ReactElement) => {
    try {
      const b = await renderToBuffer(doc);
      etapes[nom] = `ok ${b.length}`;
    } catch (e) {
      etapes[nom] = `ERREUR ${(e as Error).name}: ${(e as Error).message}`;
    }
  };
  await essai('1-texte-nu', <Document><Page size="A4"><Text>Bonjour</Text></Page></Document>);
  try {
    polices();
    etapes['2-polices'] = 'enregistrées';
  } catch (e) {
    etapes['2-polices'] = `ERREUR ${(e as Error).message}`;
  }
  await essai('3-garamond', <Document><Page size="A4"><Text style={{ fontFamily: 'Garamond' }}>Bonjour</Text></Page></Document>);
  await essai('4-jost', <Document><Page size="A4"><Text style={{ fontFamily: 'Jost', fontWeight: 600 }}>Bonjour</Text></Page></Document>);
  try {
    await essai('5-image', <Document><Page size="A4"><Image src={img('att-logo-jogoo.png')} style={{ height: 40 }} /></Page></Document>);
  } catch (e) {
    etapes['5-image'] = `ERREUR lecture ${(e as Error).message}`;
  }
  await essai('6-paysage', <Document><Page size="A4" orientation="landscape"><Text>Bonjour</Text></Page></Document>);
  return NextResponse.json(etapes);
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  if (params.get('diagnostic')) return diagnostic();
  const ref = params.get('ref') ?? '';
  const r = parReference(ref);
  if (!r) return NextResponse.json({ valide: false }, { status: 404 });
  return NextResponse.json({ valide: true, reference: reference(r.index, r.ev.prefixe), evenement: r.ev.titre, nom: r.p.nom, affiliation: r.p.affiliation ?? null, interventions: r.p.interventions });
}
