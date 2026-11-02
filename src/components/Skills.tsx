import { useMemo, useState } from "react";
import { skillGroups } from "../data/profile";
import { useInView } from "../hooks/useInView";
import { Reveal } from "./Decor";
import { Section } from "./Section";

interface ActiveSkill {
  name: string;
  level: number;
}

const SEGMENTS = 20;

function Readout({ active }: { active: ActiveSkill | null }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-2 border-coal bg-coal px-4 py-4 text-parchment sm:px-6">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-parchment/45">
        [ Inspect ]
      </p>
      {active ? (
        <>
          <p className="font-heading text-lg font-extrabold uppercase tracking-[-0.02em] text-parchment sm:text-xl">
            {active.name}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-parchment/50">
            level{" "}
            <span className="font-bold accent-invert">{active.level}</span>/100
          </p>
          <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.22em] text-parchment/30 sm:block">
            hover any skill to inspect
          </span>
        </>
      ) : (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-parchment/50">
          hover a skill to see its level
        </p>
      )}
    </div>
  );
}

function Meter({ level, active }: { level: number; active: boolean }) {
  const filled = Math.round((level / 100) * SEGMENTS);

  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`Skill level ${level} percent`}
    >
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const on = active && i < filled;
        return (
          <span
            key={i}
            style={{ transitionDelay: `${i * 18}ms` }}
            className={`h-2 flex-1 transition-colors duration-150 ${
              on ? "bg-ember" : "bg-coal/10"
            }`}
          />
        );
      })}
    </div>
  );
}

function SkillCard({
  title,
  items,
  index,
  onHover,
}: {
  title: string;
  items: readonly { name: string; level: number }[];
  index: number;
  onHover: (skill: ActiveSkill | null) => void;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className="hover-brutal group relative h-full border-2 border-coal bg-card"
    >
      <div className="flex items-stretch justify-between border-b-2 border-coal">
        <h3 className="px-4 py-3 font-heading text-base font-extrabold uppercase tracking-[-0.02em] text-coal sm:px-5">
          {title}
        </h3>
        <span className="flex w-11 shrink-0 items-center justify-center border-l-2 border-coal bg-coal font-mono text-[10px] font-bold accent-invert">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <ul>
        {items.map((skill) => (
          <li
            key={skill.name}
            onMouseEnter={() => onHover({ name: skill.name, level: skill.level })}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover({ name: skill.name, level: skill.level })}
            onBlur={() => onHover(null)}
            tabIndex={0}
            className="border-b-2 border-coal/10 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-cream focus:bg-cream focus:outline-none sm:px-5"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-xs font-bold text-coal">{skill.name}</span>
              <span className="font-mono text-[10px] tabular-nums text-fawn">
                {skill.level}
                <span className="text-latte">/100</span>
              </span>
            </div>
            <Meter level={skill.level} active={isInView} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Skills() {
  const [active, setActive] = useState<ActiveSkill | null>(null);

  const total = useMemo(
    () => skillGroups.reduce((sum, group) => sum + group.items.length, 0),
    []
  );

  return (
    <Section
      id="skills"
      index="02"
      eyebrow="Capabilities"
      title="Skills & tools"
      tone="tint"
      description="The languages, frameworks, and tools I use to build things."
    >
      <Readout active={active} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.title} delay={gi * 90} className="h-full">
            <SkillCard
              title={group.title}
              items={group.items}
              index={gi}
              onHover={setActive}
            />
          </Reveal>
        ))}
      </div>
      <p className="mt-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-latte">
        <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" />
        {total} skills tracked
      </p>
    </Section>
  );
}
