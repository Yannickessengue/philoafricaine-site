import { listForModeration } from "@/lib/admin-comments";
import { CommentRow } from "@/components/admin/comment-row";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const items = await listForModeration(400);
  const visible = items.filter((i) => i.status === "visible" && !i.deleted).length;
  const hidden = items.filter((i) => i.status === "hidden").length;

  return (
    <div>
      <PageHeader
        kicker="Modération"
        title="Commentaires"
        subtitle="Les commentaires paraissent aussitôt. Masquez a posteriori ceux qui posent problème."
      />

      <div className="mt-5 flex gap-6 text-xs uppercase tracking-wide text-ink/45">
        <span>{items.length} au total</span>
        <span className="text-terra-deep">{visible} visibles</span>
        {hidden > 0 && <span>{hidden} masqués</span>}
      </div>

      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <CommentRow key={it.id} item={it} />
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 bg-white p-12 text-center text-sm text-ink/50">
            Aucun commentaire.
          </p>
        )}
      </div>
    </div>
  );
}
