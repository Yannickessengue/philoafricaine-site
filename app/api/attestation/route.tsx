import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { COLLOQUE, chercher, parReference, reference, type Participant } from '@/lib/attestations-colloque';
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
const img = (f: string) => `data:image/png;base64,${fs.readFileSync(P(f)).toString('base64')}`;
/** Signature déposée dans lib/pdf (att-signature-<nom>.png), si elle existe. */
const signature = (n: string) => (fs.existsSync(P(`att-signature-${n}.png`)) ? img(`att-signature-${n}.png`) : undefined);
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
  page: { paddingVertical: 34, paddingHorizontal: 54, fontFamily: 'Garamond', fontSize: 11.5, color: ENCRE, backgroundColor: '#ffffff' },
  cadre: { position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderWidth: 0.7, borderColor: BRIQUE },
  cadre2: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderWidth: 0.35, borderColor: OR },
  logos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48 },
  sur: { fontFamily: 'Jost', fontWeight: 600, fontSize: 9, letterSpacing: 2.4, textTransform: 'uppercase', color: BRIQUE, textAlign: 'center', marginTop: 8 },
  titre: { fontSize: 35, textAlign: 'center', marginTop: 5, lineHeight: 1.1 },
  filet: { width: 46, height: 1.2, backgroundColor: OR, alignSelf: 'center', marginTop: 9 },
  corps: { textAlign: 'center', marginTop: 10, lineHeight: 1.1, paddingHorizontal: 34, fontSize: 15.5, color: '#3c3531' },
  nom: { fontSize: 29, fontWeight: 700, textAlign: 'center', color: BRIQUE, marginTop: 10 },
  aff: { fontStyle: 'italic', fontSize: 15, textAlign: 'center', color: GRIS, marginTop: 2 },
  liste: { marginTop: 10, paddingHorizontal: 20 },
  ligne: { textAlign: 'center', lineHeight: 1.05, marginTop: 5 },
  nature: { fontFamily: 'Jost', fontWeight: 600, fontSize: 9.2, letterSpacing: 1.3, textTransform: 'uppercase', color: GRIS },
  bas: { position: 'absolute', left: 54, right: 54, bottom: 34 },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  signataire: { width: 250 },
  paraphe: { height: 34, width: 130, objectFit: 'contain', marginBottom: 2 },
  trait: { height: 0.5, backgroundColor: '#b9aea6', marginBottom: 5 },
  sNom: { fontWeight: 700, fontSize: 13.5 },
  sRole: { fontSize: 11, color: GRIS, lineHeight: 1.3, marginTop: 1 },
  pied: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'Jost', fontWeight: 500, fontSize: 8, color: '#8d827b' },
});

const CIVILITES = ['', 'Pr', 'Dr', 'M.', 'Mme'];

