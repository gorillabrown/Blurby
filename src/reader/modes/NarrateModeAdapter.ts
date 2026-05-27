import type {
  ReaderModeAdapter,
  ReaderModeId,
  ReaderModeStartRequest,
  ReaderModeRuntimeSnapshot,
} from "./ReaderModeAdapter";
import type { SurfaceCommand } from "../surface/SurfaceCommand";
import type { PauseReason } from "../../types/narration";

export interface NarrationBridge {
  startCursorDriven: (
    words: string[],
    startWordIndex: number,
    wpm: number,
    onWordAdvance: (wordIndex: number) => void,
  ) => "started" | "warming" | "error";
  pause: (reason?: PauseReason) => void;
  resume: (currentWordIndex?: number) => void;
  stop: (reason?: PauseReason) => void;
  setOnTruthSync?: (cb: ((wordIndex: number) => void) | null) => void;
  setPageEndWord: (idx: number | null) => void;
}

export interface NarrateModeAdapterConfig {
  wpm: number;
  isFoliate: boolean;
  narration: NarrationBridge;
  onWordAdvance?: (wordIndex: number) => void;
  onTruthSync?: (wordIndex: number) => void;
  onSurfaceCommand?: (cmd: SurfaceCommand) => void;
  onBrowseAway?: () => void;
  onStartResult?: (result: "started" | "warming" | "error") => void;
}

export type NarrateStartResult = "started" | "warming" | "error";

export class NarrateModeAdapter implements ReaderModeAdapter {
  readonly mode: ReaderModeId = "narrate";

  private _selected = false;
  private _playing = false;
  private _currentWordIndex = 0;
  private _browsedAway = false;
  private _truthSyncInstalled = false;
  private _lastStartResult: NarrateStartResult | null = null;
  private config: NarrateModeAdapterConfig;

  constructor(config: NarrateModeAdapterConfig) {
    this.config = config;
  }

  select(wordIndex: number): void {
    this._selected = true;
    this._currentWordIndex = wordIndex;
  }

  start(request: ReaderModeStartRequest): void {
    this._selected = true;
    this._playing = true;
    this._browsedAway = false;
    this._currentWordIndex = request.wordIndex;

    this.installTruthSync();

    const result = this.config.narration.startCursorDriven(
      request.words,
      request.wordIndex,
      this.config.wpm,
      (idx: number) => {
        this._currentWordIndex = idx;
        if (this._playing) {
          this.config.onWordAdvance?.(idx);
          this.config.onSurfaceCommand?.({
            kind: "highlight",
            wordIndex: idx,
            mode: "narrate",
            allowMotion: false,
          });
        }
      },
    );

    this._lastStartResult = result;
    if (result === "error") {
      this._playing = false;
    }
    this.config.onStartResult?.(result);
  }

  pause(): void {
    if (this._playing) {
      this.config.narration.pause("user-stop");
      this._playing = false;
    }
  }

  resume(): void {
    if (!this._playing && this._selected) {
      this.config.narration.resume(this._currentWordIndex);
      this._playing = true;
      this._browsedAway = false;
    }
  }

  stop(
    _reason: "mode-switch" | "user-stop" | "book-close" | "teardown",
  ): void {
    this.config.narration.stop(_reason === "mode-switch" ? "mode-switch" : "user-stop");
    this.clearTruthSync();
    this._playing = false;
    this._selected = false;
    this._browsedAway = false;
  }

  jumpToWord(
    wordIndex: number,
    _cause: "hard-selection" | "navigation" | "restore",
  ): void {
    this._currentWordIndex = wordIndex;
  }

  getSnapshot(): ReaderModeRuntimeSnapshot {
    return {
      mode: "narrate",
      selected: this._selected,
      playing: this._playing,
      currentWordIndex: this._currentWordIndex,
      clockOwner: this._playing ? "audio-truth" : "none",
    };
  }

  destroy(): void {
    this.config.narration.stop("user-stop");
    this.clearTruthSync();
    this._playing = false;
    this._selected = false;
    this._browsedAway = false;
    this.config.onSurfaceCommand?.({ kind: "clear", mode: "narrate" });
  }

  // ── Narrate-specific: truth-sync lifecycle ─────────────────────────

  private installTruthSync(): void {
    if (this._truthSyncInstalled) return;
    this.config.narration.setOnTruthSync?.((wordIndex: number) => {
      if (this._playing) {
        this._currentWordIndex = wordIndex;
        this.config.onTruthSync?.(wordIndex);
      }
    });
    this._truthSyncInstalled = true;
  }

  private clearTruthSync(): void {
    if (!this._truthSyncInstalled) return;
    this.config.narration.setOnTruthSync?.(null);
    this._truthSyncInstalled = false;
  }

  get truthSyncInstalled(): boolean {
    return this._truthSyncInstalled;
  }

  // ── Narrate-specific: browse-away ──────────────────────────────────

  notifyBrowseAway(): void {
    if (this._playing) {
      this._browsedAway = true;
      this.pause();
      this.config.onBrowseAway?.();
    }
  }

  clearBrowseAway(): void {
    this._browsedAway = false;
  }

  get browsedAway(): boolean {
    return this._browsedAway;
  }

  // ── Narrate-specific: start result ─────────────────────────────────

  get lastStartResult(): NarrateStartResult | null {
    return this._lastStartResult;
  }
}
