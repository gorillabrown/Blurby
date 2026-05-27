import type {
  ReaderModeAdapter,
  ReaderModeId,
  ReaderModeStartRequest,
  ReaderModeRuntimeSnapshot,
} from "./ReaderModeAdapter";
import { FlowMode } from "../../modes/FlowMode";
import type { ModeConfig } from "../../modes/ModeInterface";
import type { SurfaceCommand } from "../surface/SurfaceCommand";

export interface FlowSectionMeta {
  sections: Array<{ sectionIndex: number; startWordIdx: number }>;
  totalWords: number;
}

export type FlowCompletionAction =
  | { action: "section-handoff"; sectionIndex: number; startWordIdx: number }
  | { action: "complete" };

export interface FlowModeAdapterConfig {
  wpm: number;
  isFoliate: boolean;
  settings: {
    rhythmPauses?: any;
    flowCursorStyle?: string;
  };
  onWordAdvance?: (wordIndex: number) => void;
  onComplete?: () => void;
  onSurfaceCommand?: (cmd: SurfaceCommand) => void;
  onBrowseAway?: () => void;
}

export class FlowModeAdapter implements ReaderModeAdapter {
  readonly mode: ReaderModeId = "flow";

  private instance: FlowMode | null = null;
  private _selected = false;
  private _playing = false;
  private _currentWordIndex = 0;
  private _browsedAway = false;
  private config: FlowModeAdapterConfig;
  private _sectionMeta: FlowSectionMeta | null = null;

  constructor(config: FlowModeAdapterConfig) {
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
    this._browsedAway = false;
    this._currentWordIndex = request.wordIndex;

    const modeConfig: ModeConfig = {
      words: request.words,
      wpm: this.config.wpm,
      callbacks: {
        onWordAdvance: (idx: number) => {
          this._currentWordIndex = idx;
          if (this._playing) {
            this.config.onWordAdvance?.(idx);
            this.config.onSurfaceCommand?.({
              kind: "highlight",
              wordIndex: idx,
              mode: "flow",
              allowMotion: false,
            });
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
        flowCursorStyle: this.config.settings.flowCursorStyle,
      },
    };

    this.instance = new FlowMode(modeConfig);
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
      this._browsedAway = false;
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
    this._browsedAway = false;
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
      mode: "flow",
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
    this._browsedAway = false;
    this.config.onSurfaceCommand?.({ kind: "clear", mode: "flow" });
  }

  // ── Flow-specific: section handoff ──────────────────────────────

  setSectionMeta(meta: FlowSectionMeta | null): void {
    this._sectionMeta = meta;
  }

  resolveCompletion(currentWordIndex: number): FlowCompletionAction {
    if (!this._sectionMeta) return { action: "complete" };
    const { sections, totalWords } = this._sectionMeta;
    const nextSection = sections.find(s => s.startWordIdx > currentWordIndex);
    if (nextSection && currentWordIndex < totalWords - 1) {
      return {
        action: "section-handoff",
        sectionIndex: nextSection.sectionIndex,
        startWordIdx: nextSection.startWordIdx,
      };
    }
    return { action: "complete" };
  }

  // ── Flow-specific: browse-away ──────────────────────────────────

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
}
