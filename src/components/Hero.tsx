import { useEffect, useState } from "react";
import { profile as fallback } from "../data/profile";
import type { SiteProfile } from "../hooks/useSiteProfile";
import { useInView } from "../hooks/useInView";
import { listPublicCertificates } from "../lib/certificates";
import { listPublicGames } from "../lib/games";
import { isSupabaseConfigured } from "../lib/supabase";
import { AsciiArt } from "./AsciiArt";
import { Magnetic } from "./Decor";
import { useClock, useCountUp } from "../hooks/useFx";

const ROLES = ["BSIT Student", "Web Developer", "Gamer", "Creative Builder"];

function useTypewriter(): string {
  const [text, setText] = useState("");

  useEffect(() => {
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const current = ROLES[word];
      char += deleting ? -1 : 1;
      setText(current.slice(0, char));

      let delay = deleting ? 40 : 85;
      if (!deleting && char === current.length) {
        delay = 1700;
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        word = (word + 1) % ROLES.length;
        delay = 350;
      }
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, []);

  return text;
}

function useCounts() {
  const [counts, setCounts] = useState<{ certs: number; games: number } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    Promise.all([listPublicCertificates(), listPublicGames()])
      .then(([certs, games]) => {
        if (!cancelled) setCounts({ certs: certs.length, games: games.length });
      })
      .catch(() => {
        // Offline or misconfigured — hide the counters.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}

function TelemetryPanel({ siteProfile }: { siteProfile: SiteProfile }) {
  const manilaTime = useClock("Asia/Manila");

  return (
    <div className="border-2 border-coal bg-card">
      <div className="flex items-center justify-between bg-coal px-4 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-parchment">
        <span>Currently</span>
        <span className="flex items-center gap-2 accent-invert">
          <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" />
          online
        </span>
      </div>

      <div className="flex items-center gap-4 p-4 sm:p-5">
        {siteProfile.avatarUrl ? (
          <img
            src={siteProfile.avatarUrl}
            alt={siteProfile.displayName}
            className="h-14 w-14 shrink-0 border-2 border-coal object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-coal bg-coal font-heading text-lg font-black text-parchment">
            {siteProfile.initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-extrabold uppercase tracking-[-0.02em] text-coal">
            {siteProfile.displayName}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-fawn">
            {siteProfile.tagline}
          </p>
        </div>
      </div>

      <dl className="border-t-2 border-coal">
        {[
          { k: "Base", v: fallback.location },
          { k: "School", v: fallback.school },
          { k: "Local time", v: manilaTime },
        ].map((row) => (
          <div
            key={row.k}
            className="flex items-baseline justify-between gap-4 border-b-2 border-coal/10 px-4 py-2.5 last:border-b-0"
          >
            <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-latte">
              {row.k}
            </dt>
            <dd className="truncate text-right text-xs font-semibold text-coal">
              {row.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Hero({ siteProfile }: { siteProfile: SiteProfile }) {
  const typed = useTypewriter();
  const counts = useCounts();
  const { ref, isInView } = useInView();
  const certCount = useCountUp(counts?.certs ?? 0, isInView && counts !== null);
  const gameCount = useCountUp(counts?.games ?? 0, isInView && counts !== null);

  const shown = "translate-y-0 opacity-100";
  const hidden = "translate-y-4 opacity-0";
  const nameParts = siteProfile.displayName.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || siteProfile.displayName;
  const lastName = nameParts.length > 1 ? nameParts.slice(-1) : "";

  return (
    <section id="home" className="relative scroll-mt-16 overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-24 sm:px-6 sm:pt-32">
        <div
          style={{ transitionDelay: "0ms" }}
          className={`grid border-2 border-coal bg-card transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:grid-cols-[1fr_auto_auto] ${
            isInView ? shown : hidden
          }`}
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-fawn sm:border-r-2 sm:border-coal/10">
            <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" />
            {fallback.location}
          </div>
          <div className="border-t-2 border-coal/10 bg-ember px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-parchment sm:border-t-0 sm:border-r-2 sm:border-coal/10">
            Open to internships
          </div>
          <div className="border-t-2 border-coal/10 px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-latte sm:border-t-0">
            UTC+8 / PHT
          </div>
        </div>

        <div
          ref={ref}
          className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-7">
            <p
              style={{ transitionDelay: "40ms" }}
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-latte transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isInView ? shown : hidden
              }`}
            >
              Portfolio — 2026
            </p>

            <h1
              style={{ transitionDelay: "90ms" }}
              className={`mt-4 font-heading text-[clamp(3rem,9.2vw,7.4rem)] font-black uppercase leading-[0.8] tracking-[-0.055em] text-coal transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isInView ? shown : hidden
              }`}
            >
              {firstName}
              {lastName && (
                <span className="mt-1 block w-fit bg-ember px-2 pb-1 text-parchment sm:px-3">
                  {lastName}
                </span>
              )}
            </h1>

            <p
              style={{ transitionDelay: "150ms" }}
              className={`mt-5 flex h-6 items-center font-mono text-xs font-semibold uppercase tracking-[0.18em] text-fawn transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:text-sm ${
                isInView ? shown : hidden
              }`}
            >
              <span className="mr-2 text-ember" aria-hidden="true">
                &gt;
              </span>
              <span className="min-w-0">{typed}</span>
              <span className="animate-blink ml-1 inline-block h-4 w-2 bg-ember" aria-hidden="true" />
            </p>

            <p
              style={{ transitionDelay: "210ms" }}
              className={`mt-5 max-w-xl text-sm leading-relaxed text-fawn transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:text-base ${
                isInView ? shown : hidden
              }`}
            >
              {siteProfile.bio}
            </p>

            <div
              style={{ transitionDelay: "270ms" }}
              className={`mt-8 flex flex-wrap gap-3 transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isInView ? shown : hidden
              }`}
            >
              <Magnetic>
                <a
                  href="#contact"
                  className="hover-brutal inline-flex items-center gap-3 border-2 border-coal bg-coal px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-parchment"
                >
                  Get in touch
                  <span aria-hidden="true">→</span>
                </a>
              </Magnetic>
              <a
                href="#games"
                className="hover-brutal inline-flex items-center gap-3 border-2 border-coal bg-card px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-coal"
              >
                View my work
              </a>
            </div>

            {counts && (
              <dl
                style={{ transitionDelay: "330ms" }}
                className={`mt-10 grid max-w-lg grid-cols-2 border-2 border-coal transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                  isInView ? shown : hidden
                }`}
              >
                {[
                  { value: certCount, label: "Certificates" },
                  { value: gameCount, label: "Projects" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`p-4 sm:p-5 ${i === 1 ? "border-l-2 border-coal" : ""}`}
                  >
                    <dd className="font-heading text-3xl font-black tabular-nums leading-none text-coal sm:text-4xl">
                      {String(s.value).padStart(2, "0")}
                    </dd>
                    <dt className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-latte">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div
            style={{ transitionDelay: "200ms" }}
            className={`flex flex-col gap-4 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none lg:col-span-5 ${
              isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div className="border-2 border-coal bg-card">
              <div className="flex items-center justify-between border-b-2 border-coal px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em]">
                <span className="text-coal">4D projection</span>
                <span className="text-ember">Drag to rotate</span>
              </div>
              <div className="grid-faint">
                <AsciiArt
                  variant="tesseract"
                  className="h-52 w-full sm:h-64"
                  fontSize={12}
                  interactive
                />
              </div>
              <div className="flex items-center justify-between border-t-2 border-coal px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-latte">
                <span>tesseract.core-4d</span>
                <span className="flex items-center gap-1.5 text-ember">
                  synced
                  <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" />
                </span>
              </div>
            </div>
            <TelemetryPanel siteProfile={siteProfile} />
          </div>
        </div>

        <a
          href="#about"
          aria-label="Scroll to about"
          className="mt-12 flex items-center justify-between border-t-2 border-coal py-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-latte transition-colors hover:text-coal"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true">↓</span> Scroll
          </span>
          <span>01 / About</span>
        </a>
      </div>
    </section>
  );
}
