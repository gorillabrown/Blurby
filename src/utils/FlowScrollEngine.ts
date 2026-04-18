/**
 * FlowScrollEngine -- Imperative scroll + shrinking-underline cursor for Flow Mode.
 *
 * Replaces FlowCursorController for FLOW-3A (infinite scroll).
 * Architecture: plain TypeScript class (per LL-014). React only calls start/stop.
 * LL-015: Uses forced reflow (offsetWidth) between transition:none and new transition.
 * LL-016: All state is internal (no React state), passed via refs.
 */

import {
  FLOW_READING_ZONE_POSITION,
  FLOW_CURSOR_HEIGHT_PX,
  FLOW_CURSOR_EINK_HEIGHT_PX,
  FLOW_TIMER_BAR_HEIGHT_PX,
  FLOW_TIMER_BAR_EINK_HEIGHT_PX,
  FLOW_SCROLL_RESUME_DELAY_MS,
  FLOW_LINE_ADVANCE_BUFFER_MS,
  FLOW_LINE_COMPLETE_FLASH_MS,
} from "../constants";

export interface LineInfo {
  y: number;
  bottom: number;
  left: number;
  right: number;
  firstWord: number;
  lastWord: number;
  wordCount: number;
}

export interface FlowScrollEngineState {
  running: boolean;
  paused: boolean;
  followerMode: boolean;
  lineIndex: number;
  wordIndex: number;
  totalLines: number;
}

export interface FlowProgress {
  lineIndex: number;
  totalLines: number;
  wordIndex: number;
  totalWords: number;
  estimatedMinutesLeft: number;
  bookPct: number;
}

export interface FlowScrollEngineCallbacks {
  onWordAdvance: (wordIndex: number) => void;
  onComplete: () => void;
  onLineChange?: (lineIndex: number, lineInfo: LineInfo) => void;
  onProgressUpdate?: (progress: FlowProgress) => void;
}

export interface FlowRenderedWordRootDescriptor {
  root: ParentNode;
  doc?: Document | null;
  sectionIndex?: number | null;
  ready?: boolean;
}

export type FlowRenderedWordRootsProvider = () => FlowRenderedWordRootDescriptor[];

export const FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY = "__blurbyRenderedWordRoots";

type FlowRenderedWordRootHost = HTMLElement & {
  [FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY]?: FlowRenderedWordRootsProvider;
};

export class FlowScrollEngine {
  private container: HTMLElement | null = null;
  private cursor: HTMLDivElement | null = null;
  private lines: LineInfo[] = [];
  private lineIdx = 0;
  private wordIndex = 0;
  private wpm = 300;
  private running = false;
  private paused = false;
  private isEink = false;
  private lineTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollResumeTimer: ReturnType<typeof setTimeout> | null = null;
  private manualScrollPaused = false;
  private followerMode = false;
  private callbacks: FlowScrollEngineCallbacks;
  private paragraphBreaks: Set<number> = new Set();
  private zonePosition: number = FLOW_READING_ZONE_POSITION;
  private totalWords = 0;
  private bookPct = 0;

  constructor(callbacks: FlowScrollEngineCallbacks) {
    this.callbacks = callbacks;
  }

  start(
    container: HTMLElement,
    cursorEl: HTMLDivElement,
    wordIndex: number,
    wpm: number,
    paragraphBreaks: Set<number> = new Set(),
    isEink = false,
    zonePosition?: number
  ): void {
    this.stop();
    this.container = container;
    this.cursor = cursorEl;
    this.wordIndex = wordIndex;
    this.wpm = wpm;
    this.paragraphBreaks = paragraphBreaks;
    this.isEink = isEink;
    if (zonePosition !== undefined) this.zonePosition = zonePosition;
    this.running = true;
    this.paused = false;
    this.manualScrollPaused = false;
    this.followerMode = false;

    this.cursor.style.display = "block";
    this.cursor.style.height = (isEink ? FLOW_TIMER_BAR_EINK_HEIGHT_PX : FLOW_TIMER_BAR_HEIGHT_PX) + "px";
    if (isEink) {
      this.cursor.style.transition = "none";
    }

    this.lines = this.buildLineMap();

    // STAB-1A (BUG-165): If buildLineMap returns empty (word spans not rendered yet),
    // retry up to 5 times with 100ms delay. Prevents zombie engine state.
    if (this.lines.length === 0) {
      let retries = 0;
      const retryBuild = () => {
        retries++;
        this.lines = this.buildLineMap();
        if (this.lines.length > 0) {
          this.lineIdx = this.findLineForWord(wordIndex);
          this.scrollToLine(this.lineIdx, true);
          setTimeout(() => {
            if (this.running && !this.paused) this.animateLine();
          }, FLOW_LINE_ADVANCE_BUFFER_MS);
          this.container!.addEventListener("wheel", this.handleWheel, { passive: true });
          this.container!.addEventListener("touchmove", this.handleWheel, { passive: true });
          return;
        }
        if (retries < 5) {
          setTimeout(retryBuild, 100);
        } else {
          // Final failure — stop cleanly, do not leave running=true with empty lines
          if (import.meta.env.DEV) console.warn("[FlowScrollEngine] buildLineMap empty after 5 retries — stopping");
          this.running = false;
          this.cursor!.style.display = "none";
        }
      };
      setTimeout(retryBuild, 100);
      return;
    }

    this.lineIdx = this.findLineForWord(wordIndex);
    this.scrollToLine(this.lineIdx, true);

    setTimeout(() => {
      if (this.running && !this.paused) this.animateLine();
    }, FLOW_LINE_ADVANCE_BUFFER_MS);

    this.container.addEventListener("wheel", this.handleWheel, { passive: true });
    this.container.addEventListener("touchmove", this.handleWheel, { passive: true });
  }

