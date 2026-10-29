import { useEffect, useState } from "react";
import { listAllCertificates } from "../lib/certificates";
import { listAllGames } from "../lib/games";
import type { Certificate, Game } from "../lib/types";
import type { AdminPage } from "./adminTypes";
import { Alert, Button } from "./ui";

interface Stats {
  certificates: number;
  publicCertificates: number;
  games: number;
  publicGames: number;
}

const EMPTY: Stats = { certificates: 0, publicCertificates: 0, games: 0, publicGames: 0 };

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-surface-light/40 p-6">
      <p className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-2 font-heading text-4xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{sub}</p>
    </div>
  );
}

export function Dashboard({ onNavigate }: { onNavigate: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAllCertificates(), listAllGames()])
      .then(([certs, games]: [Certificate[], Game[]]) => {
        if (cancelled) return;
        setStats({
          certificates: certs.length,
          publicCertificates: certs.filter((c) => c.visibility === "public").length,
          games: games.length,
          publicGames: games.filter((g) => g.visibility === "public").length,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your certificates, achievements, and games from one place.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Certificates"
          value={loading ? 0 : stats.certificates}
          sub={`${stats.publicCertificates} public`}
          accent="text-primary-light"
        />
        <StatCard
          label="Games"
          value={loading ? 0 : stats.games}
          sub={`${stats.publicGames} public`}
          accent="text-accent"
        />
        <StatCard
          label="Private certificates"
          value={loading ? 0 : stats.certificates - stats.publicCertificates}
          sub="Only visible to you"
          accent="text-amber-300"
        />
        <StatCard
          label="Private games"
          value={loading ? 0 : stats.games - stats.publicGames}
          sub="Only visible to you"
          accent="text-amber-300"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-light bg-surface-light/40 p-6">
          <h3 className="font-heading text-lg font-semibold">Certificates & achievements</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Add certificates with a title, issuer, date, and file. Use the
            <span className="text-text-primary"> Award </span> or
            <span className="text-text-primary"> Achievement </span>
            category to feature them in the School Achievements section.
          </p>
          <Button className="mt-5" onClick={() => onNavigate("certificates")}>
            Manage certificates
          </Button>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light/40 p-6">
          <h3 className="font-heading text-lg font-semibold">Games library</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Add games from any platform — Roblox, Steam, itch.io, browser, or other.
            Upload a thumbnail, paste a link, and visitors get a working Play Game
            button.
          </p>
          <Button className="mt-5" onClick={() => onNavigate("games")}>
            Manage games
          </Button>
        </div>
      </div>
    </div>
  );
}
