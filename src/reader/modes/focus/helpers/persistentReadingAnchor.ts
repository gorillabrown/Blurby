export type PersistentAnchorWriteEvent =
  | { type: "book-open"; wordIndex: number | null | undefined }
  | { type: "hard-selection"; wordIndex: number | null | undefined }
  | { type: "mode-advance"; wordIndex: number | null | undefined }
  | { type: "explicit-navigation"; wordIndex: number | null | undefined };

export type PersistentAnchorReadOnlyEvent =
  | { type: "browse-away"; visibleWordIndex: number | null | undefined }
  | { type: "mode-switch" }
  | { type: "jump-back" }
  | { type: "soft-visible"; visibleWordIndex: number | null | undefined };

export type PersistentAnchorEvent = PersistentAnchorWriteEvent | PersistentAnchorReadOnlyEvent;

export type PersistentAnchorMode = "page" | "focus" | "flow" | "narrate";

export function clampPersistentWordIndex(
  wordIndex: number | null | undefined,
  totalWords?: number | null,
): number {
  if (typeof wordIndex !== "number" || !Number.isFinite(wordIndex)) return 0;
  const normalized = Math.max(0, Math.trunc(wordIndex));
  if (totalWords != null && totalWords <= 0) return 0;
  if (totalWords == null) return normalized;
  const maxIndex = Math.max(0, Math.trunc((totalWords ?? 0) - 1));
  return Math.min(normalized, maxIndex);
}

export function reducePersistentWordAnchor(
  currentWordIndex: number,
  event: PersistentAnchorEvent,
  totalWords?: number | null,
): number {
  switch (event.type) {
    case "book-open":
    case "hard-selection":
    case "mode-advance":
    case "explicit-navigation":
      return clampPersistentWordIndex(event.wordIndex, totalWords);
    case "browse-away":
    case "mode-switch":
    case "jump-back":
    case "soft-visible":
      return clampPersistentWordIndex(currentWordIndex, totalWords);
  }
}

export function isAwayFromPersistentAnchor(
  visibleWordIndex: number | null | undefined,
  persistentWordIndex: number | null | undefined,
  toleranceWords = 0,
): boolean {
  const visible = clampPersistentWordIndex(visibleWordIndex);
  const persistent = clampPersistentWordIndex(persistentWordIndex);
  return Math.abs(visible - persistent) > Math.max(0, toleranceWords);
}

export function shouldClearBrowseAwayOnAnchorEvent(event: PersistentAnchorEvent): boolean {
  return event.type === "hard-selection"
    || event.type === "explicit-navigation"
    || event.type === "jump-back";
}

export function resolveBookOpenInitialCfi({
  cfi,
}: {
  persistentWordIndex?: number | null | undefined;
  cfi?: string | null;
}): string | null {
  return cfi || null;
}

export function shouldWriteRelocateCfi({
  userBrowsing,
}: {
  mode: PersistentAnchorMode;
  userBrowsing: boolean;
}): boolean {
  return !userBrowsing;
}

export function shouldPersistRelocateProgress({
  hasEngaged,
  hasResumeAnchor,
  userBrowsing,
}: {
  mode: PersistentAnchorMode;
  hasEngaged: boolean;
  hasResumeAnchor: boolean;
  userBrowsing: boolean;
}): boolean {
  return hasEngaged && !hasResumeAnchor && !userBrowsing;
}

/**
 * NARRATE-INTENT-CURSOR-1 (the A4 fix) — resume-anchor CONSUME predicate.
 *
 * A hard-click resume anchor is a ONE-SHOT intent: it pins the exact start word,
 * then must be consumed (nulled) once playback advances past it, so a stale anchor
 * cannot re-seed every later pause→resume / mode re-entry (the "gravity well").
 *
 * Returns true exactly when the live audio word index has advanced STRICTLY past a
 * non-null anchor:
 *   - `resumeAnchor == null`  → false (idempotent / one-shot; already consumed).
 *   - `advancedWordIndex > resumeAnchor` → true (consume now).
 *   - otherwise → false.
 *
 * Strict `>` (never `>=`) is load-bearing for A1: the clicked word IS the intended
 * first spoken word, so consume must NOT fire while audio is still on the anchor
 * word — only once it moves to the next word. Using `>=` would null the anchor
 * before the click is honored and break click-to-narrate exact start.
 */
export function shouldConsumeResumeAnchorOnAdvance({
  resumeAnchor,
  advancedWordIndex,
}: {
  resumeAnchor: number | null | undefined;
  advancedWordIndex: number;
}): boolean {
  if (resumeAnchor == null) return false;
  return advancedWordIndex > resumeAnchor;
}
