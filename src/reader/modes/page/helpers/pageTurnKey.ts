// READER-ARROW-GUARD-1: which keys turn a page in Page's book view (the FLOW-KEYS-FIX-1 pattern,
// isFlowBrowseKey). A modified ←/→ belongs to useReaderKeys (word seek, paragraph), so the book view ignores
// it. Modified PageUp/PageDown keep today's behaviour.

type PageTurnKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">;

/** True for unmodified ←/→ and for PageUp/PageDown: the keys that turn a page in Page mode. */
export function isPageTurnKey(e: PageTurnKeyEvent): boolean {
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return e.key === "PageDown" || e.key === "PageUp";
  return e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp";
}
