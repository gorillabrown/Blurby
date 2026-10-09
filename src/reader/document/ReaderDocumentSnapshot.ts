/**
 * ReaderDocumentSnapshot — value-only records that cross a reader-mode boundary
 * (READER-MODE-SEPARATION-2 contract item 1).
 *
 * Everything here is plain data: deep-copied, then frozen. Sets cross as sorted number
 * arrays and are rebuilt privately by each receiver. DOM nodes, refs, callbacks, Maps,
 * Sets and class instances are never payloads; freezeValue throws on them.
 * This file holds no module-level mutable state.
 */
import type { ReaderModeId } from "../modes/ReaderModeAdapter";
import type { BlurbySettings, PronunciationOverride } from "../../types";
import type { SectionBoundary } from "../../types/narration";

export type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

export interface ReaderSessionKey {
  readonly documentId: string;
  readonly documentGeneration: number;
  readonly mode: ReaderModeId;
  readonly session: number;
}

export interface ReaderBookWordsValue {
  readonly words: readonly string[];
  readonly sections: readonly Readonly<SectionBoundary>[];
  readonly totalWords: number;
  readonly footnoteCues: readonly Readonly<{ afterWordIdx: number; text: string }>[];
}

export interface ReaderDocumentSnapshot {
  readonly documentId: string;
  readonly documentGeneration: number;
  readonly title: string;
  readonly author: string | null;
  readonly coverPath: string | null;
  readonly filepath: string | null;
  /** Legacy: Boolean(filepath && ext === ".epub"). */
  readonly useFoliate: boolean;
  readonly wordCount: number;
  readonly position: number;
  readonly cfi: string | null;
  /** tokenizeWithMeta(content).words (Page keyboard paths). */
  readonly tokenWords: readonly string[];
  /** tokenizeWithMeta(content).paragraphBreaks as a sorted array. */
  readonly paragraphBreaks: readonly number[];
  /** Complete full-book extraction, else null. */
  readonly bookWords: ReaderBookWordsValue | null;
  readonly pronunciationOverrides: readonly Readonly<PronunciationOverride>[];
}

export interface ReaderSettingsSnapshot {
  readonly settings: DeepReadonly<BlurbySettings>;
  readonly wpm: number;
  /** Legacy e-ink ceiling applied in the shell. */
  readonly effectiveWpm: number;
  readonly focusTextSize: number;
  readonly isEink: boolean;
  readonly isMac: boolean;
}

export interface ReaderModeHandoff {
  /** null = document open. */
  readonly source: ReaderSessionKey | null;
  /** Legacy persistentWordIndexRef. */
  readonly canonicalWordIndex: number;
  /** Legacy persistentWordIndex state. */
  readonly publishedWordIndex: number;
  readonly highlightedWordIndex: number;
  readonly softWordIndex: number;
  readonly resumeAnchor: number | null;
  readonly explicitSelectionAnchor: number | null;
  readonly cfi: string | null;
}

function copyPlain(value: unknown, path: string): unknown {
  if (value === null || typeof value !== "object") {
    if (typeof value === "function" || typeof value === "symbol") {
      throw new TypeError(`freezeValue: ${typeof value} at ${path} cannot cross a mode boundary`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item, i) => copyPlain(item, `${path}[${i}]`)));
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    // Set, Map, Date, DOM Node, class instances: not plain data.
    const name = (value as { constructor?: { name?: string } }).constructor?.name ?? "object";
    throw new TypeError(`freezeValue: ${name} at ${path} cannot cross a mode boundary`);
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) out[k] = copyPlain(v, `${path}.${k}`);
  return Object.freeze(out);
}

/** Deep copy of plain data (arrays, plain objects, primitives), recursively frozen. Throws on anything else. */
export function freezeValue<T>(value: T): DeepReadonly<T> {
  return copyPlain(value, "value") as DeepReadonly<T>;
}

/** Sorted, frozen copy of a number set. */
export function setToNumberArray(set: ReadonlySet<number>): readonly number[] {
  return Object.freeze([...set].sort((a, b) => a - b));
}

/** A fresh private Set per caller. */
export function numberArrayToSet(values: readonly number[]): Set<number> {
  return new Set(values);
}

function assertIndex(name: string, value: number | null, nullable: boolean): void {
  if (value === null && nullable) return;
  // 0 is a valid index (LL-108).
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new RangeError(`ReaderModeHandoff.${name} must be an integer >= 0${nullable ? " or null" : ""}; got ${String(value)}`);
  }
}

export function createReaderModeHandoff(input: ReaderModeHandoff): ReaderModeHandoff {
  assertIndex("canonicalWordIndex", input.canonicalWordIndex, false);
  assertIndex("publishedWordIndex", input.publishedWordIndex, false);
  assertIndex("highlightedWordIndex", input.highlightedWordIndex, false);
  assertIndex("softWordIndex", input.softWordIndex, false);
  assertIndex("resumeAnchor", input.resumeAnchor, true);
  assertIndex("explicitSelectionAnchor", input.explicitSelectionAnchor, true);
  return freezeValue(input);
}

/**
 * Book open, as the legacy mount effects run it: useDocumentLifecycle seeds the resume anchor,
 * then usePersistentReadingAnchor's "book-open" write clamps it (clampPersistentWordIndex copy)
 * and clears the explicit selection. cfi = resolveBookOpenInitialCfi copy (cfi || null).
 */
export function createInitialHandoff(doc: ReaderDocumentSnapshot, totalWordCount: number): ReaderModeHandoff {
  const raw = doc.position;
  let index = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
  index = totalWordCount <= 0 ? 0 : Math.min(index, Math.max(0, Math.trunc(totalWordCount - 1)));
  return createReaderModeHandoff({
    source: null,
    canonicalWordIndex: index,
    publishedWordIndex: index,
    highlightedWordIndex: index,
    softWordIndex: index,
    resumeAnchor: index,
    explicitSelectionAnchor: null,
    cfi: doc.cfi || null,
  });
}

export function createReaderDocumentSnapshot(input: ReaderDocumentSnapshot): ReaderDocumentSnapshot {
  return freezeValue(input);
}

export function createReaderSettingsSnapshot(input: {
  settings: BlurbySettings;
  wpm: number;
  effectiveWpm: number;
  focusTextSize: number;
  isEink: boolean;
  isMac: boolean;
}): ReaderSettingsSnapshot {
  return freezeValue(input);
}
