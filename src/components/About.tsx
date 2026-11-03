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

export function About({
  siteProfile,
  flushTop = false,
}: {
  siteProfile: SiteProfile;
  flushTop?: boolean;
}) {
  const manilaTime = useClock("Asia/Manila");

  return (
    <Section
      id="about"
      index="01"
      eyebrow="Identity"
      title="A developer in the making"
      description="Who I am, what I study, and what I care about building."
      flushTop={flushTop}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <p className="font-heading text-[clamp(1.5rem,3.2vw,2.5rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-coal">
            I&apos;m{" "}
            <span className="bg-ember px-1.5 text-parchment">
              {siteProfile.displayName}
            </span>
            , a {fallback.year.toLowerCase()} IT student turning curiosity into
            working software.
          </p>
          <p className="mt-6 max-w-xl border-l-2 border-coal pl-4 text-sm leading-relaxed text-fawn sm:text-base">
            {siteProfile.bio}
          </p>
          <div className="mt-8">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-latte">
              [ Interests ]
            </p>
            <div className="mt-3 flex flex-wrap gap-0">
              {INTERESTS.map((item, i) => (
                <span
                  key={item}
                  className={`border-2 border-coal px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fawn transition-colors hover:bg-coal hover:text-parchment ${
                    i > 0 ? "-ml-0.5" : ""
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={140} className="lg:col-span-5">
          <div className="border-2 border-coal bg-card">
            <div className="flex items-center justify-between border-b-2 border-coal bg-coal px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-parchment">
              <span>Identity card</span>
              <span className="accent-invert">001</span>
            </div>

            <div className="flex items-center gap-4 border-b-2 border-coal p-4 sm:p-5">
              {siteProfile.avatarUrl ? (
                <img
                  src={siteProfile.avatarUrl}
                  alt={siteProfile.displayName}
                  className="h-16 w-16 border-2 border-coal object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center border-2 border-coal bg-coal font-heading text-xl font-black text-parchment">
                  {siteProfile.initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-latte">
                  Name
                </p>
                <p className="mt-1 truncate font-heading text-base font-extrabold uppercase tracking-[-0.02em] text-coal">
                  {siteProfile.displayName}
                </p>
              </div>
            </div>

            <dl>
              {FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 border-b-2 border-coal/10 px-4 py-3 last:border-b-0 sm:px-5"
                >
                  <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-latte">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-xs font-semibold text-coal">
                    {fact.value}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t-2 border-coal px-4 py-3 sm:px-5">
                <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-latte">
                  Local time
                </dt>
                <dd className="font-heading text-right text-xs font-extrabold tabular-nums text-ember">
                  {manilaTime}
                </dd>
              </div>
            </dl>

            <div className="border-t-2 border-coal p-4 sm:p-5">
              <Magnetic strength={0.15}>
                <a
                  href="#contact"
                  className="hover-brutal flex items-center justify-between border-2 border-coal bg-coal px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-parchment"
                >
                  Reach out <span aria-hidden="true">→</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
