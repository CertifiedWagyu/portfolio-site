import { useEffect, useMemo, useState } from "react";
import { listPublicGames } from "../lib/games";
import { GAME_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { safeUrl } from "../lib/validate";
import type { Game } from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { EmptyState, Magnetic, Reveal, Tilt } from "./Decor";
import { Section } from "./Section";

function PlayButton({ url, large = false }: { url: string; large?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-2 rounded-full bg-ember font-mono font-bold uppercase tracking-wider text-white transition-colors hover:bg-ember-deep ${
        large ? "px-7 py-3 text-xs" : "px-5 py-2.5 text-[11px]"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="panel shadow-lift w-full max-w-2xl overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video overflow-hidden bg-cream">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.25em] text-latte">
              No thumbnail
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-ember"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {game.platform && (
              <span className="rounded-full bg-ember/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-ember">
                {game.platform}
              </span>
            )}
            {game.genre && (
              <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-fawn">
                {game.genre}
              </span>
            )}
            {game.development_status && (
              <span className="rounded-full border border-forest/40 bg-forest/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-forest">
                {game.development_status}
              </span>
            )}
          </div>
          <h3 className="font-display mt-4 text-2xl font-bold text-coal sm:text-3xl">
            {game.title}
          </h3>
          {game.description && (
            <p className="mt-3 leading-relaxed text-fawn">{game.description}</p>
          )}
          <div className="mt-6">
            {url ? (
              <PlayButton url={url} large />
            ) : (
              <span className="text-sm text-latte">Link unavailable</span>
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
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-latte">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="8" y1="10" x2="8" y2="14" />
            <line x1="15" y1="13" x2="15.01" y2="13" />
            <line x1="18" y1="11" x2="18.01" y2="11" />
            <rect x="2" y="6" width="20" height="12" rx="4" />
          </svg>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
            No preview
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      {game.platform && (
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
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
      <div className="animate-pulse rounded-[2rem] border border-line bg-card p-6">
        <div className="aspect-[21/9] rounded-2xl bg-line/60" />
        <div className="mt-5 h-6 w-1/3 rounded bg-line/60" />
        <div className="mt-2 h-4 w-2/3 rounded bg-line/40" />
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
                <Tilt max={4}>
                  <article
                    onClick={() => setDetail(featured)}
                    className="group shadow-soft relative cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="relative aspect-[16/10] sm:aspect-[21/9]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-cream" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden="true" />
                      <span className="absolute left-6 top-6 rounded-full bg-ember px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
                        ★ Featured
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-9">
                        <div className="max-w-xl">
                          <p className="font-display text-4xl font-bold text-white/15" aria-hidden="true">
                            01
                          </p>
                          <h3 className="font-display -mt-1 text-2xl font-bold text-white sm:text-4xl">
                            {featured.title}
                          </h3>
                          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-white/70">
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

        <div className={`grid gap-x-8 gap-y-12 ${featured ? "mt-14" : ""} md:grid-cols-2`}>
          {rows.map((g, i) => {
            const num = String((featured ? i + 2 : i + 1)).padStart(2, "0");
            const flip = i % 2 === 1;
            const thumb = g.thumbnail_path ? (urlMap[g.thumbnail_path] ?? null) : null;
            const url = safeUrl(g.game_url);
            return (
              <Reveal key={g.id} delay={(i % 4) * 80}>
                <article
                  onClick={() => setDetail(g)}
                  className={`group grid w-full cursor-pointer gap-5 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 ${
                    flip ? "xl:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                    <Thumb game={g} thumbnailUrl={thumb} />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                      {url ? (
                        <span className="rounded-full bg-white px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-coal shadow-xl">
                          ▶ Preview
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="block py-1">
                    <span className="font-display block text-4xl font-bold text-coal/10 transition-colors group-hover:text-ember/30" aria-hidden="true">
                      {num}
                    </span>
                    <span className="font-display mt-1 block text-xl font-bold leading-snug text-coal">
                      {g.title}
                    </span>
                    <span className="mt-1 block font-mono text-xs text-fawn">
                      {[g.platform, g.genre].filter(Boolean).join(" · ") || "Game"}
                    </span>
                    {g.description && (
                      <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-fawn">
                        {g.description}
                      </span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-ember">
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
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-coal px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-parchment">
              {filtered.length} shown
            </span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="font-mono text-xs text-latte">
              {items.length} in library
            </span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games…"
            className="w-full rounded-full border border-line bg-card px-5 py-2.5 text-sm text-coal placeholder:text-latte transition-colors focus:border-ember focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
            className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
              platform === p
                ? "bg-coal text-parchment"
                : "border border-line bg-card text-fawn hover:border-ember/30 hover:text-ember"
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
