import { useState, type ReactNode } from "react";
import mark from "../assets/portrait-mark.png";
import { useAuth } from "../context/useAuth";
import { navigate } from "../lib/router";
import type { AdminPage } from "./adminTypes";

const NAV_ITEMS: { id: AdminPage; label: string; icon: ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "My Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
      </svg>
    ),
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    id: "games",
    label: "Games",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" />
      </svg>
    ),
  },
];

const PAGE_TITLES: Record<AdminPage, string> = {
  dashboard: "Dashboard",
  profile: "My Profile",
  certificates: "Certificates",
  games: "Games Library",
};

export function AdminLayout({
  page,
  onNavigate,
  children,
}: {
  page: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface text-text-primary lg:flex">
      <aside className="hidden w-60 shrink-0 border-r-2 border-border bg-surface-light lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b-2 border-border">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-full w-full items-center gap-3 px-4 text-left transition-colors hover:bg-cream"
          >
            <img
              src={mark}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 border-2 border-coal object-cover"
            />
            <span className="min-w-0">
              <span className="block font-heading text-xs font-extrabold uppercase tracking-[-0.01em]">
                Admin
              </span>
              <span className="block font-mono text-[8px] uppercase tracking-[0.24em] text-text-muted">
                Control panel
              </span>
            </span>
          </button>
        </div>
        <nav className="flex-1 p-3" aria-label="Admin">
          {NAV_ITEMS.map((item, i) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={`mb-1 flex w-full items-center gap-3 border-2 px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "border-coal bg-coal text-parchment"
                    : "border-transparent text-text-secondary hover:border-border hover:bg-cream hover:text-text-primary"
                }`}
              >
                <span className={active ? "accent-invert" : "text-text-muted"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                <span className={active ? "accent-invert" : "text-text-muted"}>
                  0{i + 1}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t-2 border-border p-3">
          <p className="mb-2 truncate px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
            {user?.email}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 border-2 border-border px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:bg-coal hover:text-parchment"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b-2 border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center border-2 border-border lg:hidden"
              aria-label="Toggle admin menu"
              aria-expanded={menuOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-text-muted">
                Admin / {String(NAV_ITEMS.findIndex((n) => n.id === page) + 1).padStart(2, "0")}
              </p>
              <h1 className="font-heading text-base font-extrabold uppercase tracking-[-0.02em]">
                {PAGE_TITLES[page]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden border-2 border-border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:bg-cream hover:text-text-primary sm:block"
            >
              View site ↗
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="border-2 border-border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:bg-coal hover:text-parchment lg:hidden"
            >
              Sign out
            </button>
          </div>
        </header>

        {menuOpen && (
          <nav className="border-b-2 border-border bg-surface-light p-3 lg:hidden" aria-label="Admin mobile">
            {NAV_ITEMS.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMenuOpen(false);
                  }}
                  className={`mb-1 flex w-full items-center gap-3 border-2 px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-coal bg-coal text-parchment"
                      : "border-transparent text-text-secondary hover:border-border hover:bg-cream"
                  }`}
                >
                  <span className={active ? "accent-invert" : "text-text-muted"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
