"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { slugify } from "@/lib/admin-slug";
import { ENTITIES, type Field } from "@/lib/admin-cms-schema";
import * as cms from "@/lib/admin-cms";
import exportContenus from "@/donnees/contenus-neon.json";

async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? ""))) {
    throw new Error("Non autorisé.");
  }
}

type Raw = Record<string, string>;

/** Convertit la valeur saisie dans le formulaire vers le type attendu par le site. */
function valeur(f: Field, brut: string | undefined): unknown {
  const s = (brut ?? "").replace(/\r\n/g, "\n");
  switch (f.type) {
    case "bool":
      return s === "true" || s === "on" || s === "1";
    case "number":
      return s.trim() === "" ? null : Number(s);
    case "date":
    case "image":
    case "file":
      return s.trim() === "" ? null : s.trim();
    case "lines":
      return s.split("\n").map((l) => l.trim()).filter(Boolean);
    case "json":
      if (s.trim() === "") return [];
      return JSON.parse(s);
    case "select":
      return s || (f.options?.[0] ?? "");
    case "textarea":
      return s.trim();
    default:
      return s.trim();
  }
}

function revalidate() {
  // Tout le site : les contenus apparaissent sur plusieurs pages (accueil, colonnes latérales, recherche…)
  revalidatePath("/", "layout");
}

export async function saveEntity(
  entityKey: string,
  id: string | null,
  raw: Raw,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await assertAdmin();
  const e = ENTITIES[entityKey];
  if (!e) return { ok: false, error: "Rubrique inconnue." };

  const titre = (raw[e.titleField] ?? "").trim();
  if (!titre) return { ok: false, error: "Le titre est obligatoire." };

  const data: Record<string, unknown> = {};
  let corps: string | null = null;
  try {
    for (const f of e.fields) {
      if (f.name === e.contentField) corps = (raw[f.name] ?? "").replace(/\r\n/g, "\n");
      else data[f.name] = valeur(f, raw[f.name]);
    }
  } catch {
    return { ok: false, error: "Un champ au format JSON contient une erreur de syntaxe." };
  }
  for (const f of e.fields) if (f.type === "date" && f.name === "date" && !data.date) data.date = new Date().toISOString().slice(0, 10);

  const slug = slugify((raw.__slug ?? "").trim() || titre).slice(0, 80);
  if (!slug) return { ok: false, error: "Identifiant (adresse) invalide." };
  if (slug !== id && (await cms.getContenu(entityKey, slug))) {
    return { ok: false, error: `L’identifiant « ${slug} » est déjà utilisé dans cette rubrique.` };
  }
  const statut: cms.Statut = raw.__statut === "brouillon" ? "brouillon" : "publie";

  await cms.upsertContenu(entityKey, slug, data, corps, statut, id);
  revalidate();
  return { ok: true, id: slug };
}

export async function deleteEntity(entityKey: string, id: string): Promise<void> {
  await assertAdmin();
  await cms.deleteContenu(entityKey, id);
  revalidate();
  redirect(`/admin/${ENTITIES[entityKey].route}`);
}

export async function saveReglages(raw: Raw): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { REGLAGES } = await import("@/lib/admin-cms-schema-reglages");
  const data: Record<string, unknown> = {};
  try {
    for (const f of REGLAGES) data[f.name] = valeur(f, raw[f.name]);
  } catch {
    return { ok: false, error: "Un champ au format JSON contient une erreur de syntaxe." };
  }
  await cms.setReglages(data);
  revalidate();
  return { ok: true };
}

/** Copie dans Neon tous les contenus actuels du site (fichiers du dépôt). */
export async function migrerContenus(ecraser: boolean): Promise<{ ok: true; bilan: Record<string, number> } | { ok: false; error: string }> {
  await assertAdmin();
  try {
    const bilan = await cms.migrer(exportContenus as cms.Export, ecraser);
    revalidate();
    return { ok: true, bilan };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Migration impossible." };
  }
}
