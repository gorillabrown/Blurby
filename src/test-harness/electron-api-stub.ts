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

/** Trace + persist state to sessionStorage (use for mutating operations) */
function traceMut<T>(method: string, args: unknown[], result: T): T {
  console.debug("[stub]", method, args.length ? args : "", "→", result);
  persistState();
  return result;
}

// ── Event emitter system ────────────────────────────────────────────────────
type EventCallback = (...args: any[]) => void;
const eventListeners = new Map<string, Set<EventCallback>>();
const stubTtsCache = new Map<string, { audio: number[]; sampleRate: number; durationMs: number }>();

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
  ttsEngine: "kokoro",
  ttsVoiceName: null,
  ttsRate: 1.0,
  firstRunCompleted: false,
};

// ── sessionStorage persistence ──────────────────────────────────────────────
const STUB_STORAGE_KEY = "blurbyStubState";

interface PersistedState {
  settings: BlurbySettings;
  library: BlurbyDoc[];
  highlights: Array<{ text: string; docTitle: string; docId: string; wordIndex: number; totalWords: number; date: string }>;
  readingStats: ReadingStats;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STUB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    console.debug("[stub] hydrated state from sessionStorage");
    return parsed;
  } catch {
    return null;
  }
}

function persistState(): void {
  try {
    const state: PersistedState = { settings, library, highlights, readingStats };
    sessionStorage.setItem(STUB_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

// ── Sample content for loadDocContent ───────────────────────────────────────
const SAMPLE_CONTENT = `Book One: Debts and Lessons

From the example of those who came before me, I gained a respect for honest conduct and the patient governance of strong feeling. My grandfather showed that serenity is not the absence of difficulty but a practiced response to it. He never raised his voice in anger, yet his quiet words carried the weight of deep conviction. My mother demonstrated that generosity begins in the mind before it reaches the hand. She taught me to refrain not merely from harmful action but from the indulgence of harmful thought. Every person who shaped my earliest years left an impression like a seal pressed into warm wax, and I carry those marks still. The debts we owe to others are not burdens but foundations. Without the patience of teachers, the correction of elders, and the example of the virtuous, we would each begin from nothing, repeating every error that has already been made and resolved a thousand times over. To acknowledge what we have received is the first act of wisdom.

Book Two: On the River Gran, Among the Quadi

Each morning I remind myself that I will encounter those who are meddlesome, ungrateful, and driven by appetites they do not examine. This is not cause for resentment but for preparation. The river does not complain when stones obstruct its path; it finds a way around them or wears them smooth with patient persistence. If another person acts from ignorance of what is genuinely good, my frustration serves no useful end. I cannot govern the choices of others, only my own response. The frontier teaches this lesson with brutal clarity. Here among unfamiliar peoples and hostile terrain, the only territory I truly command is the small province of my own intentions. When the cold wind cuts through the tent at night, I am reminded that comfort is a preference, not a necessity. The body endures what the mind permits. And the mind, when properly trained, permits a great deal more than we commonly suppose. What matters is not what happens to us but the quality of attention we bring to each occurrence.

Book Three: In Carnuntum

Consider that each day diminishes the portion of life remaining, and that the faculties of understanding may weaken before the body fails. A person may live long yet lose the capacity to reason clearly, to follow an argument, or to distinguish what is essential from what is merely urgent. Therefore the work of self-examination cannot be postponed. There is no future season better suited to reflection than this present moment. The walls of this garrison town are thick and old. Generations of soldiers have stood watch here, each believing their concerns to be of supreme importance. Yet the town endures while individual anxieties dissolve like morning frost. This perspective is not meant to diminish the significance of our struggles but to place them in their proper proportion. Act with full commitment, but hold outcomes loosely. The effort belongs to you; the result belongs to the larger pattern of events that no single person controls.

Book Four: In Carnuntum Still

The universe is transformation; life is opinion. If you are distressed by anything external, the pain is not due to the thing itself but to your estimation of it, and this you have the power to revoke at any moment. Consider how swiftly all things pass away — the body toward dissolution, memory toward complete obscurity. What then is worth pursuing? Only this: thoughts that are just, actions that serve the common good, speech that never deceives, and a disposition that welcomes each event as necessary and familiar. Everything material is already flowing, everything of the spirit is dream and vapor. Life is a brief campaign, and afterward our reputation falls to those who never knew us. Do not waste the remaining daylight on speculation about what others think. Return instead to the two or three principles that have proven reliable: that patience outlasts agitation, that kindness requires more courage than severity, and that the present moment is the only one in which you can act.

Book Five: On the Danube

At first light, when the reluctance to rise presses heavily, remind yourself: I am getting up to do the work of a human being. Why should I resent performing the function for which I was made? Was I created to lie beneath blankets and keep warm? The pleasant things in life were not given as ends in themselves but as accompaniments to purposeful effort. Even the vine and the bee accomplish their work without complaint. Observe nature's economy: nothing is wasted, nothing is performed for display alone. The river before me carries silt and stone toward the distant sea with absolute indifference to praise or blame. It does not pause to consider whether its labor is appreciated. This is not resignation but clarity. When we act from a clear understanding of what our role requires, the question of motivation dissolves. There is no gap between duty and desire when both are aligned with our fundamental nature. The difficulty is not in knowing this but in remembering it at the precise moment when comfort tempts us to forget.

Book Six: Written at Night

The lamp flickers as I write, and beyond the walls the camp is quiet except for the occasional challenge and countersign of the watch. In this stillness it is possible to see one's thoughts more clearly, as one sees the bottom of a pool only when the surface is undisturbed. Much of what occupies the mind during daylight hours is mere agitation — responses to stimuli that demand nothing more than patient waiting. The truly important decisions present themselves rarely, and when they do, they require not cleverness but character. I have observed that those who deliberate longest often act worst, not because reflection is harmful but because their deliberation is contaminated by fear. The wise person thinks carefully and then commits fully. There is a quality of attention that is neither hasty nor hesitant, and cultivating it is the central discipline of a well-ordered life. Tonight the stars are very clear, and their ancient light reminds me that urgency is largely a human invention.

Book Seven: Among the Sarmatians

Pain is neither unbearable nor unending, provided you keep its boundaries in view and do not enlarge it through anticipation. The body's signals are immediate and local; it is the imagination that makes suffering general and permanent. I have watched soldiers endure wounds that would seem impossible to bear, simply because the necessity of the moment left no room for elaboration. Their attention was occupied entirely by the next required action. This suggests that much of what we call suffering is actually commentary on suffering — a narrative we construct around a sensation. Strip away the narrative and what remains is manageable. This is not a technique for denying reality but for perceiving it accurately. The present difficulty is always smaller than the story we tell about it. When the Sarmatian wind howls across the plain and the cold seems to penetrate every layer of clothing, I find it useful to notice exactly what I feel rather than what I imagine I feel. The gap between the two is where unnecessary misery lives.

Book Eight: At Aquincum

Look at the course of the stars as though you traveled with them, and continually consider the changes of the elements into one another. These contemplations cleanse the mind of the dust that gathers from contact with earthly affairs. When you sit in judgment over disputes between citizens, when you read reports of border incidents, when you sign orders affecting thousands of lives, it is easy to believe that your perspective is the only valid one. But step outside for a moment and regard the sky. The same constellations that guided ships before any living person was born will continue their silent rotation long after every current controversy is forgotten. This is not nihilism. Rather, it is the recognition that our actions matter precisely because they are brief. The fact that nothing endures forever does not diminish its value — it concentrates it. Each kindness, each just decision, each moment of genuine attention is complete in itself and needs no permanence to justify its worth.

Book Nine: On Returning to Rome

The city presents temptations that the frontier does not. Here there are flatterers, entertainments, and the ceaseless noise of ambition. A person can lose entire days in activities that produce nothing of lasting value. The remedy is not withdrawal — for duties require our presence — but a cultivated awareness of how time is actually spent versus how we imagine it is spent. Keep a strict account, if only in your mind: how many hours today were devoted to essential work? How many to anxiety about work not yet begun? How many to conversations that served no purpose beyond the mutual reinforcement of complaint? The honest answers are often uncomfortable, but discomfort is the beginning of correction. Rome teaches an additional lesson: that proximity to power does not confer wisdom. I have met philosophers with deeper insight than any senator, and common laborers whose practical judgment exceeds that of trained advisors. Rank describes a social position, not the quality of a mind.

Book Ten: On the Nature of the Whole

Everything is interwoven, and the web is holy. Nothing is composed entirely of itself; each part exists in continuous relation to every other. The hand that writes these words depends on the arm that supports it, the heart that sustains circulation, the food that was grown in distant soil by workers whose names I will never learn. Pull any single thread and the whole fabric shifts. To understand this is to understand why justice matters: not as an abstract principle but as a practical recognition that my wellbeing cannot be separated from the wellbeing of others. The person who harms another for personal advantage is like a hand that attacks its own body — temporarily successful, perhaps, but fundamentally self-defeating. Nature has made us cooperative creatures, and every attempt to act as though we are isolated units produces a friction that eventually proves intolerable. Harmony is not an optional refinement of life; it is the condition under which life functions properly.

Book Eleven: On Dealing with Others

When another person offends you, consider first what relationship they bear to you and what obligations that relationship imposes. Then consider that they act according to their own understanding, which may be incomplete or mistaken. Then consider how often your own judgment has proven wrong, and how grateful you were when others responded to your errors with patience rather than punishment. Most offenses dissolve under this examination. What remains — the genuinely harmful, the deliberately cruel — still requires a measured response rather than an impulsive one. Anger may feel like strength, but it borrows energy from judgment and spends it on noise. The person who can hold a just position calmly has an advantage over the person who holds the same position while shouting. Others are not obstacles placed in your path to test you; they are fellow travelers navigating difficulties of their own. The most productive question is never how can I overcome this person but rather how can this situation produce the best outcome for everyone involved, including myself.

Book Twelve: The Final Account

Let this serve as a summary: you have a limited time remaining, and none of it should be spent in conflict with reality. Accept what cannot be changed, work steadily to improve what can be, and develop the wisdom to distinguish between the two. The opinions of others, the fluctuations of fortune, and the inevitable decay of the body are beyond your governance. But the quality of your character — the patience, honesty, courage, and fairness you bring to each encounter — these are entirely within your power, and they are enough. Do not wait for circumstances to be perfect before committing to right action. Circumstances will never be perfect. The draft leaks through every window, the provisions are never quite sufficient, and the reports from the frontier always contain unsettling news. Act anyway. Act because action aligned with virtue is its own justification. At the end, what will matter is not what happened to you but how you met it. And meeting it well is possible in every moment, under every condition, for anyone willing to pay attention.`;

const SAMPLE_CONTENT_WORD_COUNT = SAMPLE_CONTENT.split(/\s+/).filter(Boolean).length;

// ── Chapter metadata for Meditations (computed from content) ────────────────
const MEDITATIONS_CHAPTER_TITLES = [
  "Book One: Debts and Lessons",
  "Book Two: On the River Gran, Among the Quadi",
  "Book Three: In Carnuntum",
  "Book Four: In Carnuntum Still",
  "Book Five: On the Danube",
  "Book Six: Written at Night",
  "Book Seven: Among the Sarmatians",
  "Book Eight: At Aquincum",
  "Book Nine: On Returning to Rome",
  "Book Ten: On the Nature of the Whole",
  "Book Eleven: On Dealing with Others",
  "Book Twelve: The Final Account",
];

const MEDITATIONS_CHAPTERS = MEDITATIONS_CHAPTER_TITLES.map((title) => ({
  title,
  charOffset: SAMPLE_CONTENT.indexOf(title),
}));

// ── Second seed document: sample article ────────────────────────────────────
const SAMPLE_ARTICLE_CONTENT = `The Architecture of Attention

In an age saturated with information, the scarcest resource is not data but the capacity to attend to it meaningfully. Every notification, headline, and algorithmically curated feed competes for a finite cognitive budget, and the result is a pervasive sense of fragmentation. We know more than any previous generation, yet understanding — the slow, deliberate integration of knowledge into judgment — seems harder to achieve than ever.

The problem is not technology itself but the relationship we have established with it. Tools designed to save time have instead colonized the time they saved. The smartphone that was supposed to free us from the desk has instead ensured that the desk follows us everywhere. Meals, walks, conversations, and even sleep are punctuated by the reflexive check: what has changed in the thirty seconds since I last looked?

Attention, like a muscle, responds to how it is used. When we repeatedly practice short bursts of shallow focus — scanning, swiping, skimming — we strengthen the neural pathways associated with rapid switching and weaken those associated with sustained concentration. The consequences extend beyond productivity. Deep reading, the kind that requires holding a complex argument in mind across many pages, is a fundamentally different cognitive act from browsing. It engages empathy, abstract reasoning, and the construction of internal models that shallow reading does not require. When we lose the capacity for deep reading, we lose access to a particular quality of thought.

Reclaiming attention does not require abandoning modern tools. It requires designing our interaction with them more deliberately. Simple structural changes — designated reading periods without devices, physical books for material that deserves sustained engagement, intentional boundaries between work and rest — can rebuild the capacity for concentration that ambient distraction erodes. The goal is not to return to some imagined pre-digital simplicity but to become conscious architects of our own attention rather than passive tenants in an environment designed by others.

The stakes are higher than personal productivity. A society of distracted citizens is a society poorly equipped for the demands of self-governance. Democratic participation requires the ability to evaluate competing claims, follow extended arguments, and resist the appeal of simplistic narratives. These are all capacities that depend on the quality of attention we bring to public life. What begins as a personal habit of scattered focus becomes, at scale, a collective vulnerability.

The path forward is neither nostalgia nor resistance but intentional design. We can choose how we read, when we read, and what we allow to interrupt our reading. These small choices, repeated daily, shape the architecture of the mind itself.`;

const SAMPLE_ARTICLE_WORD_COUNT = SAMPLE_ARTICLE_CONTENT.split(/\s+/).filter(Boolean).length;

// ── Seed document definitions (must be after content constants) ─────────────
const sampleMeditationsDoc: BlurbyDoc = {
  id: "sample-meditations",
  title: "Meditations",
  wordCount: SAMPLE_CONTENT_WORD_COUNT,
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

const sampleArticleDoc: BlurbyDoc = {
  id: "sample-article",
  title: "The Architecture of Attention",
  wordCount: SAMPLE_ARTICLE_WORD_COUNT,
  position: 0,
  created: Date.now() - 43200000, // "added 12 hours ago"
  source: "sample",
  filepath: undefined,
  author: "Blurby Editorial",
  lastReadAt: null,
  favorite: false,
  archived: false,
  unread: true,
  tags: [],
  collection: null,
  furthestPosition: 0,
};

// ── In-memory state (hydrate from sessionStorage if available) ──────────────
const persisted = loadPersistedState();

let settings = persisted?.settings ?? { ...defaultSettings };
let library: BlurbyDoc[] = persisted?.library ?? [{ ...sampleMeditationsDoc }, { ...sampleArticleDoc }];
let highlights: PersistedState["highlights"] = persisted?.highlights ?? [];
let readingStats: ReadingStats = persisted?.readingStats ?? {
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
    return traceMut("saveSettings", [newSettings], undefined);
  },

  // ── Library CRUD ────────────────────────────────────────────────────────
  saveLibrary: async (newLibrary: BlurbyDoc[]) => {
    library = newLibrary;
    return traceMut("saveLibrary", [`[${newLibrary.length} docs]`], undefined);
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
    return traceMut("addManualDoc", [title, `[${content.length} chars]`], doc);
  },

  deleteDoc: async (docId: string) => {
    library = library.filter((d) => d.id !== docId);
    return traceMut("deleteDoc", [docId], undefined);
  },

  updateDoc: async (docId: string, title: string, content: string) => {
    const doc = findDoc(docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = content.split(/\s+/).filter(Boolean).length;
    }
    return traceMut("updateDoc", [docId, title, `[${content.length} chars]`], undefined);
  },

  resetProgress: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.position = 0; doc.cfi = undefined; doc.furthestPosition = 0; }
    return traceMut("resetProgress", [docId], undefined);
  },

  updateDocProgress: async (docId: string, position: number, cfi?: string) => {
    const doc = findDoc(docId);
    if (doc) {
      doc.position = position;
      if (cfi) doc.cfi = cfi;
      if (position > (doc.furthestPosition ?? 0)) doc.furthestPosition = position;
      doc.lastReadAt = Date.now();
    }
    return traceMut("updateDocProgress", [docId, position, cfi], undefined);
  },

  loadDocContent: async (docId: string) => {
    // For seed documents, return their content
    if (docId === "sample-meditations") {
      return trace("loadDocContent", [docId], SAMPLE_CONTENT);
    }
    if (docId === "sample-article") {
      return trace("loadDocContent", [docId], SAMPLE_ARTICLE_CONTENT);
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
    return traceMut("saveHighlight", [data], { ok: true });
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
    return traceMut("addDocFromUrl", [url], { doc, sourceUrl: url });
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
    return traceMut("importDroppedFiles", [filePaths], { imported, rejected });
  },

  // ── Reading statistics ──────────────────────────────────────────────────
  recordReadingSession: async (docTitle: string, wordsRead: number, durationMs: number, wpm: number) => {
    readingStats.totalWordsRead += wordsRead;
    readingStats.totalReadingTimeMs += durationMs;
    readingStats.sessions += 1;
    return traceMut("recordReadingSession", [docTitle, wordsRead, durationMs, wpm], undefined);
  },

  markDocCompleted: async () => {
    readingStats.docsCompleted += 1;
    return traceMut("markDocCompleted", [], undefined);
  },

  getStats: async () => trace("getStats", [], { ...readingStats }),

  resetStats: async () => {
    readingStats = { totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, sessions: 0, streak: 0, longestStreak: 0 };
    return traceMut("resetStats", [], { success: true });
  },

  // ── Author normalization ────────────────────────────────────────────────
  normalizeAllAuthors: async () => trace("normalizeAllAuthors", [], { updated: 0 }),

  // ── Metadata wizard ────────────────────────────────────────────────────
  scanLibraryMetadata: async () => trace("scanLibraryMetadata", [], []),
  applyMetadataUpdates: async (updates: any) => trace("applyMetadataUpdates", [updates], { updated: 0 }),

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
    return traceMut("toggleFavorite", [docId], doc?.favorite ?? false);
  },

  // ── Archive ─────────────────────────────────────────────────────────────
  archiveDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.archived = true; doc.archivedAt = Date.now(); }
    return traceMut("archiveDoc", [docId], undefined);
  },

  unarchiveDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) { doc.archived = false; doc.archivedAt = undefined; }
    return traceMut("unarchiveDoc", [docId], undefined);
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

  // ── Bug report ──────────────────────────────────────────────────────────
  captureBugScreenshot: async () => trace("captureBugScreenshot", [], { filename: "stub-screenshot.png", filepath: "/tmp/stub-screenshot.png" }),
  saveBugReport: async (data: any) => { traceMut("saveBugReport", [data], undefined); return { ok: true, filename: "stub-report.json" }; },

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
    return traceMut("snoozeDoc", [docId, until], undefined);
  },

  unsnoozeDoc: async (docId: string) => {
    const doc = findDoc(docId);
    if (doc) doc.snoozedUntil = undefined;
    return traceMut("unsnoozeDoc", [docId], undefined);
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

  // ── EPUB Word Extraction (HOTFIX-6) ─────────────────────────────────────
  extractEpubWords: async (bookId: string) => {
    // Return a mock word array for the seed book
    const words = "The quick brown fox jumps over the lazy dog and continues to run through the forest".split(" ");
    const sections = [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: words.length, wordCount: words.length }];
    return trace("extractEpubWords", [bookId], { words, sections, totalWords: words.length });
  },

  // ── Kokoro TTS ──────────────────────────────────────────────────────────
  kokoroPreload: async () => trace("kokoroPreload", [], undefined),
  kokoroPreloadMarathon: async () => trace("kokoroPreloadMarathon", [], undefined),

  kokoroGenerate: async (text: string, voice: string, speed: number) => {
    const result = generateMockAudio(text, voice, speed);
    console.debug("[stub] kokoroGenerate", `[${text.length} chars]`, voice, speed, "→", result.audio.length, "samples,", result.durationMs.toFixed(0), "ms");
    return result;
  },

  kokoroGenerateMarathon: async (text: string, voice: string, speed: number) => {
    const result = generateMockAudio(text, voice, speed);
    console.debug("[stub] kokoroGenerateMarathon", `[${text.length} chars]`, voice, speed, "→", result.audio.length, "samples,", result.durationMs.toFixed(0), "ms");
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

  // ── TTS Cache (NAR-2) — in-memory for browser testing ────────────────
  ttsCacheRead: async (bookId: string, voiceId: string, startIdx: number) => {
    const key = `${bookId}:${voiceId}:${startIdx}`;
    const entry = stubTtsCache.get(key);
    if (entry) return trace("ttsCacheRead", [bookId, voiceId, startIdx], entry);
    return trace("ttsCacheRead", [bookId, voiceId, startIdx], { miss: true });
  },
  ttsCacheWrite: async (bookId: string, voiceId: string, startIdx: number, audioArr: number[], sampleRate: number, durationMs: number) => {
    const key = `${bookId}:${voiceId}:${startIdx}`;
    stubTtsCache.set(key, { audio: Array.from(audioArr), sampleRate, durationMs });
    return trace("ttsCacheWrite", [bookId, voiceId, startIdx], { success: true });
  },
  ttsCacheHas: async (bookId: string, voiceId: string, startIdx: number) => {
    const key = `${bookId}:${voiceId}:${startIdx}`;
    return trace("ttsCacheHas", [bookId, voiceId, startIdx], stubTtsCache.has(key));
  },
  ttsCacheChunks: async (bookId: string, voiceId: string) => {
    const prefix = `${bookId}:${voiceId}:`;
    const indices = [...stubTtsCache.keys()].filter(k => k.startsWith(prefix)).map(k => parseInt(k.split(":")[2]));
    return trace("ttsCacheChunks", [bookId, voiceId], indices);
  },
  ttsCacheEvictBook: async (bookId: string) => {
    for (const key of [...stubTtsCache.keys()]) { if (key.startsWith(`${bookId}:`)) stubTtsCache.delete(key); }
    return trace("ttsCacheEvictBook", [bookId], { success: true });
  },
  ttsCacheEvictVoice: async (bookId: string, voiceId: string) => {
    const prefix = `${bookId}:${voiceId}:`;
    for (const key of [...stubTtsCache.keys()]) { if (key.startsWith(prefix)) stubTtsCache.delete(key); }
    return trace("ttsCacheEvictVoice", [bookId, voiceId], { success: true });
  },
  ttsCacheInfo: async () => {
    const size = stubTtsCache.size;
    return trace("ttsCacheInfo", [], { totalBytes: size * 1000, totalMB: Number((size * 1000 / 1048576).toFixed(2)), bookCount: new Set([...stubTtsCache.keys()].map(k => k.split(":")[0])).size });
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
  onKokoroDownloadError: (cb: EventCallback) => addEventListener("tts-kokoro-download-error", cb),
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
  /** Clear sessionStorage persistence and reset to defaults */
  clearPersistence: () => void;
  /** Delete a document by ID (for ERR-01 testing — open a deleted doc) */
  deleteDoc: (id: string) => boolean;
}

export const stubControl: BlurbyStubControl = {
  emit: emitEvent,
  getSettings: () => ({ ...settings }),
  getLibrary: () => [...library],
  reset: () => {
    settings = { ...defaultSettings };
    library = [{ ...sampleMeditationsDoc }, { ...sampleArticleDoc }];
    highlights = [];
    readingStats = { totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, sessions: 0, streak: 0, longestStreak: 0 };
    launchAtLogin = false;
    persistState();
    console.debug("[stub] state reset to defaults");
  },
  setFirstRunCompleted: (value: boolean) => {
    settings.firstRunCompleted = value;
    persistState();
    console.debug("[stub] firstRunCompleted set to", value);
  },
  clearPersistence: () => {
    try { sessionStorage.removeItem(STUB_STORAGE_KEY); } catch { /* ignore */ }
    // Also reset in-memory state
    settings = { ...defaultSettings };
    library = [{ ...sampleMeditationsDoc }, { ...sampleArticleDoc }];
    highlights = [];
    readingStats = { totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, sessions: 0, streak: 0, longestStreak: 0 };
    launchAtLogin = false;
    console.debug("[stub] persistence cleared and state reset");
  },
  deleteDoc: (id: string) => {
    const idx = library.findIndex((d) => d.id === id);
    if (idx === -1) {
      console.debug("[stub] deleteDoc: not found", id);
      return false;
    }
    library.splice(idx, 1);
    persistState();
    console.debug("[stub] deleteDoc: removed", id);
    return true;
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
