type Listener = (loading: boolean) => void;

let listeners: Listener[] = [];
let activeCount = 0;

function emit(loading: boolean) {
  for (const listener of listeners) listener(loading);
}

export function subscribeLoading(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

/**
 * Shows the global click/navigation loader for a short, satisfying moment.
 * Multiple overlapping calls are counted so the overlay never flickers.
 */
export function showLoader(duration = 700): void {
  activeCount += 1;
  emit(true);
  window.setTimeout(() => {
    activeCount = Math.max(0, activeCount - 1);
    if (activeCount === 0) emit(false);
  }, duration);
}
