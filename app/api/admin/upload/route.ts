import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX = 8 * 1024 * 1024; // 8 Mo
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};
const LABELS = "JPG, PNG, WebP, GIF, AVIF, PDF";
const mo = (n: number) => `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

const slugFolder = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "medias";

function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? ""))) {
    return err("Session expirée. Reconnectez-vous.", 401);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return err(
      "Le stockage des images n’est pas configuré (variable BLOB_READ_WRITE_TOKEN manquante).",
      503,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("Envoi interrompu ou fichier illisible. Réessayez.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("Aucun fichier reçu.", 400);
  }
  if (file.size > MAX) {
    return err(
      `Fichier trop lourd : ${mo(file.size)} (maximum ${mo(MAX)}). Réduisez ou compressez l’image avant de réessayer.`,
      413,
    );
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return err(
      `Format « ${file.type || "inconnu"} » non pris en charge. Formats acceptés : ${LABELS}.`,
      415,
    );
  }

  const folder = slugFolder(String(form.get("folder") ?? "medias"));

  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return err("Lecture du fichier impossible. Réessayez.", 400);
  }

  // Clé par empreinte du contenu : le même fichier renvoie toujours la même URL (pas de doublon).
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 24);
  const key = `jogoo/${folder}/${hash}.${ext}`;

  try {
    const blob = await put(key, buf, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, bytes: file.size });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/token|unauthor|forbidden|403|401/i.test(msg)) {
      return err("Jeton de stockage invalide ou expiré. Vérifiez BLOB_READ_WRITE_TOKEN.", 502);
    }
    if (/quota|limit|storage|size/i.test(msg)) {
      return err("Espace de stockage d’images plein. Contactez l’administrateur.", 507);
    }
    console.error("[upload]", msg);
    return err("Le téléversement a échoué côté serveur. Réessayez dans un instant.", 502);
  }
}
