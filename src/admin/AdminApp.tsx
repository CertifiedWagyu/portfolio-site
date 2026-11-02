import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { navigate } from "../lib/router";
import { AdminLayout } from "./AdminLayout";
import { CertificatesManager } from "./CertificatesManager";
import { Dashboard } from "./Dashboard";
import { GamesManager } from "./GamesManager";
import { Login } from "./Login";
import { ProfileManager } from "./ProfileManager";
import type { AdminPage } from "./adminTypes";

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-16">
      <div className="w-full max-w-xl border-2 border-border bg-surface-light shadow-[8px_8px_0_0_var(--color-border)]">
        <div className="flex items-center justify-between border-b-2 border-border bg-coal px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-parchment">
          <span>Setup required</span>
          <span className="accent-invert">config / 01</span>
        </div>
        <div className="p-5 sm:p-8">
          <h1 className="font-heading text-xl font-extrabold uppercase tracking-[-0.02em]">
            Supabase setup required
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            The admin dashboard needs a Supabase project before it can work. Connect one
            in three steps:
          </p>
          <ol className="mt-5 border-2 border-border">
            <li className="flex gap-3 border-b-2 border-border px-4 py-3 text-sm text-text-secondary">
              <span className="font-mono text-[10px] font-bold text-ember">01</span>
              Create a project at app.supabase.com.
            </li>
            <li className="flex gap-3 border-b-2 border-border px-4 py-3 text-sm text-text-secondary">
              <span className="font-mono text-[10px] font-bold text-ember">02</span>
              <span>
                Run the SQL in{" "}
                <span className="font-mono text-text-primary">supabase/schema.sql</span>{" "}
                in the SQL Editor.
              </span>
            </li>
            <li className="flex gap-3 px-4 py-3 text-sm text-text-secondary">
              <span className="font-mono text-[10px] font-bold text-ember">03</span>
              <span>
                Create a <span className="font-mono text-text-primary">.env</span> file
                with{" "}
                <span className="font-mono text-text-primary">VITE_SUPABASE_URL</span> and{" "}
                <span className="font-mono text-text-primary">
                  VITE_SUPABASE_ANON_KEY
                </span>
                , then restart the dev server.
              </span>
            </li>
          </ol>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 border-2 border-border px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-coal hover:text-parchment"
          >
            ← Back to portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

function Unauthorized() {
  const { signOut, user } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-16">
      <div className="w-full max-w-md border-2 border-border bg-surface-light shadow-[8px_8px_0_0_var(--color-border)]">
        <div className="flex items-center justify-between border-b-2 border-border bg-ember px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-parchment">
          <span>Access denied</span>
          <span>403</span>
        </div>
        <div className="p-6">
          <h1 className="font-heading text-xl font-extrabold uppercase tracking-[-0.02em]">
            Not authorized
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {user?.email} is signed in but is not an administrator. Add this user to the{" "}
            <span className="font-mono text-text-primary">admins</span> table to grant
            access.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-6 border-2 border-border px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-coal hover:text-parchment"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminApp() {
  const { loading, user, isAdmin, configMissing } = useAuth();
  const [page, setPage] = useState<AdminPage>("dashboard");

  if (configMissing) return <ConfigNotice />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="h-7 w-7 animate-spin border-2 border-ember border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Login />;
  if (!isAdmin) return <Unauthorized />;

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      {page === "dashboard" && <Dashboard onNavigate={setPage} />}
      {page === "profile" && <ProfileManager />}
      {page === "certificates" && <CertificatesManager />}
      {page === "games" && <GamesManager />}
    </AdminLayout>
  );
}
