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
    <footer className="relative overflow-hidden border-t-2 border-coal bg-ink text-mist">
      <div
        aria-hidden="true"
        className="grid-ink pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="grid border-b-2 border-mist/15 lg:grid-cols-12">
          <div className="border-b-2 border-mist/15 py-10 lg:col-span-5 lg:border-b-0 lg:border-r-2 lg:pr-8">
            <p className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-ember">
              <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" />
              End of file
            </p>
            <p className="mt-4 font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-mist">
              {name}
            </p>
            <p className="mt-3 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-mist/40">
              Designed &amp; built from scratch. No template.
            </p>
            <div className="mt-8 h-14 w-full overflow-hidden border-y-2 border-mist/15 opacity-70">
              <AsciiArt variant="wave" className="h-full w-full" fontSize={11} />
            </div>
          </div>

          <nav
            className="grid grid-cols-2 content-start sm:grid-cols-3 lg:col-span-7 lg:pl-0"
            aria-label="Footer"
          >
            {LINKS.map(([href, label], i) => (
              <a
                key={href}
                href={href}
                className="group flex items-baseline justify-between gap-3 border-b-2 border-mist/10 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mist/60 transition-colors hover:bg-mist hover:text-ink sm:px-5"
              >
                <span>{label}</span>
                <span className="text-mist/25 group-hover:text-ink/50">0{i + 1}</span>
              </a>
            ))}
            <div className="flex items-center justify-between border-b-2 border-mist/10 px-4 py-4 sm:px-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist/25">
                Davao City
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember">
                PHT
              </span>
            </div>
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist/35">
            © {new Date().getFullYear()} {name} — All rights reserved
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/admin"
              onClick={goAdmin}
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist/35 transition-colors hover:text-ember"
            >
              site admin
            </a>
            <a
              href="#home"
              className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-mist/60 transition-colors hover:text-ember"
            >
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>

        <div className="flex justify-start border-t-2 border-mist/10 py-4">
          <button
            type="button"
            data-secret-trigger
            aria-label="Secret"
            className="secret-trigger group flex items-center gap-3 px-1 py-1 font-mono text-[9px] uppercase tracking-[0.36em] text-mist/25 transition-colors hover:text-mist/60"
          >
            <span className="secret-dot h-1.5 w-1.5 bg-ember/70" aria-hidden="true" />
            <span className="secret-copy relative block h-3 overflow-hidden">
              <span className="secret-copy-idle absolute inset-0 whitespace-nowrap transition-transform duration-200 group-hover:-translate-y-4 group-hover:opacity-0">
                end of transmission
              </span>
              <span className="secret-copy-hover absolute inset-0 translate-y-4 whitespace-nowrap text-ember opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                it listened back
              </span>
            </span>
            <span className="secret-dot h-1.5 w-1.5 bg-ember/70" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
