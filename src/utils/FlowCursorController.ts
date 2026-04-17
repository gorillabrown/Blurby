interface FlowCursorControllerOpts {
  cursorStyle: "underline" | "highlight";
  onPageTurn: (nextIdx: number) => void;
  getPageCount: () => number;
  getCurrentPageIdx: () => number;
}

/**
 * Legacy PageReaderView flow controller shim.
 * Keeps page-local flow playback functional for old renderer paths.
 */
export class FlowCursorController {
  private readonly opts: FlowCursorControllerOpts;
  private running = false;
  private currentWord = 0;
  private wpm = 300;
  private cursorEl: HTMLDivElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: FlowCursorControllerOpts) {
    this.opts = opts;
  }

  start(startWord: number, wpm: number, cursorEl: HTMLDivElement): void {
    this.stop();
    this.currentWord = startWord;
    this.wpm = wpm;
    this.cursorEl = cursorEl;
    this.running = true;
    this.cursorEl.style.opacity = "1";
    this.scheduleTick();
  }

  stop(): number {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.cursorEl) this.cursorEl.style.opacity = "0";
    return this.currentWord;
  }

  isRunning(): boolean {
    return this.running;
  }

  setWpm(wpm: number): void {
    this.wpm = Math.max(1, wpm);
    if (this.running) {
      if (this.timer) clearTimeout(this.timer);
      this.scheduleTick();
    }
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = Math.max(0, wordIndex);
  }

  prevLine(): void {
    this.currentWord = Math.max(0, this.currentWord - 5);
  }

  nextLine(): void {
    this.currentWord += 5;
  }

  private scheduleTick(): void {
    if (!this.running) return;
    const delay = Math.max(20, Math.round(60000 / Math.max(1, this.wpm)));
    this.timer = setTimeout(() => {
      if (!this.running) return;
      this.currentWord += 1;
      // Conservative page advance signal for legacy view.
      const pageCount = this.opts.getPageCount();
      const currentPage = this.opts.getCurrentPageIdx();
      if (pageCount > 0 && currentPage < pageCount - 1 && this.currentWord % 120 === 0) {
        this.opts.onPageTurn(currentPage + 1);
      }
      this.scheduleTick();
    }, delay);
  }
}

