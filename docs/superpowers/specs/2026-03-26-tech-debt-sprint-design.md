# Sprint TD-1: Technical Debt Elimination — Design Spec

**Date:** 2026-03-26
**Branch:** `sprint/td1-tech-debt`
**Goal:** Eliminate the dual rendering path, decompose the god component, convert narration to a state machine, add type safety, and create pluggable mode verticals.

---

## Problem Statement

Sprint 25S (stabilization) revealed structural debt that makes every EPUB bug fix require duplicating logic across two incompatible rendering paths. The root causes:

1. **Two rendering paths** — word-by-word text (PageReaderView, 672 lines) vs foliate EPUB (FoliatePageView, 958 lines). Every feature must work in both, with 29 `useFoliate` conditional branches in ReaderContainer alone.
2. **God component** — ReaderContainer.tsx (1,142 lines) manages all 4 reading modes with 11 useState + 15 useRef hooks, making changes risky and testing impossible.
3. **Unstructured TTS** — useNarration.ts (541 lines) uses 18 refs with no state machine, two engine paths interleaved.
4. **Monolithic IPC** — ipc-handlers.js (1,630 lines) with 71 handlers in one file.
5. **No type safety** — ~55 `any` types, untyped `window.electronAPI`, untyped foliate-js APIs.
6. **Dead code** — mergeWords (82 lines), safeRangeOp, 16 console.log statements from Sprint 25S debugging.

**Sprint 25S open bugs (BUG-090/091/092) are deferred** to a follow-up sprint. This sprint is purely structural.

---

## Phase 1: Universal EPUB Pipeline (8-12h)

### Overview

Convert all document formats (TXT, MD, HTML, PDF, MOBI/AZW3) to EPUB on import. After conversion, foliate becomes the sole rendering engine. PageReaderView is kept as a fallback toggle, not deleted.

### TD-01: Custom Format Converters

**Create:** `main/epub-converter.js`

**EPUB Packaging Helper — `buildEpubZip(options)`**

Builds a valid EPUB 3.0 ZIP using `adm-zip` (already a dependency):

```
Structure:
  mimetype                          (first entry, uncompressed)
  META-INF/container.xml            (points to content.opf)
  OEBPS/content.opf                 (manifest, spine, metadata)
  OEBPS/nav.xhtml                   (EPUB 3 navigation)
  OEBPS/Text/chapter_0.xhtml        (chapter content files)
  OEBPS/Text/chapter_1.xhtml
  OEBPS/Images/cover.jpg            (optional cover)
```

Parameters:
```javascript
{
  outputPath: string,           // where to write the .epub file
  title: string,                // dc:title
  author: string,               // dc:creator
  language?: string,            // dc:language (default "en")
  chapters: Array<{             // one XHTML file per chapter
    title: string,
    xhtml: string               // inner body HTML
  }>,
  coverImage?: Buffer           // JPEG cover image
}
```

The content.opf includes: `dc:identifier` (UUID), `dc:title`, `dc:creator`, `dc:language`, `dcterms:modified`. Manifest lists all chapters + nav. Spine references chapters in order.

**Text-to-EPUB — `txtToEpub(inputPath, outputPath, meta)`**

1. Read file as UTF-8
2. Detect chapter boundaries via heuristic:
   - Lines preceded AND followed by blank lines
   - Short (< 80 chars)
   - Match patterns: `Chapter N`, `PART X`, `I.`, `1.`, ALL CAPS
3. Split into chapters at detected boundaries
4. Convert paragraph groups (separated by blank lines) to `<p>` elements
5. Escape XML entities
6. Feed chapters to `buildEpubZip`

Returns: `{ epubPath, title, author, chapterCount }`

**Markdown-to-EPUB — `mdToEpub(inputPath, outputPath, meta)`**

1. Read file as UTF-8
2. Split at `# ` and `## ` headings as chapter boundaries
3. Convert MD to XHTML:
   - `# Heading` → `<h1>`
   - `## Subheading` → `<h2>`
   - `**bold**` → `<strong>`
   - `*italic*` → `<em>`
   - `[text](url)` → `<a href>`
   - Blank line → paragraph break
   - Code fences → `<pre><code>`
