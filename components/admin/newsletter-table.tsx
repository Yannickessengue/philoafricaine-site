"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addSubscriber,
  removeSubscriber,
  changeSubscriberStatus,
} from "@/app/admin/newsletter/actions";
import type { Subscriber } from "@/lib/admin-newsletter";

const STATUS_LABEL: Record<Subscriber["status"], string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  unsubscribed: "Désinscrit",
};

export function NewsletterTable({
  subscribers,
  search,
}: {
  subscribers: Subscriber[];
  search: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(search);
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`/admin/newsletter${params}`);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await addSubscriber(newEmail);
      if (res.ok) {
        setNewEmail("");
        setMsg("Ajouté.");
        router.refresh();
      } else {
        setMsg(res.error ?? "Erreur.");
      }
    });
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={runSearch} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une adresse…"
            className="h-9 w-64 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra"
          />
          <button className="h-9 border border-ink/20 px-3 text-xs font-semibold uppercase tracking-wide text-ink/70 hover:border-terra hover:text-terra-deep">
            Chercher
          </button>
        </form>

        <a
          href="/api/admin/newsletter-export"
          className="ml-auto inline-flex h-9 items-center bg-ink px-4 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-terra"
        >
          Exporter le CSV
        </a>
      </div>

      <form onSubmit={add} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Ajouter une adresse manuellement…"
          className="h-9 w-72 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra"
        />
        <button
          disabled={pending}
          className="h-9 border border-ink/20 px-3 text-xs font-semibold uppercase tracking-wide text-ink/70 hover:border-terra hover:text-terra-deep disabled:opacity-40"
        >
          Ajouter
        </button>
        {msg && <span className="text-xs text-terra-deep">{msg}</span>}
      </form>

      <div className="mt-6 overflow-hidden border border-ink/12 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-cream/50 text-left text-[0.68rem] uppercase tracking-wide text-ink/45">
              <th className="px-4 py-2.5 font-semibold">Adresse</th>
              <th className="px-4 py-2.5 font-semibold">Statut</th>
              <th className="px-4 py-2.5 font-semibold">Source</th>
              <th className="px-4 py-2.5 font-semibold">Inscription</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <Row key={s.id} s={s} onRefresh={() => router.refresh()} />
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink/50">
                  {search ? "Aucun résultat." : "Aucun abonné pour le moment."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ s, onRefresh }: { s: Subscriber; onRefresh: () => void }) {
  const [pending, start] = useTransition();

  const dot =
    s.status === "confirmed" ? "bg-terra" : s.status === "pending" ? "bg-gold" : "bg-ink/25";

  return (
    <tr className="border-b border-ink/8 last:border-0">
      <td className="px-4 py-2.5 font-medium text-ink">{s.email}</td>
      <td className="px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/65">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
          {STATUS_LABEL[s.status]}
        </span>
      </td>
      <td className="px-4 py-2.5 text-ink/45">{s.source ?? "—"}</td>
      <td className="px-4 py-2.5 text-ink-soft">
        {new Date(s.createdAt).toLocaleDateString("fr-FR")}
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className="inline-flex gap-3 text-xs">
          {s.status !== "confirmed" && (
            <button
              disabled={pending}
              onClick={() => start(async () => (await changeSubscriberStatus(s.id, "confirmed"), onRefresh()))}
              className="font-semibold text-terra-deep hover:text-terra disabled:opacity-40"
            >
              Confirmer
            </button>
          )}
          {s.status !== "unsubscribed" && (
            <button
              disabled={pending}
              onClick={() => start(async () => (await changeSubscriberStatus(s.id, "unsubscribed"), onRefresh()))}
              className="text-ink/45 hover:text-terra-deep disabled:opacity-40"
            >
              Désinscrire
            </button>
          )}
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Supprimer ${s.email} ?`)) start(async () => (await removeSubscriber(s.id), onRefresh()));
            }}
            className="text-ink/35 hover:text-terra-deep disabled:opacity-40"
          >
            Suppr.
          </button>
        </span>
      </td>
    </tr>
  );
}
