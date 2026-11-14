import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/admin-applications";
import { BackLink } from "@/components/admin/ui";
import { ApplicationControls } from "@/components/admin/application-controls";

export const dynamic = "force-dynamic";

function FileLink({ label, href, name }: { label: string; href: string | null; name: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border border-ink/15 bg-white px-4 py-3 transition-colors hover:border-terra"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-cream text-xs font-bold text-terra-deep">
        {(name?.split(".").pop() ?? "fic").slice(0, 4).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-wide text-ink/45">{label}</span>
        <span className="block truncate text-sm text-ink">{name ?? "Télécharger"}</span>
      </span>
      <span className="ml-auto text-xs font-semibold text-terra-deep">Ouvrir ↗</span>
    </a>
  );
}

export default async function ApplicationDetailPage(props: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await props.params;
  const a = await getApplicationById(Number(id));
  if (!a) notFound();

  const when = new Date(a.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  return (
    <div>
      <BackLink href="/admin/candidatures" label="Candidatures" />
      <p className="kicker mt-4">{a.posteN ? `Poste ${a.posteN}` : "Candidature spontanée"}</p>
      <h1 className="display-title mt-1 text-2xl text-ink sm:text-[1.7rem]">{a.fullName}</h1>
      <p className="mt-1.5 text-sm text-ink/55">{a.posteTitle} · reçue le {when}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div className="space-y-6">
          {/* Coordonnées */}
          <div className="rounded-lg border border-ink/12 bg-white p-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">Contact</p>
            <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink/45">E-mail</dt>
                <dd>
                  <a href={`mailto:${a.email}`} className="text-terra-deep hover:text-terra">{a.email}</a>
                </dd>
              </div>
              {a.phone && (
                <div>
                  <dt className="text-xs text-ink/45">Téléphone</dt>
                  <dd className="text-ink">{a.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Motivation */}
          <div className="rounded-lg border border-ink/12 bg-white p-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">Motivation</p>
            <p className="mt-3 whitespace-pre-wrap font-serif text-[0.95rem] leading-relaxed text-ink-soft">
              {a.message}
            </p>
          </div>

          {/* Pièces */}
          <div className="rounded-lg border border-ink/12 bg-white p-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink/55">Pièces jointes</p>
            <div className="mt-3 space-y-2">
              <FileLink label="CV" href={a.cvUrl} name={a.cvName} />
              <FileLink label="Lettre de motivation" href={a.letterUrl} name={a.letterName} />
              <FileLink label="Portfolio" href={a.portfolioUrl} name={a.portfolioName} />
              {a.links.length > 0 && (
                <ul className="space-y-1 pt-1 text-sm">
                  {a.links.map((l, i) => (
                    <li key={i}>
                      <a href={l} target="_blank" rel="noreferrer" className="break-all text-terra-deep underline underline-offset-2 hover:text-terra">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <ApplicationControls id={a.id} status={a.status} note={a.note ?? ""} />
      </div>
    </div>
  );
}
