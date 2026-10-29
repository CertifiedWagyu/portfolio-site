import { useEffect, useState } from "react";
import { profile as fallback } from "../data/profile";
import { AsciiArt } from "./AsciiArt";

const DURATION = 1800;

const LOG: Array<[string, string]> = [
  ["tesseract.core-4d", "online"],
  ["rotation.w-axis", "locked"],
  ["projection.link", "synced"],
  ["interface.boot", "ready"],
];

const CELLS = 24;

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 200 : DURATION;

    let raf = 0;
    let leaveTimer = 0;
    let doneTimer = 0;
    const startedAt = performance.now();

    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - startedAt) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.floor(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        leaveTimer = window.setTimeout(() => setLeaving(true), 300);
        doneTimer = window.setTimeout(onDone, 800);
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  const filled = Math.min(CELLS, Math.max(0, Math.round((progress / 100) * CELLS)));
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-parchment transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={leaving}
    >
      <div
        aria-hidden="true"
        className="aurora animate-aurora absolute -inset-[12%]"
      />
      <div
        aria-hidden="true"
        className="grid-faint absolute inset-0 opacity-80 [mask-image:radial-gradient(65%_65%_at_50%_50%,black,transparent)]"
      />

      <div
        className={`relative flex w-full max-w-xl flex-col items-center px-6 transition-all duration-500 ${
          leaving ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-latte">
          loading
        </p>

        <AsciiArt variant="tesseract" className="mt-3 h-36 w-full sm:h-48" fontSize={12} />

        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.45em] text-latte">
          4d hypercube — live projection
        </p>

        <div className="panel mt-7 w-full max-w-md rounded-2xl p-4">
          <div className="space-y-1.5 font-mono text-[11px]">
            {LOG.map(([label, status], i) => {
              const shown = progress >= (i + 1) * (100 / LOG.length);
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between transition-opacity duration-300 ${
                    shown ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-fawn">{label}</span>
                  <span className="text-ember">[ {status} ]</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 font-mono text-[11px]">
            <span className="text-ember">$</span>
            <span className="tracking-tight">
              <span className="text-ember">{"█".repeat(filled)}</span>
              <span className="text-latte/50">{"░".repeat(CELLS - filled)}</span>
            </span>
            <span className="tabular-nums text-fawn">{progress}%</span>
          </div>
        </div>

        <p className="font-display mt-6 text-center text-base font-bold tracking-tight text-coal sm:text-lg">
          {fallback.fullName}
        </p>
      </div>
    </div>
  );
}
