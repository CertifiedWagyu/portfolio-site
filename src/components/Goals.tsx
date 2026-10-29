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
      <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-12 sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="grid-ink absolute inset-0 opacity-70 [mask-image:radial-gradient(90%_80%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--color-ember),transparent_68%)] opacity-[0.18]"
        />
        <p className="font-display relative text-center text-2xl font-bold leading-tight tracking-tight text-mist sm:text-4xl">
          Build. Learn. Repeat.
        </p>

        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          {GOALS.map((goal, i) => (
            <Reveal key={goal.num} delay={i * 110}>
              <div className="relative h-full rounded-2xl border border-mist/10 bg-mist/[0.04] p-6 transition-colors hover:border-mist/25">
                <p className="font-display text-3xl font-bold text-ember">
                  {goal.num}
                </p>
                <h3 className="font-display mt-3 text-lg font-bold text-mist">
                  {goal.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist/60">
                  {goal.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="relative mt-10 flex justify-center">
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-mist px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-ember-deep hover:text-white"
            >
              Help me get there <span aria-hidden="true">→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </Section>
  );
}