4. Feed to `buildEpubZip`

**HTML-to-EPUB — `htmlToEpub(inputPath, outputPath, meta)`**

1. Load HTML via cheerio (already a dependency)
2. Strip `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
3. Split at `<h1>` / `<h2>` boundaries into chapters
4. Preserve paragraph structure
5. Extract `<title>` for book title if not provided
6. Feed to `buildEpubZip`

**PDF-to-EPUB — `pdfToEpub(inputPath, outputPath, meta)`**

1. Use existing `pdf-parse` (from `file-parsers.js:323-373`) to extract text
2. Split text by page breaks (`\f` or large whitespace gaps) as chapter boundaries
3. Feed extracted text through `txtToEpub` chapter detection + paragraph wrapping
4. Feed to `buildEpubZip`

Note: PDF→EPUB is inherently lossy (layout, images, tables lost). The legacy renderer toggle (TD-04) provides a fallback.

**MOBI/AZW3-to-EPUB — `mobiToEpub(inputPath, outputPath, meta)`**

1. Reuse existing `parseMobiContent()` from `file-parsers.js:95-170` (PalmDOC decompression)
2. Reuse `parseMobiMetadata()` from `file-parsers.js:172-216` (EXTH header extraction)
3. Reuse `extractMobiCover()` from `file-parsers.js:218-274` (cover image extraction)
4. Feed decompressed text through `txtToEpub` logic
5. Include cover image in EPUB via `buildEpubZip({ coverImage })`

**Orchestrator — `convertToEpub(inputPath, outputDir, docId, meta)`**

Routes by file extension:
- `.txt`, `.text`, `.rst` → `txtToEpub`
- `.md`, `.markdown` → `mdToEpub`
- `.html`, `.htm` → `htmlToEpub`
- `.pdf` → `pdfToEpub`
- `.mobi`, `.azw3`, `.azw` → `mobiToEpub`
- `.epub` → copy to output dir (already EPUB)

Returns: `{ epubPath, title, author }`

**Dependencies:** None new. Uses existing adm-zip, cheerio, pdf-parse.

**Tests:** `tests/epub-converter.test.js`
- `buildEpubZip` produces valid EPUB structure (mimetype, container.xml, content.opf, chapters)
- `txtToEpub` converts text with paragraphs, detects chapter headings
- `htmlToEpub` strips nav/script, splits at headings
- `pdfToEpub` extracts text and packages
- `mobiToEpub` uses existing parsers
- `convertToEpub` routes correctly by extension

---

### TD-02: Import Pipeline Integration

**Modify:** `main/ipc-handlers.js` — `import-dropped-files` handler (line 636), `add-doc-from-url` handler (line 438)

**On import of any non-EPUB file:**

1. Extract metadata first (existing `extractDocMetadata` — needed for title/author/cover)
2. Call `convertToEpub(filepath, convertedDir, docId, { title, author, coverImage })`
3. Store converted EPUB at `<userData>/converted/<docId>.epub`
4. Update doc object:
   - `doc.convertedEpubPath = result.epubPath`
   - `doc.originalFilepath = filepath` (preserve original)
   - `doc.filepath = result.epubPath` (point to converted)
   - `doc.ext = ".epub"`
5. Standard doc creation continues (addDocToLibrary, broadcastLibrary)

**For URL imports** (`add-doc-from-url`):
1. Extract article via Readability (existing flow)
2. Create temporary HTML file from extracted content
3. Call `htmlToEpub` on the temp file
4. Store converted EPUB, update doc object as above

**Type additions to `BlurbyDoc` (src/types.ts):**
```typescript
convertedEpubPath?: string;    // path to converted EPUB in userData/converted/
originalFilepath?: string;     // original file path before conversion
legacyRenderer?: boolean;      // user opted for PageReaderView
```

**Constants (main/constants.js):**
```javascript
EPUB_CONVERTED_DIR = "converted"    // subdirectory name in userData
TXT_CHAPTER_MIN_LINES = 50         // minimum lines between chapter break candidates
```

**Backward compatibility:** Existing docs without `convertedEpubPath` continue working via legacy text extraction path. No migration needed — old docs just don't have the field.

---

### TD-03: Collapse useFoliate Conditionals

**Modify:** `src/components/ReaderContainer.tsx`

Current (line 112):
```typescript
const useFoliate = Boolean(activeDoc?.filepath && activeDoc?.ext === ".epub");
```

After:
```typescript
const useFoliate = Boolean(
  (activeDoc?.filepath || activeDoc?.convertedEpubPath) &&
  activeDoc?.ext === ".epub" &&
  !settings.useLegacyRenderer
);
```

With all new docs having `.epub` extension after conversion, `useFoliate` is true for all new imports. Legacy docs without conversion still fall through to PageReaderView.

**Impact:** Most of the 29 `useFoliate` conditional branches in ReaderContainer become dead code for new documents. They remain for backward compatibility with pre-conversion docs but can be progressively simplified.

---

### TD-04: PageReaderView Fallback Toggle

**Modify:** `src/types.ts` — add `useLegacyRenderer?: boolean` to `BlurbySettings`
**Modify:** Settings UI — add toggle in Layout or Help settings page

Behavior:
- **OFF (default):** All docs render via FoliatePageView (EPUB path)
- **ON:** All docs render via PageReaderView (word-by-word text path)

This is the safety net. If EPUB conversion produces artifacts or foliate has rendering issues, users can toggle back. PageReaderView is NOT deleted.

---

### TD-05: Archive Text Extraction

**Create:** `main/legacy-parsers.js` — copy of `extractContent()` from file-parsers.js
**Modify:** `main/file-parsers.js` — mark `extractContent()` as deprecated
**Modify:** `main/ipc-handlers.js` — `load-doc-content` handler uses legacy path for pre-conversion docs

The `load-doc-content` IPC handler checks:
```javascript
if (doc.convertedEpubPath && !settings.useLegacyRenderer) {
  return { filepath: doc.convertedEpubPath }; // foliate loads directly
}
// Legacy fallback for pre-conversion docs
const { extractContent } = require("./legacy-parsers");
return extractContent(doc.filepath);
```

Metadata functions (`extractDocMetadata`, `extractEpubMetadata`, `extractMobiCover`, etc.) remain active in file-parsers.js — still needed at import time.

---

### Phase 1 Acceptance Criteria

- [ ] `convertToEpub()` handles TXT, MD, HTML, PDF, MOBI/AZW3
- [ ] Converted EPUBs have valid structure (mimetype, container.xml, content.opf, XHTML chapters)
- [ ] Import pipeline converts on ingest, foliate renders the result
- [ ] Pre-conversion (legacy) docs still open correctly
- [ ] `useLegacyRenderer` toggle switches between foliate and PageReaderView
- [ ] `npm test` passes, `npm run build` succeeds
- [ ] Manual smoke: drop TXT, PDF, MOBI files — each opens and reads in foliate

---

## Phase 2: ReaderContainer Decomposition (6-8h)

### Overview

Split ReaderContainer.tsx (1,142 lines) into 3 focused hooks + 1 utility, leaving a thin ~450-line orchestrator.

### TD-06: useReaderMode Hook

**Create:** `src/hooks/useReaderMode.ts`

Extracts from ReaderContainer (~300 lines):
- `readingMode` state + `readingModeRef`
- `stopAllModes()` — cancel all sub-mode playback
- `startFocus()` — enter Focus mode from current word
- `startFlow()` — enter Flow mode from current word
- `startNarration()` — enter Narration mode from current word
- `handleTogglePlay()` — Space bar handler (start last mode or pause)
- `handleSelectMode(mode)` — click mode button (select without starting)
- `handlePauseToPage()` — return to Page mode
- `handleExitReader()` — exit reader with backtrack check

**Interface:**
```typescript
function useReaderMode(params: {
  reader: UseReaderReturn;
  narration: UseNarrationReturn;
  foliateApiRef: MutableRefObject<FoliateViewAPI | null>;
  foliateWordsRef: MutableRefObject<FoliateWord[]>;
  progressTracker: UseProgressTrackerReturn;
  settings: BlurbySettings;
  updateSettings: (partial: Partial<BlurbySettings>) => void;
  wpm: number;
  setWpm: (fn: (prev: number) => number) => void;
  effectiveWpm: number;
  useFoliate: boolean;
  getEffectiveWords: () => string[];
  onExitReader: (pos: number) => void;
}): UseReaderModeReturn;
```

**Dependencies:** Uses `getStartWordIndex()` from TD-07 for all three mode starts.

---

### TD-07: getStartWordIndex Utility

**Create:** `src/utils/startWordIndex.ts`

Currently duplicated 3 times in ReaderContainer (in startFocus, startFlow, startNarration). Each does:
1. Take `highlightedWordIndex`
2. Validate it's within the effective words array
3. Clamp if EPUB and index exceeds loaded words
4. Return 0 as fallback

```typescript
export function getStartWordIndex(
  highlightedWordIndex: number,
  effectiveWordsLength: number,
  useFoliate: boolean
): number {
  if (useFoliate && highlightedWordIndex >= effectiveWordsLength) {
    return 0;
  }
  return Math.max(0, Math.min(highlightedWordIndex, effectiveWordsLength - 1));
}
```

---

### TD-08: useProgressTracker Hook

**Create:** `src/hooks/useProgressTracker.ts`

Extracts from ReaderContainer (~200 lines):
- `highlightedWordIndex` state + setter
- `hasEngagedRef` — prevents false progress on open
- `furthestPositionRef` — high-water mark for backtrack detection
- `lastSavedPosRef` + `pageSaveTimerRef` — debounced progress save
- `activeReadingMsRef` + `activeReadingStartRef` — session timer
- `showBacktrackPrompt` state + `backtrackPages`
- `handleSaveAtCurrent()` + `handleKeepFurthest()`
- `finishReading(finalPos)` — flush saves, log session, exit
- `markEngaged()` — set engagement flag (called by mode starts, word clicks, page turns)

**Interface:**
```typescript
function useProgressTracker(params: {
  activeDoc: BlurbyDoc;
  words: string[];
  wpm: number;
  readingMode: string;
  useFoliate: boolean;
  api: ElectronAPI;
  onUpdateProgress: (docId: string, pos: number) => void;
  onArchiveDoc: (docId: string) => void;
  onExitReader: (pos: number) => void;
}): UseProgressTrackerReturn;
```

---

### TD-09: useEinkController Hook

**Create:** `src/hooks/useEinkController.ts`

Extracts from ReaderContainer (~100 lines):
- `einkPageTurns` state
- `showEinkRefresh` state
- `triggerEinkRefresh()` — forces e-ink display refresh
- `handleEinkPageTurn()` — increments counter, triggers refresh at interval

```typescript
function useEinkController(settings: BlurbySettings): {
  einkPageTurns: number;
  showEinkRefresh: boolean;
  triggerEinkRefresh: () => void;
  handleEinkPageTurn: () => void;
};
```

---

### TD-10: Thin Orchestrator Result

After extracting TD-06 through TD-09, ReaderContainer retains:
- Hook composition (call useReaderMode, useProgressTracker, useEinkController)
- `foliateApiRef` setup and `getEffectiveWords()`
- Foliate view instantiation (`foliateView` variable)
- `renderView()` — the JSX render switch
- `ReaderBottomBar` and `MenuFlap` composition
- `ReturnToReadingPill` and `BacktrackPrompt` rendering
- Keyboard shortcut wiring

**Target:** ~450-500 lines.

### Phase 2 Acceptance Criteria

- [ ] ReaderContainer.tsx under 550 lines
- [ ] All 4 reading modes work identically to before
- [ ] Backtrack prompt, progress saving, e-ink refresh all function
- [ ] No regressions in Focus/Flow/Narration mode transitions
- [ ] `npm test` passes, `npm run build` succeeds

---

## Phase 3: Narration State Machine (4-6h)

### Overview

Replace 18 refs in useNarration.ts with a `useReducer` state machine. Separate Kokoro and Web Speech into strategy pattern.

### TD-11: NarrationState + NarrationAction Types

**Create:** `src/types/narration.ts`

```typescript
export type NarrationStatus = "idle" | "loading" | "speaking" | "paused" | "holding" | "error";

