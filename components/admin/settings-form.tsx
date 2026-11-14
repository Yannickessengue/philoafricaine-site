"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveReglages } from "@/app/admin/cms/actions";
import type { Field } from "@/lib/admin-cms-schema";

const labelCls = "block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55";
const inputCls =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-terra focus:ring-1 focus:ring-terra/20";

export function ReglagesForm({ fields, initial }: { fields: Field[]; initial: Record<string, unknown> }) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((f) => {
        const x = initial[f.name];
        return [f.name, Array.isArray(x) ? x.join("\n") : x == null ? "" : String(x)];
      }),
    ),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-6 max-w-3xl pb-16"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        start(async () => {
          const r = await saveReglages(v);
          if (!r.ok) return setErr(r.error);
          setMsg("Réglages enregistrés.");
          router.refresh();
          setTimeout(() => setMsg(null), 3000);
        });
      }}
    >
      <div className="grid gap-5 rounded-lg border border-ink/12 bg-white p-6 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label className={labelCls} htmlFor={`r-${f.name}`}>
              {f.label}
            </label>
            {f.type === "text" ? (
              <input id={`r-${f.name}`} className={inputCls} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
            ) : (
              <textarea id={`r-${f.name}`} rows={f.type === "lines" ? 5 : 3} className={inputCls} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
            )}
            {f.help && <p className="mt-1 text-xs text-ink/40">{f.help}</p>}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button type="submit" disabled={pending} className="h-10 rounded-md bg-ink px-6 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra disabled:opacity-40">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {msg && <span className="text-sm font-semibold text-terra-deep">✓ {msg}</span>}
        {err && <span className="text-sm text-terra-deep">{err}</span>}
      </div>
    </form>
  );
}
