import { useEffect, useRef, useState } from "react";
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
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      if (!el) {
        setPill((p) => ({ ...p, ready: false }));
        return;
      }
      setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [active]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        className={`relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 rounded-2xl px-3 transition-all duration-300 sm:px-4 ${
          scrolled ? "glass-panel" : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#home" className="flex shrink-0 items-center gap-2.5 pl-1">
          <span className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-coal text-xs font-bold text-parchment">
            {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <span className="font-display hidden text-[15px] font-bold tracking-tight text-coal sm:block">
            {name}
          </span>
        </a>

        <ul ref={listRef} className="relative hidden items-center gap-1 lg:flex">
          <span
            aria-hidden="true"
            style={{
              left: pill.left,
              width: pill.width,
              opacity: pill.ready ? 1 : 0,
              transform: "translateY(-50%)",
            }}
            className="absolute top-1/2 h-8 rounded-full bg-coal/[0.06] transition-all duration-300 ease-out"
          />
          {LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-nav={link.href.slice(1)}
                  className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                    isActive ? "text-coal" : "text-fawn hover:text-coal"
                  }`}
                >
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCommandPalette}
            title="Command palette"
            aria-label="Open command palette"
            className="mr-0.5 hidden items-center gap-2 rounded-lg border border-line bg-card/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-latte transition-colors hover:border-coal/20 hover:text-coal sm:flex"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded border border-line px-1 py-px md:inline">{MOD_KEY} K</kbd>
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-fawn transition-colors hover:bg-coal/[0.06] hover:text-coal"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon dark={theme === "dark"} />
          </button>
          <a
            href="#contact"
            className="mr-1 hidden rounded-full bg-coal px-5 py-2 text-[13px] font-semibold text-parchment transition-colors hover:bg-ember-deep hover:text-white md:block"
          >
            Hire me
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-coal lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <nav className="glass-panel shadow-soft mx-auto mt-2 w-full max-w-6xl rounded-2xl p-2 lg:hidden">
          <ul>
            {LINKS.map((link, i) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-ember/10 text-ember" : "text-fawn hover:bg-coal/5 hover:text-coal"
                    }`}
                  >
                    {link.label}
                    <span className="font-mono text-[10px] text-latte">
                      0{i + 1}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
