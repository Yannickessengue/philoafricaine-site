"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type Item = { href: string; label: string; exact?: boolean; icon: React.ReactNode };
type Group = { title?: string; items: Item[] };

const ic = {
  dash: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  edito: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h13v14H4z" />
      <path d="M17 9h3v8a2 2 0 0 1-2 2H4" strokeLinejoin="round" />
      <path d="M7 9h6M7 12h6M7 15h4" strokeLinecap="round" />
    </>
  ),
  agenda: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="1.5" />
      <path d="M4 10h16M9 3v4M15 3v4" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" strokeLinejoin="round" />
      <path d="M5 17a3 3 0 0 1 3-3h11" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a2 2 0 0 0 2 2h1l9 4V5L6 9H5a2 2 0 0 0-2 2Z" strokeLinejoin="round" />
      <path d="M18 8a4 4 0 0 1 0 8" strokeLinecap="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" strokeLinecap="round" />
    </>
  ),
  play: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" stroke="none" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinejoin="round" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 6 8 6 8-6" strokeLinejoin="round" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3M12 18v3M4.2 7l2.6 1.5M17.2 15.5 19.8 17M4.2 17l2.6-1.5M17.2 8.5 19.8 7" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14l3.5-4 3 2.5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

const GROUPS: Group[] = [
  {
    items: [
      { href: "/admin", label: "Tableau de bord", exact: true, icon: ic.dash },
      { href: "/admin/statistiques", label: "Statistiques", icon: ic.chart },
    ],
  },
  {
    title: "Contenus",
    items: [
      { href: "/admin/editos", label: "Éditos", icon: ic.edito },
      { href: "/admin/actualites", label: "Actualités", icon: ic.news },
      { href: "/admin/agenda", label: "Agenda", icon: ic.agenda },
      { href: "/admin/flash", label: "Flash d’entrée", icon: ic.edito },
      { href: "/admin/chronologie", label: "Notre histoire", icon: ic.agenda },
      { href: "/admin/pages", label: "Pages fixes", icon: ic.edito },
    ],
  },
  {
    title: "Publications",
    items: [
      { href: "/admin/publications", label: "Notes de lecture", icon: ic.book },
      { href: "/admin/auteurs", label: "Auteurs", icon: ic.user },
      { href: "/admin/revue", label: "Revue JOGOO", icon: ic.book },
      { href: "/admin/magazine", label: "Philo Africaine Magazine", icon: ic.book },
    ],
  },
  {
    title: "Recherche & médias",
    items: [
      { href: "/admin/appels", label: "Appels à contributions", icon: ic.megaphone },
      { href: "/admin/postes", label: "Appels à postes", icon: ic.briefcase },
      { href: "/admin/videos", label: "Médiathèque", icon: ic.play },
      { href: "/admin/minutes", label: "Les 5 minutes du chant du coq", icon: ic.play },
      { href: "/admin/podcasts", label: "Podcasts", icon: ic.play },
    ],
  },
  {
    title: "Communauté",
    items: [
      { href: "/admin/commentaires", label: "Commentaires", icon: ic.chat },
      { href: "/admin/candidatures", label: "Candidatures", icon: ic.briefcase },
      { href: "/admin/newsletter", label: "Lettre d’information", icon: ic.mail },
    ],
  },
  { title: "Paramètres", items: [{ href: "/admin/reglages", label: "Réglages", icon: ic.cog }] },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="shrink-0"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (it: Item) => (it.exact ? pathname === it.href : pathname.startsWith(it.href));

  return (
    <div className="flex min-h-dvh bg-[#faf6f1]">
      <aside className="sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 flex-col overflow-y-auto bg-ink px-3.5 py-6 text-paper md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-2.5">
          <Image src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" width={565} height={168} className="h-7 w-auto" priority />
        </Link>
        <p className="mt-1 px-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-paper/40">
          Espace rédaction
        </p>

        <nav className="mt-7 flex flex-col">
          {GROUPS.map((g, gi) => (
            <div key={gi} className={gi > 0 ? "mt-5" : ""}>
              {g.title && (
                <p className="mb-1.5 px-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-paper/35">
                  {g.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {g.items.map((it) => {
                  const active = isActive(it);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.83rem] transition-colors ${
                        active
                          ? "bg-terra text-white"
                          : "text-paper/55 hover:bg-paper/[0.07] hover:text-paper"
                      }`}
                    >
                      <Ico>{it.icon}</Ico>
                      <span className="truncate">{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.83rem] text-paper/55 transition-colors hover:bg-paper/[0.07] hover:text-paper"
          >
            <Ico>
              <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            </Ico>
            Voir le site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.83rem] text-paper/55 transition-colors hover:bg-paper/[0.07] hover:text-paper"
          >
            <Ico>
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </Ico>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-ink/10 bg-ink px-4 py-3 text-paper md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Image src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" width={565} height={168} className="h-6 w-auto" />
            </Link>
            <button type="button" onClick={logout} className="text-xs text-paper/60">
              Quitter
            </button>
          </div>
          <nav className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {ALL_ITEMS.map((it) => (
              <Link key={it.href} href={it.href} className={isActive(it) ? "font-semibold text-gold" : "text-paper/55"}>
                {it.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
