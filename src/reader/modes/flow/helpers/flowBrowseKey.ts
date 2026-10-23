// FLOW-KEYS-FIX-1 amendment (owner ruling 2026-10-23): which keys let the reader look ahead in Flow.
// Flow's book view marks browse-away (which pauses) and turns a page only for these keys. Plain ←/→ change
// speed and modified arrows move the word (useReaderKeys owns them), so the arrows never browse away.

type BrowseKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">;

/** True only for unmodified PageUp and PageDown: the keys that browse away from the reading position in Flow. */
export function isFlowBrowseKey(e: BrowseKeyEvent): boolean {
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return false;
  return e.key === "PageDown" || e.key === "PageUp";
}
