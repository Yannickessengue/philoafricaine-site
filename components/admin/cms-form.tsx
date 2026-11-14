"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEntity, deleteEntity } from "@/app/admin/cms/actions";
import { slugify } from "@/lib/admin-slug";
import { ImageField } from "@/components/admin/image-field";
import type { Field } from "@/lib/admin-cms-schema";

const SLUG: Field = { name: "__slug", label: "Identifiant (adresse de la page)", type: "text", optional: true, help: "créé automatiquement depuis le titre s’il est vide" };
const STATUT: Field = { name: "__statut", label: "Statut", type: "select", options: ["publie", "brouillon"] };

function initialValue(f: Field, initial: Record<string, unknown> | null): string {
  const v = initial?.[f.name];
  if (v == null) {
    if (f.type === "bool") return "false";
    if (f.type === "date") return f.name === "date" ? new Date().toISOString().slice(0, 10) : "";
    if (f.type === "select") return f.options?.[0] ?? "";
    if (f.name === "__statut") return "publie";
    return "";
  }
  if (f.type === "bool") return v ? "true" : "false";
  if (f.type === "lines") return Array.isArray(v) ? v.join("\n") : String(v);
  if (f.type === "json") return JSON.stringify(v, null, 2);
  if (f.type === "date") return String(v).slice(0, 10);
  return String(v);
}

const labelCls = "block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55";
const inputCls =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-terra focus:ring-1 focus:ring-terra/20";

export function CmsForm({
  entityKey,
  fields,
  titleField,
  initial,
  id,
  backHref,
  folder,
}: {
  folder?: string;
  entityKey: string;
  fields: Field[];
  titleField: string;
  initial: Record<string, unknown> | null;
  id: string | null;
  backHref: string;
}) {
  fields = [...fields, SLUG, STATUT];
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initialValue(f, initial)])),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await saveEntity(entityKey, id, v);
      if (!res.ok) return setErr(res.error);
      if (!id) {
        router.push(`${backHref}/${encodeURIComponent(res.id)}`);
        router.refresh();
      } else {
        setMsg("Modifications enregistrées.");
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      }
    });
  }

  function onDelete() {
    if (!id || !confirm("Supprimer définitivement cet élément ? Il disparaîtra du site.")) return;
    start(async () => {
      await deleteEntity(entityKey, id);
    });
  }

  const titleF = fields.find((f) => f.name === titleField);
  const rest = fields.filter((f) => f.name !== titleField);
  const grid = rest.filter((f) => !isWide(f));
  const wide = rest.filter((f) => isWide(f));

  return (
    <form onSubmit={submit} className="mt-6 max-w-3xl pb-24">
      <div className="rounded-lg border border-ink/12 bg-white p-6">
        {titleF && (
          <div className="mb-5 border-b border-ink/8 pb-5">
            <FieldControl f={titleF} value={v[titleF.name]} set={set} titleField={titleField} v={v} entityKey={entityKey} folder={folder} big />
          </div>
        )}
        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {grid.map((f) => (
            <FieldControl key={f.name} f={f} value={v[f.name]} set={set} titleField={titleField} v={v} entityKey={entityKey} folder={folder} />
          ))}
        </div>
        {wide.length > 0 && (
          <div className="mt-5 space-y-5 border-t border-ink/8 pt-5">
            {wide.map((f) => (
              <FieldControl key={f.name} f={f} value={v[f.name]} set={set} titleField={titleField} v={v} entityKey={entityKey} folder={folder} />
            ))}
          </div>
        )}
      </div>

      {/* Barre d’action collante */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-[#faf6f1]/95 backdrop-blur md:left-[15.5rem]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 lg:px-10">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-md bg-ink px-6 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra disabled:opacity-40"
          >
            {pending ? "Enregistrement…" : id ? "Enregistrer" : "Créer"}
          </button>
          {id && (
            <button type="button" onClick={onDelete} className="text-xs text-ink/40 transition-colors hover:text-terra-deep">
              Supprimer
            </button>
          )}
          {err && <span className="truncate text-sm text-terra-deep">{err}</span>}
          {msg && <span className="text-sm font-semibold text-terra-deep">✓ {msg}</span>}
        </div>
      </div>
    </form>
  );
}

function isWide(f: Field) {
  return f.full || f.type === "markdown" || f.type === "json" || f.type === "lines" || f.type === "image" || f.type === "file";
}

function FieldControl({
  f,
  value,
  set,
  titleField,
  v,
  entityKey,
  folder,
  big,
}: {
  f: Field;
  value: string;
  set: (k: string, v: string) => void;
  titleField: string;
  v: Record<string, string>;
  entityKey: string;
  folder?: string;
  big?: boolean;
}) {
  if (f.type === "image" || f.type === "file") {
    return (
      <ImageField
        label={f.label}
        help={f.help}
        value={value}
        onChange={(url) => set(f.name, url)}
        folder={folder ?? entityKey}
        kind={f.type === "file" ? "file" : "image"}
        accept={f.type === "file" ? "image/*,application/pdf" : "image/*"}
      />
    );
  }

  if (f.type === "bool") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 pt-5">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => set(f.name, e.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded accent-terra"
        />
        <span className="text-sm text-ink">{f.label}</span>
      </label>
    );
  }

  return (
    <div>
      <label className={labelCls} htmlFor={`f-${f.name}`}>
        {f.label}
        {f.optional && <span className="ml-1 font-normal normal-case text-ink/30">— facultatif</span>}
      </label>
      {f.type === "select" ? (
        <select id={`f-${f.name}`} className={inputCls} value={value} onChange={(e) => set(f.name, e.target.value)}>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o === "brouillon" ? "Brouillon (non visible sur le site)" : o === "publie" ? "Publié" : o}
            </option>
          ))}
        </select>
      ) : f.type === "textarea" ? (
        <textarea id={`f-${f.name}`} rows={big ? 2 : 4} className={inputCls} value={value} onChange={(e) => set(f.name, e.target.value)} />
      ) : f.type === "markdown" || f.type === "lines" || f.type === "json" ? (
        <textarea
          id={`f-${f.name}`}
          rows={f.type === "lines" ? 5 : f.type === "json" ? 10 : 18}
          spellCheck={f.type !== "json"}
          className={`${inputCls} ${f.type === "json" ? "font-mono text-xs" : "font-serif leading-relaxed"}`}
          value={value}
          onChange={(e) => set(f.name, e.target.value)}
        />
      ) : (
        <input
          id={`f-${f.name}`}
          type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
          className={big ? `${inputCls} font-brand text-base font-bold` : inputCls}
          value={value}
          onChange={(e) => set(f.name, e.target.value)}
          onBlur={() => {
            if (f.name === "__slug" && !v.__slug && v[titleField]) set("__slug", slugify(v[titleField]));
          }}
        />
      )}
      {f.type === "markdown" && (
        <p className="mt-1 text-xs text-ink/40">
          Mise en forme : **gras**, *italique*, ## intertitre, - liste, &gt; citation, [texte du lien](https://…). Une ligne vide entre deux paragraphes.
        </p>
      )}
      {f.help && <p className="mt-1 text-xs text-ink/40">{f.help}</p>}
    </div>
  );
}
