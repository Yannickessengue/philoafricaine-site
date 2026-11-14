import { PageAttestation } from '@/components/PageAttestation';
import { COLLOQUE } from '@/lib/attestations-colloque';

export const metadata = {
  title: 'Attestation de participation · Colloque Eboussi Boulaga 2026',
  description: 'Intervenantes et intervenants du colloque international « Fabien Eboussi Boulaga interculturel ? Faire dialoguer les lieux » : obtenez votre attestation de participation en PDF.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <PageAttestation
      cle="colloque-eboussi"
      kicker="Colloque international · Toulouse, 12-14 octobre 2026"
      intro={`Vous êtes intervenu·e au colloque « ${COLLOQUE.titre} ${COLLOQUE.soustitre} » : votre attestation est produite en PDF dès que votre nom est reconnu dans le programme.`}
      reference={ref}
    />
  );
}
