/**
 * FlowScrollEngine -- Imperative scroll + shrinking-underline cursor for Flow Mode.
 *
 * Replaces FlowCursorController for FLOW-3A (infinite scroll).
 * Architecture: plain TypeScript class (per LL-014). React only calls start/stop.
 * LL-015: Uses forced reflow (offsetWidth) between transition:none and new transition.
 * LL-016: All state is internal (no React state), passed via refs.
 */

import {
  FLOW_ZONE_INITIAL_TOP,
  FLOW_ZONE_RESET_THRESHOLD,
  FLOW_ZONE_LINES_DEFAULT,
  FLOW_CURSOR_HEIGHT_PX,
  FLOW_CURSOR_EINK_HEIGHT_PX,
  FLOW_TIMER_BAR_HEIGHT_PX,
  FLOW_TIMER_BAR_EINK_HEIGHT_PX,
  FLOW_SCROLL_RESUME_DELAY_MS,
  FLOW_LINE_ADVANCE_BUFFER_MS,
  FLOW_LINE_COMPLETE_FLASH_MS,
  EINK_LINES_PER_PAGE,
} from "../constants";
import type { ReadingChunk } from "../types/chunkReading";

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
  onChunkChange?: (chunk: ReadingChunk) => void;
  onUserBrowseAway?: () => void;
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
  // FLOW-ZONE-AUTO: descending reading zone — the zone walks down the page as
  // words advance, then a page-jump resets it to the top.
  private initialZoneTop: number = FLOW_ZONE_INITIAL_TOP;
  private zoneResetThreshold: number = FLOW_ZONE_RESET_THRESHOLD;
  private currentZoneTopFrac: number = FLOW_ZONE_INITIAL_TOP;
  private zoneHeightFrac = 0;
  private zoneLines: number = FLOW_ZONE_LINES_DEFAULT;
  private onZoneTopChange: ((topFrac: number) => void) | null = null;
  private stableWindowScroll = false;
  private totalWords = 0;
  private bookPct = 0;
  private chunks: ReadingChunk[] = [];
  private activeChunkId: string | null = null;

  constructor(callbacks: FlowScrollEngineCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Convert a line position measured in the scroll container's content-space
   * into the cursor element's absolute positioning space.
   */
  private mapContainerPointToCursorSpace(left: number, top: number): { left: number; top: number } {
    if (!this.container || !this.cursor) return { left, top };
    const offsetParent = this.cursor.offsetParent as HTMLElement | null;
    if (!offsetParent) return { left, top };

    const containerRect = this.container.getBoundingClientRect();
    const parentRect = offsetParent.getBoundingClientRect();

    return {
      left: (left - this.container.scrollLeft) + (containerRect.left - parentRect.left),
      top: (top - this.container.scrollTop) + (containerRect.top - parentRect.top),
    };
  }

  start(
    container: HTMLElement,
    cursorEl: HTMLDivElement,
    wordIndex: number,
    wpm: number,
    paragraphBreaks: Set<number> = new Set(),
    isEink = false,
    zoneLines?: number,
    onZoneTopChange?: (topFrac: number) => void,
    stableWindowScroll = false,
  ): void {
    this.stop();
    this.container = container;
    this.cursor = cursorEl;
    this.wordIndex = wordIndex;
    this.wpm = wpm;
    this.paragraphBreaks = paragraphBreaks;
    this.isEink = isEink;
    this.zoneLines = zoneLines !== undefined && zoneLines > 0 ? zoneLines : FLOW_ZONE_LINES_DEFAULT;
    this.onZoneTopChange = onZoneTopChange ?? null;
    this.stableWindowScroll = stableWindowScroll;
    this.currentZoneTopFrac = this.initialZoneTop;
    this.computeZoneHeightFrac();
    this.running = true;
    this.paused = false;
    this.manualScrollPaused = false;
    this.followerMode = false;
    this.activeChunkId = null;

    // Flow mode always shows the timer cursor. Narrate follower mode can choose
    // chunk-only visuals, but that path is gated by followerMode below.
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
          this.scrollActiveChunkOrLine(wordIndex, true);
          this.emitChunkChangeForWord(wordIndex);
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
    this.scrollActiveChunkOrLine(wordIndex, true);
    this.emitChunkChangeForWord(wordIndex);

    setTimeout(() => {
      if (this.running && !this.paused) this.animateLine();
    }, FLOW_LINE_ADVANCE_BUFFER_MS);

    this.container.addEventListener("wheel", this.handleWheel, { passive: true });
    this.container.addEventListener("touchmove", this.handleWheel, { passive: true });
  }

  /** FLOW-ZONE-AUTO: current zone height as a fraction of viewport height. */
  getZoneHeightFrac(): number {
    return this.zoneHeightFrac;
  }

  setTotalWords(total: number): void {
    this.totalWords = total;
  }

  setBookProgress(pct: number): void {
    this.bookPct = pct;
  }

  setChunks(chunks: ReadingChunk[]): void {
    this.chunks = chunks;
    this.activeChunkId = null;
    if (!this.running) return;
    this.emitChunkChangeForWord(this.wordIndex);
    if (this.cursor && this.followerMode && this.hasChunkVisualState()) {
      this.cursor.style.display = "none";
      this.cursor.style.transition = "none";
      this.cursor.style.width = "";
    }
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
    this.activeChunkId = null;
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
    this.scrollActiveChunkOrLine(wordIndex);
    this.emitChunkChangeForWord(wordIndex);
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
    this.emitChunkChangeForWord(wordIndex);
    this.advanceZone(lineIdx);

    const lineWidth = Math.max(line.right - line.left, 1);
    const fraction = Math.max(
      0,
      Math.min(1, (wordIndex - line.firstWord) / Math.max(1, line.lastWord - line.firstWord))
    );
    const width = Math.max(1, lineWidth * (1 - fraction));

    const mapped = this.mapContainerPointToCursorSpace(line.left, line.bottom);
    this.cursor.style.transition = "none";
    this.cursor.style.left = mapped.left + "px";
    this.cursor.style.top = mapped.top + "px";
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
      this.emitChunkChangeForWord(this.wordIndex);
      this.callbacks.onLineChange?.(this.lineIdx, line);
      this.scrollActiveChunkOrLine(this.wordIndex);
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
    this.emitChunkChangeForWord(this.wordIndex);
    this.scrollActiveChunkOrLine(this.wordIndex);
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

  getActiveChunk(): ReadingChunk | null {
    return this.findChunkForWord(this.wordIndex);
  }

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
      bookPct: totalWords > 0 ? this.wordIndex / totalWords : this.bookPct,
    };
  }

  rebuildLineMap(): void {
    this.lines = this.buildLineMap();
    this.computeZoneHeightFrac();
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

    const iframeOffsetCache = new Map<Document, { top: number; left: number }>();
    const getIframeOffset = (el: Element): { top: number; left: number } => {
      const elDoc = el.ownerDocument;
      if (!elDoc || elDoc === this.container!.ownerDocument) return { top: 0, left: 0 };
      const cached = iframeOffsetCache.get(elDoc);
      if (cached) return cached;
      const iframe = elDoc.defaultView?.frameElement as HTMLElement | null;
      if (!iframe) {
        iframeOffsetCache.set(elDoc, { top: 0, left: 0 });
        return { top: 0, left: 0 };
      }
      const iRect = iframe.getBoundingClientRect();
      const offset = { top: iRect.top, left: iRect.left };
      iframeOffsetCache.set(elDoc, offset);
      return offset;
    };

    wordEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const idx = parseInt(el.getAttribute("data-word-index") || "0", 10);
      const ifOff = getIframeOffset(el);
      const top = rect.top + ifOff.top - cRect.top + this.container!.scrollTop;
      const bottom = rect.bottom + ifOff.top - cRect.top + this.container!.scrollTop;
      const left = rect.left + ifOff.left - cRect.left + this.container!.scrollLeft;
      const right = rect.right + ifOff.left - cRect.left + this.container!.scrollLeft;

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

  private getWordElementByIndex(wordIndex: number): Element | null {
    if (!this.container) return null;
    const provider = (this.container as FlowRenderedWordRootHost)[FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY];
    if (typeof provider === "function") {
      for (const entry of provider().filter(e => e?.root && e.ready !== false)) {
        try {
          const el = entry.root.querySelector(`[data-word-index="${wordIndex}"]`);
          if (el) return el;
        } catch { /* ignore detached roots */ }
      }
      return null;
    }
    return this.container.querySelector(`[data-word-index="${wordIndex}"]`);
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

    if (this.followerMode && this.hasChunkVisualState()) {
      this.animateChunkVisualLine();
      return;
    }

    if (this.isEink) {
      this.animateEinkChunk();
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
    const mapped = this.mapContainerPointToCursorSpace(line.left, line.bottom);
    this.cursor.style.transition = "none";
    this.cursor.style.left = mapped.left + "px";
    this.cursor.style.top = mapped.top + "px";
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
          this.advanceZone(this.lineIdx);
          setTimeout(() => {
            if (this.running && !this.paused) this.animateLine();
          }, FLOW_LINE_ADVANCE_BUFFER_MS);
        }, FLOW_LINE_COMPLETE_FLASH_MS);
      } else {
        this.advanceZone(this.lineIdx);
        setTimeout(() => {
          if (this.running && !this.paused) this.animateLine();
        }, FLOW_LINE_ADVANCE_BUFFER_MS);
      }
    }, duration);
  }

  private animateChunkVisualLine(): void {
    if (!this.running || this.paused || this.followerMode || !this.container) return;
    if (this.lineIdx >= this.lines.length) {
      this.running = false;
      this.callbacks.onComplete();
      return;
    }

    const line = this.lines[this.lineIdx];
    this.callbacks.onLineChange?.(this.lineIdx, line);

    let currentWord = Math.max(this.wordIndex, line.firstWord);
    if (currentWord > line.lastWord) currentWord = line.firstWord;
    const msPerWord = Math.max(60000 / Math.max(this.wpm, 1), 50);

    const emitCurrentAndScheduleNext = () => {
      if (!this.running || this.paused || this.followerMode) return;
      if (currentWord > line.lastWord) {
        this.lineIdx++;
        if (this.lineIdx >= this.lines.length) {
          this.running = false;
          if (this.cursor) this.cursor.style.display = "none";
          this.callbacks.onComplete();
          return;
        }
        this.wordIndex = this.lines[this.lineIdx].firstWord;
        this.emitChunkChangeForWord(this.wordIndex);
        this.advanceZone(this.lineIdx);
        this.lineTimer = setTimeout(() => {
          if (this.running && !this.paused) this.animateLine();
        }, FLOW_LINE_ADVANCE_BUFFER_MS);
        return;
      }

      this.emitWordAdvance(currentWord);
      currentWord++;
      this.lineTimer = setTimeout(emitCurrentAndScheduleNext, msPerWord);
    };

    emitCurrentAndScheduleNext();
  }

  private animateEinkChunk(): void {
    if (!this.running || this.paused || this.followerMode || !this.cursor || !this.container) return;
    if (this.lineIdx >= this.lines.length) {
      this.running = false;
      this.callbacks.onComplete();
      return;
    }

    const startLineIdx = this.lineIdx;
    const endLineIdx = Math.min(this.lines.length - 1, startLineIdx + EINK_LINES_PER_PAGE - 1);
    const startLine = this.lines[startLineIdx];
    const endLine = this.lines[endLineIdx];
    const chunkWordCount = Math.max(1, endLine.lastWord - startLine.firstWord + 1);
    const duration = Math.max((chunkWordCount / this.wpm) * 60000, 50);
    const chunkLine: LineInfo = {
      y: startLine.y,
      bottom: endLine.bottom,
      left: Math.min(...this.lines.slice(startLineIdx, endLineIdx + 1).map(line => line.left)),
      right: Math.max(...this.lines.slice(startLineIdx, endLineIdx + 1).map(line => line.right)),
      firstWord: startLine.firstWord,
      lastWord: endLine.lastWord,
      wordCount: chunkWordCount,
    };

    this.wordIndex = startLine.firstWord;
    this.callbacks.onWordAdvance(this.wordIndex);
    this.callbacks.onLineChange?.(startLineIdx, chunkLine);
    this.callbacks.onProgressUpdate?.(this.getProgress());

    this.cursor.style.transition = "none";
    this.cursor.style.left = chunkLine.left + "px";
    this.cursor.style.top = chunkLine.bottom + "px";
    this.cursor.style.width = Math.max(chunkLine.right - chunkLine.left, 1) + "px";
    this.cursor.style.display = "block";

    this.lineTimer = setTimeout(() => {
      this.wordIndex = endLine.lastWord;
      this.callbacks.onWordAdvance(this.wordIndex);
      this.lineIdx = endLineIdx + 1;

      if (this.lineIdx >= this.lines.length) {
        this.running = false;
        if (this.cursor) this.cursor.style.display = "none";
        this.callbacks.onComplete();
        return;
      }

      this.advanceZone(this.lineIdx);
      setTimeout(() => {
        if (this.running && !this.paused) this.animateLine();
      }, FLOW_LINE_ADVANCE_BUFFER_MS);
    }, duration);
  }

  /**
   * FLOW-ZONE-AUTO: position the reading zone for the given line.
   *
   * The zone descends as words advance — the page stays still and only the
   * mask highlight walks downward. When the zone bottom would cross the lower-
   * third threshold (or the line scrolled above the viewport), the container
   * jump-scrolls so the line lands back at the initial zone top.
   *
   * `forceReset` always performs the jump (used on start/resume so the active
   * line lands cleanly at the top of the zone).
   */
  private advanceZone(lineIdx: number, forceReset = false): void {
    if (!this.container || lineIdx < 0 || lineIdx >= this.lines.length) return;
    const line = this.lines[lineIdx];
    const ch = this.container.clientHeight;
    if (ch <= 0) return;

    // Flow-only "wheel" mode: keep the reading window stationary and roll text
    // through it by continuously aligning the active line to the fixed zone top.
    // Narration follower mode keeps legacy behavior unchanged.
    if (this.stableWindowScroll && !this.followerMode) {
      const targetScrollTop = Math.max(0, line.y - (ch * this.initialZoneTop));
      if (Math.abs(this.container.scrollTop - targetScrollTop) > 0.5) {
        this.container.scrollTop = targetScrollTop;
      }
      this.currentZoneTopFrac = this.initialZoneTop;
      this.onZoneTopChange?.(this.currentZoneTopFrac);
      return;
    }

    const lineViewportFrac = (line.y - this.container.scrollTop) / ch;
    const zoneBotFrac = lineViewportFrac + this.zoneHeightFrac;
    const shouldJump = forceReset
      || zoneBotFrac > this.zoneResetThreshold
      || lineViewportFrac < 0;

    if (shouldJump) {
      const isContainerScrollable = this.container.scrollHeight > ch + 1
        || this.container.scrollHeight === 0;
      if (isContainerScrollable) {
        // Instant page-jump: place the line at the initial zone top.
        const newScrollTop = Math.max(0, line.y - ch * this.initialZoneTop);
        this.container.scrollTop = newScrollTop;
        this.currentZoneTopFrac = Math.min(this.initialZoneTop, (line.y - newScrollTop) / ch);
      } else {
        // Non-scrollable container (short Foliate section): scrollIntoView fallback.
        const wordEl = this.getWordElementByIndex(line.firstWord) as HTMLElement | null;
        wordEl?.scrollIntoView?.({ block: "start", behavior: "auto" });
        this.currentZoneTopFrac = this.initialZoneTop;
      }
    } else {
      // Zone descends — no scroll, just move the mask down to the line.
      this.currentZoneTopFrac = Math.max(0, lineViewportFrac);
    }
    this.onZoneTopChange?.(this.currentZoneTopFrac);
  }

  /** Recompute the zone height (in viewport fractions) from line height × zone lines. */
  private computeZoneHeightFrac(): void {
    if (!this.container) { this.zoneHeightFrac = 0; return; }
    const ch = this.container.clientHeight;
    if (ch <= 0) { this.zoneHeightFrac = 0; return; }
    const lineHeight = parseFloat(getComputedStyle(this.container).lineHeight) || 24;
    this.zoneHeightFrac = (lineHeight * this.zoneLines) / ch;
  }

  private scrollToWord(wordIndex: number, forceReset = false): void {
    this.advanceZone(this.findLineForWord(wordIndex), forceReset);
  }

  private scrollActiveChunkOrLine(wordIndex: number, forceReset = false): void {
    const chunk = this.findChunkForWord(wordIndex);
    if (chunk) {
      this.scrollToWord(chunk.startWordIndex, forceReset);
      return;
    }
    this.scrollToWord(wordIndex, forceReset);
  }

  private hasChunkVisualState(): boolean {
    return this.chunks.length > 0;
  }

  private findChunkForWord(wordIndex: number): ReadingChunk | null {
    return this.chunks.find((chunk) =>
      wordIndex >= chunk.startWordIndex && wordIndex < chunk.endWordIndex
    ) ?? null;
  }

  private emitWordAdvance(wordIndex: number): void {
    this.wordIndex = wordIndex;
    const chunkChanged = this.emitChunkChangeForWord(wordIndex);
    if (chunkChanged) {
      this.scrollActiveChunkOrLine(wordIndex);
    }
    this.callbacks.onWordAdvance(wordIndex);
    this.callbacks.onProgressUpdate?.(this.getProgress());
  }

  private emitChunkChangeForWord(wordIndex: number): boolean {
    const chunk = this.findChunkForWord(wordIndex);
    const nextChunkId = chunk?.id ?? null;
    if (nextChunkId === this.activeChunkId) return false;
    this.activeChunkId = nextChunkId;
    if (chunk) {
      this.callbacks.onChunkChange?.(chunk);
    }
    return true;
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
      this.callbacks.onUserBrowseAway?.();
    }
  };

  private clearTimers(): void {
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.scrollResumeTimer) { clearTimeout(this.scrollResumeTimer); this.scrollResumeTimer = null; }
  }
}
