import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";

/** Scroll-triggered rise + fade wrapper with stagger delay. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/** Thin progress hairline across the very top of the page. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-px bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-ember"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

export function BackToTop() {
  const [state, setState] = useState({ visible: false, progress: 0 });

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setState({
        visible: window.scrollY > 600,
        progress: max > 0 ? el.scrollTop / max : 0,
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!state.visible) return null;

  const radius = 17;
  const circumference = 2 * Math.PI * radius;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="glass-panel fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:-translate-y-1"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2.5" className="text-coal" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - state.progress)}
        />
      </svg>
      <span className="text-sm font-bold text-coal">↑</span>
    </button>
  );
}

/**
 * Lag-free 3D tilt: direct DOM transforms (no re-renders).
 * Respects reduced-motion by rendering a plain wrapper instead.
 */
export function Tilt({
  children,
  className = "",
  max = 4,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`[perspective:1200px] ${className}`}>
      <div
        ref={innerRef}
        onMouseMove={(e) => {
          const el = innerRef.current;
          if (!el) return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transition = "transform 0.08s ease-out";
          el.style.transform = `rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
        }}
        onMouseLeave={() => {
          const el = innerRef.current;
          if (!el) return;
          el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = "rotateX(0deg) rotateY(0deg)";
        }}
        className="h-full [transform-style:preserve-3d]"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Magnetic wrapper: the child drifts toward the cursor and springs back.
 * Direct DOM transforms only — no re-renders. Disabled for touch/reduced motion.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.2,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 0.1s ease-out";
        el.style.transform = `translate3d(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px, 0)`;
      }}
      onMouseLeave={() => {
        const el = ref.current;
        if (!el) return;
        el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "translate3d(0, 0, 0)";
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/** Hairline divider with a center dot. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <span className="h-1 w-1 rounded-full bg-latte" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="panel flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10 font-display text-lg text-ember">
        ✦
      </span>
      <p className="font-display mt-5 text-lg font-bold text-coal">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-fawn">{hint}</p>
    </div>
  );
}
