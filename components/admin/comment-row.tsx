"use client";

import { useTransition } from "react";
import { moderateComment } from "@/app/admin/commentaires/actions";
import type { ModerationItem } from "@/lib/admin-comments";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function CommentRow({ item }: { item: ModerationItem }) {
  const [pending, start] = useTransition();
  const hidden = item.status === "hidden";

  return (
    <div
      className={`flex gap-3 border p-4 text-sm ${
        hidden ? "border-ink/12 bg-ink/[0.02] opacity-70" : "border-ink/12 bg-white"
      }`}
    >
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terra/12 font-brand text-xs font-bold text-terra-deep"
      >
        {initials(item.author)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-brand font-bold text-ink">{item.author}</span>
          {item.email && <span className="text-xs text-ink/40">{item.email}</span>}
          <span className="text-xs text-ink/35">{new Date(item.createdAt).toLocaleString("fr-FR")}</span>
          <a
            href={`/edito/${item.slug}#commentaires`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-terra-deep underline underline-offset-2"
          >
            {item.slug}
          </a>
          {item.parentId && <span className="text-xs text-ink/40">↳ réponse</span>}
          {item.deleted && <span className="text-xs italic text-ink/40">supprimé par l’auteur</span>}
          {hidden && (
            <span className="rounded-full bg-terra/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-terra-deep">
              masqué
            </span>
          )}
        </div>

        <p className="mt-1.5 whitespace-pre-wrap text-ink-soft">{item.body || "—"}</p>

        <div className="mt-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => moderateComment(item.id, hidden ? "visible" : "hidden", item.slug))}
            className="border border-ink/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70 transition-colors hover:border-terra hover:text-terra-deep disabled:opacity-40"
          >
            {pending ? "…" : hidden ? "Réafficher" : "Masquer"}
          </button>
        </div>
      </div>
    </div>
  );
}
