import { listSubscribers, subscriberStats, emailEnabled } from "@/lib/admin-newsletter";
import { PageHeader } from "@/components/admin/ui";
import { NewsletterTable } from "@/components/admin/newsletter-table";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage(props: { params: Promise<Record<string, string>>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const search = typeof sp?.q === "string" ? sp.q : "";
  const [subscribers, stats] = await Promise.all([listSubscribers(search), subscriberStats()]);

  return (
    <div>
      <PageHeader
        kicker="Audience"
        title="Lettre d’information"
        subtitle={
          emailEnabled()
            ? "Double opt-in actif : les inscrits confirment par e-mail avant d’entrer dans la liste."
            : "Inscription directe (aucun service d’e-mail configuré). Les adresses sont confirmées immédiatement."
        }
        action={{ href: "/admin/newsletter/lettre", label: "Composer la lettre" }}
      />

      <div className="mt-6 flex flex-wrap gap-6 text-xs uppercase tracking-wide text-ink/45">
        <span className="text-terra-deep">{stats.confirmed} confirmés</span>
        {stats.pending > 0 && <span>{stats.pending} en attente</span>}
        {stats.unsubscribed > 0 && <span>{stats.unsubscribed} désinscrits</span>}
      </div>

      <NewsletterTable subscribers={subscribers} search={search} />

      <p className="mt-6 text-xs text-ink/40">
        Le CSV exporte uniquement les adresses <strong>confirmées</strong> — prêt à importer dans
        Brevo, Mailchimp, ou tout autre outil d’envoi.
      </p>
    </div>
  );
}
