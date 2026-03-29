// ── Document schema ──────────────────────────────────────────────────────────
export interface BlurbyDoc {
  id: string;
  title: string;
  content?: string;
  wordCount: number;
  position: number;
  created: number;
  source: "manual" | "folder" | "url" | "sample";
  filepath?: string;
  filename?: string;
  ext?: string;
  size?: number;
  modified?: number;
  sourceUrl?: string;
  favorite?: boolean;
  archived?: boolean;
  archivedAt?: number;
  lastReadAt?: number | null;
  author?: string;
  coverPath?: string; // absolute path to extracted cover image on disk
  // Sprint 19: Article provenance
  sourceDomain?: string;      // display name of source (e.g., "The New York Times")
  publishedDate?: string;     // ISO 8601 date string of original publication
  authorFull?: string;        // full byline string for display (multi-author)
  // Sprint 19: Sync hardening
  deleted?: boolean;
  deletedAt?: number;         // revision number when deleted
  deletedBy?: string;         // deviceId that deleted
  syncContent?: boolean;      // false for folder-sourced docs
  contentHash?: string;       // SHA-256 of full content for sync
  // Sprint 20: Keyboard-first UX
  unread?: boolean;
  snoozedUntil?: number;      // epoch ms, null/undefined = not snoozed
  tags?: string[];
  collection?: string | null;
  // Sprint 25C: "New" dot tracking
  seenAt?: number;        // timestamp when card was seen in library view
  // Sprint 25S: High-water mark for backtrack detection
  furthestPosition?: number; // Page number (non-EPUB) or fraction 0.0-1.0 (EPUB)
  // Sprint 26: EPUB CFI position tracking
  cfi?: string;           // EPUB Canonical Fragment Identifier — exact reading position
  // TD-02: Import pipeline
  convertedEpubPath?: string;    // path to converted EPUB in userData/converted/
  originalFilepath?: string;     // original file path before conversion
  legacyRenderer?: boolean;      // user opted for PageReaderView
}

// ── Settings schema ─────────────────────────────────────────────────────────
export interface RhythmPauses {
  commas: boolean;
  sentences: boolean;
  paragraphs: boolean;
  numbers: boolean;
  longerWords: boolean;
}

export interface LayoutSpacing {
  line: number;
  character: number;
  word: number;
}

export interface BlurbySettings {
  schemaVersion: number;
  wpm: number;
  sourceFolder: string | null;
  folderName: string;
  recentFolders: string[];
  theme: "dark" | "light" | "blurby" | "eink" | "system";
  launchAtLogin: boolean;
  focusTextSize: number;
  accentColor: string | null;
  fontFamily: string | null;
  compactMode: boolean;
  readingMode: "focus" | "flow" | "narration" | "page";
  focusMarks: boolean;
  readingRuler: boolean;
  focusSpan: number;
  flowTextSize: number;
  rhythmPauses: RhythmPauses;
  layoutSpacing: LayoutSpacing;
  initialPauseMs: number;     // pause before first word advances (default 3000)
  punctuationPauseMs: number; // extra dwell on punctuation words (default 1000)
  viewMode: "list" | "grid";
  // Flow mode settings
  flowWordSpan: number; // how many words to highlight at once in Flow mode (3-5, default 3)
  flowCursorStyle: "underline" | "highlight"; // flow cursor visual style (default: underline)
  // E-ink display optimization settings
  einkWpmCeiling: number;
  einkRefreshInterval: number;
  einkPhraseGrouping: boolean;
  // TTS settings
  ttsEnabled: boolean;
  ttsEngine: "web" | "kokoro"; // which TTS backend to use
  ttsVoiceName: string | null; // SpeechSynthesisVoice.name (web) or Kokoro voice ID
  ttsRate: number; // 0.5-2.0, default 1.0
  // TTS pause timing (user-adjustable via settings)
  ttsPauseCommaMs?: number;
  ttsPauseSentenceMs?: number;
  ttsPauseParagraphMs?: number;
  ttsDialogueSentenceThreshold?: number;
  // Last-used reading mode (Space bar starts this mode from Page view)
  lastReadingMode: "focus" | "flow" | "narration";
  // Cloud sync settings
  syncIntervalMinutes: number;
  syncOnMeteredConnection: boolean;
  // Sprint 23: First-run onboarding
  firstRunCompleted?: boolean;
  // Sprint 25C: Library layout settings
  defaultSort?: string;
  defaultViewMode?: "grid" | "list";
  libraryCardSize?: "small" | "medium" | "large";
  libraryCardSpacing?: "compact" | "cozy" | "roomy";
  // TD-02: Import pipeline
  useLegacyRenderer?: boolean;   // opt-in for legacy word-by-word renderer
}

