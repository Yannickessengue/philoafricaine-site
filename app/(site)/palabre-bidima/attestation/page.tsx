import { PageAttestation } from '@/components/PageAttestation';

export const metadata = {
  title: 'Attestation de participation · Journée d’étude « Palabre autour de Jean Godefroy Bidima »',
  description: 'Intervenantes et intervenants de la journée d’étude du 21 octobre 2026 au Collège international de philosophie : obtenez votre attestation de participation en PDF.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <PageAttestation
      cle="palabre-bidima"
      kicker="Journée d’étude · Collège international de philosophie, 21 octobre 2026"
      intro="Vous êtes intervenu·e à la journée d’étude « Palabre autour de Jean Godefroy Bidima. Leçons de biopolitique : la démocratie en sursis ? » : votre attestation est produite en PDF dès que votre nom est reconnu dans le programme."
      reference={ref}
    />
  );
}
