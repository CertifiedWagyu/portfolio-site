export const COMMAND_PALETTE_EVENT = "site:command-palette";

/** Opens the command palette from anywhere in the app. */
export function openCommandPalette(): void {
  window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}