  setZonePosition(pos: number): void {
    this.zonePosition = pos;
  }

  setTotalWords(total: number): void {
    this.totalWords = total;
  }

  setBookProgress(pct: number): void {
    this.bookPct = pct;
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    this.followerMode = false;
    this.clearTimers();
    if (this.cursor) {
      this.cursor.style.display = "none";
      this.cursor.style.transition = "none";
    }
    if (this.container) {
      this.container.removeEventListener("wheel", this.handleWheel);
      this.container.removeEventListener("touchmove", this.handleWheel);
    }
    this.container = null;
    this.cursor = null;
    this.lines = [];
  }

  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.clearTimers();
    if (this.cursor) {
      const computed = getComputedStyle(this.cursor);
      const currentWidth = computed.width;
      this.cursor.style.transition = "none";
      this.cursor.style.width = currentWidth;
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.manualScrollPaused = false;
    if (this.followerMode) return;
    this.animateLine();
  }

  setWpm(wpm: number): void {
    this.wpm = wpm;
    if (this.running && !this.paused && !this.followerMode) {
      this.clearTimers();
      this.animateLine();
    }
  }

  setFollowerMode(enabled: boolean): void {
    if (!this.running) {
      this.followerMode = enabled;
      return;
    }
    if (enabled) {
      this.clearTimers();
      this.manualScrollPaused = false;
      this.followerMode = true;
      if (this.cursor) {
        this.cursor.style.transition = "none";
      }
      return;
    }
    const wasFollower = this.followerMode;
    this.followerMode = false;
    if (wasFollower && !this.paused) {
      this.animateLine();
    }
  }

  jumpToWord(wordIndex: number): void {
    this.wordIndex = wordIndex;
    if (!this.running) return;
    if (this.followerMode) {
      this.followWord(wordIndex);
      return;
    }
    this.clearTimers();
    this.lineIdx = this.findLineForWord(wordIndex);
    this.scrollToLine(this.lineIdx);
    if (!this.paused) {
      setTimeout(() => this.animateLine(), FLOW_LINE_ADVANCE_BUFFER_MS);
    }
  }

  followWord(wordIndex: number): void {
    if (!this.running || !this.followerMode || !this.cursor) return;

    const lineIdx = this.findLineForWord(wordIndex);
    const line = this.lines[lineIdx];
    if (!line) return;

    const lineChanged = lineIdx !== this.lineIdx;
    this.lineIdx = lineIdx;
    this.wordIndex = wordIndex;
    this.scrollToLine(lineIdx, true);

    const lineWidth = Math.max(line.right - line.left, 1);
    const fraction = Math.max(
      0,
      Math.min(1, (wordIndex - line.firstWord) / Math.max(1, line.lastWord - line.firstWord))
    );
    const width = Math.max(1, lineWidth * (1 - fraction));

    this.cursor.style.transition = "none";
    this.cursor.style.left = line.left + "px";
    this.cursor.style.top = line.bottom + "px";
    this.cursor.style.width = width + "px";
    this.cursor.style.display = "block";

    this.callbacks.onWordAdvance(wordIndex);
    if (lineChanged) {
      this.callbacks.onLineChange?.(lineIdx, line);
    }
    this.callbacks.onProgressUpdate?.(this.getProgress());
  }

  jumpToLine(direction: "prev" | "next"): void {
    if (!this.running) return;
    this.clearTimers();
    if (direction === "prev" && this.lineIdx > 0) this.lineIdx--;
    else if (direction === "next" && this.lineIdx < this.lines.length - 1) this.lineIdx++;
    const line = this.lines[this.lineIdx];
    if (line) {
      this.wordIndex = line.firstWord;
      this.callbacks.onWordAdvance(this.wordIndex);
      this.callbacks.onLineChange?.(this.lineIdx, line);
      this.scrollToLine(this.lineIdx);
    }
    if (!this.paused) {
      setTimeout(() => this.animateLine(), FLOW_LINE_ADVANCE_BUFFER_MS);
    }
  }

