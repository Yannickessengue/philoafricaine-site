"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Connexion impossible.");
        return;
      }
      const from = new URLSearchParams(window.location.search).get("from");
      router.replace(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau de marque */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        {/* Le coq, en filigrane */}
        <Image
          src="/medias/site/jogoo/coq-penseur-t.png"
          alt=""
          aria-hidden
          width={1203}
          height={1232}
          priority
          className="pointer-events-none absolute -bottom-20 -right-24 w-[32rem] max-w-none -scale-x-100 opacity-20 [mask-image:radial-gradient(circle_at_100%_100%,#000_0%,#000_32%,transparent_70%)]"
        />
        {/* Halo chaud + voile pour l’unité */}
        <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_12%_0%,rgba(234,191,49,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-ink/40" />
        <div className="absolute inset-y-0 right-0 w-px bg-gold/40" />

        <div className="relative">
          <Image src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" width={565} height={168} className="h-10 w-auto" priority />
        </div>

        <div className="relative max-w-sm">
          <p aria-hidden className="font-serif text-5xl leading-none text-gold/70">“</p>
          <p className="-mt-3 font-serif text-2xl italic leading-snug text-paper">
            Le coq, animal de l’aurore : celui qui nous réveille, celui qui nous met au travail.
          </p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/60">
            Espace de gestion éditoriale : rédaction et publication des éditos de la semaine,
            modération des commentaires.
          </p>
        </div>

        <div className="relative text-[0.7rem] uppercase tracking-[0.22em] text-paper/45">
          Philosophie africaine · Débats &amp; questions
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm">
          <Image
            src="/medias/site/jogoo/logo-jogoo-header.png"
            alt="Groupe JOGOO"
            width={2018}
            height={984}
            className="mb-8 h-9 w-auto lg:hidden"
            priority
          />

          <p className="kicker">Espace rédaction</p>
          <h1 className="display-title mt-2 text-3xl text-ink">Connexion</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Réservé à l’équipe éditoriale du Groupe JOGOO.
          </p>

          <label htmlFor="admin-pass" className="mt-8 block text-xs font-semibold uppercase tracking-wide text-ink/60">
            Mot de passe
          </label>
          <input
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="mt-1.5 h-12 w-full border border-ink/20 bg-white px-3.5 text-sm outline-none transition-colors focus:border-terra"
          />

          {error && (
            <p className="mt-3 rounded-sm bg-terra/8 px-3 py-2 text-sm text-terra-deep">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-ink text-xs font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <rect x="4" y="11" width="16" height="10" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
            </svg>
            {busy ? "Connexion…" : "Se connecter"}
          </button>

          <Link
            href="/"
            className="mt-8 inline-block text-xs font-semibold uppercase tracking-wide text-ink/45 transition-colors hover:text-terra-deep"
          >
            ← Retour au site
          </Link>
        </form>
      </div>
    </div>
  );
}
