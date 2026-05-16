# Flow Cursor Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken React effect-based flow cursor with a standalone imperative controller that CSS-transitions a bar across each text line at WPM speed.

**Architecture:** A plain TypeScript class (`FlowCursorController`) owns the cursor DOM element, line map, timers, and position tracking. React never touches it during playback — only calls `start()`, `stop()`, `setWpm()`, and `jumpTo()`. The controller creates its own `<div>`, appends it to `.page-reader-content`, and removes it on stop. No useEffect, no dependency arrays, no ref-vs-state races.

**Tech Stack:** TypeScript class, CSS transitions, DOM API

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/FlowCursorController.ts` | **Create** | Standalone imperative controller — line map, cursor DOM, CSS transitions, timers, position tracking |
| `src/components/PageReaderView.tsx` | **Modify** | Remove all flow cursor refs/effects/callbacks (~lines 223-445). Replace with controller instantiation and 4 call sites |
| `src/components/ReaderContainer.tsx` | **No change** | Already sets `flowPlaying` and `readingMode` correctly |

---

### Task 1: Create FlowCursorController class

**Files:**
- Create: `src/utils/FlowCursorController.ts`

- [ ] **Step 1: Write the controller class**

```typescript
import { PAGE_TRANSITION_MS, FLOW_PAGE_TURN_PAUSE_MS, ANIMATION_DISABLE_WPM } from "../constants";

interface LineInfo {
  y: number;
  bottom: number;
  left: number;
  right: number;
  firstWord: number;
  lastWord: number;
  wordCount: number;
}

interface FlowCursorOptions {
  cursorStyle: "underline" | "highlight";
  onPageTurn: (nextPageIdx: number) => void;
  getPageCount: () => number;
  getCurrentPageIdx: () => number;
}

export class FlowCursorController {
  private cursor: HTMLDivElement | null = null;
  private container: HTMLElement | null = null;
  private lines: LineInfo[] = [];
  private lineIdx = 0;
  private wordIndex = 0;
  private wpm = 300;
  private lineTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private options: FlowCursorOptions;

  constructor(options: FlowCursorOptions) {
    this.options = options;
  }

  /** Start sliding from the given word index at the given WPM. */
  start(wordIndex: number, wpm: number): void {
    this.stop(); // clean up any previous run
    this.wordIndex = wordIndex;
    this.wpm = wpm;
    this.running = true;

    // Find container
    this.container = document.querySelector(".page-reader-content") as HTMLElement;
    if (!this.container) return;

    // Create cursor element
    this.cursor = document.createElement("div");
    const isUnderline = this.options.cursorStyle === "underline";
    this.cursor.className = "flow-highlight-cursor" + (isUnderline ? "" : " flow-highlight-cursor--box");
    this.cursor.style.display = "none";
    this.container.appendChild(this.cursor);

    // Build line map and start
    this.lines = this.buildLineMap();
    if (this.lines.length === 0) return;

    // Find the line containing wordIndex
    this.lineIdx = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (wordIndex >= this.lines[i].firstWord && wordIndex <= this.lines[i].lastWord) {
        this.lineIdx = i;
        break;
      }
    }

