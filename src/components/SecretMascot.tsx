import stocking from "../assets/stocking-cut.webp";
import { OPEN_SECRET_EVENT } from "./EasterEgg";

/**
 * Stocking, cut clean from the page art. Pinned bottom-right so she rides
 * along with the scroll; one click opens the classified payload.
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
          className="stocking-bubble pointer-events-none absolute -top-6 right-0 z-10 whitespace-nowrap border-2 border-[#09090b] bg-[#f4f1ea] px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-[#09090b] shadow-[2px_2px_0_0_#09090b]"
        >
          psst — click me
        </span>
        <button
          type="button"
          onClick={openSecret}
          aria-label="Open the secret image"
          className="stocking-btn pointer-events-auto block cursor-pointer bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <img
            src={stocking}
            alt=""
            width={408}
            height={1026}
            draggable={false}
            className="stocking-art block h-[54px] w-auto select-none sm:h-[74px]"
          />
        </button>
      </div>
    </div>
  );
}
