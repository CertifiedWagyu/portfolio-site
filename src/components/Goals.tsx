import { Magnetic, Reveal } from "./Decor";
import { Section } from "./Section";

const GOALS = [
  {
    num: "01",
    title: "Grow as a developer",
    body: "Sharper fundamentals, cleaner code, better instincts — leveling up with every project I finish.",
  },
  {
    num: "02",
    title: "Ship real things",
    body: "Turn tutorials and coursework into finished, working experiences that real people can use and enjoy.",
  },
  {
    num: "03",
    title: "Join a great team",
    body: "Learn how professionals build software — and contribute something genuinely useful along the way.",
  },
];

export function Goals() {
  return (
    <Section
      id="goals"
      index="06"
      eyebrow="Ambition"
      title="Where this is going"
      tone="tint"
      description="The direction of travel. Everything here is fuel for what comes next."
    >
      <div className="relative overflow-hidden border-2 border-coal bg-ink">
        <div
          aria-hidden="true"
          className="grid-ink pointer-events-none absolute inset-0 opacity-60"
        />

        <div className="relative flex flex-col gap-4 border-b-2 border-mist/15 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-ember">
              [ Directives ]
            </p>
            <p className="mt-3 font-heading text-[clamp(1.9rem,4.6vw,3.6rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-mist">
              Build. Learn. Repeat.
            </p>
          </div>
          <p className="max-w-[14rem] font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-mist/35">
            Three rules. No shortcuts.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3">
          {GOALS.map((goal, i) => (
            <Reveal key={goal.num} delay={i * 100} className="h-full">
              <div
                className={`h-full border-b-2 border-mist/15 p-6 transition-colors hover:bg-mist/[0.05] md:border-b-0 sm:p-7 ${
                  i < GOALS.length - 1 ? "md:border-r-2" : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-heading text-4xl font-black leading-none tracking-[-0.06em] text-ember tabular-nums">
                    {goal.num}
                  </p>
                  <span className="h-px w-8 bg-mist/25" aria-hidden="true" />
                </div>
                <h3 className="mt-6 font-heading text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-mist">
                  {goal.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist/55">
                  {goal.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="relative border-t-2 border-mist/15 p-6 sm:p-8">
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 border-2 border-mist bg-mist px-7 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ember hover:bg-ember hover:text-parchment"
            >
              Help me get there <span aria-hidden="true">→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </Section>
  );
}
