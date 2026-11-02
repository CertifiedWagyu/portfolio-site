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
  const hidden = "translate-y-3 opacity-0";

  return (
    <section
      id={id}
      className={`relative scroll-mt-16 border-t-2 border-coal ${
        tone === "tint" ? "bg-cream" : "bg-parchment"
      }`}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div
          ref={ref}
          className="grid gap-6 py-10 sm:py-14 md:grid-cols-12 md:items-end md:gap-8"
        >
          <div
            style={{ transitionDelay: "0ms" }}
            className={`flex items-end gap-3 transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none md:col-span-2 ${
              isInView ? shown : hidden
            }`}
          >
            <span className="font-heading text-[clamp(3.2rem,7vw,5.5rem)] font-black leading-[0.72] tracking-[-0.06em] text-ember tabular-nums">
              {index}
            </span>
            <span className="mb-1 h-0.5 w-6 bg-ember" aria-hidden="true" />
          </div>

          <div className="md:col-span-6">
            <p
              style={{ transitionDelay: "60ms" }}
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-latte transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isInView ? shown : hidden
              }`}
            >
              [ {eyebrow} ]
            </p>
            <h2
              style={{ transitionDelay: "110ms" }}
              className={`mt-3 font-heading text-[clamp(1.9rem,4.4vw,3.4rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-coal transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isInView ? shown : hidden
              }`}
            >
              {title}
            </h2>
          </div>

          {description && (
            <p
              style={{ transitionDelay: "170ms" }}
              className={`max-w-sm border-l-2 border-coal pl-4 text-sm leading-relaxed text-fawn transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none md:col-span-4 md:justify-self-end ${
                isInView ? shown : hidden
              }`}
            >
              {description}
            </p>
          )}
        </div>

        <div className="pb-16 sm:pb-24">{children}</div>
      </div>
    </section>
  );
}
