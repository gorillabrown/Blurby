export type NarrationStatus = "idle" | "loading" | "speaking" | "paused" | "holding" | "error";

export interface NarrationState {
  status: NarrationStatus;
  engine: "web" | "kokoro";
  chunkStart: number;
  chunkWords: string[];
  cursorWordIndex: number;
  kokoroReady: boolean;
  kokoroDownloading: boolean;
  kokoroDownloadProgress: number;
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
  | { type: "KOKORO_DOWNLOAD_PROGRESS"; progress: number }
  | { type: "SET_PAGE_END"; endIdx: number | null }
  | { type: "ERROR"; message: string };

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
    case "KOKORO_READY":
      return { ...state, kokoroReady: true, kokoroDownloading: false };
    case "KOKORO_DOWNLOAD_PROGRESS":
      return { ...state, kokoroDownloading: true, kokoroDownloadProgress: action.progress };
    case "SET_PAGE_END":
      return { ...state, pageEndWord: action.endIdx };
    case "ERROR":
      return { ...state, status: "error" };
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
