import { useEffect, useState } from "react";
import mark from "../assets/portrait-mark.png";
import { useScrollSpy } from "../hooks/useFx";
import { useTheme } from "../hooks/useTheme";
import { openCommandPalette } from "../lib/commandPalette";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#certificates", label: "Certificates" },
  { href: "#games", label: "Games" },
  { href: "#education", label: "Education" },
  { href: "#goals", label: "Goals" },
  { href: "#contact", label: "Contact" },
];

const LINK_IDS = ["home", "about", "skills", "certificates", "games", "education", "goals", "contact"];

const MOD_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "")
    ? "⌘"
    : "Ctrl";

function ThemeIcon({ dark }: { dark: boolean }) {
  if (dark) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useScrollSpy(LINK_IDS);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b-2 border-coal bg-parchment transition-shadow duration-150 ${
        scrolled ? "shadow-[0_2px_0_0_var(--color-coal)]" : ""
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-stretch justify-between sm:h-16">
        <a
          href="#home"
          className="flex min-w-0 flex-1 items-center gap-2.5 border-r-2 border-coal px-3 sm:gap-3 sm:px-4 lg:flex-none"
        >
          <img
            src={mark}
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 border-2 border-coal object-cover sm:h-8 sm:w-8"
          />
          <span className="truncate font-heading text-[13px] font-extrabold uppercase tracking-[-0.01em] text-coal sm:text-sm">
            {name}
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-latte xl:inline">
            /portfolio
          </span>
        </a>

        <ul className="hidden items-stretch lg:flex">
          {LINKS.map((link, i) => {
            const isActive = active === link.href.slice(1);
            return (
              <li key={link.href} className="flex border-l-2 border-coal/15">
                <a
                  href={link.href}
                  data-nav={link.href.slice(1)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center gap-2 px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-150 xl:px-4 ${
                    isActive
                      ? "bg-coal text-parchment"
                      : "text-fawn hover:bg-cream hover:text-coal"
                  }`}
                >
                  <span className={isActive ? "accent-invert" : "text-latte"}>
                    0{i + 1}
                  </span>
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-stretch border-l-2 border-coal">
          <button
            type="button"
            onClick={openCommandPalette}
            title="Command palette"
            aria-label="Open command palette"
            className="hidden items-center gap-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fawn transition-colors hover:bg-cream hover:text-coal sm:flex"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden border border-line px-1 py-px text-[9px] tracking-normal md:inline">
              {MOD_KEY}K
            </kbd>
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex w-11 items-center justify-center border-l-2 border-coal/15 text-fawn transition-colors hover:bg-cream hover:text-coal sm:w-12"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon dark={theme === "dark"} />
          </button>
          <a
            href="#contact"
            className="hidden items-center bg-ember px-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ember-deep md:flex"
          >
            Hire me
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-11 items-center justify-center border-l-2 border-coal lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-all duration-200 ${open ? "top-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-all duration-200 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition-all duration-200 ${open ? "top-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t-2 border-coal bg-parchment lg:hidden" aria-label="Mobile">
          <ul className="mx-auto max-w-[1400px]">
            {LINKS.map((link, i) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href} className="border-b-2 border-coal/10 last:border-b-0">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      isActive ? "bg-coal text-parchment" : "text-fawn hover:bg-cream hover:text-coal"
                    }`}
                  >
                    {link.label}
                    <span className={isActive ? "accent-invert" : "text-latte"}>
                      0{i + 1}
                    </span>
                  </a>
                </li>
              );
            })}
            <li className="border-t-2 border-coal">
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between bg-ember px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-parchment"
              >
                Start a project <span aria-hidden="true">→</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
