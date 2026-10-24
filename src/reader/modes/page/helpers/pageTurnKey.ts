// READER-ARROW-GUARD-1 (red): which keys turn a page in Page's book view.
// Held at today's condition so the new test fails by assertion before the guard lands.

type PageTurnKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">;

/** True for the keys that turn a page in Page mode. */
export function isPageTurnKey(e: PageTurnKeyEvent): boolean {
  return e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp";
}