// ── Toast ───────────────────────────────────────────────────────────────────
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastState {
  message: string;
  action?: ToastAction;
}

// ── Reading history ─────────────────────────────────────────────────────────
export interface ReadingSession {
  date: string;
  docTitle: string;
  wordsRead: number;
  durationMs: number;
  wpm: number;
}

export interface ReadingStats {
  totalWordsRead: number;
  totalReadingTimeMs: number;
  docsCompleted: number;
  sessions: number;
  streak: number;
  longestStreak: number;
}

// ── Cloud sync ──────────────────────────────────────────────────────────────
export type SyncStatusValue = "idle" | "syncing" | "error" | "offline";

export interface AuthState {
  provider: "microsoft" | "google";
  email: string;
  name: string;
}

export interface SyncResult {
  status: "success" | "error" | "not-signed-in" | "already-syncing";
  results?: {
    settings: string;
    library: string;
    history: string;
  };
  lastSync?: number;
  error?: string;
}

export interface SyncStatus {
  status: SyncStatusValue;
  lastSync: number;
  provider: string | null;
}

export interface MergePreview {
  cloudDocs: number;
  localDocs: number;
  cloudHasData: boolean;
  localHasData: boolean;
  lastSync: number;
  error?: string;
}

// ── IPC API exposed via preload ─────────────────────────────────────────────
export interface ElectronAPI {
  getState: () => Promise<{ settings: BlurbySettings; library: BlurbyDoc[] }>;
  getPlatform: () => Promise<string>;
  getSystemTheme: () => Promise<"dark" | "light">;
  selectFolder: () => Promise<string | null>;
  switchFolder: (folder: string) => Promise<{ folder?: string; error?: string }>;
  saveSettings: (settings: Partial<BlurbySettings>) => Promise<void>;
  saveLibrary: (library: BlurbyDoc[]) => Promise<void>;
  addManualDoc: (title: string, content: string) => Promise<BlurbyDoc>;
  deleteDoc: (docId: string) => Promise<void>;
  updateDoc: (docId: string, title: string, content: string) => Promise<void>;
  resetProgress: (docId: string) => Promise<void>;
  updateDocProgress: (docId: string, position: number, cfi?: string) => Promise<void>;
  loadDocContent: (docId: string) => Promise<string | { userError: string } | null>;
  getDocChapters: (docId: string) => Promise<Array<{ title: string; charOffset: number }>>;
  saveHighlight: (data: { docTitle: string; text: string; wordIndex: number; totalWords: number }) => Promise<{ ok?: boolean; error?: string }>;
  defineWord: (word: string) => Promise<{ word: string; phonetic?: string; partOfSpeech?: string; definition?: string; example?: string; synonyms?: string[] } | { error: string }>;
  addDocFromUrl: (url: string) => Promise<{ doc?: BlurbyDoc; error?: string; sourceUrl?: string }>;
  openUrlInBrowser: (url: string) => Promise<{ ok?: boolean; error?: string }>;
  importDroppedFiles: (filePaths: string[]) => Promise<{ imported: string[]; rejected: string[] }>;
  recordReadingSession: (docTitle: string, wordsRead: number, durationMs: number, wpm: number) => Promise<void>;
  markDocCompleted: () => Promise<void>;
  getStats: () => Promise<ReadingStats>;
  resetStats: () => Promise<{ success: boolean }>;
  exportLibrary: () => Promise<string | null>;
  importLibrary: () => Promise<{ added?: number; total?: number; error?: string } | null>;
  exportStatsCsv: () => Promise<string | null>;
  getLaunchAtLogin: () => Promise<boolean>;
  setLaunchAtLogin: (enabled: boolean) => Promise<boolean>;
  toggleFavorite: (docId: string) => Promise<boolean>;
  archiveDoc: (docId: string) => Promise<void>;
  unarchiveDoc: (docId: string) => Promise<void>;
  openReaderWindow: (docId: string) => Promise<void>;
  checkForUpdates: () => Promise<{ status: string; version?: string | null; message?: string }>;
  installUpdate: () => Promise<void>;
  logError: (message: string) => Promise<void>;
  getSiteLogins: () => Promise<Array<{ domain: string; cookieCount: number }>>;
  siteLogin: (url: string) => Promise<{ success?: boolean; site?: string; cancelled?: boolean; error?: string }>;
  siteLogout: (domain: string) => Promise<boolean>;
  getCoverImage: (coverPath: string) => Promise<string | null>;
  readFileBuffer: (filepath: string) => Promise<ArrayBuffer>;
  rescanFolder: () => Promise<{ count?: number; error?: string }>;
  getFilePathForDrop: (file: File) => string;
  // Sprint 19: Sync hardening
  cloudFullReconciliation: () => Promise<{ status: string; fixed?: number; error?: string }>;
  cloudDownloadDocContent: (docId: string) => Promise<{ content?: string; error?: string }>;
  // Sprint 20: Keyboard-first UX
  openDocSource: (docId: string) => Promise<{ opened?: boolean; error?: string }>;
  getAllHighlights: () => Promise<Array<{ text: string; docTitle: string; docId: string; wordIndex: number; totalWords: number; date: string }>>;
  snoozeDoc: (docId: string, until: number) => Promise<void>;
  unsnoozeDoc: (docId: string) => Promise<void>;
  saveReadingNote: (data: { docId: string; highlight: string; note: string; citation: string }) => Promise<{ ok?: boolean; path?: string; error?: string }>;
  logReadingSession: (data: { docId: string; duration: number; wordsRead: number; finalWpm: number; mode: string; chapter?: string }) => Promise<{ ok?: boolean; path?: string; error?: string }>;
  openReadingLog: () => Promise<{ ok?: boolean; error?: string }>;
  openReadingNotes: (docId?: string) => Promise<{ ok?: boolean; error?: string }>;
  // WebSocket server (Chrome extension)
  startWsServer: () => Promise<{ port: number; token: string }>;
  stopWsServer: () => Promise<{ ok: boolean }>;
  getWsStatus: () => Promise<{ running: boolean; port: number; clients: number; token: string | null }>;
  getWsPairingToken: () => Promise<string | null>;
  regenerateWsPairingToken: () => Promise<{ port: number; token: string }>;
  // Cloud sync
  cloudSignIn: (provider: "microsoft" | "google") => Promise<{ success?: boolean; error?: string; email?: string; name?: string; provider?: string }>;
  cloudSignOut: (provider: "microsoft" | "google") => Promise<{ success?: boolean; error?: string }>;
  cloudGetAuthState: () => Promise<AuthState | null>;
  cloudSyncNow: () => Promise<SyncResult>;
  cloudGetSyncStatus: () => Promise<SyncStatus>;
  cloudGetMergePreview: () => Promise<MergePreview | null>;
  cloudForceSync: (direction: "upload" | "download" | "merge") => Promise<SyncResult>;
  cloudStartAutoSync: (intervalMs: number) => Promise<{ ok: boolean }>;
  cloudStopAutoSync: () => Promise<{ ok: boolean }>;
  // Events from main
  onLibraryUpdated: (callback: (library: BlurbyDoc[]) => void) => () => void;
  onSystemThemeChanged?: (callback: (theme: "dark" | "light") => void) => () => void;
  onUpdateAvailable?: (callback: (version: string) => void) => () => void;
  onUpdateDownloaded?: (callback: (version: string) => void) => () => void;
  onCloudSyncStatusChanged?: (callback: (status: SyncStatusValue) => void) => () => void;
  onCloudAuthRequired?: (callback: (provider: string) => void) => () => void;
  onWatcherError?: (callback: (data: { message: string }) => void) => () => void;
  // Kokoro TTS
  kokoroPreload?: () => Promise<void>;
  kokoroModelStatus: () => Promise<{ ready: boolean }>;
  kokoroVoices?: () => Promise<{ voices?: string[]; error?: string }>;
  kokoroDownload?: () => Promise<{ ok?: boolean; error?: string }>;
  kokoroGenerate?: (text: string, voice: string, speed: number) => Promise<{ audio?: Float32Array; sampleRate?: number; durationMs?: number; error?: string }>;
  onKokoroDownloadProgress?: (callback: (progress: number) => void) => () => void;
  onKokoroLoading?: (callback: (loading: boolean) => void) => () => void;
  onKokoroDownloadError?: (callback: (error: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
