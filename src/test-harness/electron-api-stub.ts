// src/test-harness/electron-api-stub.ts — Complete window.electronAPI stub for browser testing
// Dev-only. Implements all 73 IPC methods + 10 event listeners from preload.js.
// Auto-injected when window.electronAPI is undefined (i.e., outside Electron).

import { generateMockAudio, getMockModelStatus, getMockVoices } from "./mock-kokoro";
import type { BlurbyDoc, BlurbySettings, ReadingStats, ElectronAPI } from "../types";

// ── Console tracing helper ──────────────────────────────────────────────────
function trace<T>(method: string, args: unknown[], result: T): T {
  console.debug("[stub]", method, args.length ? args : "", "→", result);
  return result;
}

// ── Event emitter system ────────────────────────────────────────────────────
type EventCallback = (...args: any[]) => void;
const eventListeners = new Map<string, Set<EventCallback>>();

function addEventListener(event: string, callback: EventCallback): () => void {
  if (!eventListeners.has(event)) eventListeners.set(event, new Set());
  eventListeners.get(event)!.add(callback);
  return () => { eventListeners.get(event)?.delete(callback); };
}

function emitEvent(event: string, data?: unknown): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((cb) => {
      try { cb(data); } catch (e) { console.error("[stub] event handler error:", event, e); }
    });
  }
  console.debug("[stub] emit", event, data);
}

// ── In-memory state ─────────────────────────────────────────────────────────
const defaultSettings: BlurbySettings = {
  schemaVersion: 0,
  wpm: 300,
  sourceFolder: null,
  folderName: "My reading list",
  recentFolders: [],
  theme: "dark",
  launchAtLogin: false,
  focusTextSize: 110,
  accentColor: null,
  fontFamily: null,
  compactMode: false,
  readingMode: "page",
  focusMarks: true,
  readingRuler: false,
  focusSpan: 0.4,
  flowTextSize: 110,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000,
  punctuationPauseMs: 1000,
  viewMode: "list",
  einkWpmCeiling: 250,
  einkRefreshInterval: 20,
  einkPhraseGrouping: true,
  syncIntervalMinutes: 5,
  syncOnMeteredConnection: false,
  flowWordSpan: 3,
  flowCursorStyle: "underline",
  lastReadingMode: "flow",
  ttsEnabled: false,
  ttsEngine: "web",
  ttsVoiceName: null,
  ttsRate: 1.0,
  firstRunCompleted: false,
};

const sampleMeditationsDoc: BlurbyDoc = {
  id: "sample-meditations",
  title: "Meditations",
  wordCount: 47000,
  position: 0,
  created: Date.now() - 86400000, // "added yesterday"
  source: "sample",
  filepath: "/resources/sample-meditations.epub",
  author: "Marcus Aurelius",
  lastReadAt: null,
  favorite: false,
  archived: false,
  unread: true,
  tags: [],
  collection: null,
  furthestPosition: 0,
};

let settings = { ...defaultSettings };
let library: BlurbyDoc[] = [{ ...sampleMeditationsDoc }];
let highlights: Array<{ text: string; docTitle: string; docId: string; wordIndex: number; totalWords: number; date: string }> = [];
let readingStats: ReadingStats = {
  totalWordsRead: 0,
  totalReadingTimeMs: 0,
  docsCompleted: 0,
  sessions: 0,
  streak: 0,
  longestStreak: 0,
};
let launchAtLogin = false;

// ── Helper: find doc by ID ──────────────────────────────────────────────────
function findDoc(docId: string): BlurbyDoc | undefined {
  return library.find((d) => d.id === docId);
}

// ── Sample content for loadDocContent ───────────────────────────────────────
const SAMPLE_CONTENT = `Book One: Debts and Lessons

From my grandfather Verus, I learned good morals and the government of my temper.
From the reputation and remembrance of my father, modesty and a manly character.
From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts.

Book Two: On the River Gran, Among the Quadi

Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial.
All these things happen to them by reason of their ignorance of what is good and evil.

Book Three: In Carnuntum

We ought to consider not only that our life is daily wasting away and a smaller part of it is left, but another thing also must be taken into the account, that if a man should live longer, it is quite uncertain whether the understanding will still continue sufficient for the comprehension of things.`;

