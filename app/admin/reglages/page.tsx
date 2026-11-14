import { PageHeader } from "@/components/admin/ui";
import { ReglagesForm } from "@/components/admin/settings-form";
import { REGLAGES } from "@/lib/admin-cms-schema-reglages";
import { reader } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const actuels = ((await reader.singletons.reglages.read()) ?? {}) as Record<string, unknown>;
  return (
    <div>
      <PageHeader kicker="Paramètres" title="Réglages du site" subtitle="Coordonnées, réseaux sociaux, mention légale et bloc « En cours »." />
      <ReglagesForm fields={REGLAGES} initial={actuels} />
    </div>
  );
}
