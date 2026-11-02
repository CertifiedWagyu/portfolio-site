import { useEffect, useMemo, useState } from "react";
import { listPublicCertificates } from "../lib/certificates";
import { CERTIFICATE_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { formatDate, isPdfPath } from "../lib/validate";
import type { Certificate } from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { EmptyState, Reveal, Tilt } from "./Decor";
import { Section } from "./Section";

const inputClass =
  "w-full border-2 border-coal bg-card px-4 py-3 font-mono text-xs text-coal placeholder:text-latte transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";

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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream text-latte">
      <svg width={large ? 44 : 30} height={large ? 44 : 30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl border-2 border-coal bg-card shadow-[8px_8px_0_0_var(--color-coal)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-coal p-4 sm:p-5">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember">
              Certificate / {position}
            </p>
            <h3 className="mt-1.5 font-heading text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-coal">
              {certificate.title}
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fawn">
              {[certificate.organization, formatDate(certificate.date_received)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className="border-2 border-coal bg-card px-2.5 py-1.5 font-mono text-sm font-bold text-coal transition-colors hover:bg-coal hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-coal"
              aria-label="Previous certificate"
            >
              ←
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="border-2 border-coal bg-card px-2.5 py-1.5 font-mono text-sm font-bold text-coal transition-colors hover:bg-coal hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-coal"
              aria-label="Next certificate"
            >
              →
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-coal bg-coal px-2.5 py-1.5 font-mono text-sm font-bold text-parchment transition-colors hover:bg-ember"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title={certificate.title}
                className="h-[70vh] w-full border-2 border-coal bg-white"
              />
            ) : (
              <img
                src={fileUrl}
                alt={certificate.title}
                className="mx-auto max-h-[70vh] w-auto border-2 border-coal"
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
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse border-2 border-coal bg-card">
            <div className="aspect-[16/9] border-b-2 border-coal bg-coal/10" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 bg-coal/15" />
              <div className="h-3 w-1/2 bg-coal/10" />
            </div>
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
            <Tilt max={3}>
              <button
                type="button"
                onClick={() => setActive(featured)}
                className="hover-brutal group grid w-full overflow-hidden border-2 border-coal bg-ink text-left lg:grid-cols-[1.15fr_1fr]"
              >
                <div className="relative min-h-64 overflow-hidden border-b-2 border-coal lg:min-h-[22rem] lg:border-b-0 lg:border-r-2">
                  <PreviewArt
                    certificate={featured}
                    fileUrl={featured.file_path ? (urlMap[featured.file_path] ?? null) : null}
                    large
                  />
                  <span className="absolute left-4 top-4 bg-ember px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-parchment">
                    ★ Latest
                  </span>
                </div>
                <div className="relative flex flex-col justify-center p-6 sm:p-10">
                  <p className="font-heading text-6xl font-black leading-none tracking-[-0.06em] text-mist/10" aria-hidden="true">
                    01
                  </p>
                  <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-ember">
                    {formatDate(featured.date_received)}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-mist sm:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mist/60">
                    {featured.organization}
                  </p>
                  {featured.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mist/55">
                      {featured.description}
                    </p>
                  )}
                  <span className="mt-6 inline-flex w-fit items-center gap-2 border-2 border-mist bg-mist px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors group-hover:border-ember group-hover:bg-ember group-hover:text-parchment">
                    View certificate <span aria-hidden="true">→</span>
                  </span>
                </div>
              </button>
            </Tilt>
          </Reveal>
        )}

        <div className={`grid gap-4 ${featured ? "mt-4" : ""} md:grid-cols-2`}>
          {rows.map((c, i) => {
            const num = String((featured ? i + 2 : i + 1)).padStart(2, "0");
            return (
              <Reveal key={c.id} delay={(i % 4) * 70} className="h-full">
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className="hover-brutal group flex h-full w-full flex-col border-2 border-coal bg-card text-left"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden border-b-2 border-coal">
                    <PreviewArt
                      certificate={c}
                      fileUrl={c.file_path ? (urlMap[c.file_path] ?? null) : null}
                    />
                    {c.category && (
                      <span className="absolute left-3 top-3 bg-coal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-parchment">
                        {c.category}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-1 flex-col p-4 sm:p-5">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-latte">
                        {formatDate(c.date_received)}
                      </span>
                      <span
                        className="font-heading text-2xl font-black leading-none tracking-[-0.06em] text-coal/15 transition-colors group-hover:text-ember"
                        aria-hidden="true"
                      >
                        {num}
                      </span>
                    </span>
                    <span className="mt-2 font-heading text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-coal">
                      {c.title}
                    </span>
                    <span className="mt-1 text-xs text-fawn">{c.organization}</span>
                    <span className="mt-auto flex items-center gap-1.5 pt-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ember">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 border-2 border-coal bg-card px-4 py-2.5">
            <span className="bg-coal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-parchment">
              {filtered.length} shown
            </span>
            <span className="h-0.5 flex-1 bg-coal/10" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-latte">
              {items.length} collected
            </span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates…"
            className={`${inputClass} mt-3`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`border-2 px-3.5 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  category === c
                    ? "border-coal bg-coal text-parchment"
                    : "border-coal bg-card text-fawn hover:bg-cream hover:text-coal"
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
