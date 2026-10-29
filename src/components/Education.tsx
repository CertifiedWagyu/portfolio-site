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
      <div className="relative ml-2 max-w-3xl sm:ml-6">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-0 top-4 w-px rounded-full bg-line"
        />
        {ENTRIES.map((entry, i) => (
          <Reveal key={entry.title} delay={i * 140}>
            <div className="relative pb-10 pl-10 last:pb-0 sm:pl-14">
              <span className="absolute left-0 top-1 flex -translate-x-1/2 items-center justify-center" aria-hidden="true">
                {entry.current && (
                  <span className="absolute h-7 w-7 rounded-full bg-ember/15" />
                )}
                <span
                  className={`relative h-3.5 w-3.5 rounded-full border-2 ${
                    entry.current
                      ? "border-ember bg-ember"
                      : "border-line bg-card"
                  }`}
                />
              </span>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-ember">
                {entry.period}
              </p>
              <h3 className="font-display mt-2 text-xl font-bold tracking-tight text-coal sm:text-2xl">
                {entry.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-fawn">{entry.place}</p>
              <div className="panel mt-4 max-w-xl rounded-2xl p-5">
                <p className="text-sm leading-relaxed text-fawn">{entry.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
