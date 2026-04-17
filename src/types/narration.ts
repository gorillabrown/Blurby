import type { KokoroStatusSnapshot } from "../types";
import type { KokoroRatePlan } from "../utils/kokoroRatePlan";

// ── Book word array types (moved from bookWordExtractor.ts in HOTFIX-6) ──────

/** Section boundary in the book-wide word array */
export interface SectionBoundary {
  sectionIndex: number;
  startWordIdx: number;  // first word of this section in the global array
  endWordIdx: number;    // last word + 1
  wordCount: number;
}

/** Result of full-book word extraction */
export interface BookWordArray {
  words: string[];
  sections: SectionBoundary[];
  totalWords: number;
  complete: boolean;
}

/**
 * Find which section a global word index belongs to.
 */
export function findSectionForWord(sections: SectionBoundary[], globalWordIdx: number): SectionBoundary | null {
  for (const sec of sections) {
    if (globalWordIdx >= sec.startWordIdx && globalWordIdx < sec.endWordIdx) {
      return sec;
    }
  }
  return null;
}

/**
 * Convert a global word index to a section-local word index.
 */
export function globalToLocal(sections: SectionBoundary[], globalWordIdx: number): { sectionIndex: number; localIdx: number } | null {
  const sec = findSectionForWord(sections, globalWordIdx);
  if (!sec) return null;
  return { sectionIndex: sec.sectionIndex, localIdx: globalWordIdx - sec.startWordIdx };
}

// ── Narration state machine types ────────────────────────────────────────────

export type NarrationStatus = "idle" | "loading" | "speaking" | "paused" | "holding" | "error" | "warming";

export interface NarrationState {
  status: NarrationStatus;
  engine: "web" | "kokoro";
  chunkStart: number;
  chunkWords: string[];
  cursorWordIndex: number;
  kokoroReady: boolean;
  kokoroDownloading: boolean;
  kokoroDownloadProgress: number;
  kokoroStatus: KokoroStatusSnapshot;
  generationId: number;
  speed: number;
  pageEndWord: number | null;
}

export type NarrationAction =
  | { type: "START_CURSOR_DRIVEN"; startIdx: number; speed: number }
  | { type: "WORD_ADVANCE"; wordIndex: number }
  | { type: "CHUNK_COMPLETE"; endIdx: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "HOLD" }
  | { type: "RESUME_CHAINING" }
  | { type: "SET_ENGINE"; engine: "web" | "kokoro" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "INCREMENT_GENERATION_ID" }
  | { type: "KOKORO_READY" }
  | { type: "SYNC_KOKORO_STATUS"; snapshot: KokoroStatusSnapshot }
  | { type: "KOKORO_DOWNLOAD_PROGRESS"; progress: number }
  | { type: "SET_PAGE_END"; endIdx: number | null }
  | { type: "ERROR"; message: string }
  | { type: "KOKORO_WARMING"; startIdx: number; speed: number };

export function createInitialNarrationState(): NarrationState {
  return {
    status: "idle",
    engine: "web",
    chunkStart: 0,
    chunkWords: [],
    cursorWordIndex: 0,
    kokoroReady: false,
    kokoroDownloading: false,
    kokoroDownloadProgress: 0,
    kokoroStatus: {
      status: "idle",
      detail: null,
      reason: null,
      ready: false,
      loading: false,
      recoverable: false,
    },
    generationId: 0,
    speed: 1.0,
    pageEndWord: null,
  };
}

export function narrationReducer(state: NarrationState, action: NarrationAction): NarrationState {
  switch (action.type) {
    case "START_CURSOR_DRIVEN":
      return { ...state, status: "speaking", cursorWordIndex: action.startIdx, speed: action.speed, chunkStart: action.startIdx, chunkWords: [] };
    case "WORD_ADVANCE":
      return { ...state, cursorWordIndex: action.wordIndex };
    case "CHUNK_COMPLETE":
      return { ...state, cursorWordIndex: action.endIdx };
    case "PAUSE":
      return state.status === "speaking" ? { ...state, status: "paused" } : state;
    case "RESUME":
      return (state.status === "paused" || state.status === "holding") ? { ...state, status: "speaking" } : state;
    case "STOP":
      return { ...state, status: "idle", chunkStart: 0, chunkWords: [] };
    case "HOLD":
      return state.status === "speaking" ? { ...state, status: "holding" } : state;
    case "RESUME_CHAINING":
      return state.status === "holding" ? { ...state, status: "speaking" } : state;
    case "SET_ENGINE":
      return { ...state, engine: action.engine };
    case "SET_SPEED":
      return { ...state, speed: action.speed, generationId: state.generationId + 1 };
    case "INCREMENT_GENERATION_ID":
      return { ...state, generationId: state.generationId + 1 };
    case "KOKORO_WARMING":
      return { ...state, status: "warming", cursorWordIndex: action.startIdx, speed: action.speed };
    case "KOKORO_READY":
      return {
        ...state,
        kokoroReady: true,
        kokoroDownloading: false,
        kokoroStatus: {
          ...state.kokoroStatus,
          status: "ready",
          ready: true,
          loading: false,
          detail: null,
          reason: null,
          recoverable: false,
        },
      };
    case "SYNC_KOKORO_STATUS":
      return {
        ...state,
        kokoroReady: action.snapshot.ready,
        kokoroDownloading: false,
        kokoroStatus: action.snapshot,
      };
    case "KOKORO_DOWNLOAD_PROGRESS":
      return { ...state, kokoroDownloading: true, kokoroDownloadProgress: action.progress };
    case "SET_PAGE_END":
      return { ...state, pageEndWord: action.endIdx };
    case "ERROR":
      return { ...state, status: "error", kokoroReady: false, kokoroDownloading: false };
    default:
      return state;
  }
}

export interface TtsStrategy {
  speakChunk(
    text: string,
    words: string[],
    startIdx: number,
    speed: number,
    onWordAdvance: (wordOffset: number) => void,
    onEnd: () => void,
    onError: () => void
  ): void;
  stop(): void;
  pause(): void;
  resume(): void;
}

/**
 * Wave A Kokoro tempo-shaping contract.
 * The scheduler path receives this metadata so it can perform a
 * pitch-preserving pre-playback tempo stage after bucketed generation/cache.
 * Do not treat this as playbackRate guidance.
 */
export interface KokoroSchedulerRatePlanMetadata {
  kokoroRatePlan?: KokoroRatePlan;
}
