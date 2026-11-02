import { useInView } from "../hooks/useInView";
import type { ReactNode } from "react";

export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  children,
  tone = "plain",
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "plain" | "tint";
}) {
  const { ref, isInView } = useInView();
  const shown = "translate-y-0 opacity-100";
  const hidden = "translate-y-5 opacity-0";

  return (
    <section
      id={id}
      className={`relative scroll-mt-24 py-20 sm:py-28 ${
        tone === "tint" ? "border-y border-line bg-cream/60" : ""
      }`}
    >
      <div ref={ref} className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p
            style={{ transitionDelay: "0ms" }}
            className={`flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ember transition-all duration-700 ease-out ${
              isInView ? shown : hidden
            }`}
          >
            <span className="h-px w-8 bg-ember/40" aria-hidden="true" />
            {index} · {eyebrow}
          </p>
          <h2
            style={{ transitionDelay: "80ms" }}
            className={`font-omori mt-4 text-[2rem] font-normal leading-tight tracking-tight text-coal transition-all duration-700 ease-out sm:text-[2.5rem] ${
              isInView ? shown : hidden
            }`}
          >
            <span className="text-twitch">{title}</span>
          </h2>
          {description && (
            <p
              style={{ transitionDelay: "150ms" }}
              className={`mt-4 text-base leading-relaxed text-fawn transition-all duration-700 ease-out sm:text-lg ${
                isInView ? shown : hidden
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <div className="mt-12 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