// ── Chapter metadata for Meditations ────────────────────────────────────────
const MEDITATIONS_CHAPTERS = [
  { title: "Book One: Debts and Lessons", charOffset: 0 },
  { title: "Book Two: On the River Gran, Among the Quadi", charOffset: 500 },
  { title: "Book Three: In Carnuntum", charOffset: 1100 },
  { title: "Book Four", charOffset: 1800 },
  { title: "Book Five", charOffset: 2500 },
  { title: "Book Six", charOffset: 3200 },
  { title: "Book Seven", charOffset: 3900 },
  { title: "Book Eight", charOffset: 4600 },
  { title: "Book Nine", charOffset: 5300 },
  { title: "Book Ten", charOffset: 6000 },
  { title: "Book Eleven", charOffset: 6700 },
  { title: "Book Twelve", charOffset: 7400 },
];

// ── The stub API ────────────────────────────────────────────────────────────
export const electronAPIStub: ElectronAPI = {
  // ── State ───────────────────────────────────────────────────────────────
  getState: async () => {
    const result = { settings: { ...settings }, library: library.filter((d) => !d.deleted) };
    return trace("getState", [], result);
  },

  getPlatform: async () => trace("getPlatform", [], "win32"),

  getSystemTheme: async () => trace("getSystemTheme", [], "dark" as const),

  // ── Folder ──────────────────────────────────────────────────────────────
  selectFolder: async () => trace("selectFolder", [], null),

  switchFolder: async (folder: string) => trace("switchFolder", [folder], { error: "Folders not available in browser stub" }),

  // ── Settings ────────────────────────────────────────────────────────────
  saveSettings: async (newSettings: Partial<BlurbySettings>) => {
    Object.assign(settings, newSettings);
    return trace("saveSettings", [newSettings], undefined);
  },

  // ── Library CRUD ────────────────────────────────────────────────────────
  saveLibrary: async (newLibrary: BlurbyDoc[]) => {
    library = newLibrary;
    return trace("saveLibrary", [`[${newLibrary.length} docs]`], undefined);
  },

  addManualDoc: async (title: string, content: string) => {
    const doc: BlurbyDoc = {
      id: `manual-${Date.now()}`,
      title,
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      position: 0,
      created: Date.now(),
      source: "manual",
      lastReadAt: null,
    };
    library.push(doc);
    return trace("addManualDoc", [title, `[${content.length} chars]`], doc);
  },

  deleteDoc: async (docId: string) => {
    library = library.filter((d) => d.id !== docId);
    return trace("deleteDoc", [docId], undefined);
  },

  updateDoc: async (docId: string, title: string, content: string) => {
    const doc = findDoc(docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = content.split(/\s+/).filter(Boolean).length;
    }
    return trace("updateDoc", [docId, title, `[${content.length} chars]`], undefined);
  },

  resetProgress: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.position = 0; doc.cfi = undefined; doc.furthestPosition = 0; }
    return trace("resetProgress", [docId], undefined);
  },

  updateDocProgress: async (docId: string, position: number, cfi?: string) => {
    const doc = findDoc(docId);
    if (doc) {
      doc.position = position;
      if (cfi) doc.cfi = cfi;
      if (position > (doc.furthestPosition ?? 0)) doc.furthestPosition = position;
      doc.lastReadAt = Date.now();
    }
    return trace("updateDocProgress", [docId, position, cfi], undefined);
  },

  loadDocContent: async (docId: string) => {
    // For the sample Meditations, return sample content
    if (docId === "sample-meditations") {
      return trace("loadDocContent", [docId], SAMPLE_CONTENT);
    }
    const doc = findDoc(docId);
    return trace("loadDocContent", [docId], doc?.content ?? null);
  },

  readFileBuffer: async (filepath: string) => {
    // Fetch the EPUB from Vite's public/ directory
    const url = filepath.startsWith("/") ? filepath : `/${filepath}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      console.debug("[stub] readFileBuffer", filepath, "→", buffer.byteLength, "bytes");
      return buffer;
    } catch (e) {
      console.error("[stub] readFileBuffer failed:", filepath, e);
      return new ArrayBuffer(0);
    }
  },

  getDocChapters: async (docId: string) => {
    if (docId === "sample-meditations") {
      return trace("getDocChapters", [docId], MEDITATIONS_CHAPTERS);
    }
    return trace("getDocChapters", [docId], []);
  },

  saveHighlight: async (data) => {
    highlights.push({
      text: data.text,
      docTitle: data.docTitle,
      docId: "unknown",
      wordIndex: data.wordIndex,
      totalWords: data.totalWords,
      date: new Date().toISOString(),
    });
    return trace("saveHighlight", [data], { ok: true });
  },

  defineWord: async (word: string) => {
    return trace("defineWord", [word], {
      word,
      phonetic: `/${word}/`,
      partOfSpeech: "noun",
      definition: `Mock definition for "${word}". In a real environment, this would query a dictionary API.`,
      example: `The philosopher used the word "${word}" in his writings.`,
      synonyms: ["concept", "idea", "notion"],
    });
  },

  // ── Cover images ────────────────────────────────────────────────────────
  getCoverImage: async (coverPath: string) => trace("getCoverImage", [coverPath], null),

  rescanFolder: async () => trace("rescanFolder", [], { count: library.length }),

  getFilePathForDrop: (file: File) => {
    const path = `/mock/dropped/${file.name}`;
    console.debug("[stub] getFilePathForDrop", file.name, "→", path);
    return path;
  },

  // ── URL ingestion ───────────────────────────────────────────────────────
  addDocFromUrl: async (url: string) => {
    const doc: BlurbyDoc = {
      id: `url-${Date.now()}`,
      title: `Article from ${new URL(url).hostname}`,
      wordCount: 1200,
      position: 0,
      created: Date.now(),
      source: "url",
      sourceUrl: url,
      sourceDomain: new URL(url).hostname,
      lastReadAt: null,
    };
    library.push(doc);
    return trace("addDocFromUrl", [url], { doc, sourceUrl: url });
  },

  openUrlInBrowser: async (url: string) => trace("openUrlInBrowser", [url], { ok: true }),

  // ── Drag-and-drop ───────────────────────────────────────────────────────
  importDroppedFiles: async (filePaths: string[]) => {
    const imported: string[] = [];
    const rejected: string[] = [];
    for (const fp of filePaths) {
      const ext = fp.split(".").pop()?.toLowerCase();
      if (["txt", "md", "pdf", "epub", "mobi", "azw3", "html", "htm"].includes(ext || "")) {
        const filename = fp.split("/").pop() || fp.split("\\").pop() || fp;
        const doc: BlurbyDoc = {
          id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: filename.replace(/\.[^.]+$/, ""),
          wordCount: 5000,
          position: 0,
          created: Date.now(),
          source: "folder",
          filepath: fp,
          filename,
          ext,
          lastReadAt: null,
        };
        library.push(doc);
        imported.push(filename);
      } else {
        rejected.push(fp.split("/").pop() || fp);
      }
    }
    return trace("importDroppedFiles", [filePaths], { imported, rejected });
  },

  // ── Reading statistics ──────────────────────────────────────────────────
  recordReadingSession: async (docTitle: string, wordsRead: number, durationMs: number, wpm: number) => {
    readingStats.totalWordsRead += wordsRead;
    readingStats.totalReadingTimeMs += durationMs;
    readingStats.sessions += 1;
    return trace("recordReadingSession", [docTitle, wordsRead, durationMs, wpm], undefined);
  },

  markDocCompleted: async () => {
    readingStats.docsCompleted += 1;
    return trace("markDocCompleted", [], undefined);
  },

  getStats: async () => trace("getStats", [], { ...readingStats }),

  resetStats: async () => {
    readingStats = { totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, sessions: 0, streak: 0, longestStreak: 0 };
    return trace("resetStats", [], { success: true });
  },

  // ── Import/export ───────────────────────────────────────────────────────
  exportLibrary: async () => trace("exportLibrary", [], null),
  importLibrary: async () => trace("importLibrary", [], null),
  exportStatsCsv: async () => trace("exportStatsCsv", [], null),

  // ── Launch at login ─────────────────────────────────────────────────────
  getLaunchAtLogin: async () => trace("getLaunchAtLogin", [], launchAtLogin),
  setLaunchAtLogin: async (enabled: boolean) => {
    launchAtLogin = enabled;
    return trace("setLaunchAtLogin", [enabled], enabled);
  },

  // ── Favorites ───────────────────────────────────────────────────────────
  toggleFavorite: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) doc.favorite = !doc.favorite;
    return trace("toggleFavorite", [docId], doc?.favorite ?? false);
  },

  // ── Archive ─────────────────────────────────────────────────────────────
  archiveDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.archived = true; doc.archivedAt = Date.now(); }
    return trace("archiveDoc", [docId], undefined);
  },

  unarchiveDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.archived = false; doc.archivedAt = undefined; }
    return trace("unarchiveDoc", [docId], undefined);
  },

  // ── Multi-window reader ─────────────────────────────────────────────────
  openReaderWindow: async (docId: string) => trace("openReaderWindow", [docId], undefined),

  // ── Auto-updater ────────────────────────────────────────────────────────
  checkForUpdates: async () => trace("checkForUpdates", [], { status: "up-to-date", version: null, message: "You're running the latest version" }),
  installUpdate: async () => trace("installUpdate", [], undefined),

  // ── Error logging ───────────────────────────────────────────────────────
  logError: async (message: string) => {
    console.error("[stub] logError:", message);
    return undefined;
  },

  // ── Site logins ─────────────────────────────────────────────────────────
  getSiteLogins: async () => trace("getSiteLogins", [], []),
  siteLogin: async (url: string) => trace("siteLogin", [url], { success: false, cancelled: true }),
  siteLogout: async (domain: string) => trace("siteLogout", [domain], true),

  // ── Sync hardening ──────────────────────────────────────────────────────
  cloudFullReconciliation: async () => trace("cloudFullReconciliation", [], { status: "success", fixed: 0 }),
  cloudDownloadDocContent: async (docId: string) => trace("cloudDownloadDocContent", [docId], { error: "Cloud sync not available in browser stub" }),

  // ── Keyboard-first UX ──────────────────────────────────────────────────
  openDocSource: async (docId: string) => trace("openDocSource", [docId], { opened: false, error: "Cannot open source in browser stub" }),

  getAllHighlights: async () => trace("getAllHighlights", [], [...highlights]),

  snoozeDoc: async (docId: string, until: number) => {
    const doc = findDoc(docId);
    if (doc) doc.snoozedUntil = until;
    return trace("snoozeDoc", [docId, until], undefined);
  },

  unsnoozeDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) doc.snoozedUntil = undefined;
    return trace("unsnoozeDoc", [docId], undefined);
  },

  saveReadingNote: async (data) => trace("saveReadingNote", [data], { ok: true, path: "/mock/notes/note.docx" }),

  logReadingSession: async (data) => trace("logReadingSession", [data], { ok: true, path: "/mock/logs/session.xlsx" }),

  openReadingLog: async () => trace("openReadingLog", [], { ok: true }),

  openReadingNotes: async (docId?: string) => trace("openReadingNotes", [docId], { ok: true }),

  // ── WebSocket server (Chrome extension) ─────────────────────────────────
  startWsServer: async () => trace("startWsServer", [], { port: 48924, token: "mock-token-12345" }),
  stopWsServer: async () => trace("stopWsServer", [], { ok: true }),
  getWsStatus: async () => trace("getWsStatus", [], { running: false, port: 48924, clients: 0, token: null }),
  getWsPairingToken: async () => trace("getWsPairingToken", [], "mock-token-12345"),
  regenerateWsPairingToken: async () => trace("regenerateWsPairingToken", [], { port: 48924, token: "mock-token-new-67890" }),

  // ── Cloud sync ──────────────────────────────────────────────────────────
  cloudSignIn: async (provider) => trace("cloudSignIn", [provider], { success: false, error: "Cloud auth not available in browser stub" }),
  cloudSignOut: async (provider) => trace("cloudSignOut", [provider], { success: true }),
  cloudGetAuthState: async () => trace("cloudGetAuthState", [], null),
  cloudSyncNow: async () => trace("cloudSyncNow", [], { status: "not-signed-in" as const }),
  cloudGetSyncStatus: async () => trace("cloudGetSyncStatus", [], { status: "idle" as const, lastSync: 0, provider: null }),
  cloudGetMergePreview: async () => trace("cloudGetMergePreview", [], null),
  cloudForceSync: async (direction) => trace("cloudForceSync", [direction], { status: "not-signed-in" as const }),
  cloudStartAutoSync: async (intervalMs: number) => trace("cloudStartAutoSync", [intervalMs], { ok: true }),
  cloudStopAutoSync: async () => trace("cloudStopAutoSync", [], { ok: true }),

  // ── Kokoro TTS ──────────────────────────────────────────────────────────
  kokoroPreload: async () => trace("kokoroPreload", [], undefined),

  kokoroGenerate: async (text: string, voice: string, speed: number) => {
    const result = generateMockAudio(text, voice, speed);
    console.debug("[stub] kokoroGenerate", `[${text.length} chars]`, voice, speed, "→", result.audio.length, "samples,", result.durationMs.toFixed(0), "ms");
    return result;
  },

  kokoroVoices: async () => trace("kokoroVoices", [], getMockVoices()),

  kokoroModelStatus: async () => trace("kokoroModelStatus", [], getMockModelStatus()),

  kokoroDownload: async () => {
    // Simulate download progress
    setTimeout(() => emitEvent("tts-kokoro-download-progress", 0.25), 200);
    setTimeout(() => emitEvent("tts-kokoro-download-progress", 0.5), 400);
    setTimeout(() => emitEvent("tts-kokoro-download-progress", 0.75), 600);
    setTimeout(() => emitEvent("tts-kokoro-download-progress", 1.0), 800);
    return trace("kokoroDownload", [], { ok: true });
  },

  // ── Event listeners ───────────────────────────────────────────────────
  onLibraryUpdated: (cb: EventCallback) => addEventListener("library-updated", cb),
  onUpdateAvailable: (cb: EventCallback) => addEventListener("update-available", cb),
  onSystemThemeChanged: (cb: EventCallback) => addEventListener("system-theme-changed", cb),
  onUpdateDownloaded: (cb: EventCallback) => addEventListener("update-downloaded", cb),
  onCloudSyncStatusChanged: (cb: EventCallback) => addEventListener("cloud-sync-status-changed", cb),
  onCloudAuthRequired: (cb: EventCallback) => addEventListener("cloud-auth-required", cb),
  onWatcherError: (cb: EventCallback) => addEventListener("watcher-error", cb),
  onKokoroDownloadProgress: (cb: EventCallback) => addEventListener("tts-kokoro-download-progress", cb),
  onKokoroLoading: (cb: EventCallback) => addEventListener("tts-kokoro-loading", cb),
};

// ── Public test control interface ───────────────────────────────────────────
export interface BlurbyStubControl {
  /** Emit an event to trigger registered listeners */
  emit: (event: string, data?: unknown) => void;
  /** Get current in-memory settings */
  getSettings: () => BlurbySettings;
  /** Get current in-memory library */
  getLibrary: () => BlurbyDoc[];
  /** Reset all state to defaults */
  reset: () => void;
  /** Manually set firstRunCompleted for testing different flows */
  setFirstRunCompleted: (value: boolean) => void;
}

export const stubControl: BlurbyStubControl = {
  emit: emitEvent,
  getSettings: () => ({ ...settings }),
  getLibrary: () => [...library],
  reset: () => {
    settings = { ...defaultSettings };
    library = [{ ...sampleMeditationsDoc }];
    highlights = [];
    readingStats = { totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, sessions: 0, streak: 0, longestStreak: 0 };
    launchAtLogin = false;
    console.debug("[stub] state reset to defaults");
  },
  setFirstRunCompleted: (value: boolean) => {
    settings.firstRunCompleted = value;
    console.debug("[stub] firstRunCompleted set to", value);
  },
};

/**
 * Install the stub onto window.electronAPI and window.__blurbyStub.
 * Call this before React mounts.
 */
export function installStub(): void {
  if (typeof window === "undefined") return;
  if ((window as any).electronAPI) {
    console.debug("[stub] window.electronAPI already exists — skipping stub installation");
    return;
  }

  (window as any).electronAPI = electronAPIStub;
  (window as any).__blurbyStub = stubControl;

  console.info(
    "%c[Blurby Stub] %celectronAPI stub installed. Use window.__blurbyStub.emit(event, data) to trigger events.",
    "color: #D04716; font-weight: bold",
    "color: inherit",
  );
}
