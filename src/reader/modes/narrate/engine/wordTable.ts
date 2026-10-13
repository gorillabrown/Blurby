/**
 * Narrate engine — the exact word table (NARRATE-REBUILD-1 P3; ROADMAP Core "provenance, not a trusted flag").
 *
 * A ChunkTable is what the main-process producer returns for one synthesized chunk: the model's own duration
 * frames (one per input id), the measured samples-per-frame factor, and the units (words, or fused word runs)
 * with their frame and sample spans taken from that table. Nothing here estimates: verifyTable only checks
 * what the producer claims against the PCM actually handed over and the chunk's own source words, and
 * lookupUnit only reads the table at a playback sample. Pure functions; no React, no DOM.
 */

export const NATIVE_SOURCE = "model-output";

export interface TableUnit {
  readonly words: readonly string[];
  readonly kind: "word" | "fused" | "split-word";
  readonly frameStart: number;
  readonly frameEnd: number;
  readonly sampleStart: number;
  readonly sampleEnd: number;
}

export interface TableProvenance {
  readonly source: string;
  readonly outputNames?: readonly string[];
  readonly durationsType?: string | null;
}

export interface ChunkTable {
  readonly provenance: TableProvenance;
  /** One duration per input id, BOS and EOS included, in model frames. */
  readonly durations: readonly number[];
  /** Measured samples per frame (600 at 24 kHz on every Phase 0 chunk). */
  readonly samplesPerFrame: number;
  readonly sampleRate: number;
  readonly units: readonly TableUnit[];
  /** The producer's mapping verdict (P0-2): every unit's identification evidence within its limit. */
  readonly reconciled: boolean;
}

export type TableVerdict = { readonly ok: true } | { readonly ok: false; readonly reason: TableRejection };

export type TableRejection =
  | "missing-table"
  | "provenance-not-native"
  | "unreconciled"
  | "frames-not-integer"
  | "factor-not-integer"
  | "law"
  | "no-units"
  | "unit-frames"
  | "units-not-monotone"
  | "words-mismatch";

/**
 * The trust gate (F4). A table is used for the cursor only when every check holds; the first failing check names
 * the rejection. `pcmSamples` is the length of the PCM that will actually be played, `sourceWords` the chunk's
 * words as the engine sent them to the producer.
 */
export function verifyTable(input: {
  readonly table: ChunkTable | null | undefined;
  readonly sourceWords: readonly string[];
  readonly pcmSamples: number;
}): TableVerdict {
  const { table, sourceWords, pcmSamples } = input;
  if (!table) return { ok: false, reason: "missing-table" };
  if (table.provenance?.source !== NATIVE_SOURCE) return { ok: false, reason: "provenance-not-native" };
  if (table.reconciled !== true) return { ok: false, reason: "unreconciled" };
  const d = table.durations;
  if (!Array.isArray(d) || d.length < 2 || !d.every((f) => Number.isInteger(f) && f >= 0)) return { ok: false, reason: "frames-not-integer" };
  const factor = table.samplesPerFrame;
  if (!Number.isInteger(factor) || factor < 1) return { ok: false, reason: "factor-not-integer" };
  const sum = d.reduce((a, b) => a + b, 0);
  if (sum * factor !== pcmSamples) return { ok: false, reason: "law" };
  const units = table.units;
  if (!Array.isArray(units) || units.length === 0) return { ok: false, reason: "no-units" };
  let last = 0;
  for (const u of units) {
    if (!Number.isInteger(u.frameStart) || !Number.isInteger(u.frameEnd) || u.frameEnd <= u.frameStart) return { ok: false, reason: "unit-frames" };
    if (u.sampleStart !== u.frameStart * factor || u.sampleEnd !== u.frameEnd * factor) return { ok: false, reason: "unit-frames" };
    if (u.sampleStart < last || u.sampleEnd > pcmSamples) return { ok: false, reason: "units-not-monotone" };
    last = u.sampleEnd;
  }
  const covered = units.flatMap((u) => u.words);
  if (covered.length !== sourceWords.length || covered.some((w, i) => w !== sourceWords[i])) return { ok: false, reason: "words-mismatch" };
  return { ok: true };
}

/**
 * The cursor: the index of the unit being played at `sample`, holding the last started unit through the silence
 * after it (R6: never advance early). -1 before the first unit starts (leading silence).
 */
export function lookupUnit(units: readonly TableUnit[], sample: number): number {
  let lo = 0, hi = units.length - 1, found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (units[mid].sampleStart <= sample) { found = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return found;
}
