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
    <div className="panel rounded-2xl p-6">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-latte">
        <span>Currently</span>
        <span className="flex items-center gap-1.5 text-forest">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-forest opacity-60" />
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
          </span>
          online
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        {siteProfile.avatarUrl ? (
          <img
            src={siteProfile.avatarUrl}
            alt={siteProfile.displayName}
            className="h-14 w-14 rounded-xl border border-line object-cover"
          />
        ) : (
          <div className="font-display flex h-14 w-14 items-center justify-center rounded-xl bg-coal text-base font-bold text-parchment">
            {siteProfile.initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display truncate text-base font-bold text-coal">
            {siteProfile.displayName}
          </p>
          <p className="truncate font-mono text-[11px] text-fawn">
            {siteProfile.tagline}
          </p>
        </div>
      </div>

      <dl className="mt-5 border-t border-line">
        {[
          { k: "Base", v: fallback.location },
          { k: "School", v: fallback.school },
          { k: "Local time", v: manilaTime },
        ].map((row) => (
          <div
            key={row.k}
            className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
          >
            <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-latte">
              {row.k}
            </dt>
            <dd className="truncate text-right text-sm font-medium text-coal">
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
  const hidden = "translate-y-6 opacity-0";
  const nameParts = siteProfile.displayName.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || siteProfile.displayName;
  const lastName = nameParts.length > 1 ? nameParts.slice(-1) : "";

  return (
    <section id="home" className="relative scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
        <div ref={ref} className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="pt-2">
            <p
              style={{ transitionDelay: "0ms" }}
              className={`inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-fawn transition-all duration-700 ${
                isInView ? shown : hidden
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
              {fallback.location}
            </p>

            <h1
              style={{ transitionDelay: "90ms" }}
              className={`font-omori mt-6 text-[1.62rem] font-normal leading-[1.2] tracking-[0.01em] text-coal transition-all duration-700 ease-out sm:text-[2.6rem] ${
                isInView ? shown : hidden
              }`}
            >
              Hello, I&apos;m{" "}
              <span className="text-spasm text-ember">
                {firstName}
                {lastName ? ` ${lastName}` : ""}
              </span>
              .
            </h1>

            <p
              style={{ transitionDelay: "180ms" }}
              className={`mt-4 flex h-6 items-center font-mono text-sm tracking-[0.06em] text-fawn transition-all duration-700 ${
                isInView ? shown : hidden
              }`}
            >
              <span className="min-w-0">{typed}</span>
              <span className="animate-blink ml-0.5 inline-block h-4 w-[2px] bg-ember" aria-hidden="true" />
            </p>

            <p
              style={{ transitionDelay: "260ms" }}
              className={`mt-5 max-w-xl text-base leading-relaxed text-fawn sm:text-lg transition-all duration-700 ${
                isInView ? shown : hidden
              }`}
            >
              {siteProfile.bio}
            </p>

            <div
              style={{ transitionDelay: "340ms" }}
              className={`mt-9 flex flex-wrap gap-3 transition-all duration-700 ${
                isInView ? shown : hidden
              }`}
            >
              <Magnetic>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-coal px-7 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-ember-deep hover:text-white"
                >
                  Get in touch
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </a>
              </Magnetic>
              <a
                href="#games"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-7 py-3 text-sm font-semibold text-coal transition-colors hover:border-coal/25"
              >
                View my work
              </a>
            </div>

            {counts && (
              <dl
                style={{ transitionDelay: "420ms" }}
                className={`mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-line pt-6 transition-all duration-700 ${
                  isInView ? shown : hidden
                }`}
              >
                {[
                  { value: certCount, label: "Certificates" },
                  { value: gameCount, label: "Projects" },
                ].map((s) => (
                  <div key={s.label}>
                    <dd className="font-display text-3xl font-bold tabular-nums text-coal">
                      {s.value}
                    </dd>
                    <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-latte">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div
            style={{ transitionDelay: "200ms" }}
            className={`flex flex-col gap-5 transition-all duration-1000 ease-out ${
              isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="panel overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-latte">
                <span>4d projection</span>
                <span className="flex items-center gap-1.5 text-fawn">
                  <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
                  drag to rotate
                </span>
              </div>
              <AsciiArt
                variant="tesseract"
                className="h-52 w-full sm:h-60"
                fontSize={12}
                interactive
              />
            </div>
            <TelemetryPanel siteProfile={siteProfile} />
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <a
            href="#about"
            aria-label="Scroll to about"
            className="group flex flex-col items-center gap-2 text-latte transition-colors hover:text-ember"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <span className="flex h-9 w-5 items-start justify-center rounded-full border border-current p-1.5">
              <span className="h-1.5 w-1 animate-bounce rounded-full bg-current" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
