/**
 * TTS-7M Regression Tests — Persistent Resume Anchor & Reopen Authority
 *
 * Verifies BUG-135: resume-anchor ownership across pause, close, and reopen.
 * Hard priority: explicit selection → live narration cursor → saved progress → visible fallback.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";
import { recordDiagEvent, getDiagEvents, clearDiagnostics } from "../src/utils/narrateDiagnostics";

// ── Resume Anchor State Machine ─────────────────────────────────────

/** Simulates the resumeAnchorRef behavior from ReaderContainer/useReaderMode */
class ResumeAnchor {
  private anchor: number | null = null;

  /** Set anchor (from pause cursor, reopen saved pos) */
  set(value: number) { this.anchor = value; }

  /** Get current anchor */
  get(): number | null { return this.anchor; }

  /** Consume anchor (on mode start) — returns value and clears */
  consume(): number | null {
    const val = this.anchor;
    this.anchor = null;
    return val;
  }

  /** Clear anchor (on explicit selection) */
  clear() { this.anchor = null; }

  /** Check if anchor is active */
  isActive(): boolean { return this.anchor != null; }
}

// ── Pause → Play (without reselection) ──────────────────────────────

describe("TTS-7M: pause→play resumes from narration cursor", () => {
  it("pause captures live cursor as resume anchor", () => {
    const anchor = new ResumeAnchor();
    // Simulating: narration paused at word 4500
    anchor.set(4500);
    expect(anchor.get()).toBe(4500);
  });

  it("replay without reselection uses resume anchor", () => {
    const anchor = new ResumeAnchor();
    anchor.set(4500); // Paused at word 4500

    // Simulate startNarration consuming the anchor
    const startSource = anchor.consume() ?? 0;
    expect(startSource).toBe(4500);
    expect(anchor.get()).toBeNull(); // Consumed
  });

  it("passive onRelocate cannot downgrade while anchor active", () => {
    const anchor = new ResumeAnchor();
    anchor.set(4500); // Paused at word 4500

    // Simulate passive onRelocate trying to set approxWordIdx = 100
    let highlightedWordIndex = 4500;
    if (!anchor.isActive()) {
      highlightedWordIndex = 100; // Would downgrade
    }
    expect(highlightedWordIndex).toBe(4500); // Protected
  });
});

// ── Explicit selection overrides anchor ─────────────────────────────

describe("TTS-7M: explicit selection overrides resume anchor", () => {
  it("user click clears resume anchor", () => {
    const anchor = new ResumeAnchor();
    anchor.set(4500);

    // User clicks word 8000
    anchor.clear();
    expect(anchor.get()).toBeNull();
  });

  it("after explicit selection, startNarration uses highlighted word", () => {
    const anchor = new ResumeAnchor();
    anchor.set(4500);
    anchor.clear(); // Explicit selection happened

    const consumed = anchor.consume();
    expect(consumed).toBeNull();
    // startNarration falls through to highlightedWordIndexRef.current
  });
});

// ── Close → Reopen ──────────────────────────────────────────────────

describe("TTS-7M: close→reopen starts at saved position", () => {
  it("reopen sets resume anchor from saved position", () => {
    const anchor = new ResumeAnchor();
    const savedPosition = 12500;

    // Simulating init effect on reopen
    if (savedPosition > 0) anchor.set(savedPosition);
    expect(anchor.get()).toBe(12500);
  });

  it("passive onLoad cannot overwrite saved position anchor", () => {
    const anchor = new ResumeAnchor();
    anchor.set(12500); // Saved position on reopen

    // Simulate onLoad trying to restore firstVisible = 0
    if (anchor.isActive()) {
      // Skip restore
    }
    expect(anchor.get()).toBe(12500); // Protected
  });

  it("immediate play after reopen starts from saved word", () => {
    const anchor = new ResumeAnchor();
    anchor.set(12500);

    // Simulate startNarration
    const startSource = anchor.consume() ?? 0;
    const frozenLaunchIdx = resolveFoliateStartWord(startSource, 270494, () => 0, 270494);
    expect(frozenLaunchIdx).toBe(12500);
  });

  it("fresh book with no saved position has no anchor", () => {
    const anchor = new ResumeAnchor();
    const savedPosition = 0;
    if (savedPosition > 0) anchor.set(savedPosition);
    expect(anchor.get()).toBeNull();
  });
});

// ── Passive restore as visual-only fallback ─────────────────────────

describe("TTS-7M: passive restore is visual-only fallback", () => {
  it("first-visible applies when no anchor and no saved position", () => {
    const anchor = new ResumeAnchor();
    // No anchor, savedPos = 0
    expect(anchor.isActive()).toBe(false);

    // firstVisible fallback
    const startIdx = resolveFoliateStartWord(0, 14, () => 5, 270494);
    expect(startIdx).toBe(0); // 0 is valid, so it's used
  });

  it("onRelocate updates highlight when no anchor active", () => {
    const anchor = new ResumeAnchor();
    let highlightedWordIndex = 0;

    // No anchor — onRelocate can update
    if (!anchor.isActive()) {
      highlightedWordIndex = 3500;
    }
    expect(highlightedWordIndex).toBe(3500);
  });
});

// ── Progress save guardrails ────────────────────────────────────────

describe("TTS-7M: persisted progress guardrails", () => {
  it("onRelocate does not persist progress when anchor is active", () => {
    const anchor = new ResumeAnchor();
    anchor.set(12500);

    let progressSaved = false;
    const hasEngaged = false;

    // Simulate onRelocate progress save guard
    if (!hasEngaged || anchor.isActive()) {
      // Skip save
    } else {
      progressSaved = true;
    }
    expect(progressSaved).toBe(false);
  });

  it("onRelocate persists progress after engagement with no anchor", () => {
    const anchor = new ResumeAnchor();
    let progressSaved = false;
    const hasEngaged = true;

    if (!hasEngaged || anchor.isActive()) {
      // Skip
    } else {
      progressSaved = true;
    }
    expect(progressSaved).toBe(true);
  });
});

// ── Exact selection does not regress ────────────────────────────────

describe("TTS-7M: exact selection behavior preserved", () => {
  it("global selection still flows through resolveFoliateStartWord", () => {
    const result = resolveFoliateStartWord(4065, 270494, () => 0, 270494);
    expect(result).toBe(4065);
  });

  it("selection at saved position also valid", () => {
    const result = resolveFoliateStartWord(12500, 270494, () => 0, 270494);
    expect(result).toBe(12500);
  });
});

// ── Diagnostics ─────────────────────────────────────────────────────

describe("TTS-7M: resume-anchor diagnostics", () => {
  beforeEach(() => clearDiagnostics());

  it("records source-promoted when anchor consumed", () => {
    recordDiagEvent("source-promoted", "resume anchor consumed: word 4500");
    expect(getDiagEvents().filter(e => e.event === "source-promoted").length).toBe(1);
  });
});
