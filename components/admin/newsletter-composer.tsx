"use client";

import { useState, useTransition } from "react";
import { previewDigest, sendTestDigest, sendDigestToAll } from "@/app/admin/newsletter/send-actions";

export function NewsletterComposer({
  confirmedCount,
  mailReady,
}: {
  confirmedCount: number;
  mailReady: boolean;
}) {
  const [intro, setIntro] = useState("");
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function doPreview() {
    setMsg(null);
    start(async () => {
      const d = await previewDigest(intro);
      setPreview({ subject: d.subject, html: d.html });
    });
  }

  function doTest() {
    setMsg(null);
    start(async () => {
      const res = await sendTestDigest(testEmail, intro);
      setMsg(
        res.ok
          ? { kind: "ok", text: `Test envoyé à ${testEmail}.` }
          : { kind: "err", text: res.error ?? "Échec." },
      );
    });
  }

  function doSendAll() {
    if (
      !confirm(
        `Envoyer la lettre à ${confirmedCount} abonné·e·s confirmé·e·s ?\nL’envoi peut prendre plusieurs minutes.`,
      )
    )
      return;
    setMsg(null);
    start(async () => {
      const res = await sendDigestToAll(intro);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: `Envoyé : ${res.delivered}/${res.total} livrés${res.failed ? `, ${res.failed} échecs` : ""}.`,
            }
          : { kind: "err", text: res.error ?? "Échec de l’envoi." },
      );
    });
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
          Mot d’introduction (facultatif)
        </label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={7}
          placeholder="Quelques lignes de la rédaction en tête de lettre… (laisser vide pour aller droit au sommaire)"
          className="mt-1.5 w-full resize-y border border-ink/20 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-terra"
        />
        <p className="mt-1.5 text-xs text-ink/40">
          Le reste de la lettre est assemblé automatiquement : dernier édito, publications récentes,
          agenda, appels ouverts.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={doPreview}
            disabled={pending}
            className="h-10 border border-ink/20 px-4 text-xs font-semibold uppercase tracking-wide text-ink/70 hover:border-terra hover:text-terra-deep disabled:opacity-40"
          >
            {pending ? "…" : "Aperçu"}
          </button>
        </div>

        <div className="mt-6 border-t border-ink/10 pt-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
            Envoyer un test
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="votre@adresse.fr"
              className="h-10 w-56 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra"
            />
            <button
              type="button"
              onClick={doTest}
              disabled={pending || !mailReady}
              className="h-10 border border-ink/20 px-4 text-xs font-semibold uppercase tracking-wide text-ink/70 hover:border-terra hover:text-terra-deep disabled:opacity-40"
            >
              Envoyer le test
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-ink/10 pt-5">
          <button
            type="button"
            onClick={doSendAll}
            disabled={pending || !mailReady || confirmedCount === 0}
            className="h-11 bg-ink px-5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Envoi en cours…" : `Envoyer à ${confirmedCount} abonné·e·s`}
          </button>
          {!mailReady && (
            <p className="mt-2 text-xs text-terra-deep">
              Configurez l’envoi d’e-mail (mot de passe d’application Gmail) pour activer l’envoi.
            </p>
          )}
        </div>

        {msg && (
          <p
            className={`mt-4 border px-3 py-2 text-sm ${
              msg.kind === "ok"
                ? "border-terra/30 bg-white text-ink"
                : "border-terra/40 bg-terra/5 text-terra-deep"
            }`}
          >
            {msg.text}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Aperçu</p>
        {preview ? (
          <div className="mt-2 border border-ink/12">
            <div className="border-b border-ink/10 bg-cream/60 px-3 py-2 text-xs text-ink-soft">
              <span className="font-semibold text-ink">Objet :</span> {preview.subject}
            </div>
            <iframe
              title="Aperçu de la lettre"
              srcDoc={preview.html}
              className="h-[70vh] w-full bg-white"
            />
          </div>
        ) : (
          <p className="mt-2 border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/45">
            Cliquez sur « Aperçu » pour visualiser la lettre telle qu’elle sera reçue.
          </p>
        )}
      </div>
    </div>
  );
}