  jumpToParagraph(direction: "prev" | "next"): void {
    if (!this.running || this.paragraphBreaks.size === 0) return;
    this.clearTimers();
    const breaks = Array.from(this.paragraphBreaks).sort((a, b) => a - b);
    let targetWord: number;
    if (direction === "next") {
      const nextBreak = breaks.find(b => b > this.wordIndex);
      targetWord = nextBreak !== undefined ? nextBreak + 1 : this.wordIndex;
    } else {
      const prevBreaks = breaks.filter(b => b < this.wordIndex);
      if (prevBreaks.length >= 2) targetWord = prevBreaks[prevBreaks.length - 2] + 1;
      else if (prevBreaks.length === 1) targetWord = 0;
      else targetWord = 0;
    }
    this.wordIndex = targetWord;
    this.lineIdx = this.findLineForWord(targetWord);
    this.callbacks.onWordAdvance(this.wordIndex);
    this.scrollToLine(this.lineIdx);
    if (!this.paused) {
      setTimeout(() => this.animateLine(), FLOW_LINE_ADVANCE_BUFFER_MS);
    }
  }

  getState(): FlowScrollEngineState {
    return {
      running: this.running,
      paused: this.paused,
      followerMode: this.followerMode,
      lineIndex: this.lineIdx,
      wordIndex: this.wordIndex,
      totalLines: this.lines.length,
    };
  }

  getWordIndex(): number { return this.wordIndex; }

  getProgress(): FlowProgress {
    const totalWords = this.totalWords || (this.lines.length > 0 ? this.lines[this.lines.length - 1].lastWord + 1 : 0);
    const wordsLeft = Math.max(0, totalWords - this.wordIndex);
    const estimatedMinutesLeft = this.wpm > 0 ? wordsLeft / this.wpm : 0;
    return {
      lineIndex: this.lineIdx,
      totalLines: this.lines.length,
      wordIndex: this.wordIndex,
      totalWords,
      estimatedMinutesLeft,
      bookPct: this.bookPct,
    };
  }

  rebuildLineMap(): void {
    this.lines = this.buildLineMap();
    if (this.lines.length > 0) this.lineIdx = this.findLineForWord(this.wordIndex);
  }

  destroy(): void { this.stop(); }

  // -- Internal --

