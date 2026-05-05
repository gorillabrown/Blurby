export type ResumeAnchorChoiceKind = "word" | "cfi" | "reconciled-word";

export interface ResumeAnchorChoice {
  kind: ResumeAnchorChoiceKind;
  wordIndex: number | null;
  reason: string;
  metadata: {
    savedWordIndex: number | null;
    restoredWordIndex: number | null;
    wordCount: number;
    threshold: number;
    delta: number | null;
    mismatch: boolean;
    hasInitialCfi: boolean;
  };
}

function normalizeWordIndex(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
}

function clampWordIndex(value: number, wordCount: number): number {
  const count = Math.max(0, Math.trunc(wordCount));
  if (count <= 0) return 0;
  return Math.max(0, Math.min(Math.trunc(value), count - 1));
}

export function resumeAnchorMismatchThreshold(wordCount: number): number {
  return Math.max(250, Math.floor(Math.max(0, wordCount) * 0.02));
}

export function wordIndexFromProgress(position: number, wordCount: number): number {
  if (!Number.isFinite(position)) return 0;
  const count = Math.max(0, Math.trunc(wordCount));
  if (count <= 0) return Math.max(0, Math.trunc(position));
  if (position > 0 && position < 1) {
    return clampWordIndex(Math.floor(position * count), count);
  }
  return clampWordIndex(position, count);
}

export function isResumeAnchorMismatch(
  savedWordIndex: number,
  restoredWordIndex: number,
  wordCount: number,
): boolean {
  const threshold = resumeAnchorMismatchThreshold(wordCount);
  return Math.abs(Math.trunc(savedWordIndex) - Math.trunc(restoredWordIndex)) > threshold;
}

export function chooseResumeAnchor({
  savedWordIndex,
  restoredWordIndex,
  wordCount,
  hasInitialCfi,
}: {
  savedWordIndex?: number | null;
  restoredWordIndex?: number | null;
  wordCount: number;
  hasInitialCfi: boolean;
}): ResumeAnchorChoice {
  const threshold = resumeAnchorMismatchThreshold(wordCount);
  const saved = normalizeWordIndex(savedWordIndex);
  const restored = normalizeWordIndex(restoredWordIndex);
  const delta = saved != null && restored != null ? Math.abs(saved - restored) : null;
  const mismatch = delta != null && delta > threshold;
  const metadata = {
    savedWordIndex: saved,
    restoredWordIndex: restored,
    wordCount,
    threshold,
    delta,
    mismatch,
    hasInitialCfi,
  };

  if (saved != null && restored != null && mismatch) {
    return {
      kind: "reconciled-word",
      wordIndex: saved,
      reason: "restored-cfi-too-far-from-saved-word",
      metadata,
    };
  }

  if (hasInitialCfi && restored != null) {
    return {
      kind: "cfi",
      wordIndex: restored,
      reason: saved != null ? "restored-cfi-agrees-with-saved-word" : "restored-cfi-only",
      metadata,
    };
  }

  if (saved != null) {
    return {
      kind: "word",
      wordIndex: saved,
      reason: hasInitialCfi ? "saved-word-without-restored-word" : "saved-word-only",
      metadata,
    };
  }

  return {
    kind: hasInitialCfi ? "cfi" : "word",
    wordIndex: restored,
    reason: hasInitialCfi ? "initial-cfi-without-word-offsets" : "no-anchor",
    metadata,
  };
}
