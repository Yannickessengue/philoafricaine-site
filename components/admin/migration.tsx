"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { migrerContenus } from "@/app/admin/cms/actions";

/** Copie des contenus du site (fichiers du dépôt) vers Neon. */
export function Migration({ aMigrer }: { aMigrer: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function lancer(ecraser: boolean) {
    if (ecraser && !confirm("Remplacer dans la base les contenus déjà présents par ceux du site ? Les modifications faites dans l’admin sur ces contenus seront perdues.")) return;
    setErr(null);
    setMsg(null);
    start(async () => {
      const r = await migrerContenus(ecraser);
      if (!r.ok) return setErr(r.error);
      const total = Object.values(r.bilan).reduce((a, b) => a + b, 0);
      setMsg(`${total} contenus copiés dans la base. Le site les lit désormais depuis Neon.`);
      router.refresh();
    });
  }

  if (aMigrer.length === 0 && !msg) {
    return (
      <details className="mt-6 rounded-lg border border-ink/12 bg-white px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">Migration vers la base : terminée</summary>
        <p className="mt-2 text-ink-soft">
          Tous les contenus sont gérés depuis cet espace. En cas de besoin, vous pouvez recopier dans la base les contenus d’origine du site.
        </p>
        <button type="button" disabled={pending} onClick={() => lancer(true)} className="mt-3 text-xs font-semibold text-terra-deep hover:text-terra disabled:opacity-40">
          {pending ? "Copie en cours…" : "Recopier et remplacer"}
        </button>
        {err && <p className="mt-2 text-terra-deep">{err}</p>}
      </details>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-terra/40 bg-white p-5">
      <p className="font-brand text-sm font-bold uppercase tracking-wide text-ink">Migrer les contenus du site vers la base</p>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Le site affiche encore les contenus enregistrés dans ses fichiers pour : {aMigrer.join(", ")}. Un clic les copie dans la base
        Neon ; ensuite, tout se gère ici et le site lit la base. Rien n’est supprimé.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => lancer(false)}
        className="mt-4 h-10 rounded-md bg-ink px-5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra disabled:opacity-40"
      >
        {pending ? "Migration en cours…" : "Migrer maintenant"}
      </button>
      {msg && <p className="mt-3 text-sm font-semibold text-terra-deep">✓ {msg}</p>}
      {err && <p className="mt-3 text-sm text-terra-deep">{err}</p>}
    </div>
  );
}
