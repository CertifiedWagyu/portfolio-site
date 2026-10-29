import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { showLoader } from "./loading";

let applyRoute: ((path: string) => void) | null = null;

export function useRoute(): string {
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  useEffect(() => {
    applyRoute = setPath;
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onChange);
    return () => {
      applyRoute = null;
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  return path;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function commit(to: string): void {
  window.history.pushState({}, "", to);
  window.scrollTo(0, 0);
  if (applyRoute) flushSync(() => applyRoute?.(to));
  else window.dispatchEvent(new Event("popstate"));
}

/**
 * Client-side navigation with an animated route transition where supported,
 * falling back to an instant swap.
 */
export function navigate(to: string): void {
  if (window.location.pathname === to) {
    window.scrollTo(0, 0);
    return;
  }
  showLoader();

  const doc = document as ViewTransitionDocument;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (doc.startViewTransition && !reduced) {
    doc.startViewTransition(() => commit(to));
  } else {
    commit(to);
  }
}
