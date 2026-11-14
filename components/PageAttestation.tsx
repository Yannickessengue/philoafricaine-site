import { EnTete } from '@/components/ui';
import { DemandeAttestation } from '@/components/DemandeAttestation';
import { EVENEMENTS, parReference, reference } from '@/lib/attestations-colloque';

/** Page de demande et de vérification d’une attestation de participation, pour un événement donné. */
export function PageAttestation({ cle, kicker, intro, reference: ref }: { cle: string; kicker: string; intro: string; reference?: string }) {
  const ev = EVENEMENTS[cle];
  const verif = ref ? parReference(ref) : null;
  const [gauche, droite] = ev.signataires;
  return (
    <>
      <EnTete kicker={kicker} titre="Attestation de participation" intro={intro} icone="action" />
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
        {ref && (
          <section className="mb-10 rounded-xl bg-ink px-6 py-6 text-paper" aria-label="Vérification d’une attestation">
            <p className="kicker !text-gold">Vérification</p>
            {verif ? (
              <>
                <p className="mt-2 font-serif text-2xl">Attestation n° {reference(verif.index, verif.ev.prefixe)} authentique</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  Délivrée à <strong className="text-paper">{verif.p.nom}</strong>
                  {verif.p.affiliation ? ` (${verif.p.affiliation})` : ''} pour « {verif.ev.titre} ».
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
        <DemandeAttestation evenement={cle} />
        <section className="mt-10 grid gap-6 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
          <div>
            <h2 className="font-brand text-sm font-bold text-ink">Comment cela fonctionne</h2>
            <p className="mt-2">
              Votre nom est comparé au programme. S’il y figure, l’attestation reprend vos interventions (communication, conférence, présidence ou modération) et porte un numéro qui permet à tout établissement
              d’en vérifier l’authenticité sur cette page.
            </p>
          </div>
          <div>
            <h2 className="font-brand text-sm font-bold text-ink">Une difficulté ?</h2>
            <p className="mt-2">
              Si votre nom n’est pas reconnu ou si un intitulé est à corriger, écrivez à{' '}
              <a className="font-semibold text-terra-deep underline" href={`mailto:${ev.contact}`}>
                {ev.contact}
              </a>
              . L’attestation est signée par {droite.nom} et {gauche.nom}.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
