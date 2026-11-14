import Link from "next/link";
import { subscriberStats, listCampaigns, emailEnabled } from "@/lib/admin-newsletter";
import { PageHeader } from "@/components/admin/ui";
import { NewsletterComposer } from "@/components/admin/newsletter-composer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function NewsletterLettrePage() {
  const [stats, campaigns] = await Promise.all([subscriberStats(), listCampaigns(8)]);

  return (
    <div>
      <Link
        href="/admin/newsletter"
        className="text-xs font-semibold uppercase tracking-wide text-ink/40 hover:text-terra"
      >
        ← Abonnés
      </Link>
      <div className="mt-3">
        <PageHeader
          kicker="Lettre d’information"
          title="Composer et envoyer"
          subtitle="Un récapitulatif automatique de l’activité du site — édito, publications, agenda, appels — habillé aux couleurs du Groupe."
        />
      </div>

      <NewsletterComposer confirmedCount={stats.confirmed} mailReady={emailEnabled()} />

      {campaigns.length > 0 && (
        <div className="mt-12">
          <h2 className="font-brand text-sm font-bold uppercase tracking-wide text-ink">Envois précédents</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-[0.68rem] uppercase tracking-wide text-ink/45">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Objet</th>
                <th className="py-2 pr-3 font-semibold">Livrés</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-ink/8">
                  <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">
                    {new Date(c.sentAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2.5 pr-3">{c.subject}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-ink-soft">
                    {c.delivered}/{c.recipients}
                    {c.failed > 0 && <span className="text-terra-deep"> ({c.failed} échecs)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
