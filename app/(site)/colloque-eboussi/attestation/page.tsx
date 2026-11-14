import { EnTete } from '@/components/ui';
import { DemandeAttestation } from '@/components/DemandeAttestation';
import { COLLOQUE, parReference, reference } from '@/lib/attestations-colloque';

export const metadata = {
  title: 'Attestation de participation · Colloque Eboussi Boulaga 2026',
  description: 'Intervenantes et intervenants du colloque international « Fabien Eboussi Boulaga interculturel ? Faire dialoguer les lieux » : obtenez votre attestation de participation en PDF.',
};

export default async function PageAttestation({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const verif = ref ? parReference(ref) : null;
  return (
    <>
      <EnTete
        kicker="Colloque international · Toulouse, 12-14 octobre 2026"
        titre="Attestation de participation"
        intro={`Vous êtes intervenu·e au colloque « ${COLLOQUE.titre} ${COLLOQUE.soustitre} » : votre attestation est produite en PDF dès que votre nom est reconnu dans le programme.`}
        icone="action"
      />
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
        {ref && (
          <section className="mb-10 rounded-xl bg-ink px-6 py-6 text-paper" aria-label="Vérification d’une attestation">
            <p className="kicker !text-gold">Vérification</p>
            {verif ? (
              <>
                <p className="mt-2 font-serif text-2xl">Attestation n° {reference(verif.index)} authentique</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  Délivrée à <strong className="text-paper">{verif.p.nom}</strong>
                  {verif.p.affiliation ? ` (${verif.p.affiliation})` : ''}.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-paper/80">
                  {verif.p.interventions.map((i, k) => (
                    <li key={k}>
                      {i.nature}
                      {i.titre ? ` : « ${i.titre} »` : ''}
                      {i.cadre ? ` (${i.cadre})` : ''}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-paper/80">Aucune attestation ne correspond au numéro « {ref.slice(0, 20)} ».</p>
            )}
          </section>
        )}
        <DemandeAttestation />
        <section className="mt-10 grid gap-6 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
          <div>
            <h2 className="font-brand text-sm font-bold text-ink">Comment cela fonctionne</h2>
            <p className="mt-2">
              Votre nom est comparé au programme définitif du colloque. S’il y figure, l’attestation reprend vos interventions (communication, conférence, présidence ou modération) et porte un numéro qui permet à
              tout établissement d’en vérifier l’authenticité sur cette page.
            </p>
          </div>
          <div>
            <h2 className="font-brand text-sm font-bold text-ink">Une difficulté ?</h2>
            <p className="mt-2">
              Si votre nom n’est pas reconnu ou si un intitulé est à corriger, écrivez au Fonds Eboussi Boulaga :{' '}
              <a className="font-semibold text-terra-deep underline" href="mailto:fondseboussi@gmail.com">
                fondseboussi@gmail.com
              </a>
              . L’attestation est signée par le Pr Jean-Christophe Goddard et le Dr Adoulou N. Bitang, pour le comité scientifique et le comité d’organisation.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
