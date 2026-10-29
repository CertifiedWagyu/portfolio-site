import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const subscribers = new Set<(theme: Theme) => void>();
let current: Theme | null = null;

/** First-visit default: light during the day, dark at night. Overridable. */
function preferred(): Theme {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

function read(): Theme {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  if (typeof window === "undefined") return preferred();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // storage unavailable — fall through to the time-of-day default
  }
  return preferred();
}

/** Applies a theme everywhere: DOM class, storage, and every mounted hook. */
export function setTheme(theme: Theme): void {
  current = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable — theme just won't persist
  }
  [...subscribers].forEach((notify) => notify(theme));
}

export function useTheme() {
  const [theme, setLocal] = useState<Theme>(() => (current ??= read()));

  useEffect(() => {
    subscribers.add(setLocal);
    return () => {
      subscribers.delete(setLocal);
    };
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === "dark" || event.newValue === "light")) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current ??= read()) === "dark" ? "light" : "dark");
  }, []);

  return { theme, toggle };
}
