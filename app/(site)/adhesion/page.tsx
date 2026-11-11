import { EnTete } from '@/components/ui';
import { FormulaireEnLigne } from '@/components/FormulaireEnLigne';
import { ANNEE_ADHESION, getAdhesion } from '@/lib/activites';
import { FORMULAIRES } from '@/lib/formulaires';

export const metadata = {
  title: `Adhérer au Groupe JOGOO · ${ANNEE_ADHESION}`,
  description:
    'Devenir membre de la société savante « JOGOO – Philosophie africaine. Débats & questions » : types de membres (article 8 des statuts), cotisations, fiche d’adhésion PDF et formulaire en ligne.',
};

const PAYPAL = 'https://www.paypal.com/qrcodes/managed/c3f3fd18-1b95-40f4-8501-5a8ed19641a8?utm_source=consweb_more';
const EMAIL = 'philoafricaine@gmail.com';

/* Article 8 des statuts : quatre types de membres. */
const MEMBRES = [
  {
    nom: 'Membres actifs, dits sociétaires',
    cotisation: '40 € · 50 $ · environ 25 000 FCFA par an',
    texte: 'Ils participent pleinement à la vie de l’association et à ses activités, et versent chaque année leur cotisation.',
  },
  {
    nom: 'Membres bienfaiteurs',
    cotisation: '76,21 € · 100 $ · environ 50 000 FCFA par an',
    texte: 'Ils soutiennent l’association par une contribution plus élevée, qui finance ses rencontres, ses publications et ses projets.',
  },
  {
    nom: 'Membres d’honneur',
    cotisation: 'Sans cotisation',
    texte: 'Titre reconnu aux personnes qui ont rendu des services importants à l’association.',
  },
  {
    nom: 'Membres bénévoles',
    cotisation: 'Sans cotisation',
    texte: 'Ils donnent de leur temps et de leurs compétences ; leur adhésion est présentée par deux lettres de membres déjà agréés.',
  },
];

const PIECES = [
  'La fiche d’adhésion remplie (en ligne ou en PDF)',
  'Une photo récente (4 × 4)',
  'Une pièce d’identité',
  'Le justificatif de paiement de la cotisation',
  'Pour les membres bénévoles : deux lettres de présentation de membres déjà agréés',
];

export default function Adhesion() {
  const a = getAdhesion();
  const f = FORMULAIRES.adhesion;
  return (
    <>
      <EnTete
        kicker={`Le Groupe · Adhésion ${ANNEE_ADHESION}`}
        titre="Adhérer au Groupe JOGOO"
        icone="action"
        intro={
          <>
            Rejoindre la société savante « JOGOO – Philosophie africaine. Débats &amp; questions », c’est prendre part à ses débats, ses séminaires, ses
            publications et ses projets, et soutenir une philosophie africaine vivante et partagée.
          </>
        }
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#formulaire" className="bg-terra px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-ink">
            Adhérer en ligne
          </a>
          <a
            href={a.fichier!}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-ink/25 bg-white px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-ink hover:border-terra hover:text-terra-deep"
          >
            Fiche d’adhésion (PDF) <span aria-hidden="true">↓</span>
          </a>
        </div>
      </EnTete>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="kicker">Article 8 des statuts</p>
        <h2 className="display-title mt-1 text-3xl text-terra">Quatre types de membres</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          L’association, déclarée le 15 mars 2023 (récépissé n° 00000423/RDA/J06/SAAJP/BAPP), comprend quatre types de membres. La cotisation vaut pour
          l’année {ANNEE_ADHESION}.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {MEMBRES.map((m) => (
            <article key={m.nom} className="border-t-2 border-terra bg-white p-6">
              <h3 className="font-serif text-xl text-ink">{m.nom}</h3>
              <p className="mt-2 font-brand text-sm font-bold text-terra-deep">{m.cotisation}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{m.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-cream/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-3">
          <div>
            <p className="kicker">Étape 1</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">Remplir la fiche</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Deux possibilités : le <a href="#formulaire" className="font-semibold text-terra-deep underline underline-offset-2">formulaire en ligne</a> ci-dessous,
              ou la{' '}
              <a href={a.fichier!} target="_blank" rel="noreferrer" className="font-semibold text-terra-deep underline underline-offset-2">
                fiche PDF
              </a>{' '}
              à imprimer ou remplir, puis à renvoyer à{' '}
              <a href={`mailto:${EMAIL}?subject=Adh%C3%A9sion%20${ANNEE_ADHESION}`} className="font-semibold text-terra-deep underline underline-offset-2">
                {EMAIL}
              </a>
              .
            </p>
            <p className="mt-5 font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Pièces à fournir</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
              {PIECES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker">Étape 2</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">Régler la cotisation</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Par PayPal (lien ou code QR ci-contre) ou par virement au compte de l’« Association des Philosophes du Chant du Coq (ASPHICC JOGOO) » : les
              coordonnées bancaires sont communiquées sur demande à {EMAIL}. Joignez ensuite le justificatif de paiement.
            </p>
            <a
              href={PAYPAL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block bg-[#253b80] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-ink"
            >
              Payer avec PayPal
            </a>
          </div>
          <div className="flex flex-col items-start lg:items-center">
            <img src="/medias/site/paypal-adhesion.png" alt="Code QR PayPal pour régler la cotisation au Groupe JOGOO" width={220} height={220} className="h-[220px] w-[220px] bg-white p-2" />
            <p className="mt-2 text-xs text-ink/55">Scannez avec votre téléphone pour payer par PayPal.</p>
          </div>
        </div>
      </section>

      <div id="formulaire" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-5 py-14 lg:grid-cols-[1fr_17rem]">
        <section>
          <p className="kicker">Étape 3 · Formulaire en ligne</p>
          <h2 className="display-title mt-1 text-3xl text-terra">{f.titre}</h2>
          <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{f.intro}</p>
          <FormulaireEnLigne
            sorte="adhesion"
            slug={a.slug}
            champs={a.champs}
            bouton={f.bouton}
            contact={EMAIL}
            accord="Je certifie vouloir adhérer à la société savante « Philosophie africaine. Débats & questions » ; je reconnais l’objet de l’association, je m’engage à respecter son règlement intérieur et à verser ma cotisation chaque année. J’accepte que ces informations soient transmises au bureau du Groupe JOGOO, qui les garde confidentielles."
            merci="Une copie vient de partir à {email}. Le bureau vous enverra votre attestation de membre après examen. Pensez à regarder dans vos courriers indésirables."
          />
        </section>
        <aside className="space-y-6 text-sm text-ink-soft lg:pt-16">
          <div className="border-t-2 border-terra pt-4">
            <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Ce qui se passe ensuite</p>
            <p className="mt-2 leading-relaxed">
              Votre demande arrive au bureau du Groupe, à <span className="text-ink">{EMAIL}</span>, et une copie vous est envoyée. Une fois l’adhésion validée, le
              président vous adresse votre attestation de membre.
            </p>
          </div>
          <div className="border-t border-ink/15 pt-4">
            <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Pièces jointes</p>
            <p className="mt-2 leading-relaxed">
              4 Mo au plus en tout. Trop lourdes ? Envoyez-les simplement par e-mail en répondant à l’accusé de réception.
            </p>
          </div>
          <div className="border-t border-ink/15 pt-4">
            <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Confidentialité</p>
            <p className="mt-2 leading-relaxed">Le Groupe JOGOO garde confidentielles et sécurisées les données personnelles de cette fiche.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
