import { useMemo, useState } from "react";
import { skillGroups } from "../data/profile";
import { useInView } from "../hooks/useInView";
import { Reveal } from "./Decor";
import { Section } from "./Section";

interface ActiveSkill {
  name: string;
  level: number;
}

function Readout({ active }: { active: ActiveSkill | null }) {
  return (
    <div className="panel mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl px-6 py-5 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-latte">
        Now viewing
      </p>
      {active ? (
        <>
          <p className="font-display text-xl font-bold text-coal sm:text-2xl">
            {active.name}
          </p>
          <p className="font-mono text-sm tabular-nums text-fawn">
            level <span className="font-bold text-ember">{active.level}</span>/100
          </p>
          <span className="ml-auto hidden font-mono text-[11px] text-latte sm:block">
            hover any skill to inspect
          </span>
        </>
      ) : (
        <p className="font-mono text-sm text-fawn">
          hover a skill to see its level
        </p>
      )}
    </div>
  );
}

function Meter({ level, active }: { level: number; active: boolean }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-coal/[0.07]"
      role="img"
      aria-label={`Skill level ${level} percent`}
    >
      <div
        className="h-full rounded-full bg-ember transition-[width] duration-1000 ease-out"
        style={{ width: active ? `${level}%` : "0%" }}
      />
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
      className="panel group relative h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-latte">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
      <h3 className="font-display mt-2 text-xl font-bold text-coal">{title}</h3>

      <ul className="mt-6 space-y-5">
        {items.map((skill) => (
          <li
            key={skill.name}
            onMouseEnter={() => onHover({ name: skill.name, level: skill.level })}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover({ name: skill.name, level: skill.level })}
            onBlur={() => onHover(null)}
            tabIndex={0}
            className="rounded-lg transition-colors focus:outline-none"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-coal">{skill.name}</span>
              <span className="font-mono text-xs tabular-nums text-fawn">
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
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.title} delay={gi * 110} className="h-full">
            <SkillCard
              title={group.title}
              items={group.items}
              index={gi}
              onHover={setActive}
            />
          </Reveal>
        ))}
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-latte">
        {total} skills tracked
      </p>
    </Section>
  );
}
