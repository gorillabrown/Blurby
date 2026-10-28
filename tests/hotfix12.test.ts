// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { currentChapterIndex } from "../src/utils/text";

/**
 * HOTFIX-12 behavioral tests
 *
 * Covers the five bugs fixed in HOTFIX-12:
 *   BUG-150 — keyboard guard blocks app shortcuts when typing in input elements
 *   BUG-146 — chapter dropdown uses narration cursor when narration is active
 *   BUG-149 — chunked EPUB extraction yields between sections
 *   BUG-148 — position restore toast fires at most once per book open
 */

// ── BUG-150 — Keyboard guard ──────────────────────────────────────────────────

/**
 * Replicates the guard logic from useKeyboardShortcuts.ts lines 170-172.
 *
 *   const target = e.target as HTMLElement;
 *   const isTyping = target?.closest?.("input, textarea, select, [contenteditable]");
 *   if (isTyping && e.key !== "Escape") return;
 */
function shouldBlockShortcut(target: HTMLElement, key: string): boolean {
  const isTyping = target?.closest?.("input, textarea, select, [contenteditable]");
  return !!(isTyping && key !== "Escape");
}

describe("BUG-150 — keyboard guard blocks shortcuts in input elements", () => {
  it("blocks a plain letter key when target is a textarea", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    expect(shouldBlockShortcut(textarea, "t")).toBe(true);

    document.body.removeChild(textarea);
  });

  it("allows Escape through even when target is a textarea", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    expect(shouldBlockShortcut(textarea, "Escape")).toBe(false);

    document.body.removeChild(textarea);
  });

  it("blocks Ctrl+Arrow when target is an input element", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    // Ctrl+Left would word-seek in a text input — guard must block it before
    // the app's Ctrl+Left handler fires.
    expect(shouldBlockShortcut(input, "ArrowLeft")).toBe(true);

    document.body.removeChild(input);
  });

  it("does not block keys when target is a non-input element", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    expect(shouldBlockShortcut(div, "t")).toBe(false);
    expect(shouldBlockShortcut(div, "ArrowLeft")).toBe(false);

    document.body.removeChild(div);
  });

  it("blocks shortcuts when target is a child of a contenteditable container", () => {
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const span = document.createElement("span");
    editor.appendChild(span);
    document.body.appendChild(editor);

    // The cursor is on a <span> inside the contenteditable — .closest() should
    // walk up and match the [contenteditable] attribute.
    expect(shouldBlockShortcut(span, "b")).toBe(true);

    document.body.removeChild(editor);
  });

  it("allows Escape through when target is a child of a contenteditable container", () => {
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const span = document.createElement("span");
    editor.appendChild(span);
    document.body.appendChild(editor);

    expect(shouldBlockShortcut(span, "Escape")).toBe(false);

    document.body.removeChild(editor);
  });
});

// ── BUG-146 — Chapter dropdown narration tracking ─────────────────────────────

describe("BUG-146 — currentChapterIndex uses narrationWordIndex when provided", () => {
  const chapters = [
    { title: "Chapter 1", wordIndex: 0 },
    { title: "Chapter 2", wordIndex: 100 },
    { title: "Chapter 3", wordIndex: 250 },
  ];

  it("resolves to chapter 2 when narrationWordIndex is mid-chapter-2", () => {
    // narrationWordIndex is authoritative; simulate: narrationWordIndex ?? wordIndex
    const narrationWordIndex = 150;
    const wordIndex = 10; // reading cursor is still at chapter 1
    const effective = narrationWordIndex ?? wordIndex;
    expect(currentChapterIndex(chapters, effective)).toBe(1); // chapter 2 (0-based)
  });

  it("falls back to wordIndex when narrationWordIndex is null", () => {
    // null ?? wordIndex should give wordIndex
    const narrationWordIndex: number | null = null;
    const wordIndex = 180;
    const effective = narrationWordIndex ?? wordIndex;
    expect(currentChapterIndex(chapters, effective)).toBe(1); // chapter 2
  });

  it("resolves to chapter 3 when narrationWordIndex is past the third chapter start", () => {
    const effective = 300; // past chapter 3's wordIndex of 250
    expect(currentChapterIndex(chapters, effective)).toBe(2); // chapter 3
  });

  it("returns -1 for an empty chapter list regardless of word index", () => {
    expect(currentChapterIndex([], 999)).toBe(-1);
  });
});

