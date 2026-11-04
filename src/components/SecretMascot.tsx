import stocking from "../assets/stocking-cut.png";
import { OPEN_SECRET_EVENT } from "./EasterEgg";

/**
 * Stocking, die-cut onto the page. Pinned bottom-right so she rides along
 * with the scroll; one click opens the classified payload.
 */
export function SecretMascot() {
  const openSecret = () => {
    window.dispatchEvent(new CustomEvent(OPEN_SECRET_EVENT));
  };

  return (
    <div className="pointer-events-none fixed bottom-[5.5rem] right-3 z-40 sm:bottom-[6.75rem] sm:right-6">
      <div className="stocking-dock group relative">
        <span
          aria-hidden="true"
          className="stocking-bubble pointer-events-none absolute -top-7 right-0 z-10 whitespace-nowrap border-2 border-[#09090b] bg-[#f4f1ea] px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#09090b] shadow-[2px_2px_0_0_#09090b]"
        >
          psst — click me
        </span>
        <button
          type="button"
          onClick={openSecret}
          aria-label="Open the secret image"
          className="stocking-btn pointer-events-auto block cursor-pointer bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
        >
          <img
            src={stocking}
            alt=""
            width={207}
            height={512}
            draggable={false}
            className="stocking-art block h-[112px] w-auto select-none sm:h-[160px]"
          />
        </button>
      </div>
    </div>
  );
}