function Attestation({ p, refe, civilite }: { p: Participant; refe: string; civilite: string }) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
  const serre = p.interventions.length > 2 || p.interventions.some((i) => (i.titre ?? '').length > 150);
  const sg = process.env.ATTESTATION_SIGNATURE_GODDARD || signature('goddard');
  const sb = process.env.ATTESTATION_SIGNATURE_BITANG || signature('bitang');
  return (
    <Document title={`Attestation de participation · ${p.nom}`} author="Fonds Eboussi Boulaga · Groupe JOGOO" subject={`Colloque international « ${COLLOQUE.titre} ${COLLOQUE.soustitre} »`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.cadre} fixed />
        <View style={s.cadre2} fixed />
        <View style={s.logos}>
          <Image src={img('att-logo-ut2j.png')} style={{ height: 32 }} />
          <Image src={img('att-logo-fonds.png')} style={{ height: 48 }} />
          <Image src={img('att-logo-jogoo.png')} style={{ height: 38 }} />
        </View>
        <Text style={s.sur}>Colloque international · Toulouse, {COLLOQUE.dates}</Text>
        <Text style={s.titre}>Attestation de participation</Text>
        <View style={s.filet} />
        <Text style={s.corps}>
          Le comité scientifique et le comité d’organisation du colloque international{' '}
          <Text style={{ fontWeight: 700, color: ENCRE }}>
            « {COLLOQUE.titre.replace(' ?', ' ?')} {COLLOQUE.soustitre} »
          </Text>
          , organisé par l’Université Toulouse – Jean Jaurès (ERRAPHIS, LLA-Créatis), le Fonds Eboussi Boulaga et le Groupe JOGOO, et tenu en ligne les {COLLOQUE.dates}, attestent
          la participation de
        </Text>
        <Text style={s.nom}>
          {civilite ? `${civilite} ` : ''}
          {p.nom}
        </Text>
        {p.affiliation ? <Text style={s.aff}>{p.affiliation}</Text> : null}
        <View style={s.liste}>
          {p.interventions.map((i, k) => (
            <Text key={k} style={[s.ligne, { fontSize: serre ? 13 : 14.5 }]}>
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
        <View style={s.bas}>
          <Text style={{ textAlign: 'center', fontSize: 12, color: GRIS, marginBottom: sg || sb ? 2 : 26 }}>Fait à Toulouse, le {date}, pour servir et valoir ce que de droit.</Text>
          <View style={s.signatures}>
            <View style={s.signataire}>
              {sb ? <Image src={sb} style={s.paraphe} /> : null}
              <View style={s.trait} />
              <Text style={s.sNom}>Dr Jean Éric Bitang</Text>
              <Text style={s.sRole}>Secrétaire exécutif du Fonds Eboussi Boulaga{'\n'}Membre du comité d’organisation</Text>
            </View>
            <View style={[s.signataire, { alignItems: 'flex-end' }]}>
              {sg ? <Image src={sg} style={[s.paraphe, { objectPosition: 'right' }]} /> : null}
              <View style={[s.trait, { width: 250 }]} />
              <Text style={s.sNom}>Pr Jean-Christophe Goddard</Text>
              <Text style={[s.sRole, { textAlign: 'right' }]}>Université Toulouse – Jean Jaurès{'\n'}Pour le comité scientifique</Text>
            </View>
          </View>
          <View style={s.pied}>
            <Text>Attestation n° {refe}</Text>
            <Text>
              Vérification : {SITE.replace(/^https?:\/\//, '')}/colloque-eboussi/attestation?ref={refe}
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
  let d: { nom?: string; civilite?: string };
  try {
    d = await req.json();
  } catch {
    return NextResponse.json({ erreur: 'Demande illisible.' }, { status: 400 });
  }
  const nom = String(d.nom ?? '').trim().slice(0, 160);
  const civilite = CIVILITES.includes(String(d.civilite ?? '')) ? String(d.civilite ?? '') : '';
  if (nom.length < 4) return NextResponse.json({ erreur: 'Indiquez votre prénom et votre nom.' }, { status: 400 });
  const r = chercher(nom);
  if (r === 'aucun')
    return NextResponse.json(
      { erreur: 'Ce nom ne figure pas au programme du colloque. Vérifiez l’orthographe (prénom et nom, tels qu’au programme) ou écrivez au Fonds Eboussi Boulaga.' },
      { status: 404 },
    );
  if (r === 'plusieurs') return NextResponse.json({ erreur: 'Plusieurs personnes correspondent : saisissez votre nom complet, tel qu’il figure au programme.' }, { status: 409 });
  polices();
  const refe = reference(r.index);
  const pdf = await renderToBuffer(<Attestation p={r.p} refe={refe} civilite={civilite} />);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="attestation-colloque-eboussi-${fichier(r.p.nom)}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Attestation': refe,
    },
  });
}

export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get('ref') ?? '';
  const r = parReference(ref);
  if (!r) return NextResponse.json({ valide: false }, { status: 404 });
  return NextResponse.json({ valide: true, reference: reference(r.index), nom: r.p.nom, affiliation: r.p.affiliation ?? null, interventions: r.p.interventions });
}
