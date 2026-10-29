import { useState, type ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import { navigate } from "../lib/router";
import type { AdminPage } from "./adminTypes";

const NAV_ITEMS: { id: AdminPage; label: string; icon: ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "My Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
      </svg>
    ),
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    id: "games",
    label: "Games",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="4" />
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
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-light/30 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-heading text-base font-bold"
          >
            <span className="text-gradient">{"<Your Name />"}</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                page === item.id
                  ? "bg-primary/15 text-primary-light"
                  : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="mb-2 truncate text-xs text-text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-primary hover:bg-surface-light"
              aria-label="Toggle admin menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
          <h1 className="font-heading text-lg font-semibold">{PAGE_TITLES[page]}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-light hover:text-text-primary sm:block"
            >
              View site
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 lg:hidden"
            >
              Sign out
            </button>
          </div>
        </header>

        {menuOpen && (
          <nav className="border-b border-border bg-surface-light/60 p-3 lg:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  page === item.id
                    ? "bg-primary/15 text-primary-light"
                    : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
