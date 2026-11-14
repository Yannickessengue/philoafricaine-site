import "server-only";
import { getEditos, getPublications, getAgenda, reader } from "@/lib/content";
import { siteUrl, emailLogoUrl } from "@/lib/admin-mailer";

const C = {
  ink: "#1a1a1a",
  soft: "#4a433f",
  terra: "#c94c27",
  terraDeep: "#9e3a1c",
  gold: "#eabf31",
  cream: "#f8ede8",
  paper: "#fbf8f3",
  line: "#e4d9d2",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/** Placeholder de lien de désinscription, remplacé par destinataire. */
export const UNSUB_PLACEHOLDER = "%%UNSUB%%";

export type DigestData = {
  subject: string;
  html: string;
  summary: { editos: number; publications: number; agenda: number; appels: number };
};

export async function assembleDigest(intro: string): Promise<DigestData> {
  const url = siteUrl();
  // Contenus du site (Neon, ou fichiers tant que la migration n'est pas faite)
  const editos = (await getEditos()).map((e) => ({
    slug: e.slug,
    title: e.entry.titre,
    subtitle: e.entry.soustitre || "",
    standfirst: e.entry.accroche || "",
  }));
  const currentEdito = editos[0];

  const pubs = (await getPublications())
    .map((p) => ({
      slug: p.slug,
      work: p.entry.titre,
      author: p.entry.auteurOuvrage || "",
      year: Number(p.entry.annee) || 0,
      excerpt: p.entry.resume || "",
    }))
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = (await getAgenda())
    .filter((a) => (a.entry.date ?? "") >= todayIso)
    .slice(0, 4)
    .map((a) => ({ date: a.entry.dateAffichee || a.entry.date || "", title: a.entry.intitule, place: a.entry.lieu || "" }));

  const openPostes = (await reader.collections.postes.all())
    .filter((p) => !p.entry.pourvu)
    .slice(0, 4)
    .map((p) => ({ title: p.entry.intitule }));

  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = currentEdito
    ? `Lettre du Groupe JOGOO — ${clip(currentEdito.title, 60)}`
    : `Lettre du Groupe JOGOO — ${dateLabel}`;

  const section = (label: string, inner: string) => `
    <tr><td style="padding:28px 32px 0">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.terraDeep}">${label}</p>
      ${inner}
    </td></tr>`;

  const btn = (href: string, text: string) => `
    <a href="${href}" style="display:inline-block;background:${C.ink};color:#ffffff;text-decoration:none;padding:9px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">${esc(text)}</a>`;

  const editoBlock = currentEdito
    ? section(
        "L’édito de la semaine",
        `
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:bold;line-height:1.25;color:${C.ink}">${esc(currentEdito.title)}</p>
        ${currentEdito.subtitle ? `<p style="margin:0 0 10px;font-family:Georgia,serif;font-style:italic;font-size:14px;color:${C.soft}">${esc(currentEdito.subtitle)}</p>` : ""}
        <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:${C.soft}">${esc(clip(currentEdito.standfirst, 260))}</p>
        ${btn(`${url}/edito/${currentEdito.slug}`, "Lire l’édito")}
      `,
      )
    : "";

  const pubsBlock =
    pubs.length > 0
      ? section(
          "Publications récentes",
          pubs
            .map(
              (r) => `
        <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:14px;line-height:1.5;color:${C.soft}">
          <a href="${url}/publications/${r.slug}" style="color:${C.ink};text-decoration:none;font-weight:bold">${esc(r.work ?? r.author)}</a>
          <span style="color:#8a807a"> — ${esc(r.author)}, ${r.year}</span><br/>
          ${esc(clip(r.excerpt, 160))}
        </p>`,
            )
            .join("") + `<p style="margin:6px 0 0">${btn(`${url}/publications`, "Toutes les publications")}</p>`,
        )
      : "";

  const agendaBlock =
    upcoming.length > 0
      ? section(
          "À l’agenda",
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">` +
            upcoming
              .map(
                (a) => `
          <tr>
            <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:${C.terraDeep};white-space:nowrap;vertical-align:top;width:110px">${esc(a.date)}</td>
            <td style="padding:6px 0;font-family:Georgia,serif;font-size:13.5px;line-height:1.45;color:${C.soft}">${esc(a.title)}${a.place ? `<span style="color:#8a807a"> · ${esc(a.place)}</span>` : ""}</td>
          </tr>`,
              )
              .join("") +
            `</table><p style="margin:12px 0 0">${btn(`${url}/actualites`, "Tout l’agenda")}</p>`,
        )
      : "";

  const appelsBlock =
    openPostes.length > 0
      ? section(
          "Appels ouverts",
          `<p style="margin:0 0 10px;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:${C.soft}">${openPostes.length} poste${openPostes.length > 1 ? "s" : ""} de direction de programme de recherche ${openPostes.length > 1 ? "sont ouverts" : "est ouvert"} :</p>
          <ul style="margin:0 0 12px;padding-left:18px">
            ${openPostes.map((p) => `<li style="font-family:Georgia,serif;font-size:13.5px;line-height:1.5;color:${C.soft};margin-bottom:4px">${esc(p.title)}</li>`).join("")}
          </ul>
          ${btn(`${url}/recherche/appels-a-postes`, "Voir les appels")}`,
        )
      : "";

  const introBlock = intro.trim()
    ? `<tr><td style="padding:24px 32px 0">
        <div style="font-family:Georgia,serif;font-size:15px;line-height:1.65;color:${C.ink}">
          ${intro
            .trim()
            .split(/\n\s*\n/)
            .map((p) => `<p style="margin:0 0 12px">${esc(p).replace(/\n/g, "<br/>")}</p>`)
            .join("")}
        </div>
      </td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/>
<title>Lettre du Groupe JOGOO</title></head>
<body style="margin:0;padding:0;background:${C.cream}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.paper};border:1px solid ${C.line}">

    <tr><td style="background:${C.ink};padding:26px 32px" align="center">
      <img src="${emailLogoUrl()}" width="150" alt="Groupe JOGOO" style="display:block;height:auto;border:0"/>
    </td></tr>
    <tr><td style="height:4px;background:${C.gold};font-size:0;line-height:0">&nbsp;</td></tr>

    <tr><td style="padding:26px 32px 0">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${C.terraDeep}">La lettre &middot; ${esc(dateLabel)}</p>
      <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:24px;font-weight:bold;color:${C.ink}">Philosophie africaine, débats &amp; questions</p>
    </td></tr>

    ${introBlock}
    ${editoBlock}
    ${pubsBlock}
    ${agendaBlock}
    ${appelsBlock}

    <tr><td style="padding:30px 32px 26px">
      <hr style="border:0;border-top:1px solid ${C.line};margin:0 0 16px"/>
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a807a">
        Groupe JOGOO — ASPHICC-JOGOO, « Association des Philosophes du Chant du Coq ».<br/>
        <a href="${url}" style="color:${C.terraDeep};text-decoration:none">philoafricaine.org</a>
      </p>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a99f98">
        Vous recevez cette lettre car vous êtes inscrit·e.
        <a href="${UNSUB_PLACEHOLDER}" style="color:#a99f98;text-decoration:underline">Se désinscrire</a>.
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body></html>`;

  return {
    subject,
    html,
    summary: {
      editos: currentEdito ? 1 : 0,
      publications: pubs.length,
      agenda: upcoming.length,
      appels: openPostes.length,
    },
  };
}

