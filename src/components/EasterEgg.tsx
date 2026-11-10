import { useCallback, useEffect, useRef, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const CLICK_TARGET = 5;
const CLICK_HINT = 3;
const CLICK_WINDOW_MS = 1800;
const FOUND_KEY = "site:secret-found";
const TEASED_KEY = "site:secret-teased";
const WHISPER_DELAY_MS = 22000;
const TRIGGER = "[data-secret-trigger]";
const SCARE_SRC = "/fnaf-foxy-jumpscare.gif";
const SCREAM_SRC = "/fnaf-foxy-scream.mp3";
/** The scream is 1.7s; keep the one-shot GIF on screen until it finishes. */
const SCARE_MS = 1780;

/** Fired by any element that should trigger the secret jump-scare. */
export const OPEN_SECRET_EVENT = "site:open-secret";

/** Foxy jump-scare + scream revealed by the monogram, Konami code or footer signal. */
export function EasterEgg() {
  const [whisper, setWhisper] = useState(false);
  const [scare, setScare] = useState(false);
  const clicks = useRef<number[]>([]);
  const seq = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scareTimer = useRef<number | null>(null);

  const setTriggerState = useCallback((hint: boolean) => {
    document.querySelectorAll<HTMLElement>(TRIGGER).forEach((el) => {
      el.classList.toggle("secret-armed", hint);
    });
  }, []);

  const reveal = useCallback(() => {
    clicks.current = [];
    seq.current = 0;
    setTriggerState(false);
    try {
      window.localStorage.setItem(FOUND_KEY, "1");
    } catch {
      /* storage blocked */
    }

    /* Jump-scare: one-shot GIF over the whole page + scream, same instant.
       Nothing else opens afterwards; the scare is the whole payload. */
    setScare(true);
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.currentTime = 0;
        audio.volume = 1;
        void audio.play().catch(() => {
          /* sound blocked; the GIF still plays */
        });
      } catch {
        /* audio unavailable */
      }
    }
    if (scareTimer.current) window.clearTimeout(scareTimer.current);
    scareTimer.current = window.setTimeout(() => setScare(false), SCARE_MS);
  }, [setTriggerState]);

  /* Warm the payload so the GIF starts on the same frame as the scream. */
  useEffect(() => {
    const img = new Image();
    img.src = SCARE_SRC;
    return () => {
      if (scareTimer.current) window.clearTimeout(scareTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = KONAMI[seq.current];
      if (key === expected) {
        seq.current += 1;
        if (seq.current === KONAMI.length) reveal();
      } else {
        seq.current = key === KONAMI[0] ? 1 : 0;
      }
    };

    const onClick = (event: MouseEvent) => {
      const hit = (event.target as HTMLElement | null)?.closest?.(TRIGGER);
      if (!hit) return;
      const now = Date.now();
      clicks.current = [...clicks.current.filter((t) => now - t < CLICK_WINDOW_MS), now];
      if (clicks.current.length >= CLICK_TARGET) {
        reveal();
        return;
      }
      const hint = clicks.current.length >= CLICK_HINT;
      setTriggerState(hint);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
      setTriggerState(false);
    };
  }, [reveal, setTriggerState]);

  useEffect(() => {
    const tease = () => {
      setWhisper(true);
      try {
        window.sessionStorage.setItem(TEASED_KEY, "1");
      } catch {
        /* storage blocked */
      }
    };

    let enabled = true;
    try {
      if (window.localStorage.getItem(FOUND_KEY) === "1") enabled = false;
      if (window.sessionStorage.getItem(TEASED_KEY) === "1") enabled = false;
    } catch {
      /* storage blocked */
    }
    if (!enabled) return;

    const timer = window.setTimeout(tease, WHISPER_DELAY_MS);

    const onScroll = () => {
      const el = document.documentElement;
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop;
      if (remaining < 40) {
        tease();
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(timer);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!whisper) return;
    const timer = window.setTimeout(() => setWhisper(false), 9000);
    return () => window.clearTimeout(timer);
  }, [whisper]);

  useEffect(() => {
    const onOpen = () => reveal();
    window.addEventListener(OPEN_SECRET_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SECRET_EVENT, onOpen);
  }, [reveal]);

  return (
    <>
      <audio ref={audioRef} src={SCREAM_SRC} preload="auto" aria-hidden="true" />

      {!scare && whisper && (
        <button
          type="button"
          onClick={() => setWhisper(false)}
          className="secret-whisper fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 border-2 border-ember bg-ink px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.26em] text-mist shadow-[4px_4px_0_0_var(--color-ember)] transition-colors hover:bg-ember hover:text-parchment"
        >
          <span className="secret-whisper-dot mr-2 inline-block h-1.5 w-1.5 bg-ember align-middle" aria-hidden="true" />
          you scrolled to the end. most stop here.
          <span className="ml-2 text-mist/50">tap the last signal ↓</span>
        </button>
      )}

      {scare && (
        <div
          className="fnaf-scare fixed inset-0 z-[120] overflow-hidden bg-black/30"
          aria-hidden="true"
        >
          <img
            src={SCARE_SRC}
            alt=""
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        </div>
      )}
    </>
  );
}
