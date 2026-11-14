"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStatus, saveNote, removeApplication } from "@/app/admin/candidatures/actions";
import { APPLICATION_STATUSES, STATUS_LABEL, type ApplicationStatus } from "@/lib/admin-application-status";

export function ApplicationControls({
  id,
  status,
  note,
}: {
  id: number;
  status: ApplicationStatus;
  note: string;
}) {
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [nt, setNt] = useState(note);
  const [savedNote, setSavedNote] = useState(note);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function changeStatus(next: ApplicationStatus) {
    setSt(next);
    start(async () => {
      await updateStatus(id, next);
      router.refresh();
    });
  }

  function persistNote() {
    if (nt === savedNote) return;
    start(async () => {
      await saveNote(id, nt);
      setSavedNote(nt);
      setMsg("Note enregistrée");
      setTimeout(() => setMsg(null), 2500);
    });
  }

  function onDelete() {
    if (!confirm("Supprimer cette candidature et ses fichiers ? Action définitive.")) return;
    start(async () => {
      await removeApplication(id);
    });
  }

  return (
    <div className="rounded-lg border border-ink/12 bg-white p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">Suivi</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            disabled={pending}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              st === s ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink/55 hover:bg-ink/10"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">
        Note interne
      </label>
      <textarea
        value={nt}
        onChange={(e) => setNt(e.target.value)}
        onBlur={persistNote}
        rows={4}
        placeholder="Impressions, prochaines étapes…"
        className="mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-terra focus:ring-1 focus:ring-terra/20"
      />
      <div className="mt-1 flex h-4 items-center justify-between text-xs">
        <span className="font-semibold text-terra-deep">{msg}</span>
        {nt !== savedNote && !msg && <span className="text-ink/35">non enregistrée</span>}
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="mt-4 text-xs text-ink/40 transition-colors hover:text-terra-deep"
      >
        Supprimer la candidature
      </button>
    </div>
  );
}
