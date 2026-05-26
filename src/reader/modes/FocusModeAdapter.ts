import type {
  ReaderModeAdapter,
  ReaderModeId,
  ReaderModeStartRequest,
  ReaderModeRuntimeSnapshot,
} from "./ReaderModeAdapter";
import { FocusMode } from "../../modes/FocusMode";
import type { ModeConfig } from "../../modes/ModeInterface";

export interface FocusModeAdapterConfig {
  wpm: number;
  isFoliate: boolean;
  settings: {
    rhythmPauses?: any;
    focusSpan?: number;
    focusMarks?: boolean;
  };
  onWordAdvance?: (wordIndex: number) => void;
  onComplete?: () => void;
}

export class FocusModeAdapter implements ReaderModeAdapter {
  readonly mode: ReaderModeId = "focus";

  private instance: FocusMode | null = null;
  private _selected = false;
  private _playing = false;
  private _currentWordIndex = 0;
  private config: FocusModeAdapterConfig;

  constructor(config: FocusModeAdapterConfig) {
    this.config = config;
  }

  select(wordIndex: number): void {
    this._selected = true;
    this._currentWordIndex = wordIndex;
  }

  start(request: ReaderModeStartRequest): void {
    if (this.instance) {
      this.instance.destroy();
    }

    this._selected = true;
    this._playing = true;
    this._currentWordIndex = request.wordIndex;

    const modeConfig: ModeConfig = {
      words: request.words,
      wpm: this.config.wpm,
      callbacks: {
        onWordAdvance: (idx: number) => {
          this._currentWordIndex = idx;
          if (this._playing) {
            this.config.onWordAdvance?.(idx);
          }
        },
        onPageTurn: () => {},
        onComplete: () => {
          this._playing = false;
          this.config.onComplete?.();
        },
        onError: () => {},
      },
      isFoliate: this.config.isFoliate,
      paragraphBreaks: request.paragraphBreaks,
      settings: {
        rhythmPauses: this.config.settings.rhythmPauses,
        focusSpan: this.config.settings.focusSpan,
        focusMarks: this.config.settings.focusMarks,
      },
    };

    this.instance = new FocusMode(modeConfig);
    this.instance.start(request.wordIndex);
  }

  pause(): void {
    if (this.instance && this._playing) {
      this.instance.pause();
      this._playing = false;
    }
  }

  resume(): void {
    if (this.instance && !this._playing && this._selected) {
      this.instance.resume();
      this._playing = true;
    }
  }

  stop(
    _reason: "mode-switch" | "user-stop" | "book-close" | "teardown"
  ): void {
    if (this.instance) {
      this.instance.stop();
      this.instance.destroy();
      this.instance = null;
    }
    this._playing = false;
    this._selected = false;
  }

  jumpToWord(
    wordIndex: number,
    _cause: "hard-selection" | "navigation" | "restore"
  ): void {
    this._currentWordIndex = wordIndex;
    if (this.instance) {
      this.instance.jumpTo(wordIndex);
    }
  }

  getSnapshot(): ReaderModeRuntimeSnapshot {
    return {
      mode: "focus",
      selected: this._selected,
      playing: this._playing,
      currentWordIndex: this._currentWordIndex,
      clockOwner: this._playing ? "wpm" : "none",
    };
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
    if (this.instance) {
      this.instance.setSpeed(wpm);
    }
  }

  destroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
    this._playing = false;
    this._selected = false;
  }
}
