import { profile as fallback } from "../data/profile";
import type { SiteProfile } from "../hooks/useSiteProfile";
import { useClock } from "../hooks/useFx";
import { Magnetic, Reveal } from "./Decor";
import { Section } from "./Section";

const FACTS = [
  { label: "Institution", value: fallback.school },
  { label: "Program", value: fallback.degree },
  { label: "Standing", value: fallback.year },
  { label: "Base", value: fallback.location },
];

const INTERESTS = ["Web Dev", "Design", "Games", "Photo", "Video", "Music"];

export function About({ siteProfile }: { siteProfile: SiteProfile }) {
  const manilaTime = useClock("Asia/Manila");

  return (
    <Section
      id="about"
      index="01"
      eyebrow="Identity"
      title="A developer in the making"
      description="Who I am, what I study, and what I care about building."
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight text-coal sm:text-3xl">
            I&apos;m{" "}
            <span className="text-ember">{siteProfile.displayName}</span>, a{" "}
            {fallback.year.toLowerCase()} IT student turning curiosity into
            working software.
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fawn">
            {siteProfile.bio}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {INTERESTS.map((item) => (
              <span
                key={item}
                className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-semibold text-fawn transition-colors hover:border-ember/30 hover:text-ember"
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140} className="lg:col-span-5">
          <div className="panel rounded-3xl p-7">
            <div className="flex items-center gap-4">
              {siteProfile.avatarUrl ? (
                <img
                  src={siteProfile.avatarUrl}
                  alt={siteProfile.displayName}
                  className="h-16 w-16 rounded-2xl border border-line object-cover"
                />
              ) : (
                <div className="font-display flex h-16 w-16 items-center justify-center rounded-2xl bg-coal text-xl font-bold text-parchment">
                  {siteProfile.initials}
                </div>
              )}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-latte">
                  Identity
                </p>
                <p className="font-display mt-1 text-lg font-bold text-coal">
                  {siteProfile.displayName}
                </p>
              </div>
            </div>

            <dl className="mt-6 border-t border-line">
              {FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3"
                >
                  <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-latte">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-sm font-medium text-coal">
                    {fact.value}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-latte">
                  Local time
                </dt>
                <dd className="font-display text-right text-sm font-bold tabular-nums text-coal">
                  {manilaTime}
                </dd>
              </div>
            </dl>

            <Magnetic strength={0.15}>
              <a
                href="#contact"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-coal px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-ember-deep hover:text-white"
              >
                Reach out <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
