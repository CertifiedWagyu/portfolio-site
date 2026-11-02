import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../data/profile";
import { navigate } from "../lib/router";
import { COMMAND_PALETTE_EVENT } from "../lib/commandPalette";
import { useTheme } from "../hooks/useTheme";

const SECTIONS = [
  { id: "home", label: "Home", hint: "top" },
  { id: "about", label: "About", hint: "01" },
  { id: "skills", label: "Skills", hint: "02" },
  { id: "certificates", label: "Certificates", hint: "03" },
  { id: "games", label: "Games & projects", hint: "04" },
  { id: "education", label: "Education", hint: "05" },
  { id: "goals", label: "Goals", hint: "06" },
  { id: "contact", label: "Contact", hint: "07" },
];

const OPEN_EVENT = COMMAND_PALETTE_EVENT;

interface Action {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
}

function copyText(value: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).catch(() => undefined);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = value;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, toggle } = useTheme();

  const openPalette = useCallback(() => {
    setQuery("");
    setCursor(0);
    setStatus("");
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else openPalette();
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => openPalette();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open, openPalette]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 1600);
    return () => window.clearTimeout(timer);
  }, [status]);

  const goTo = (id: string) => {
    setOpen(false);
    // Wait for the scroll lock to release before scrolling.
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }, 0);
  };

  const actions = useMemo<Action[]>(() => {
    const nav: Action[] = SECTIONS.map((s) => ({
      id: `go:${s.id}`,
      label: `Go to ${s.label}`,
      hint: s.hint,
      keywords: `section jump scroll ${s.id} ${s.label}`,
      run: () => goTo(s.id),
    }));

    const acts: Action[] = [
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        hint: "theme",
        keywords: "theme dark light mode appearance toggle",
        run: () => {
          toggle();
          setStatus("Theme updated");
        },
      },
      {
        id: "copy-email",
        label: "Copy email address",
        hint: "copy",
        keywords: `email copy clipboard mail ${profile.email}`,
        run: () => {
          copyText(profile.email);
          setStatus("Email copied to clipboard");
        },
      },
      {
        id: "mail",
        label: "Open mail app",
        hint: "mail",
        keywords: `mail email send message contact ${profile.email}`,
        run: () => {
          setOpen(false);
          window.location.href = `mailto:${profile.email}`;
        },
      },
      {
        id: "top",
        label: "Back to top",
        hint: "top",
        keywords: "top home scroll up beginning",
        run: () => {
          setOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      {
        id: "admin",
        label: "Open site admin",
        hint: "admin",
        keywords: "admin dashboard manage backend",
        run: () => {
          setOpen(false);
          navigate("/admin");
        },
      },
    ];

    return [...nav, ...acts];
  }, [theme, toggle]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    const scored = actions
      .map((a) => {
        const label = a.label.toLowerCase();
        if (label.startsWith(q)) return { a, score: 0 };
        if (label.includes(q)) return { a, score: 1 };
        if (a.keywords.toLowerCase().includes(q)) return { a, score: 2 };
        return null;
      })
      .filter((entry): entry is { a: Action; score: number } => entry !== null)
      .sort((x, y) => x.score - y.score);
    return scored.map((entry) => entry.a);
  }, [actions, query]);

  const activeIndex = results.length ? Math.min(cursor, results.length - 1) : 0;

  if (!open) return null;

  const runAt = (i: number) => {
    const action = results[i];
    if (action) action.run();
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        className="w-full max-w-lg border-2 border-coal bg-card shadow-[10px_10px_0_0_var(--color-coal)]"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b-2 border-coal px-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="shrink-0 text-ember" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => (results.length ? (c + 1) % results.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                runAt(activeIndex);
              }
            }}
            placeholder="Search sections and actions…"
            aria-label="Search commands"
            className="h-14 flex-1 bg-transparent text-sm text-coal placeholder:text-latte focus:outline-none"
          />
          <kbd className="shrink-0 border-2 border-line px-1.5 py-0.5 font-mono text-[9px] uppercase text-latte">
            esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {results.map((action, i) => (
            <li key={action.id} className="border-b-2 border-coal/10 last:border-b-0">
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => action.run()}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-coal font-semibold text-parchment"
                    : "text-fawn hover:bg-cream hover:text-coal"
                }`}
              >
                <span className="truncate">{action.label}</span>
                <span
                  className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] ${
                    i === activeIndex ? "text-ember" : "text-latte"
                  }`}
                >
                  {action.hint}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-10 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-latte">
              No matches
            </li>
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t-2 border-coal bg-cream px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-latte">
          <span>{status || "↑↓ navigate · ⏎ select"}</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
