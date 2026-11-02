import { profile as fallback } from "../data/profile";
import { Reveal } from "./Decor";
import { Section } from "./Section";

const ENTRIES = [
  {
    period: "2023 — Present",
    title: fallback.degree,
    place: fallback.school,
    body: `Currently in ${fallback.year.toLowerCase()} — core computing, software development, and everything in between, one semester at a time.`,
    current: true,
  },
  {
    period: "Always",
    title: "Self-directed learning",
    place: "Beyond the classroom",
    body: "Web development, design, and games — built through tutorials, documentation, side projects, and a lot of trial and error.",
    current: false,
  },
];

export function Education() {
  return (
    <Section
      id="education"
      index="05"
      eyebrow="Trajectory"
      title="Education timeline"
      description="Where I've studied, and where the learning never stops."
    >
      <div className="border-2 border-coal bg-card">
        {ENTRIES.map((entry, i) => (
          <Reveal key={entry.title} delay={i * 120}>
            <div className="grid border-b-2 border-coal last:border-b-0 md:grid-cols-12">
              <div className="flex items-start justify-between gap-4 border-b-2 border-coal p-5 md:col-span-4 md:border-b-0 md:border-r-2 sm:p-6">
                <div>
                  <p className="font-heading text-3xl font-black leading-none tracking-[-0.06em] text-ember tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-latte">
                    {entry.period}
                  </p>
                </div>
                {entry.current && (
                  <span className="flex items-center gap-1.5 border-2 border-coal bg-coal px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-parchment">
                    <span className="h-1 w-1 bg-ember" aria-hidden="true" />
                    now
                  </span>
                )}
              </div>

              <div className="p-5 md:col-span-8 sm:p-7">
                <h3 className="font-heading text-xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-coal sm:text-2xl">
                  {entry.title}
                </h3>
                <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ember">
                  {entry.place}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-fawn">
                  {entry.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
