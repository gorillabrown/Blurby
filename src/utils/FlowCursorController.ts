import { PAGE_TRANSITION_MS, FLOW_PAGE_TURN_PAUSE_MS } from "../constants";

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

  start(wordIndex: number, wpm: number): void {
    this.stop();
    this.wordIndex = wordIndex;
    this.wpm = wpm;
    this.running = true;

    this.container = document.querySelector(".page-reader-content") as HTMLElement;
    if (!this.container) return;

    this.cursor = document.createElement("div");
    const isUnderline = this.options.cursorStyle === "underline";
    this.cursor.className = "flow-highlight-cursor" + (isUnderline ? "" : " flow-highlight-cursor--box");
    this.cursor.style.display = "none";
    this.container.appendChild(this.cursor);

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
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }
    this.cursor = null;
    this.container = null;
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
    const barWidth = 40;
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
        return;
      }

      this.slideLine();
    }, duration);
  }
}
