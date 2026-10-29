import { useEffect, useMemo, useState } from "react";
import { listPublicCertificates } from "../lib/certificates";
import { CERTIFICATE_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { formatDate, isPdfPath } from "../lib/validate";
import type { Certificate } from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { EmptyState, Reveal, Tilt } from "./Decor";
import { Section } from "./Section";

const inputClass =
  "w-full rounded-full border border-line bg-card px-5 py-2.5 text-sm text-coal placeholder:text-latte transition-colors focus:border-ember focus:outline-none";

function PreviewArt({
  certificate,
  fileUrl,
  large = false,
}: {
  certificate: Certificate;
  fileUrl: string | null;
  large?: boolean;
}) {
  const isPdf = isPdfPath(certificate.file_path);

  if (fileUrl && !isPdf) {
    return (
      <img
        src={fileUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card text-latte">
      <svg width={large ? 44 : 30} height={large ? 44 : 30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
      <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
        {isPdf ? "PDF document" : "Certificate"}
      </span>
    </div>
  );
}

function Viewer({
  certificate,
  fileUrl,
  position,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  certificate: Certificate;
  fileUrl: string | null;
  position: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const isPdf = isPdfPath(certificate.file_path);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="panel shadow-lift w-full max-w-3xl overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-coal">
              {certificate.title}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-ember">
              {[certificate.organization, formatDate(certificate.date_received)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-1 font-mono text-xs tabular-nums text-latte">
              {position}
            </span>
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold text-coal transition-colors hover:bg-ember hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cream disabled:hover:text-coal"
              aria-label="Previous certificate"
            >
              ←
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold text-coal transition-colors hover:bg-ember hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cream disabled:hover:text-coal"
              aria-label="Next certificate"
            >
              →
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold text-fawn transition-colors hover:bg-coal hover:text-parchment"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title={certificate.title}
                className="h-[70vh] w-full rounded-2xl border border-line bg-white"
              />
            ) : (
              <img
                src={fileUrl}
                alt={certificate.title}
                className="mx-auto max-h-[70vh] w-auto rounded-2xl border border-line"
              />
            )
          ) : (
            <p className="text-sm text-fawn">No file attached to this certificate.</p>
          )}
          {certificate.description && (
            <p className="mt-4 border-l-2 border-ember pl-4 text-sm leading-relaxed text-fawn">
              {certificate.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Certificates() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    listPublicCertificates()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load certificates.");
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
    CERTIFICATE_BUCKET,
    items.map((c) => c.file_path)
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.organization ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "All" || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const isFiltering = search.trim() !== "" || category !== "All";
  const [featured, ...rest] = isFiltering ? [] : filtered;
  const rows = isFiltering ? filtered : rest;

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="grid gap-5 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-3xl border border-line bg-card p-6">
            <div className="aspect-[16/9] rounded-2xl bg-line/60" />
            <div className="mt-5 h-5 w-3/4 rounded bg-line/60" />
            <div className="mt-2 h-4 w-1/2 rounded bg-line/40" />
          </div>
        ))}
      </div>
    );
  } else if (error) {
    body = <p className="text-sm text-ember-deep">{error}</p>;
  } else if (!isSupabaseConfigured || items.length === 0) {
    body = (
      <EmptyState
        title="The shelf is empty"
        hint="No certificates to show yet — check back soon."
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <EmptyState
        title="Nothing found"
        hint="No certificates match your search. Try different words."
      />
    );
  } else {
    body = (
      <>
        {featured && (
          <Reveal>
            <Tilt max={4}>
              <button
                type="button"
                onClick={() => setActive(featured)}
                className="group shadow-soft relative grid w-full overflow-hidden rounded-3xl bg-ink text-left transition-all hover:-translate-y-1 hover:shadow-lift lg:grid-cols-[1.25fr_1fr]"
              >
                <div className="relative min-h-64 overflow-hidden lg:min-h-[22rem]">
                  <PreviewArt
                    certificate={featured}
                    fileUrl={featured.file_path ? (urlMap[featured.file_path] ?? null) : null}
                    large
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" aria-hidden="true" />
                  <span className="absolute left-5 top-5 rounded-full bg-ember px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
                    ★ Latest
                  </span>
                </div>
                <div className="relative flex flex-col justify-center p-7 sm:p-10">
                  <p className="font-display text-5xl font-bold text-mist/10" aria-hidden="true">
                    01
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ember">
                    {formatDate(featured.date_received)}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-bold leading-tight text-mist sm:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-mist/70">
                    {featured.organization}
                  </p>
                  {featured.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mist/60">
                      {featured.description}
                    </p>
                  )}
                  <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-mist px-6 py-2.5 text-sm font-semibold text-ink transition-colors group-hover:bg-ember-deep group-hover:text-white">
                    View certificate <span aria-hidden="true">→</span>
                  </span>
                </div>
              </button>
            </Tilt>
          </Reveal>
        )}

        <div className={`grid gap-x-8 gap-y-12 ${featured ? "mt-14" : ""} md:grid-cols-2`}>
          {rows.map((c, i) => {
            const num = String((featured ? i + 2 : i + 1)).padStart(2, "0");
            const flip = i % 2 === 1;
            return (
              <Reveal key={c.id} delay={(i % 4) * 80}>
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className={`group grid w-full gap-5 text-left sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 ${
                    flip ? "xl:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                    <PreviewArt
                      certificate={c}
                      fileUrl={c.file_path ? (urlMap[c.file_path] ?? null) : null}
                    />
                    {c.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                        {c.category}
                      </span>
                    )}
                  </span>
                  <span className="block py-1">
                    <span className="font-display block text-4xl font-bold text-coal/10 transition-colors group-hover:text-ember/30" aria-hidden="true">
                      {num}
                    </span>
                    <span className="font-display mt-1 block text-xl font-bold leading-snug text-coal">
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm text-fawn">{c.organization}</span>
                    <span className="mt-0.5 block font-mono text-xs text-latte">
                      {formatDate(c.date_received)}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-ember">
                      Open
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Section
      id="certificates"
      index="03"
      eyebrow="Credentials"
      title="Proof of work"
      description="Courses, training, and seminars I've completed. Select one to take a closer look."
    >
      {isSupabaseConfigured && items.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-coal px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-parchment">
              {filtered.length} shown
            </span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="font-mono text-xs text-latte">
              {items.length} collected
            </span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates…"
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  category === c
                    ? "bg-coal text-parchment"
                    : "border border-line bg-card text-fawn hover:border-ember/30 hover:text-ember"
                }`}
              >
                {c === "All" ? "All" : c}
              </button>
            ))}
          </div>
        </div>
      )}
      {body}
      {active &&
        (() => {
          const idx = filtered.findIndex((c) => c.id === active.id);
          const safeIdx = idx >= 0 ? idx : 0;
          const current = idx >= 0 ? filtered[idx] : active;
          return (
            <Viewer
              certificate={current}
              fileUrl={
                current.file_path ? (urlMap[current.file_path] ?? null) : null
              }
              position={`${safeIdx + 1} / ${filtered.length}`}
              hasPrev={safeIdx > 0}
              hasNext={safeIdx < filtered.length - 1}
              onPrev={() => {
                if (safeIdx > 0) setActive(filtered[safeIdx - 1]);
              }}
              onNext={() => {
                if (safeIdx < filtered.length - 1) setActive(filtered[safeIdx + 1]);
              }}
              onClose={() => setActive(null)}
            />
          );
        })()}
    </Section>
  );
}
