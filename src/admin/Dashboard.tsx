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
    <div className="border-2 border-border bg-surface-light">
      <div className="flex items-center justify-between border-b-2 border-border px-4 py-2">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
          {label}
        </p>
        <span className="h-2 w-2 bg-ember" aria-hidden="true" />
      </div>
      <div className="p-4 sm:p-5">
        <p className={`font-heading text-4xl font-black leading-none tabular-nums ${accent}`}>
          {String(value).padStart(2, "0")}
        </p>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-text-secondary">
          {sub}
        </p>
      </div>
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-border pb-6">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ember">
            [ Overview ]
          </p>
          <h2 className="mt-2 font-heading text-[2rem] font-black uppercase leading-[0.92] tracking-[-0.04em]">
            Welcome back
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
            Manage your certificates, achievements, and games from one place.
          </p>
        </div>
        <span className="border-2 border-border px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
          {loading ? "Loading…" : "Synced"}
        </span>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Certificates"
          value={loading ? 0 : stats.certificates}
          sub={`${stats.publicCertificates} public`}
          accent="text-ember"
        />
        <StatCard
          label="Games"
          value={loading ? 0 : stats.games}
          sub={`${stats.publicGames} public`}
          accent="text-ember"
        />
        <StatCard
          label="Private certificates"
          value={loading ? 0 : stats.certificates - stats.publicCertificates}
          sub="Only visible to you"
          accent="text-text-primary"
        />
        <StatCard
          label="Private games"
          value={loading ? 0 : stats.games - stats.publicGames}
          sub="Only visible to you"
          accent="text-text-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-2 border-border bg-surface-light">
          <div className="flex items-center justify-between border-b-2 border-border px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
            <span>Certificates &amp; achievements</span>
            <span className="text-ember">03.01</span>
          </div>
          <div className="p-5">
            <h3 className="font-heading text-lg font-extrabold uppercase tracking-[-0.02em]">
              Certificates &amp; achievements
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Add certificates with a title, issuer, date, and file. Use the
              <span className="font-semibold text-text-primary"> Award </span> or
              <span className="font-semibold text-text-primary"> Achievement </span>
              category to feature them in the School Achievements section.
            </p>
            <Button className="mt-5" onClick={() => onNavigate("certificates")}>
              Manage certificates
            </Button>
          </div>
        </div>

        <div className="border-2 border-border bg-surface-light">
          <div className="flex items-center justify-between border-b-2 border-border px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
            <span>Games library</span>
            <span className="text-ember">03.02</span>
          </div>
          <div className="p-5">
            <h3 className="font-heading text-lg font-extrabold uppercase tracking-[-0.02em]">
              Games library
            </h3>
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
    </div>
  );
}
