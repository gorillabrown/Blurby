// READER-ARROW-GUARD-1 (red): which keys browse away and turn a page in Narrate's book view.
// Held at today's condition so the new test fails by assertion before the guard lands.

type NarrateBrowseKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">;

/** True for the keys that browse away from the reading position and turn a page in Narrate. */
export function isNarrateBrowseKey(e: NarrateBrowseKeyEvent): boolean {
  return e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp";
}
