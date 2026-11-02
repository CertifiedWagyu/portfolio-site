import { useEffect, useMemo, useState } from "react";
import { listPublicGames } from "../lib/games";
import { GAME_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { safeUrl } from "../lib/validate";
import type { Game } from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { EmptyState, Magnetic, Reveal, Tilt } from "./Decor";
import { Section } from "./Section";

const inputClass =
  "w-full border-2 border-coal bg-card px-4 py-3 font-mono text-xs text-coal placeholder:text-latte transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";

function PlayButton({ url, large = false }: { url: string; large?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`hover-brutal inline-flex items-center gap-2 border-2 border-coal bg-ember font-mono font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ember-deep ${
        large ? "px-6 py-3 text-[10px]" : "px-4 py-2 text-[9px]"
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play game
    </a>
  );
}

function DetailModal({
  game,
  thumbnailUrl,
  onClose,
}: {
  game: Game;
  thumbnailUrl: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const url = safeUrl(game.game_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border-2 border-coal bg-card shadow-[8px_8px_0_0_var(--color-coal)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video overflow-hidden border-b-2 border-coal bg-cream">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.28em] text-latte">
              No thumbnail
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 border-2 border-coal bg-coal px-2.5 py-1.5 font-mono text-sm font-bold text-parchment transition-colors hover:bg-ember"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {game.platform && (
              <span className="border-2 border-coal bg-ember px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-parchment">
                {game.platform}
              </span>
            )}
            {game.genre && (
              <span className="border-2 border-coal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-fawn">
                {game.genre}
              </span>
            )}
            {game.development_status && (
              <span className="border-2 border-forest px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-forest">
                {game.development_status}
              </span>
            )}
          </div>
          <h3 className="mt-4 font-heading text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-coal sm:text-3xl">
            {game.title}
          </h3>
          {game.description && (
            <p className="mt-3 text-sm leading-relaxed text-fawn">{game.description}</p>
          )}
          <div className="mt-6">
            {url ? (
              <PlayButton url={url} large />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-latte">
                Link unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumb({
  game,
  thumbnailUrl,
}: {
  game: Game;
  thumbnailUrl: string | null;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-cream">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-latte">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="8" y1="10" x2="8" y2="14" />
            <line x1="15" y1="13" x2="15.01" y2="13" />
            <line x1="18" y1="11" x2="18.01" y2="11" />
            <rect x="2" y="6" width="20" height="12" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
            No preview
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      {game.platform && (
        <span className="absolute left-3 top-3 bg-coal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-parchment">
          {game.platform}
        </span>
      )}
    </div>
  );
}

export function Games() {
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [detail, setDetail] = useState<Game | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    listPublicGames()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load games.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const urlMap = useSignedUrls(
    GAME_BUCKET,
    items.map((g) => g.thumbnail_path)
  );

  const platforms = useMemo(() => {
    const set = new Set<string>();
    items.forEach((g) => {
      if (g.platform) set.add(g.platform);
    });
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((g) => {
      const matchesSearch = !q || g.title.toLowerCase().includes(q);
      const matchesPlatform = platform === "All" || g.platform === platform;
      return matchesSearch && matchesPlatform;
    });
  }, [items, search, platform]);

  const isFiltering = search.trim() !== "" || platform !== "All";
  const [featured, ...rest] = isFiltering ? [] : filtered;
  const rows = isFiltering ? filtered : rest;

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="animate-pulse border-2 border-coal bg-card">
        <div className="aspect-[21/9] border-b-2 border-coal bg-coal/10" />
        <div className="space-y-3 p-5">
          <div className="h-5 w-1/3 bg-coal/15" />
          <div className="h-3 w-2/3 bg-coal/10" />
        </div>
      </div>
    );
  } else if (error) {
    body = <p className="text-sm text-ember-deep">{error}</p>;
  } else if (!isSupabaseConfigured || items.length === 0) {
    body = (
      <EmptyState
        title="No games loaded"
        hint="No games to show yet — check back soon."
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <EmptyState
        title="Game over"
        hint="No games match your search. Try different words."
      />
    );
  } else {
    body = (
      <>
        {featured &&
          (() => {
            const thumb = featured.thumbnail_path
              ? (urlMap[featured.thumbnail_path] ?? null)
              : null;
            const url = safeUrl(featured.game_url);
            return (
              <Reveal>
                <Tilt max={3}>
                  <article
                    onClick={() => setDetail(featured)}
                    className="hover-brutal group relative cursor-pointer overflow-hidden border-2 border-coal"
                  >
                    <div className="relative aspect-[16/10] sm:aspect-[21/9]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-cream" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" aria-hidden="true" />
                      <span className="absolute left-4 top-4 bg-ember px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-parchment">
                        ★ Featured
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-9">
                        <div className="max-w-xl">
                          <p className="font-heading text-5xl font-black leading-none tracking-[-0.06em] text-white/15" aria-hidden="true">
                            01
                          </p>
                          <h3 className="mt-1 font-heading text-2xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-white sm:text-4xl">
                            {featured.title}
                          </h3>
                          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60">
                            {[featured.platform, featured.genre, featured.development_status]
                              .filter(Boolean)
                              .join("  ·  ")}
                          </p>
                        </div>
                        {url && (
                          <Magnetic strength={0.3}>
                            <span onClick={(e) => e.stopPropagation()}>
                              <PlayButton url={url} large />
                            </span>
                          </Magnetic>
                        )}
                      </div>
                    </div>
                  </article>
                </Tilt>
              </Reveal>
            );
          })()}

        <div className={`grid gap-4 ${featured ? "mt-4" : ""} md:grid-cols-2`}>
          {rows.map((g, i) => {
            const num = String((featured ? i + 2 : i + 1)).padStart(2, "0");
            const thumb = g.thumbnail_path ? (urlMap[g.thumbnail_path] ?? null) : null;
            const url = safeUrl(g.game_url);
            return (
              <Reveal key={g.id} delay={(i % 4) * 70} className="h-full">
                <article
                  onClick={() => setDetail(g)}
                  className="hover-brutal group flex h-full w-full cursor-pointer flex-col border-2 border-coal bg-card text-left"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden border-b-2 border-coal">
                    <Thumb game={g} thumbnailUrl={thumb} />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                      {url ? (
                        <span className="border-2 border-coal bg-mist px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-coal">
                          ▶ Preview
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-4 sm:p-5">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-latte">
                        {[g.platform, g.genre].filter(Boolean).join(" · ") || "Game"}
                      </span>
                      <span
                        className="font-heading text-2xl font-black leading-none tracking-[-0.06em] text-coal/15 transition-colors group-hover:text-ember"
                        aria-hidden="true"
                      >
                        {num}
                      </span>
                    </span>
                    <span className="mt-2 font-heading text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-coal">
                      {g.title}
                    </span>
                    {g.description && (
                      <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-fawn">
                        {g.description}
                      </span>
                    )}
                    <span className="mt-auto flex items-center gap-1.5 pt-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ember">
                      Details
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Section
      id="games"
      index="04"
      eyebrow="Selected work"
      title="Games & projects"
      tone="tint"
      description="Games I've played or worked on. Pick one to play or learn more."
    >
      {isSupabaseConfigured && items.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 border-2 border-coal bg-card px-4 py-2.5">
            <span className="bg-coal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-parchment">
              {filtered.length} shown
            </span>
            <span className="h-0.5 flex-1 bg-coal/10" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-latte">
              {items.length} in library
            </span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games…"
            className={`${inputClass} mt-3`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`border-2 px-3.5 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  platform === p
                    ? "border-coal bg-coal text-parchment"
                    : "border-coal bg-card text-fawn hover:bg-cream hover:text-coal"
                }`}
              >
                {p === "All" ? "All" : p}
              </button>
            ))}
          </div>
        </div>
      )}
      {body}
      {detail && (
        <DetailModal
          game={detail}
          thumbnailUrl={
            detail.thumbnail_path ? (urlMap[detail.thumbnail_path] ?? null) : null
          }
          onClose={() => setDetail(null)}
        />
      )}
    </Section>
  );
}