export interface NarrationState {
  status: NarrationStatus;
  engine: "web" | "kokoro";
  chunkStart: number;
  chunkWords: string[];
  cursorWordIndex: number;
  nextChunkBuffer: { text: string; audio: any; sampleRate: number; durationMs: number } | null;
  kokoroReady: boolean;
  kokoroDownloading: boolean;
  kokoroDownloadProgress: number;
  kokoroInFlight: boolean;
  generationId: number;
  speed: number;           // TTS rate (0.5-2.0)
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
  | { type: "SET_PRE_BUFFER"; buffer: NarrationState["nextChunkBuffer"] }
  | { type: "CLEAR_PRE_BUFFER" }
  | { type: "KOKORO_READY" }
  | { type: "KOKORO_DOWNLOAD_PROGRESS"; progress: number }
  | { type: "KOKORO_IN_FLIGHT"; inFlight: boolean }
  | { type: "SET_PAGE_END"; endIdx: number | null }
  | { type: "ERROR"; message: string };
```

**State transitions:**
- `idle` + START → `speaking`
- `speaking` + PAUSE → `paused`
- `speaking` + HOLD → `holding`
- `paused` + RESUME → `speaking`
- `holding` + RESUME_CHAINING → `speaking`
- any + STOP → `idle`
- any + ERROR → `error`

---

### TD-12: Convert Refs to useReducer

**Modify:** `src/hooks/useNarration.ts`

**Refs replaced by reducer state (12-13):**

| Ref | → Reducer Field |
|-----|-----------------|
| `engineRef` | `state.engine` |
| `chunkStartRef` | `state.chunkStart` |
| `chunkWordsRef` | `state.chunkWords` |
| `isCursorDrivenRef` | derived: `state.status !== "idle"` |
| `cursorWordIndexRef` | `state.cursorWordIndex` |
| `holdRef` | derived: `state.status === "holding"` |
| `kokoroVoiceRef` | moved to strategy (TD-13) |
| `pageEndWordRef` | `state.pageEndWord` |
| `speedRef` | `state.speed` |
| `kokoroInFlightRef` | `state.kokoroInFlight` |
| `nextChunkBufferRef` | `state.nextChunkBuffer` |
| `generationIdRef` | `state.generationId` |

**Refs KEPT as refs (5):** These need synchronous access that useReducer can't provide:
- `allWordsRef` — large array, set once per session
- `onWordAdvanceRef` — callback, set by caller
- `rhythmPausesRef` — config object
- `paragraphBreaksRef` — large Set
- `chunkPauseTimerRef` + `rateDebounceRef` — timer handles

---

### TD-13: TTS Strategy Pattern

**Create:** `src/hooks/narration/webSpeechStrategy.ts`
**Create:** `src/hooks/narration/kokoroStrategy.ts`

**Shared interface:**
```typescript
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
```

**Web Speech strategy:** Uses `SpeechSynthesisUtterance` with `onboundary` for word sync. Encapsulates voice selection, rate setting.

**Kokoro strategy:** Uses `window.electronAPI.kokoroGenerate` IPC → `audioPlayer.playBuffer`. Encapsulates pre-buffering, generation ID guard, voice ID. The generation ID guard (from Sprint 25S LL-033) lives inside this strategy.

**useNarration dispatches to active strategy:**
```typescript
const strategy = state.engine === "kokoro" ? kokoroStrategy : webSpeechStrategy;
strategy.speakChunk(chunkText, chunkWords, startIdx, state.speed, onWordAdvance, onEnd, onError);
```

Eliminates 5+ `if (engineRef.current === "kokoro")` branches.

---

### TD-14: Rhythm Pause Calculator

**Modify:** `src/utils/rhythm.ts`

Add:
```typescript
export function calculateChunkBoundaryPause(
  lastWord: string,
  lastWordGlobalIdx: number,
  paragraphBreaks: Set<number>,
  rhythmPauses: RhythmPauses | null,
  hasPreBuffer: boolean
): number
```

Logic (from useNarration.ts:260-280):
- If `!hasPreBuffer` → return 0 (generation time IS the pause)
- If paragraph end + `rhythmPauses.paragraphs` → `TTS_PAUSE_PARAGRAPH_MS` (750ms)
- If sentence end (`.!?`) + `rhythmPauses.sentences` → `TTS_PAUSE_SENTENCE_MS` (400ms)
- If clause end (`,;:`) + `rhythmPauses.commas` → `TTS_PAUSE_COMMA_MS` (250ms)
- Otherwise → 0

Both strategies call this after each chunk completes.

### Phase 3 Acceptance Criteria

- [ ] useNarration uses `useReducer` with typed NarrationState/NarrationAction
- [ ] Web Speech and Kokoro are separate strategy files
- [ ] Rhythm pause calculator is a pure function
- [ ] TTS narration works in both Web Speech and Kokoro modes
- [ ] No regressions in pause/resume/hold/resync
- [ ] `npm test` passes

---

## Phase 4: Type Safety + Cleanup (4-6h)

### Overview

Add foliate types, type window.electronAPI, remove dead code, consolidate constants, split IPC handlers.

### TD-15: Foliate Type Definitions

**Create:** `src/types/foliate.ts`

```typescript
export interface FoliateBook {
  sections: Array<{ id: string; href: string; linear: boolean }>;
  toc: FoliateTocItem[];
  metadata: { title?: string; creator?: string; language?: string };
}

export interface FoliateTocItem {
  label: string;
  href: string;
  subitems?: FoliateTocItem[];
}

export interface RelocateDetail {
  cfi: string;
  fraction: number;
  tocItem?: FoliateTocItem;
  pageItem?: { current: number; total: number };
}

export interface FoliateRenderer {
  getContents(): Array<{ doc: Document; index: number }>;
  next(): void;
  prev(): void;
  setAttribute(key: string, value: string): void;
  element?: { shadowRoot?: ShadowRoot };
}

export interface FoliateViewElement extends HTMLElement {
  open(file: File): Promise<void>;
  init(options?: { lastLocation?: string }): Promise<void>;
  goTo(target: string): Promise<any>;
  goToFraction(frac: number): Promise<void>;
  getCFI(sectionIndex: number, range: Range): string;
  book: FoliateBook;
  renderer: FoliateRenderer;
}
```

Apply these types to FoliatePageView.tsx, replacing ~23 `any` casts.

---

### TD-16: Type window.electronAPI

**Modify:** `src/types.ts`

The existing `ElectronAPI` interface (line ~171) should be expanded to cover all 71 IPC channels. Add:

```typescript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

Remove all `(window as any).electronAPI` casts throughout the codebase.

---

### TD-17: Constants Consolidation

**Modify:** `src/constants.ts`

Move hardcoded values from:
- ReaderContainer.tsx: `250` (words/page estimate), `2000` (debounce ms), `500` (backtrack threshold)
- FoliatePageView.tsx: `40px`, `5%`, `720px`, `20px` (renderer margins/gaps)
- Various: `300` (default WPM used directly instead of DEFAULT_WPM import)

---

### TD-18: FoliateViewAPI Grouping

**Modify:** `src/components/FoliatePageView.tsx`

Current flat interface (12 methods) → grouped sub-interfaces:

```typescript
export interface FoliateViewAPI {
  navigation: {
    goTo: (target: string | number) => Promise<any>;
    goToFraction: (frac: number) => Promise<void>;
    next: () => void;
    prev: () => void;
  };
  words: {
    getWords: () => FoliateWord[];
    getParagraphBreaks: () => Set<number>;
  };
  highlight: {
    highlightWordByIndex: (idx: number) => void;
    clearHighlight: () => void;
  };
  raw: {
    getView: () => any;
  };
}
```

---

### Dead Code Removal (bundled with Phase 4)

**FoliatePageView.tsx:**
- Delete `mergeWords()` function (82 lines, never called)
- Delete `safeRangeOp()` function (4 lines, never called)
- Remove unused `import { getOverlayPosition }`
- Remove 13 `console.log` statements (all tagged `[Foliate]`)

**ReaderContainer.tsx:**
- Remove 3 `console.log` statements

---

### IPC Handler Split (bundled with Phase 4)

**Split `main/ipc-handlers.js` (1,630 lines) into 8 domain files:**

| New File | Handlers | Est. Lines |
|----------|----------|------------|
| `main/ipc/state.js` | get-state, save-settings, get-platform, get-system-theme, get/set-launch-at-login | ~80 |
| `main/ipc/library.js` | save-library, add-manual-doc, delete-doc, update-doc, load-doc-content, read-file-buffer, get-doc-chapters, import-dropped-files, rescan-folder, export/import-library | ~400 |
| `main/ipc/documents.js` | update-doc-progress, reset-progress, toggle-favorite, archive/unarchive, snooze/unsnooze, open-doc-source, open-reader-window | ~200 |
| `main/ipc/reader.js` | save-highlight, define-word, get-all-highlights, save-reading-note, open-reading-notes | ~250 |
| `main/ipc/stats.js` | record/log-reading-session, mark-completed, get/reset-stats, export-stats-csv, open-reading-log | ~300 |
| `main/ipc/cloud.js` | cloud-sign-in/out, cloud-get-auth-state, cloud-sync-now, cloud-get-sync-status, cloud-force-sync, etc. | ~100 |
| `main/ipc/tts.js` | tts-kokoro-generate/voices/model-status/download/preload | ~50 |
| `main/ipc/misc.js` | add-doc-from-url, open-url-in-browser, get-cover-image, log-error, site logins, WebSocket | ~200 |

**Coordinator (main/ipc-handlers.js → ~50 lines):**
```javascript
function registerIpcHandlers(ctx) {
  require("./ipc/state").register(ctx);
  require("./ipc/library").register(ctx);
  require("./ipc/documents").register(ctx);
  require("./ipc/reader").register(ctx);
  require("./ipc/stats").register(ctx);
  require("./ipc/cloud").register(ctx);
  require("./ipc/tts").register(ctx);
  require("./ipc/misc").register(ctx);
}
```

Each sub-module exports `{ register(ctx) }` and receives the context object. Closures (definitionCache, coverCache) are local to their sub-module.

### Phase 4 Acceptance Criteria

- [ ] Zero `any` in FoliatePageView.tsx and ReaderContainer.tsx
- [ ] `window.electronAPI` typed — no `(window as any)` casts
- [ ] Dead code removed (mergeWords, safeRangeOp, console.logs)
- [ ] ipc-handlers.js is ~50 line coordinator
- [ ] All 71 IPC handlers still function
- [ ] Constants consolidated — no hardcoded magic numbers in components
- [ ] `npm test` passes, `npm run build` succeeds

---

## Phase 5: Mode Verticals (6-8h)

### Overview

Each reading mode becomes a self-contained module implementing a shared interface. ReaderContainer dispatches to mode objects instead of inline callbacks.

### TD-23: Mode Interface Contract

**Create:** `src/modes/ModeInterface.ts`

```typescript
export interface ReadingMode {
  readonly name: "page" | "focus" | "flow" | "narrate";

  start(wordIndex: number, words: string[], options: ModeStartOptions): void;
  pause(): void;
  resume(): void;
  stop(): void;

  getCurrentWordIndex(): number;
  isActive(): boolean;
}

export interface ModeStartOptions {
  wpm: number;
  foliateApi?: FoliateViewAPI;
  settings: Partial<BlurbySettings>;
  onWordAdvance?: (idx: number) => void;
  onComplete?: () => void;
}
```

All modes implement this. `useReaderMode` (TD-06) dispatches to the active mode object.

---

### TD-19: PageMode

**Create:** `src/modes/PageMode.ts`

Page mode is passive — no auto-advancing:
- `start(wordIndex)` — sets highlighted word, no timer
- `pause()` / `resume()` — no-op
- `stop()` — clears state
- `getCurrentWordIndex()` — returns highlighted word
- `isActive()` — always false (page is inherently idle)

Simplest implementation, serves as reference.

---

### TD-20: FocusMode

**Create:** `src/modes/FocusMode.ts`

Wraps the existing `useReader` hook's RAF-based RSVP loop:
- `start(wordIndex)` — calls `reader.jumpToWord(wordIndex)` + `reader.togglePlay()`
- `pause()` — calls `reader.togglePlay()` (toggle off)
- `resume()` — calls `reader.togglePlay()` (toggle on)
- `stop()` — stops RAF loop, resets
- `getCurrentWordIndex()` — returns `reader.wordIndex`
- `isActive()` — returns `reader.playing`

---

### TD-21: FlowMode

**Create:** `src/modes/FlowMode.ts`

Manages the flow cursor advancement at WPM speed:
- For foliate: drives the overlay cursor via rAF loop + `highlightWordByIndex`
- For non-foliate: drives `FlowCursorController` via `flowPlaying` state
- `start(wordIndex)` — begins advancement from wordIndex
- `pause()` — stops advancement
- `resume()` — resumes from current word
- `stop()` — stops and clears cursor
- `getCurrentWordIndex()` — returns current flow position
- `isActive()` — returns whether flowing

---

### TD-22: NarrateMode

**Create:** `src/modes/NarrateMode.ts`

Wraps the refactored `useNarration` hook (Phase 3):
- `start(wordIndex)` — calls `narration.adjustRate()` then `narration.startCursorDriven()`
- `pause()` — calls `narration.pause()`
- `resume()` — calls `narration.resume()`
- `stop()` — calls `narration.stop()`, restores pre-cap WPM
- `getCurrentWordIndex()` — returns cursor position from narration state
- `isActive()` — returns `state.status === "speaking"`

---

### Integration with useReaderMode

After Phase 5, `useReaderMode` from TD-06 dispatches to mode objects:

```typescript
const modes = {
  page: pageMode,
  focus: focusMode,
  flow: flowMode,
  narration: narrateMode,
};

function handleTogglePlay() {
  if (readingMode === "page") {
    const target = settings.lastReadingMode || "flow";
    const startIdx = getStartWordIndex(highlightedWordIndex, words.length, useFoliate);
    modes[target].start(startIdx, words, { wpm, foliateApi, settings, onWordAdvance });
    setReadingMode(target);
  } else {
    modes[readingMode].stop();
    setReadingMode("page");
  }
}
```

### Phase 5 Acceptance Criteria

- [ ] Each mode implements ReadingMode interface
- [ ] Mode transitions work identically to pre-refactor
- [ ] Modes are unit-testable without rendering React components
- [ ] All 4 modes pass smoke test (start/pause/resume/stop)
- [ ] ReaderContainer under 450 lines after integration
- [ ] `npm test` passes, `npm run build` succeeds

---

## Execution Order

```
Phase 1 [TD-01→TD-05] — EPUB pipeline (independent track)
    ↓
Phase 2 [TD-06→TD-10] — ReaderContainer split
  ├── Phase 3 [TD-11→TD-14] — Narration (parallel, different files)
  └── Phase 4 [TD-15→TD-18] — Types + cleanup (parallel)
    ↓
Phase 5 [TD-19→TD-23] — Mode verticals (depends on Phase 2)
```

## Impact Summary

| Metric | Before | After |
|--------|--------|-------|
| ReaderContainer.tsx | 1,142 lines | ~450 lines |
| useFoliate conditionals | 29 | 0-2 (legacy toggle only) |
| Rendering paths | 2 | 1 primary + 1 fallback |
| Mode start duplication | 3x | 1 shared function |
| `any` types | ~55 | ~5 |
| useNarration refs | 18 | 5 (rest in reducer) |
| ipc-handlers.js | 1,630 lines | ~50 line coordinator |
| Dead code removed | — | ~200+ lines |

## Verification

After each phase:
1. `npx vitest run tests/` — 522+ tests pass
2. `npm run build` — clean build
3. Manual smoke: open EPUB, TXT, PDF. Test all 4 modes. Test narration start/pause/resume.
4. Verify legacy renderer toggle (Phase 1)
5. Verify converted EPUBs render in foliate (Phase 1)

## Risk

1. **EPUB conversion quality** — PDF/MOBI are lossy. Mitigated by PageReaderView fallback toggle.
2. **Narration ref→reducer timing** — keep timer/callback refs as refs, only computed state in reducer.
3. **IPC split registration order** — each sub-module creates own closure scope, coordinator passes ctx only.
