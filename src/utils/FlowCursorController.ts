import { FLOW_PAGE_TURN_PAUSE_MS } from "../constants";

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
  private ownsCursor = false;
  private options: FlowCursorOptions;

  constructor(options: FlowCursorOptions) {
    this.options = options;
  }

  /**
   * Start the flow cursor. If cursorEl is provided (React-owned div), use it
   * instead of creating a new DOM element — prevents orphaning on re-render.
   */
  start(wordIndex: number, wpm: number, cursorEl?: HTMLElement): void {
    this.stop();
    this.wordIndex = wordIndex;
    this.wpm = wpm;
    this.running = true;

    this.container = document.querySelector(".page-reader-content") as HTMLElement;
    if (!this.container) return;

    if (cursorEl) {
      // React-owned element — just style it, don't create/destroy
      this.cursor = cursorEl as HTMLDivElement;
      const isUnderline = this.options.cursorStyle === "underline";
      this.cursor.className = "flow-highlight-cursor" + (isUnderline ? "" : " flow-highlight-cursor--box");
      this.cursor.style.display = "none";
      this.ownsCursor = false;
    } else {
      // Fallback: controller creates its own div
      this.cursor = document.createElement("div");
      const isUnderline = this.options.cursorStyle === "underline";
      this.cursor.className = "flow-highlight-cursor" + (isUnderline ? "" : " flow-highlight-cursor--box");
      this.cursor.style.display = "none";
      this.container.appendChild(this.cursor);
      this.ownsCursor = true;
    }

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

  stop(): number {
    this.running = false;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.cursor) {
      if (this.ownsCursor && this.cursor.parentNode) {
        this.cursor.parentNode.removeChild(this.cursor);
      } else {
        // React-owned: just hide it, don't remove from DOM
        this.cursor.style.display = "none";
        this.cursor.style.transition = "none";
      }
    }
    this.cursor = null;
    this.container = null;
    this.ownsCursor = false;
    this.lines = [];
    return this.wordIndex;
  }

  setWpm(wpm: number): void {
    this.wpm = wpm;
    if (!this.running) return;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    this.lines = this.buildLineMap();
    if (this.lines.length > 0 && this.lineIdx < this.lines.length) {
      this.slideLine();
    }
  }

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

  /** Jump to start of previous line and resume sliding */
  prevLine(): void {
    if (!this.running) return;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.lineIdx > 0) {
      this.lineIdx--;
    }
    this.wordIndex = this.lines[this.lineIdx]?.firstWord ?? this.wordIndex;
    this.slideLine();
  }

  /** Jump to start of next line and resume sliding */
  nextLine(): void {
    if (!this.running) return;
    if (this.lineTimer) { clearTimeout(this.lineTimer); this.lineTimer = null; }
    if (this.lineIdx < this.lines.length - 1) {
      this.lineIdx++;
      this.wordIndex = this.lines[this.lineIdx].firstWord;
      this.slideLine();
    }
    // At last line — let slideLine's end-of-page logic handle page turn
  }

  isRunning(): boolean { return this.running; }
  getWordIndex(): number { return this.wordIndex; }

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
    const barWidth = 120;
    const y = isUnderline ? line.bottom : line.y;
    const h = isUnderline ? 3 : (line.bottom - line.y);
    const duration = (line.wordCount / this.wpm) * 60000;

    // Position at line start instantly
    this.cursor.style.transition = "none";
    this.cursor.style.transform = `translate3d(${line.left}px, ${y}px, 0)`;
    this.cursor.style.width = `${barWidth}px`;
    this.cursor.style.height = `${h}px`;
    this.cursor.style.display = "";

    this.wordIndex = line.firstWord;

    // Force reflow then start transition
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.cursor.offsetWidth;
    this.cursor.style.transition = `transform ${duration}ms linear`;
    this.cursor.style.transform = `translate3d(${line.right - barWidth}px, ${y}px, 0)`;

    this.lineTimer = setTimeout(() => {
      this.wordIndex = line.lastWord;
      this.lineIdx++;

      if (this.lineIdx >= this.lines.length) {
        const nextPageIdx = this.options.getCurrentPageIdx() + 1;
        if (nextPageIdx < this.options.getPageCount()) {
          this.options.onPageTurn(nextPageIdx);
          // Brief pause, then wait for React to render the new page's words
          setTimeout(() => {
            this.container = document.querySelector(".page-reader-content") as HTMLElement;
            if (this.cursor && this.container) {
              if (this.ownsCursor && !this.container.contains(this.cursor)) {
                this.container.appendChild(this.cursor);
              }
            }
            // Retry buildLineMap until words appear (React may still be rendering)
            const tryResume = (attempts: number) => {
              this.lines = this.buildLineMap();
              if (this.lines.length > 0) {
                this.lineIdx = 0;
                this.slideLine();
              } else if (attempts > 0) {
                setTimeout(() => tryResume(attempts - 1), 50);
              }
            };
            tryResume(5);
          }, FLOW_PAGE_TURN_PAUSE_MS);
        }
        return;
      }

      this.slideLine();
    }, duration);
  }
}