  buildLineMap(): LineInfo[] {
    if (!this.container) return [];
    const wordEls = this.getWordElements();
    if (wordEls.length === 0) return [];
    const cRect = this.container.getBoundingClientRect();
    const lines: LineInfo[] = [];
    let cur: LineInfo | null = null;

    wordEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const idx = parseInt(el.getAttribute("data-word-index") || "0", 10);
      const top = rect.top - cRect.top + this.container!.scrollTop;
      const bottom = rect.bottom - cRect.top + this.container!.scrollTop;
      const left = rect.left - cRect.left + this.container!.scrollLeft;
      const right = rect.right - cRect.left + this.container!.scrollLeft;

      if (!cur || Math.abs(top - cur.y) > rect.height * 0.5) {
        cur = { y: top, bottom, left, right, firstWord: idx, lastWord: idx, wordCount: 1 };
        lines.push(cur);
      } else {
        cur.right = right;
        cur.bottom = Math.max(cur.bottom, bottom);
        cur.lastWord = idx;
        cur.wordCount++;
      }
    });
    return lines;
  }

  private getWordElements(): Element[] {
    if (!this.container) return [];

    const provider = (this.container as FlowRenderedWordRootHost)[
      FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY
    ];
    if (typeof provider === "function") {
      const renderedRoots = provider()
        .filter((entry) => entry?.root && entry.ready !== false)
        .sort((a, b) => {
          const sectionA = typeof a.sectionIndex === "number" ? a.sectionIndex : Number.MAX_SAFE_INTEGER;
          const sectionB = typeof b.sectionIndex === "number" ? b.sectionIndex : Number.MAX_SAFE_INTEGER;
          return sectionA - sectionB;
        });

      const providerWordEls: Element[] = [];
      for (const entry of renderedRoots) {
        try {
          providerWordEls.push(...Array.from(entry.root.querySelectorAll("[data-word-index]")));
        } catch {
          // Ignore detached roots; Foliate readiness provider is allowed to race section churn.
        }
      }
      return providerWordEls;
    }

    const directWordEls = Array.from(this.container.querySelectorAll("[data-word-index]"));
    if (directWordEls.length > 0) return directWordEls;

    const iframeWordEls: Element[] = [];
    const iframes = Array.from(this.container.querySelectorAll("iframe"));
    for (const iframe of iframes) {
      try {
        const doc = (iframe as HTMLIFrameElement).contentDocument;
        if (!doc) continue;
        iframeWordEls.push(...Array.from(doc.querySelectorAll("[data-word-index]")));
      } catch {
        // Ignore detached or inaccessible iframe content while building the line map.
      }
    }

    return iframeWordEls;
  }

  private findLineForWord(wordIndex: number): number {
    for (let i = 0; i < this.lines.length; i++) {
      if (wordIndex >= this.lines[i].firstWord && wordIndex <= this.lines[i].lastWord) return i;
    }
    if (this.lines.length > 0 && wordIndex > this.lines[this.lines.length - 1].lastWord) return this.lines.length - 1;
    return 0;
  }

  private animateLine(): void {
    if (!this.running || this.paused || this.followerMode || !this.cursor || !this.container) return;
    if (this.lineIdx >= this.lines.length) {
      this.running = false;
      this.callbacks.onComplete();
      return;
    }

    const line = this.lines[this.lineIdx];
    const lineWidth = Math.max(line.right - line.left, 1); // Guard against zero-width lines
    const duration = Math.max((line.wordCount / this.wpm) * 60000, 50); // Minimum 50ms per line

    this.wordIndex = line.firstWord;
    this.callbacks.onWordAdvance(this.wordIndex);
    this.callbacks.onLineChange?.(this.lineIdx, line);
    this.callbacks.onProgressUpdate?.(this.getProgress());

    // Position cursor at full width under the line, instantly
    this.cursor.style.transition = "none";
    this.cursor.style.left = line.left + "px";
    this.cursor.style.top = line.bottom + "px";
    this.cursor.style.width = lineWidth + "px";
    this.cursor.style.display = "block";

    // LL-015: Force reflow before applying transition
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.cursor.offsetWidth;

    if (this.isEink) {
      this.cursor.style.transition = "none";
    } else {
      this.cursor.style.transition = "width " + duration + "ms linear";
    }

    // Shrink from full width to 0 (left-to-right contraction)
    this.cursor.style.width = "0px";

    this.lineTimer = setTimeout(() => {
      this.wordIndex = line.lastWord;
      this.callbacks.onWordAdvance(this.wordIndex);
      this.lineIdx++;

      if (this.lineIdx >= this.lines.length) {
        this.running = false;
        if (this.cursor) this.cursor.style.display = "none";
        this.callbacks.onComplete();
        return;
      }

      // FLOW-INF-B: Line-completion flash — brief opacity pulse for visual rhythm
      if (!this.isEink && this.cursor) {
        this.cursor.style.opacity = "0.4";
        setTimeout(() => {
          if (this.cursor) this.cursor.style.opacity = "1";
          this.scrollToLine(this.lineIdx);
          setTimeout(() => {
            if (this.running && !this.paused) this.animateLine();
          }, FLOW_LINE_ADVANCE_BUFFER_MS);
        }, FLOW_LINE_COMPLETE_FLASH_MS);
      } else {
        this.scrollToLine(this.lineIdx);
        setTimeout(() => {
          if (this.running && !this.paused) this.animateLine();
        }, FLOW_LINE_ADVANCE_BUFFER_MS);
      }
    }, duration);
  }

  private scrollToLine(lineIdx: number, instant = false): void {
    if (!this.container || lineIdx >= this.lines.length) return;
    const line = this.lines[lineIdx];
    const containerHeight = this.container.clientHeight;
    const targetScrollTop = line.y - (containerHeight * this.zonePosition);

    if (this.isEink || instant) {
      // STAB-1A (BUG-165): Initial scroll uses instant behavior — no smooth animation delay
      this.container.scrollTop = Math.max(0, targetScrollTop);
    } else {
      this.container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
    }
  }

  private handleWheel = (): void => {
    if (!this.running || this.paused || this.followerMode) return;
    if (!this.manualScrollPaused) {
      this.manualScrollPaused = true;
      this.clearTimers();
      if (this.cursor) {
        const computed = getComputedStyle(this.cursor);
        const currentWidth = computed.width;
        this.cursor.style.transition = "none";
        this.cursor.style.width = currentWidth;
      }
    }
    if (this.scrollResumeTimer) clearTimeout(this.scrollResumeTimer);
    this.scrollResumeTimer = setTimeout(() => {
      this.manualScrollPaused = false;
      this.scrollResumeTimer = null;
      if (this.running && !this.paused) this.animateLine();
    }, FLOW_SCROLL_RESUME_DELAY_MS);
  };

  private clearTimers(): void {
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.scrollResumeTimer) { clearTimeout(this.scrollResumeTimer); this.scrollResumeTimer = null; }
  }
}
