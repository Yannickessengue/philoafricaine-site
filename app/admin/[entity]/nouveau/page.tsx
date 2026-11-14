import { notFound } from "next/navigation";
import { ENTITIES } from "@/lib/admin-cms-schema";
import { CmsForm } from "@/components/admin/cms-form";
import { BackLink } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CmsNewPage(props: { params: Promise<{ entity: string }> }) {
  const { entity } = await props.params;
  const schema = ENTITIES[entity];
  if (!schema) notFound();

  return (
    <div>
      <BackLink href={`/admin/${schema.route}`} label={schema.plural} />
      <p className="kicker mt-4">Nouveau</p>
      <h1 className="display-title mt-1 text-2xl text-ink sm:text-[1.7rem]">Ajouter — {schema.singular}</h1>
      <CmsForm
        entityKey={entity}
        fields={schema.fields}
        titleField={schema.titleField}
        initial={null}
        id={null}
        backHref={`/admin/${schema.route}`}
      />
    </div>
  );
}