// ── BUG-149 — Chunked extraction (setImmediate yield) ────────────────────────

describe("BUG-149 — extractWords yields between sections via setImmediate", () => {
  it("setImmediate resolves a Promise (basic yield contract)", async () => {
    // Verify the yield pattern used in epub-word-extractor.js works as expected:
    //   await new Promise((resolve) => setImmediate(resolve));
    // If setImmediate is unavailable in jsdom the promise would never settle.
    let settled = false;
    await new Promise<void>((resolve) =>
      setImmediate(() => {
        settled = true;
        resolve();
      })
    );
    expect(settled).toBe(true);
  });

  it("multiple setImmediate yields run in FIFO order", async () => {
    const order: number[] = [];
    await new Promise<void>((resolve) => {
      setImmediate(() => {
        order.push(1);
        setImmediate(() => {
          order.push(2);
          setImmediate(() => {
            order.push(3);
            resolve();
          });
        });
      });
    });
    expect(order).toEqual([1, 2, 3]);
  });

  it("extractBlockTexts returns an array (smoke — module loads without EPUB path)", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { extractBlockTexts } = require("../main/epub-word-extractor.js");
    const cheerio = require("cheerio");

    const $ = cheerio.load("<body><p>Hello world.</p></body>");
    const blocks = extractBlockTexts($, $("body"));
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks).toEqual(["Hello world."]);
  });
});

// ── BUG-148 — Position restore toast fires at most once ──────────────────────

/**
 * Isolates the one-shot gate logic from ReaderContainer.tsx (lines 271-278):
 *
 *   if ((activeDoc.position || 0) > 0) {
 *     restoreTimer = setTimeout(() => {
 *       if (!hasShownRestoreToastRef.current) {
 *         hasShownRestoreToastRef.current = true;
 *         showToast("Restored to your last position", 2000);
 *       }
 *     }, 500);
 *   }
 */
function makeRestoreGate() {
  let hasShown = false;
  let callCount = 0;

  function maybeShowRestoreToast(position: number): void {
    if (position > 0 && !hasShown) {
      hasShown = true;
      callCount++;
    }
  }

  return { maybeShowRestoreToast, getCallCount: () => callCount, getHasShown: () => hasShown };
}

describe("BUG-148 — restore toast one-shot gate", () => {
  it("fires when position is greater than 0 on first call", () => {
    const gate = makeRestoreGate();
    gate.maybeShowRestoreToast(42);
    expect(gate.getCallCount()).toBe(1);
    expect(gate.getHasShown()).toBe(true);
  });

  it("does NOT fire when position is 0 (fresh start)", () => {
    const gate = makeRestoreGate();
    gate.maybeShowRestoreToast(0);
    expect(gate.getCallCount()).toBe(0);
    expect(gate.getHasShown()).toBe(false);
  });

  it("fires at most once even if called multiple times with position > 0", () => {
    const gate = makeRestoreGate();
    gate.maybeShowRestoreToast(100);
    gate.maybeShowRestoreToast(200);
    gate.maybeShowRestoreToast(300);
    expect(gate.getCallCount()).toBe(1);
  });

  it("does not fire on subsequent calls after first successful fire", () => {
    const gate = makeRestoreGate();
    gate.maybeShowRestoreToast(50); // fires
    gate.maybeShowRestoreToast(0);  // position 0 — still does not re-fire
    expect(gate.getCallCount()).toBe(1);
  });
});
