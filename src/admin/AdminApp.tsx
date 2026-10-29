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
    <div className="flex min-h-screen items-center justify-center bg-grid bg-surface px-6 py-16">
      <div className="max-w-xl rounded-2xl border border-amber-500/40 bg-amber-500/5 p-8">
        <h1 className="font-heading text-xl font-bold">Supabase setup required</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          The admin dashboard needs a Supabase project before it can work. Connect one
          in three steps:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
          <li>Create a project at app.supabase.com.</li>
          <li>
            Run the SQL in{" "}
            <span className="font-mono text-text-primary">supabase/schema.sql</span>{" "}
            in the SQL Editor.
          </li>
          <li>
            Create a <span className="font-mono text-text-primary">.env</span> file with{" "}
            <span className="font-mono text-text-primary">VITE_SUPABASE_URL</span> and{" "}
            <span className="font-mono text-text-primary">VITE_SUPABASE_ANON_KEY</span>,
            then restart the dev server.
          </li>
        </ol>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 text-sm font-semibold text-primary-light hover:underline"
        >
          ← Back to portfolio
        </button>
      </div>
    </div>
  );
}

function Unauthorized() {
  const { signOut, user } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid bg-surface px-6 py-16">
      <div className="max-w-md rounded-2xl border border-red-500/40 bg-red-500/5 p-8 text-center">
        <h1 className="font-heading text-xl font-bold">Not authorized</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {user?.email} is signed in but is not an administrator. Add this user to the{" "}
          <span className="font-mono text-text-primary">admins</span> table to grant access.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-6 rounded-xl border border-border-light px-4 py-2 text-sm font-semibold hover:bg-surface-light"
        >
          Sign out
        </button>
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
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
