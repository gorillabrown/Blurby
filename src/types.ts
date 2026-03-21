// ── Document schema ──────────────────────────────────────────────────────────
export interface BlurbyDoc {
  id: string;
  title: string;
  content?: string;
  wordCount: number;
  position: number;
  created: number;
  source: "manual" | "folder" | "url";
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
  theme: "dark" | "light" | "eink" | "system";
  launchAtLogin: boolean;
  focusTextSize: number;
  accentColor: string | null;
  fontFamily: string | null;
  compactMode: boolean;
  readingMode: "focus" | "flow";
  focusMarks: boolean;
  readingRuler: boolean;
  focusSpan: number;
  flowTextSize: number;
  rhythmPauses: RhythmPauses;
  layoutSpacing: LayoutSpacing;
  initialPauseMs: number;     // pause before first word advances (default 3000)
  punctuationPauseMs: number; // extra dwell on punctuation words (default 1000)
  viewMode: "list" | "grid";
  // E-ink display optimization settings
  einkWpmCeiling: number;
  einkRefreshInterval: number;
  einkPhraseGrouping: boolean;
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
  updateDocProgress: (docId: string, position: number) => Promise<void>;
  loadDocContent: (docId: string) => Promise<string | null>;
  getDocChapters: (docId: string) => Promise<Array<{ title: string; charOffset: number }>>;
  saveHighlight: (data: { docTitle: string; text: string; wordIndex: number; totalWords: number }) => Promise<{ ok?: boolean; error?: string }>;
  defineWord: (word: string) => Promise<{ word: string; phonetic?: string; partOfSpeech?: string; definition?: string; example?: string; synonyms?: string[] } | { error: string }>;
  addDocFromUrl: (url: string) => Promise<{ doc?: BlurbyDoc; error?: string }>;
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
  rescanFolder: () => Promise<{ count?: number; error?: string }>;
  getFilePathForDrop: (file: File) => string;
  onLibraryUpdated: (callback: (library: BlurbyDoc[]) => void) => () => void;
  onSystemThemeChanged?: (callback: (theme: "dark" | "light") => void) => () => void;
  onUpdateAvailable?: (callback: (version: string) => void) => () => void;
  onUpdateDownloaded?: (callback: (version: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
