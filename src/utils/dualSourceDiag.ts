/**
 * NARRATE-DUAL-SOURCE-DIAG-1 — Diagnostic helper (Wave B)
 *
 * Flag-gated structured logger for the dual-source position-state investigation.
 * Every export is a NO-OP unless localStorage flag BLURBY_DUAL_SOURCE_DIAG === '1'.
 *
 * ZERO semantic/behavioral change. This module is log-only.
 * Remove all call sites in Wave C once the diagnostic is complete.
 */

/**
 * Flexible payload — each call site supplies only what is reachable in its
 * local scope. All fields are optional so sites in different layers can
 * include their own relevant state without forcing callers to pass stubs.
 */
export interface DualSourceRefs {
  /** cursorWordIndex from stateRef / s.cursorWordIndex */
  cursorWordIndex?: number | null;
  /** lastConfirmedAudioWordRef.current */
  lastConfirmedAudioWordRef?: number | null;
  /** nextGenWordIndexRef.current */
  nextGenWordIndexRef?: number | null;
  /** nextKokoroExactStartRef.current */
  nextKokoroExactStartRef?: number | null;
  /** Chunk start index derived from nextGenWordIndexRef at seed site */
  startIdx?: number | null;
  /** Word at startIdx (for quick readability in logs) */
  word?: string | null;
  /** Result of getHeardFloorWordIndex() — null when no audio source playing */
  heardFloor?: number | null;
  /** Raw result of getPlayingSourceMaxWordIndex() at query time */
  playingSourceMax?: number | null;
  /** resumeAnchorRef.current (reader-layer sites) */
  resumeAnchor?: number | null;
  /** Current reading mode (reader-layer sites) */
  mode?: string | null;
  /** Approximate word index from scroll position (reader-layer sites) */
  approxWordIdx?: number | null;
  /** caller-supplied currentWordIndex argument to resume() */
  currentWordIndex?: number | null;
  /** handoffPendingRef.current */
  handoffPendingRef?: boolean | null;
  /** Short label identifying the call site (cross-layer sites) */
  source?: string | null;
  /** requireExactFirstBoundary gate value */
  requireExactFirstBoundary?: boolean | null;
  /** engine name from stateRef */
  engine?: string | null;
  /** narration status from stateRef */
  status?: string | null;
  [key: string]: unknown;
}

/**
 * Returns true iff the BLURBY_DUAL_SOURCE_DIAG localStorage flag is set to '1'.
 * Safe in SSR/worker contexts — returns false on localStorage access errors.
 */
export function isDualSourceDiagEnabled(): boolean {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem("BLURBY_DUAL_SOURCE_DIAG") === "1"
    );
  } catch {
    return false;
  }
}

/**
 * Emit a structured diagnostic log for the dual-source investigation.
 *
 * This is a NO-OP when the flag is not set. The payload thunk is NEVER
 * called when the flag is off — so call sites that read side-effecting or
 * potentially-missing methods (e.g. kokoroStrategy.getHeardFloorWordIndex())
 * in their payload are safe: the expressions are evaluated lazily only when
 * the diagnostic is actually enabled.
 *
 * @param pathId  - Exact path-ID from prep.md §5 (e.g. 'speakNextChunkKokoro:seed')
 * @param refsFn  - Thunk that returns the state snapshot — called only when enabled
 */
export function logDualSourceTransition(pathId: string, refsFn: () => DualSourceRefs): void {
  if (!isDualSourceDiagEnabled()) return;
  try {
    const refs = refsFn();
    // eslint-disable-next-line no-console
    console.debug("[DUAL-SOURCE-DIAG]", pathId, JSON.stringify({ t: pathId, ...refs }));
  } catch {
    // Swallow payload errors so a diagnostic bug never breaks the app.
  }
}
