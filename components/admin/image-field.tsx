"use client";

import { useRef, useState } from "react";

const MAX = 8 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const FILE_TYPES = [...IMG_TYPES, "application/pdf"];
const mo = (n: number) => `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

export function ImageField({
  value,
  onChange,
  folder = "medias",
  accept = "image/*",
  kind = "image",
  label,
  help,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  kind?: "image" | "file";
  label: string;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const allowed = kind === "file" ? FILE_TYPES : IMG_TYPES;

  async function handle(file: File | undefined) {
    setErr(null);
    if (!file) return;

    // Contrôles avant envoi : feedback immédiat
    if (file.size === 0) return setErr("Le fichier est vide.");
    if (file.size > MAX) {
      return setErr(`Fichier trop lourd : ${mo(file.size)}. Maximum ${mo(MAX)} — compressez l’image d’abord.`);
    }
    if (!allowed.includes(file.type)) {
      const nice = kind === "file" ? "JPG, PNG, WebP, GIF, AVIF ou PDF" : "JPG, PNG, WebP, GIF ou AVIF";
      return setErr(`Format « ${file.type || "inconnu"} » non accepté. Choisissez un fichier ${nice}.`);
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      let d: { url?: string; error?: string } = {};
      try {
        d = await res.json();
      } catch {
        d = { error: `Réponse inattendue du serveur (${res.status}).` };
      }
      if (!res.ok || !d.url) {
        setErr(d.error ?? `Échec du téléversement (${res.status}).`);
        return;
      }
      onChange(d.url);
    } catch {
      setErr("Connexion perdue pendant l’envoi. Vérifiez votre réseau et réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const isPdf = value.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">{label}</label>

      <div
        className={`mt-1.5 flex items-center gap-3 border border-dashed p-3 transition-colors ${
          err ? "border-terra/50 bg-terra/5" : "border-ink/25 bg-white"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          kind === "image" && !isPdf ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-16 w-16 shrink-0 border border-ink/10 object-cover"
              onError={() => setErr("L’image enregistrée est introuvable (lien cassé). Téléversez-en une nouvelle.")}
            />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center border border-ink/10 bg-cream text-[0.6rem] font-semibold uppercase text-terra-deep">
              {isPdf ? "PDF" : "Fichier"}
            </span>
          )
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center border border-ink/10 bg-cream text-ink/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </span>
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="h-8 border border-ink/20 px-3 text-xs font-semibold uppercase tracking-wide text-ink/70 transition-colors hover:border-terra hover:text-terra-deep disabled:opacity-40"
          >
            {busy ? "Envoi…" : value ? "Remplacer" : "Téléverser"}
          </button>
          {value && !busy && (
            <button type="button" onClick={() => onChange("")} className="ml-2 text-xs text-ink/40 hover:text-terra-deep">
              Retirer
            </button>
          )}
          {value && (
            <p className="mt-1 truncate text-xs text-ink/40" title={value}>
              {value.replace(/^https?:\/\/[^/]+\//, "…/")}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {err ? (
        <p className="mt-1 text-xs font-medium text-terra-deep">{err}</p>
      ) : help ? (
        <p className="mt-1 text-xs text-ink/40">{help}</p>
      ) : (
        <p className="mt-1 text-xs text-ink/35">Glissez-déposez ou cliquez · {mo(MAX)} max</p>
      )}
    </div>
  );
}
