/**
 * Narrate performance instrumentation (TTS-6O).
 * DEV/test-only timing helpers for startup, restart, and steady-state budgets.
 * Tree-shaken from production builds via import.meta.env.DEV guards at call sites.
 */

export interface NarratePerfEntry {
  event: "startup" | "restart" | "extraction" | "restamp";
  startMs: number;
  endMs?: number;
  durationMs?: number;
}

let _entries: NarratePerfEntry[] = [];

/** Start a perf measurement. Returns the entry for later completion. */
export function perfStart(event: NarratePerfEntry["event"]): NarratePerfEntry {
  const entry: NarratePerfEntry = { event, startMs: performance.now() };
  _entries.push(entry);
  return entry;
}

/** Complete a perf measurement started with perfStart. */
export function perfEnd(entry: NarratePerfEntry): number {
  entry.endMs = performance.now();
  entry.durationMs = entry.endMs - entry.startMs;
  return entry.durationMs;
}

/** Get all recorded entries (test/dev inspection). */
export function getPerfEntries(): NarratePerfEntry[] {
  return _entries;
}

/** Clear all entries. */
export function clearPerfEntries(): void {
  _entries = [];
}

/** Get the last entry matching an event type. */
export function getLastEntry(event: NarratePerfEntry["event"]): NarratePerfEntry | undefined {
  for (let i = _entries.length - 1; i >= 0; i--) {
    if (_entries[i].event === event) return _entries[i];
  }
  return undefined;
}
