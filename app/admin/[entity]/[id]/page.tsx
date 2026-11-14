import { notFound } from "next/navigation";
import { ENTITIES } from "@/lib/admin-cms-schema";
import { fetchOne } from "@/lib/admin-cms-fetch";
import { CmsForm } from "@/components/admin/cms-form";
import { BackLink } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CmsEditPage(props: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await props.params;
  const schema = ENTITIES[entity];
  if (!schema) notFound();
  const slug = decodeURIComponent(id);
  const row = await fetchOne(entity, slug);
  if (!row) notFound();

  const label = String(row[schema.titleField] ?? "") || "(sans titre)";

  return (
    <div>
      <BackLink href={`/admin/${schema.route}`} label={schema.plural} />
      <p className="kicker mt-4">Modifier — {schema.singular}</p>
      <h1 className="display-title mt-1 text-2xl text-ink sm:text-[1.7rem]">{label}</h1>
      <CmsForm
        entityKey={entity}
        fields={schema.fields}
        titleField={schema.titleField}
        initial={row}
        id={slug}
        backHref={`/admin/${schema.route}`}
        folder={entity}
      />
    </div>
  );
}
