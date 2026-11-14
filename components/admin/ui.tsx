import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink/40 transition-colors hover:text-terra"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-5">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="display-title mt-1.5 text-[1.7rem] text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  href,
  accent = "ink",
  icon,
}: {
  label: string;
  value: number | string;
  href: string;
  accent?: "ink" | "terra" | "gold" | "muted";
  icon: React.ReactNode;
}) {
  const dot =
    accent === "terra"
      ? "bg-terra"
      : accent === "gold"
        ? "bg-gold"
        : accent === "muted"
          ? "bg-ink/20"
          : "bg-ink";
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden border border-ink/12 bg-white p-5 transition-colors hover:border-terra"
    >
      <div className="flex items-start justify-between">
        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-ink/25 transition-colors group-hover:text-terra" aria-hidden>
          {icon}
        </svg>
      </div>
      <div className="mt-6">
        <div className="display-title text-[2rem] leading-none text-ink">{value}</div>
        <div className="mt-1.5 text-xs uppercase tracking-wide text-ink/45">{label}</div>
      </div>
    </Link>
  );
}

export function StatusPill({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-terra/10 px-2.5 py-0.5 text-xs font-semibold text-terra-deep">
      <span className="h-1.5 w-1.5 rounded-full bg-terra" aria-hidden />
      Publié
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-xs font-semibold text-ink/55">
      <span className="h-1.5 w-1.5 rounded-full bg-ink/30" aria-hidden />
      Brouillon
    </span>
  );
}
