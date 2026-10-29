import { navigate } from "../lib/router";
import { AsciiArt } from "./AsciiArt";

const LINKS = [
  ["#about", "About"],
  ["#skills", "Skills"],
  ["#certificates", "Certificates"],
  ["#games", "Games"],
  ["#education", "Education"],
  ["#goals", "Goals"],
  ["#contact", "Contact"],
] as const;

export function Footer({ name }: { name: string }) {
  const goAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <footer className="relative overflow-hidden bg-ink">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-mist/10" />
      <div
        aria-hidden="true"
        className="grid-ink absolute inset-0 opacity-60 [mask-image:radial-gradient(100%_120%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 h-56 w-[36rem] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-ember),transparent_70%)] opacity-[0.14]"
      />
      <div className="relative h-16 w-full overflow-hidden opacity-80">
        <AsciiArt variant="wave" className="h-full w-full" fontSize={12} />
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-mist">
              {name}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mist/40">
              Designed & built from scratch
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
            {LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-mist/60 transition-colors hover:text-ember"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#home"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mist/60 transition-colors hover:text-ember"
          >
            ↑ Back to top
          </a>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-mist/10 pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-mist/40">
            © {new Date().getFullYear()} {name} · All rights reserved
          </p>
          <a
            href="/admin"
            onClick={goAdmin}
            className="font-mono text-[11px] text-mist/30 transition-colors hover:text-mist/60"
          >
            site admin
          </a>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            data-secret-trigger
            aria-label="Secret"
            className="secret-trigger group flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.4em] text-mist/25 transition-colors hover:text-mist/60"
          >
            <span className="secret-dot h-1.5 w-1.5 rounded-full bg-forest/70" aria-hidden="true" />
            <span className="secret-copy relative block h-3">
              <span className="secret-copy-idle absolute inset-0 whitespace-nowrap transition-all duration-300 group-hover:-translate-y-4 group-hover:opacity-0">
                end of transmission
              </span>
              <span className="secret-copy-hover absolute inset-0 translate-y-4 whitespace-nowrap text-forest opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                it listened back
              </span>
            </span>
            <span className="secret-dot h-1.5 w-1.5 rounded-full bg-forest/70" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