    this.slideLine();
  }

  /** Stop and return the current word index. */
  stop(): number {
    this.running = false;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }
    this.cursor = null;
    this.container = null;
    this.lines = [];
    return this.wordIndex;
  }

  /** Update WPM — restarts the current line at the new speed. */
  setWpm(wpm: number): void {
    this.wpm = wpm;
    if (!this.running) return;
    // Restart current line at new speed
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    this.lines = this.buildLineMap();
    if (this.lines.length > 0 && this.lineIdx < this.lines.length) {
      this.slideLine();
    }
  }

  /** Jump to a specific word — restarts slide from that word's line. */
  jumpTo(wordIndex: number): void {
    this.wordIndex = wordIndex;
    if (!this.running) return;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    this.lines = this.buildLineMap();
    if (this.lines.length === 0) return;
    this.lineIdx = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (wordIndex >= this.lines[i].firstWord && wordIndex <= this.lines[i].lastWord) {
        this.lineIdx = i;
        break;
      }
    }
    this.slideLine();
  }

  /** Returns true if currently sliding. */
  isRunning(): boolean { return this.running; }

  /** Returns current word position. */
  getWordIndex(): number { return this.wordIndex; }

  // ── Private ──────────────────────────────────────────────────

  private buildLineMap(): LineInfo[] {
    const container = this.container || document.querySelector(".page-reader-content") as HTMLElement;
    if (!container) return [];
    const cRect = container.getBoundingClientRect();
    const wordEls = container.querySelectorAll("[data-word-index]");
    if (wordEls.length === 0) return [];

    const lines: LineInfo[] = [];
    let cur: LineInfo | null = null;

    wordEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const idx = parseInt(el.getAttribute("data-word-index") || "0", 10);
      const top = rect.top - cRect.top + container.scrollTop;
      const bottom = rect.bottom - cRect.top + container.scrollTop;
      const left = rect.left - cRect.left + container.scrollLeft;
      const right = rect.right - cRect.left + container.scrollLeft;

      if (!cur || Math.abs(top - cur.y) > rect.height * 0.5) {
        cur = { y: top, bottom, left, right, firstWord: idx, lastWord: idx, wordCount: 1 };
        lines.push(cur);
      } else {
        cur.right = right;
        cur.lastWord = idx;
        cur.wordCount++;
      }
    });
    return lines;
  }

  private slideLine(): void {
    if (!this.running || !this.cursor || this.lineIdx >= this.lines.length) return;
    const line = this.lines[this.lineIdx];
    const isUnderline = this.options.cursorStyle === "underline";
    const barWidth = 40;
    const lineWidth = line.right - line.left;
    const y = isUnderline ? line.bottom - 3 : line.y;
    const h = isUnderline ? 3 : (line.bottom - line.y);
    const duration = (line.wordCount / this.wpm) * 60000;

    // Position at line start instantly
    this.cursor.style.transition = "none";
    this.cursor.style.transform = `translate3d(${line.left}px, ${y}px, 0)`;
    this.cursor.style.width = `${barWidth}px`;
    this.cursor.style.height = `${h}px`;
    this.cursor.style.display = "";

    this.wordIndex = line.firstWord;

    // Force reflow, then start CSS transition to line end
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.cursor.offsetWidth;
    this.cursor.style.transition = `transform ${duration}ms linear`;
    this.cursor.style.transform = `translate3d(${line.right - barWidth}px, ${y}px, 0)`;

    // When line completes, advance
    this.lineTimer = setTimeout(() => {
      this.wordIndex = line.lastWord;
      this.lineIdx++;

      if (this.lineIdx >= this.lines.length) {
        // End of page — try next page
        const nextPageIdx = this.options.getCurrentPageIdx() + 1;
        if (nextPageIdx < this.options.getPageCount()) {
          this.options.onPageTurn(nextPageIdx);
          // Wait for page turn + render, then rebuild and continue
          setTimeout(() => {
            this.container = document.querySelector(".page-reader-content") as HTMLElement;
            if (this.cursor && this.container && !this.container.contains(this.cursor)) {
              this.container.appendChild(this.cursor);
            }
            this.lines = this.buildLineMap();
            this.lineIdx = 0;
            if (this.lines.length > 0) this.slideLine();
          }, FLOW_PAGE_TURN_PAUSE_MS + PAGE_TRANSITION_MS + 50);
        }
        // else: end of document — running stays true, cursor stays at last position
        return;
      }

      this.slideLine();
    }, duration);
  }
}
```

- [ ] **Step 2: Run build to verify no TS errors**

Run: `npm run build`
Expected: compiles clean

- [ ] **Step 3: Commit**

```bash
git add src/utils/FlowCursorController.ts
git commit -m "feat: add FlowCursorController — imperative line-slide engine"
```

---

### Task 2: Wire controller into PageReaderView

**Files:**
- Modify: `src/components/PageReaderView.tsx`

- [ ] **Step 1: Remove all old flow cursor code**

Delete everything between the `wordSpan` declaration and the `handlePageClick` callback:
- Lines ~228-445: the hide effect, all flow refs, buildLineMap, startLineSlide, the main flow useEffect, the WPM restart effect
- Keep: `flowCursorRef` declaration (line 223) — actually delete this too, the controller creates its own element
- Delete: the `{flowPlaying && <div ref={flowCursorRef} .../>}` JSX (~line 581)

- [ ] **Step 2: Add controller import and instance**

At the top of PageReaderView, after existing imports:
```typescript
import { FlowCursorController } from "../utils/FlowCursorController";
```

Inside the component, after `wordSpan`:
```typescript
const flowControllerRef = useRef<FlowCursorController | null>(null);
```

- [ ] **Step 3: Add the single flow effect**

Replace all removed flow code with:

```typescript
// ── Flow mode: imperative controller handles everything ──────────────
useEffect(() => {
  if (!flowPlaying) {
    // Stop and save position
    if (flowControllerRef.current) {
      const finalPos = flowControllerRef.current.stop();
      onHighlightedWordChange(finalPos);
      flowControllerRef.current = null;
    }
    return;
  }

  // Navigate to page containing the reading position
  const targetPage = pageForWord(pages, highlightedWordIndex);
  if (targetPage !== currentPage) {
    setCurrentPage(targetPage);
  }

  // Create and start controller after DOM settles
  const timer = setTimeout(() => {
    const ctrl = new FlowCursorController({
      cursorStyle: settings?.flowCursorStyle || "underline",
      onPageTurn: (nextIdx) => { setCurrentPage(nextIdx); },
      getPageCount: () => pages.length,
      getCurrentPageIdx: () => currentPage,
    });
    ctrl.start(highlightedWordIndex, wpm);
    flowControllerRef.current = ctrl;
  }, targetPage !== currentPage ? 200 : 16);

  return () => {
    clearTimeout(timer);
    if (flowControllerRef.current) {
      const finalPos = flowControllerRef.current.stop();
      onHighlightedWordChange(finalPos);
      flowControllerRef.current = null;
    }
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [flowPlaying]);
```

- [ ] **Step 4: Update word click handler**

Change `handleWordClick` to call the controller during flow:
```typescript
const handleWordClick = useCallback((index: number, e: React.MouseEvent) => {
  e.stopPropagation();
  if (flowControllerRef.current?.isRunning()) {
    flowControllerRef.current.jumpTo(index);
  } else {
    onHighlightedWordChange(index);
  }
}, [onHighlightedWordChange]);
```

- [ ] **Step 5: Add WPM sync effect**

```typescript
// Sync WPM changes to controller during flow
useEffect(() => {
  if (flowControllerRef.current?.isRunning()) {
    flowControllerRef.current.setWpm(wpm);
  }
}, [wpm]);
```

- [ ] **Step 6: Remove the flowCursorRef JSX element**

Delete this line from the JSX (~line 581):
```tsx
{flowPlaying && <div ref={flowCursorRef} className="flow-highlight-cursor" style={{ display: "none" }} />}
```

The controller creates and manages its own DOM element.

- [ ] **Step 7: Clean up unused imports and refs**

Remove any refs that are no longer used: `flowCursorRef`, `flowRafRef`, `flowPagePausingRef`, `ttsActiveRef`, `flowWpmRef`, `flowPagesRef`, `flowCurrentPageRef`, `flowWordsRef`, `flowHighlightRef`, `flowSavedPosRef`, `onHighlightRef`, `flowLineIdxRef`, `flowWordUpdateRef`, `flowRestartRef`, `startLineSlideRef`, `buildLineMapRef`, `prevWpmRef`, `flowCursorLastY`.

Remove unused imports: `FLOW_PAGE_TURN_PAUSE_MS`, `ANIMATION_DISABLE_WPM` (now used only in the controller).

- [ ] **Step 8: Run tests + build**

Run: `npm test && npm run build`
Expected: 512 tests pass, zero TS errors

- [ ] **Step 9: Commit**

```bash
git add src/components/PageReaderView.tsx
git commit -m "feat: replace flow cursor effects with FlowCursorController"
```

---

### Task 3: Verify and fix page turn integration

**Files:**
- Modify: `src/utils/FlowCursorController.ts` (if needed)
- Modify: `src/components/PageReaderView.tsx` (if needed)

- [ ] **Step 1: Manual smoke test**

Test these scenarios:
1. Open a book, click a word, press Space → bar appears on that word's line and slides
2. Press Space again → bar stops, highlighted word stays where bar was
3. Press Space again → bar resumes from saved position
4. Press Up/Down during flow → WPM changes, bar restarts at new speed
5. Click a word during flow → bar jumps to that word's line
6. Let bar reach end of page → pauses, page turns, bar continues on new page
7. Press Escape during flow → exits reader

- [ ] **Step 2: Fix any issues found**

Address based on smoke test results.

- [ ] **Step 3: Run tests + build**

Run: `npm test && npm run build`
Expected: 512 tests pass, zero TS errors

- [ ] **Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix: flow cursor page turn and edge case fixes"
```

---

## Key Design Decisions

1. **No React state during playback.** The controller is a plain class. React calls `start()` and `stop()`. Everything in between is imperative DOM manipulation.

2. **Forced reflow for instant CSS transition.** Reading `cursor.offsetWidth` between setting `transition: none` and setting the new transition forces the browser to commit the "no transition" position before starting the slide. This is the standard technique for CSS transition sequencing without rAF.

3. **Controller creates its own DOM element.** No React ref, no conditional JSX rendering, no timing issues with element availability.

4. **Position saved on stop() return value.** No refs, no cleanup races. `stop()` returns the word index, caller saves it to React state.
