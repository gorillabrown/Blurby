# Blurby Technical Reference

**Version:** 2.3.0
**Last updated:** 2026-04-01
**Branch:** `main` (v1.5.0)

This document is the governing technical reference for Blurby. It covers architecture, data model, reading modes, rendering, TTS, build/release, and known technical debt. A new developer should be able to understand the entire system by reading this document and following the file path references.

---

## 1. Product Vision

Blurby is a desktop speed-reading and audiobook application for Windows. It lets users import documents in any common format (EPUB, PDF, MOBI, DOCX, TXT, HTML, Markdown), read them with advanced speed-reading techniques, and listen via neural text-to-speech.

**Target users:** Avid readers, students, researchers, and professionals who consume large volumes of text and want to read faster or hands-free.

**Core value proposition:**

- Four reading modes in one app: traditional paginated reading, RSVP (Rapid Serial Visual Presentation), flow cursor (sliding highlight), and neural TTS narration.
- Native EPUB rendering via foliate-js with full formatting, images, and chapter navigation.
- Offline-first cloud sync across devices (OneDrive / Google Drive).
- Keyboard-first UX with 30+ shortcuts and a Ctrl+K command palette.
- Library management with folder watching, URL article import, drag-and-drop, and metadata extraction.

**What Blurby is not:** It is not a mobile app (yet), not a web app, and not an ebook store. It reads files the user already has.

---

## 2. Architecture Overview

Blurby is an Electron application with a clear three-layer architecture.

### Process Model

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Process (Node.js)                   │
│  main.js ─── orchestrator, app lifecycle, context object     │
│  main/ipc-handlers.js ─── all IPC channel registrations      │
│  main/file-parsers.js ─── EPUB, MOBI, PDF, HTML, TXT, DOCX  │
│  main/epub-converter.js ── format→EPUB (formatting+images)  │
│  main/sync-engine.js ─── offline-first cloud sync            │
│  main/sync-queue.js ─── offline operation queue              │
│  main/auth.js ─── OAuth2 (Microsoft MSAL + Google)           │
│  main/url-extractor.js ─── article extraction, PDF export    │
│  main/cloud-google.js ─── Google Drive API                   │
│  main/cloud-onedrive.js ─── OneDrive Graph API               │
│  main/window-manager.js ─── BrowserWindow, tray, menu        │
│  main/migrations.js ─── schema migrations with backup        │
│  main/ws-server.js ─── WebSocket for Chrome extension        │
│  main/folder-watcher.js ─── chokidar folder watching         │
│  main/tts-engine.js ─── Kokoro TTS worker wrapper            │
│  main/tts-worker.js ─── Kokoro inference (worker thread)     │
│  main/cloud-storage.js ─── provider factory                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ IPC (invoke/handle + send/on)
              ┌────────┴────────┐
              │   preload.js    │  contextBridge → window.electronAPI
              └────────┬────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Renderer Process (Chromium)                 │
│  src/App.tsx ─── thin orchestrator                           │
│  src/components/ ─── 39 UI components + 8 settings pages     │
│  src/modes/ ─── ReadingMode strategy pattern (4 modes)       │
│  src/hooks/ ─── useReader, useLibrary, useKeyboardShortcuts  │
│  src/contexts/ ─── SettingsContext, ToastContext              │
│  src/utils/ ─── text, pdf, rhythm, queue, segmentWords       │
│  src/styles/global.css ─── all styles (CSS custom props)     │
│  src/constants.ts ─── all tunable behavioral constants       │
│  src/types.ts ─── shared TypeScript interfaces               │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Rules

| Rule | Rationale |
|------|-----------|
| Main process stays CommonJS | Electron main does not support ESM natively |
| Renderer stays ESM/TypeScript | Vite bundling, type safety |
| All file I/O is async (`fs.promises`) | Never block the main process event loop |
| `preload.js` is the security boundary | Minimal surface area; all system access via IPC |
| Never import Node.js modules in renderer | Security isolation; all access through `window.electronAPI` |
| CSS custom properties for theming | No inline styles; all in `src/styles/global.css` |
| Context object pattern in main process | Shared state (mainWindow, library, settings, paths) across modules |

### Data Flow

```
User action (click, key, drag-drop)
  → React component (src/components/)
    → window.electronAPI.<method>()
      → IPC invoke (preload.js contextBridge)
        → Main process handler (main/ipc-handlers.js)
          → File I/O / parsing / sync (main/*.js)
        ← IPC response
      ← Promise resolution
    ← State update (React state or context)
  ← UI re-render
```

For events initiated by the main process (folder watcher, sync status, theme changes):

```
Main process event
  → ipcRenderer.send / mainWindow.webContents.send
    → preload.js listener → callback
      → React state update
        → UI re-render
```

---

## 3. Technology Stack

### Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | 41 | Desktop shell, BrowserWindow, IPC, native APIs |
| React | 19 | UI rendering with hooks and functional components |
| Vite | 6 | Dev server and production bundler (ESM) |
| TypeScript | 5.9 | Type safety in renderer code |
| Node.js | 22 LTS (recommended) | Main process runtime |

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `foliate-js` | Native EPUB rendering (shadow DOM, CSS columns, CFI) |
| `kokoro-js` | Neural TTS engine (28 voices, ONNX inference) |
| `@azure/msal-node` | Microsoft OAuth2/PKCE authentication |
| `googleapis` | Google OAuth2 and Drive API |
| `electron-updater` | Auto-update checking and installation |
| `chokidar` | File system watching for folder sync (lazy-loaded) |
| `@mozilla/readability` | Article extraction from URLs (lazy-loaded) |
| `jsdom` | DOM parsing for URL extraction (lazy-loaded) |
| `pdf-parse` | PDF text extraction (lazy-loaded) |
| `pdfkit` | PDF export (article provenance headers) |
| `adm-zip` | EPUB/MOBI ZIP extraction (lazy-loaded) |
| `mammoth` | DOCX→HTML conversion with image extraction (lazy-loaded) |
| `cheerio` | HTML parsing (lazy-loaded) |
| `docx` | .docx export for reading notes (APA citations) |
| `exceljs` | .xlsx export for reading log |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `vitest` (4.1) | Unit testing framework |
| `electron-builder` (26) | NSIS installer packaging |
| `concurrently` | Parallel dev server + Electron |
| `wait-on` | Dev startup synchronization |
| `@vitejs/plugin-react` | React Fast Refresh for Vite |

### Lazy-Loading Strategy

Heavy dependencies are lazy-loaded on first use to keep startup fast: `chokidar`, `@mozilla/readability`, `jsdom`, `pdf-parse`, `adm-zip`, `cheerio`. This saves ~13MB from initial load.

---

## 4. Data Model

All persistent data lives in the user data directory at `{userData}/blurby-data/` as JSON files. Schema versioning and migration are built in.

### Core Files

| File | Content | Schema |
|------|---------|--------|
| `settings.json` | User preferences | `BlurbySettings` |
| `library.json` | Document metadata array | `BlurbyDoc[]` |
| `history.json` | Reading session history | `ReadingSession[]` |
| `error.log` | Error logging | Plain text |
| `site-cookies.json` | Authenticated site cookies | Cookie jar |

### BlurbyDoc (document record)

Defined in `src/types.ts`. Key fields:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | UUID |
| `title` | string | Display title |
| `content` | string? | Full text (null for folder-sourced docs) |
| `wordCount` | number | Total words |
| `position` | number | Current reading position (word index) |
| `cfi` | string? | EPUB CFI (Canonical Fragment Identifier) for exact position |
| `furthestPosition` | number? | High-water mark for backtrack detection |
| `source` | enum | `"manual" | "folder" | "url" | "sample"` |
| `filepath` | string? | Absolute path to source file |
| `convertedEpubPath` | string? | Path to converted EPUB (for non-EPUB formats) |
| `legacyRenderer` | boolean? | Opt-in for word-by-word renderer instead of foliate |
| `ext` | string? | File extension |
| `favorite` | boolean? | Favorited by user |
| `archived` | boolean? | Soft-archived |
| `tags` | string[]? | User tags |
| `collection` | string? | Collection name |
| `snoozedUntil` | number? | Epoch ms snooze deadline |
| `unread` | boolean? | Unread flag |
| `deleted` | boolean? | Tombstone for sync |
| `deletedAt` | number? | Revision number when deleted |
| `syncContent` | boolean? | Whether content syncs to cloud |
| `contentHash` | string? | SHA-256 for sync verification |
| `author`, `authorFull` | string? | Author metadata |
| `sourceDomain`, `publishedDate` | string? | Article provenance |
| `coverPath` | string? | Extracted cover image path |

### BlurbySettings (user preferences)

Defined in `src/types.ts`. Defaults in `src/constants.ts` (`DEFAULT_SETTINGS`). Key fields:

| Field | Default | Purpose |
|-------|---------|---------|
| `wpm` | 300 | Reading speed (words per minute) |
| `theme` | `"dark"` | `"dark" | "light" | "blurby" | "eink" | "system"` |
| `readingMode` | `"focus"` | Active mode type |
| `lastReadingMode` | `"flow"` | Space bar starts this mode from Page view |
| `ttsEngine` | `"web"` | `"web" | "kokoro"` |
| `ttsRate` | 1.0 | TTS speech rate (0.5-2.0) |
| `rhythmPauses` | object | Comma, sentence, paragraph, number, long-word pauses |
| `layoutSpacing` | object | Line height, character spacing, word spacing |
| `focusTextSize` | 110 | Font size percentage (60-200) |
| `syncIntervalMinutes` | 5 | Auto-sync frequency |

### EPUB CFI Position Tracking

For EPUBs rendered by foliate-js, position is tracked via CFI (Canonical Fragment Identifier) rather than word index. CFI is an EPUB standard that identifies an exact location within the EPUB DOM tree, surviving content reflows and font size changes.

- `BlurbyDoc.cfi` stores the CFI string (e.g., `epubcfi(/6/4!/4/2/1:0)`)
- `BlurbyDoc.position` stores an approximate word index (for progress bar display)
- On EPUB open, the saved CFI is passed to foliate-js to restore exact position
- For new EPUBs with no saved CFI, `goToFraction(0)` lands on the cover page

### Cloud Sync Data Model

Sync uses revision counters and tombstones for conflict resolution:

- Each document carries a revision number incremented on every change
- Deleted documents become tombstones (`deleted: true`, `deletedAt: revisionNumber`)
- The sync engine performs field-level merge for settings, document-level merge for library, and append-merge for history
- Content hashes (SHA-256) verify document integrity after sync
- An operation log tracks all changes for two-phase staging and rollback

---

## 5. Reading Modes

Blurby implements four reading modes via the strategy pattern defined in `src/modes/ModeInterface.ts`.

### ReadingMode Interface Contract

Every mode implements this interface (`src/modes/ModeInterface.ts`):

```
start(wordIndex)    — Begin from a specific word
pause()             — Pause without losing position
resume()            — Continue from where pause() left off
stop()              — Stop completely, clean up timers/audio
getCurrentWord()    — Get current word index
setSpeed(value)     — Change WPM or TTS rate
jumpTo(wordIndex)   — Seek to a specific word
getState()          — Get ModeState (type, isPlaying, currentWordIndex, effectiveWpm)
destroy()           — Final cleanup, instance should not be reused
```

### Mode Lifecycle

```
create(config) → start(wordIdx) → [advance / pause / resume / setSpeed] → stop → destroy
```

`ReaderContainer` orchestrates transitions between modes. When switching modes, the current mode is `stop()`'d and `destroy()`'d, and the new mode is created and `start()`'d.

### Page Mode (`src/modes/PageMode.ts`)

The default mode. No auto-advance. User reads at their own pace with paginated text, word click selection, notes, and dictionary lookup. All other modes are sub-modes that return to Page when paused.

- `start()` / `pause()` / `resume()` / `stop()` are no-ops
- `jumpTo()` updates the word index and notifies via callback

### Focus Mode (`src/modes/FocusMode.ts`)

RSVP (Rapid Serial Visual Presentation). Displays one word at a time centered on screen.

- Uses `setTimeout` chain (not `setInterval`) for variable-duration rhythm pauses
- Each word's dwell time: `(60000 / WPM) + rhythmPause`
- Rhythm pauses calculated by `src/utils/rhythm.ts` based on punctuation, paragraph breaks, numbers, and word length
- Visual rendering (centered word, ORP highlight, focus marks) handled by `ReaderView.tsx`

### Flow Mode (`src/modes/FlowMode.ts` + `src/utils/FlowScrollEngine.ts`)

Infinite-scroll reading with a shrinking underline cursor pacing the reader line-by-line.

- **Architecture (FLOW-3A):** Timing engine (`FlowMode.ts`) drives word advancement via `setTimeout` chain with half-duration rhythm pauses. Visual rendering handled by `FlowScrollEngine` — an imperative TypeScript class (per LL-014) that owns the scroll container, cursor DOM element, animation timers, and line map.
- **Rendering path:** FoliatePageView switches to `flow="scrolled"` (foliate-js native scrolled mode) when `flowMode=true`. All documents are EPUB (since EPUB-2B), so FlowScrollEngine always operates on foliate's scrollable container. `FlowScrollView.tsx` exists as a non-EPUB fallback but is effectively dead code.
- **Shrinking underline cursor:** A `var(--accent)` underline spans the full width of the active line, then contracts from left-to-right via CSS `transition: width Xms linear` (duration derived from WPM and word count per line). When width reaches 0, the next line's underline appears at full width. Forced reflow (`offsetWidth`) used between `transition:none` and the new transition (per LL-015).
- **Reading zone:** Active line auto-scrolled to ~25% from top of viewport (`FLOW_READING_ZONE_POSITION`). Upcoming text visible below, already-read text scrolls off top. E-ink mode uses jump-scroll instead of smooth scroll.
- **Line map:** `buildLineMap()` scans all `[data-word-index]` spans in the scroll container, groups them into lines by vertical position (y-coordinate threshold = 0.5 * element height).
- **Pause/resume:** Space pauses cursor animation (freezes current width via `getComputedStyle`). Mouse wheel triggers manual scroll pause with 2s auto-resume delay (`FLOW_SCROLL_RESUME_DELAY_MS`).
- **Keyboard:** ↑/↓ = line jump, Shift+↑/↓ = paragraph jump, ←/→ = WPM adjust (±25), Space = pause/resume, Escape = exit.
- **Constants:** `FLOW_READING_ZONE_POSITION` (0.25), `FLOW_CURSOR_HEIGHT_PX` (3), `FLOW_CURSOR_EINK_HEIGHT_PX` (4), `FLOW_SCROLL_RESUME_DELAY_MS` (2000), `FLOW_LINE_ADVANCE_BUFFER_MS` (50).
- **Reverses LL-013** ("Flow belongs in Page View") — see LL-067. Infinite scroll is fundamentally incompatible with CSS multi-column pagination.

### Narrate Mode (`src/modes/NarrateMode.ts`)

TTS-driven reading with word highlight and auto page turn.

- Delegates all timing to the narration engine (`useNarration` hook)
- Web Speech uses boundary events for word advancement; Kokoro uses estimated timers from audio duration / word count
- Speed controlled by TTS rate (0.5-2.0x), not WPM
- Effective WPM derived as: `ttsRate * TTS_RATE_BASELINE_WPM` (150)
- Uses `NarrationInterface` to bridge with the React hook without importing React

### ModeConfig

All modes receive a `ModeConfig` at construction:

| Field | Type | Purpose |
|-------|------|---------|
| `words` | `string[]` | Full word array for the document |
| `wpm` | number | Current WPM setting |
| `callbacks` | `ModeCallbacks` | `onWordAdvance`, `onPageTurn`, `onComplete`, `onError` |
| `isFoliate` | boolean | Whether this is a foliate-rendered EPUB |
| `paragraphBreaks` | `Set<number>` | Word indices that end a paragraph |
| `settings` | object | Mode-specific settings (rhythm, TTS rate, focus span, etc.) |

---

## 6. EPUB Rendering (foliate-js)

EPUBs are rendered natively via foliate-js in `src/components/FoliatePageView.tsx`, preserving full HTML formatting, images, and CSS.

### Loading Pipeline

1. Renderer requests file buffer via `window.electronAPI.readFileBuffer(filepath)`
2. Buffer converted to a `File` object (foliate-js expects `File`)
3. `<foliate-view>` custom element created and attached to a container
4. EPUB loaded via `view.open(file)`
5. foliate-js parses the EPUB ZIP, renders sections into shadow DOM iframes
6. CSS multi-column layout handles pagination (DOM-based, not estimation)

### Shadow DOM / Iframe Architecture

foliate-js renders EPUB content inside a shadow DOM containing an iframe per section. This means:

- EPUB CSS is isolated from the app's CSS
- Word extraction must traverse into the iframe's `contentDocument`
- DOM Ranges created in one section become invalid when another section loads
- The `getContents()` API provides access to currently loaded sections

### Word Extraction

`extractWordsFromView()` in `FoliatePageView.tsx`:

1. Iterates over `view.renderer.getContents()` (currently loaded sections)
2. Uses `TreeWalker` to find all text nodes (skipping `<script>` and `<style>`)
3. Segments text via `Intl.Segmenter` (word-level granularity)
4. Attaches trailing punctuation to words (needed for rhythm pauses)
5. Creates `Range` objects for each word (used for highlighting overlays)
6. Tracks paragraph boundaries by detecting block-parent changes between words

Each word is stored as a `FoliateWord`:
```typescript
interface FoliateWord {
  word: string;
  range: Range | null;      // null when section is unloaded
  sectionIndex: number;
}
```

### CFI-Based Position Tracking

- foliate-js emits `relocate` events with CFI location data
- CFI stored in `BlurbyDoc.cfi` for exact position restoration
- Fraction (0.0-1.0) derived for progress bar display
- Section index tracked for word array management

### Known Challenges

| Challenge | Status | Details |
|-----------|--------|---------|
| Stale Ranges | Mitigated | When a section unloads, its DOM Ranges become invalid. `safeRangeOp` + `isConnected` guards prevent crashes. Words re-extracted on section change. |
| CSS column visibility | Open (BUG-090/091) | All section words exist in DOM simultaneously across CSS columns. Cannot determine which words are "visible" on the current page. Affects narration auto-advance and Flow cursor. |
| Focus mode start position | Open (BUG-092) | `wordsRef` may not be populated with foliate words when Focus starts. |
| Two-column layout | Handled | Viewport width threshold at 1040px (`FOLIATE_TWO_COLUMN_BREAKPOINT_PX`) |

---

## 7. TTS Engine (Kokoro)

Blurby supports two TTS backends. The default is Web Speech API (`ttsEngine: "web"`). The neural option is Kokoro (`ttsEngine: "kokoro"`), an ONNX-based model running locally.

### Kokoro Architecture

```
Renderer (useNarration hook)
  → IPC: kokoroGenerate(text, voice, speed)
    → main/tts-engine.js (worker manager)
      → main/tts-worker.js (worker_threads)
        → kokoro-js (ONNX inference)
      ← Float32Array audio + sampleRate
    ← IPC response
  → AudioContext.decodeAudioData → playback
```

- **Worker thread isolation:** All ONNX inference runs in a `worker_threads` Worker so the main process event loop is never blocked.
- **Model:** `onnx-community/Kokoro-82M-v1.0-ONNX` (q4 quantization, ~50MB)
- **Sample rate:** 24,000 Hz
- **Idle unload:** Worker terminates after 5 minutes of no use to free memory.
- **Warm-up:** On first activation, a warm-up inference ("Hello.") primes the ONNX session.

### 28 Voices

Defined in `src/constants.ts` (`KOKORO_VOICE_NAMES`):

| Accent | Count | Voices |
|--------|-------|--------|
| American | 20 | Heart, Alloy, Aoede, Bella, Jessica, Kore, Nicole, Nova, River, Sarah, Sky, Adam, Echo, Eric, Fenrir, Liam, Michael, Onyx, Puck, Santa |
| British | 8 | Alice, Emma, Isabella, Lily, Daniel, Fable, George, Lewis |

Voice labels use the format "Name — Accent" (e.g., "Bella — American", "Daniel — British"). No gender prefix.

### Rolling Audio Queue (NAR-1)

The narration engine uses a producer-consumer rolling audio queue (`src/utils/audioQueue.ts`) for Kokoro playback. This replaces the earlier pre-buffer bolt-on (see LL-047).

```
Producer (background loop)           Consumer (playback)
  │                                    │
  ├─ Generate chunk 0 ─────────────┬──►│ Play chunk 0
  ├─ Generate chunk 1 ─────────────┤   │   (word advance timer)
  ├─ Generate chunk 2 ─────────────┤   │   │
  │   (queue full, pause)          │   ├──►│ Pause (100/400/800ms)
  │                                │   ├──►│ Play chunk 1
  ├─ Generate chunk 3 ◄── slot freed  │   │   ...
  └─ ...                           │   └──►│ onEnd
```

1. **Producer** continuously calls `kokoroGenerate()` IPC, slicing words into sentence-aligned chunks. Maintains a queue of `TTS_QUEUE_DEPTH` (3) pre-generated `AudioChunk` objects. Pauses when queue is full, resumes when consumer takes one.
2. **Consumer** plays chunk from queue head via Web Audio API. Between chunks, inserts manual silence based on smart pause heuristics (see below). On chunk end, shifts queue, signals producer.
3. **Startup:** Producer generates chunks 0, 1, 2. Playback starts when chunk 0 is ready.
4. **Rate changes:** Queue is flushed, re-generated from current position at new rate.
5. **Pause/resume:** `audioCtx.suspend()/resume()`. Producer can keep generating during pause.
6. **Stop:** Clear queue, cancel in-flight IPC, reset producer.

### Smart Pause Heuristics (NAR-1)

Calculated by `src/utils/pauseDetection.ts`. Replaces the naive regex-only detection with a multi-step pipeline that handles abbreviations and dialogue paragraphs:

**Sentence-end detection (priority order):**
1. Internal period (e.g. `J.P.`, `N.A.S.A.`) → acronym, no pause
2. Known abbreviation set (22 entries: `dr.`, `mr.`, `etc.`, `i.e.`, ...) → no pause
3. Next word starts with lowercase → not sentence end, no pause
4. Otherwise → real sentence end, apply sentence pause
5. `!` and `?` always trigger sentence pause

**Paragraph-break detection (sentence-count heuristic):**
- ≤2 sentences → dialogue paragraph → 0ms pause (sentence pause only if sentence-ending)
- >2 sentences → expository paragraph → full 800ms pause

| Boundary | Duration |
|----------|----------|
| Comma/semicolon/colon | 100ms |
| Sentence end (. ! ?) | 400ms |
| Paragraph (>2 sentences) | 800ms |
| Dialogue paragraph (≤2 sentences) | 0ms (sentence pause if applicable) |

### Generation ID Pattern

A generation ID inside `audioQueue.ts` guards against stale audio. When TTS rate changes mid-playback, the generation ID increments. Any IPC response with a mismatched generation ID is discarded. The queue flushes all buffered chunks and re-generates from the current position.

### Dual-Write Pattern (stateRef)

The narration state machine uses React's `useReducer` for state (`dispatch()`), plus a `stateRef` ref for synchronous reads inside async callbacks. Because `dispatch()` is asynchronous (batched by React), callbacks that fire between renders must read from `stateRef.current`, not from the reducer state.

**Dual-write rule:** Every `dispatch()` that changes `status`, `cursorWordIndex`, or `speed` must also update `stateRef.current` on the same line.

### Worker Crash Recovery

If the Kokoro worker thread crashes (uncaught exception, OOM), the `error` event handler in `tts-engine.js` rejects all pending requests and resets engine state (`worker = null; modelReady = false; loadingPromise = null`). The next `generate()` call transparently creates a fresh worker and re-loads the model. The renderer sees a loading signal (`tts-kokoro-loading` IPC) during re-warm.

### Privacy & Data Flow

Narrate mode has two TTS backends with different privacy characteristics:

- **Kokoro (local):** All inference runs on-device in a worker thread. After the one-time model download from HuggingFace CDN (~50MB, cached under `userData/models/`), no network requests are made. Text is passed via IPC from renderer to main process to worker thread. No text is logged, cached, or transmitted externally.
- **Web Speech API (platform):** Uses the operating system's speech synthesis service. On Windows, this is typically local (SAPI/OneCore voices). Some platforms may route text through cloud services for higher-quality voices — this is OS-dependent and outside Blurby's control. Blurby does not log or cache any text passed to Web Speech.
- **No telemetry.** Blurby collects no usage data, analytics, or crash reports related to narration or any other feature.

### Web Speech Voice Fallback

When no user-selected voice is stored, the default Web Speech voice is chosen by locale priority: `en-US` first, then `en-GB`, then any `en-*` variant, then the first available voice. Voices may load asynchronously via the `voiceschanged` event — the selection runs again when new voices appear, but never overrides a user's prior choice. The logic lives in `src/utils/voiceSelection.ts` (`selectPreferredVoice`).

### SSML Stance

Blurby sends plain text to both TTS engines. SSML is not supported and not planned. Kokoro handles prosody through its neural model. Web Speech API handles it through platform synthesis. Adding SSML preprocessing is unnecessary complexity for a reading application that processes existing prose.

### Safety Posture

Narrate mode reads user-provided text verbatim. No content filtering, generation, recommendation, or content sharing occurs. Voice personas are user-selected from Kokoro's 28-voice inventory. No voice cloning or custom voice upload is supported.

### TTS Glossary

| Term | Definition |
|------|------------|
| **Phonemizer** | Library that converts text to phoneme sequences before neural TTS synthesis. Used by Kokoro via `kokoro-js`. |
| **Lexicon** | A pronunciation dictionary mapping words to phoneme sequences. Kokoro uses its built-in lexicon. |
| **Prosody** | The rhythm, stress, and intonation of speech. Kokoro's neural model generates prosody from context. |
| **SSML** | Speech Synthesis Markup Language — XML-based control of TTS output. Not used by Blurby. |
| **Pre-buffer** | Generating the next chunk's audio while the current chunk plays, stored in `preBufferRef`. |
| **Generation ID** | An incrementing counter that invalidates stale async TTS results after speed/position changes. |
| **Chunk** | A ~40-word segment of text, aligned to sentence boundaries, sent to the TTS engine as one unit. |
| **Sentence boundary** | The end of a sentence (`.`, `!`, `?` plus optional closing quotes). Chunks prefer to end here. |
| **Dual-write rule** | Every `dispatch()` must also update `stateRef.current`. Prevents async callbacks from reading stale state. |
| **stateRef** | A React ref mirroring reducer state for synchronous reads inside async TTS callbacks. |
| **Rhythm pause** | Silence inserted between chunks at punctuation/paragraph boundaries (100/200/400ms). |
| **Web Audio API AudioContext** | The browser API used to play Kokoro's raw PCM audio buffers. Supports suspend/resume for pause. |

---

## 8. Universal EPUB Pipeline

**Status:** Design phase (Sprint 27). Current system uses dual rendering paths.

### Current Format Handling

All format parsing lives in `main/file-parsers.js` (content extraction) and `main/epub-converter.js` (format→EPUB conversion):

| Format | Parser | Conversion | Fidelity |
|--------|--------|-----------|----------|
| EPUB | `adm-zip` + `cheerio` | Native (copy) | Full — foliate-js rendering |
| PDF | `pdf-parse` | `pdfToEpub` → `structuredTextToHtml` | Headings, lists, paragraphs detected. No bold/italic or image extraction (pdf-parse limitation). |
| MOBI/AZW3 | Custom PalmDoc + `parseMobiHtml` | `mobiToEpub` preserves HTML | Bold, italic, headings, lists, images |
| HTML | `cheerio` | `htmlToEpub` sanitizes + preserves | Full HTML structure, embedded images |
| DOCX | `mammoth` | `docxToEpub` → HTML → EPUB | Bold, italic, headings, lists, images |
| TXT/MD | Direct file read | `txtToEpub` / `mdToEpub` | Plain text / Markdown formatting |

### Single Renderer Architecture (EPUB-2B)

All documents render through foliate-js (`FoliatePageView.tsx`). Every format is converted to EPUB on import via `convertToEpub()`. URL-imported articles and Chrome extension articles also produce EPUB (not PDF/TXT). Documents without an EPUB path show a "needs re-import" error. The legacy text rendering fallback has been removed — `legacy-parsers.js` is retained only for word count extraction during import.

- All formats (HTML/TXT/MD/DOCX/PDF/MOBI/AZW) → EPUB on import
- URL articles → `extractArticleFromHtml` → `htmlToEpub` (with metadata in OPF)
- Chrome extension articles → `htmlToEpub` via ws-server
- Lazy migration: legacy docs get on-demand EPUB conversion via `load-doc-content`
- Stored at `userData/converted/<docId>.epub`

### Scanned PDF Detection

PDF documents that contain only images (scanned books) are detected by checking for near-zero text content from `pdf-parse`. These are flagged to the user as unsupported.

---

## 9. Library Management

### Import Pipeline

Documents enter the library through four paths:

| Path | Entry Point | Handler |
|------|-------------|---------|
| Manual add | "Paste text" UI | `addManualDoc` IPC |
| File drag-and-drop | Drop zone anywhere in app | `importDroppedFiles` IPC |
| Folder watch | `chokidar` watcher on configured folder | `main/folder-watcher.js` |
| URL import | Paste URL or Chrome extension | `addDocFromUrl` IPC via `main/url-extractor.js` |

Folder-sourced documents do NOT store content in `library.json`. Content is loaded on-demand via the `load-doc-content` IPC channel.

### Metadata

Each document carries:

| Field | Source |
|-------|--------|
| Title | EPUB metadata, filename parsing, URL `<title>` |
| Author | EPUB metadata, filename parsing, URL byline extraction |
| Word count | `countWords()` utility on extracted text |
| Cover image | EPUB cover extraction, MOBI cover record |
| Source domain | URL hostname extraction |
| Published date | URL metadata extraction |
| Format/extension | File extension detection |

### Progress Tracking

- **Non-EPUB:** `position` field stores the current word index (0-based integer)
- **EPUB:** `cfi` field stores the EPUB CFI string; `position` stores an approximate word index for progress display
- **High-water mark:** `furthestPosition` tracks the furthest point reached. Closing below this triggers a backtrack prompt (Sprint 25S)
- **Engagement gating:** Progress is only saved after deliberate interaction (mode start, word click, page turn). Opening a book does not falsely advance progress.

### Library Card Display

Cards show three lines:
1. **Title** (truncated with ellipsis)
2. **Author** (if available)
3. **Book data** (progress %, pages, time read/remaining)

Library supports grid and list view modes, search, favorites, archives, tags, collections, and snooze.

---

## 10. Settings System

### Current Structure

Settings live in `BlurbySettings` (`src/types.ts`) with defaults in `src/constants.ts` (`DEFAULT_SETTINGS`). Accessed via `SettingsContext` throughout the renderer.

Eight settings sub-pages in `src/components/settings/`:

| Page | Content |
|------|---------|
| Theme | Dark/light/blurby/eink/system, accent color, font family |
| Reading Layout | Text size, spacing (line/character/word) |
| Speed Reading | WPM, rhythm pauses, Focus span/marks, Flow cursor style |
| Library Layout | View mode, card size, spacing |
| Hotkeys | Keyboard shortcut reference |
| Connectors | Site logins for paywall content |
| Cloud Sync | Provider sign-in, sync frequency, manual sync |
| Help | Version info, auto-updater, error logs |

### 3-Tier Cascade Vision (Sprint 28)

Planned but not yet implemented:

```
Global settings (default for all books)
  → Per-book overrides (stored on BlurbyDoc)
    → Per-view overrides (active only during session)
```

Currently only global settings exist. Per-book settings will add fields like `bookWpm`, `bookTheme`, `bookFontFamily` to `BlurbyDoc`.

### Command Palette Integration

The Ctrl+K command palette (`CommandPalette.tsx`) provides quick access to:
- All keyboard shortcuts
- Settings pages
- Library actions (search, filter, sort)
- Reading mode switches
- Document operations

---

## 11. Cloud Sync

### Authentication

Two OAuth2 providers, implemented in `main/auth.js`:

| Provider | Library | Token Storage |
|----------|---------|---------------|
| Microsoft | `@azure/msal-node` (PKCE flow) | Encrypted via `safeStorage` |
| Google | `googleapis` (OAuth2) | Encrypted via `safeStorage` |

### Sync Engine (`main/sync-engine.js`)

Offline-first architecture:

1. **Local changes** are applied immediately and queued in the operation log
2. **Sync trigger** (manual or auto-interval) pushes pending operations to cloud
3. **Conflict resolution** uses revision counters: higher revision wins
4. **Field-level merge** for settings (each field has independent revision)
5. **Document-level merge** for library (per-document revision)
6. **Append-merge** for reading history (union of sessions)

### Key Mechanisms

| Mechanism | Purpose |
|-----------|---------|
| Revision counters | Conflict detection and resolution |
| Tombstones | Deleted documents persist with `deleted: true` for cross-device sync |
| Operation log | Records all changes for replay and rollback |
| Two-phase staging | Changes written to staging area, then committed atomically |
| Content hash (SHA-256) | Verifies document content integrity after sync |
| Conditional writes | Cloud writes check revision before applying |
| Full reconciliation | Periodic full scan to catch drift (`cloudFullReconciliation` IPC) |

### Sync Queue (`main/sync-queue.js`)

When offline, operations are queued with compaction (multiple edits to the same document collapse) and idempotent replay on reconnect.

### Cloud Storage Providers

- **OneDrive** (`main/cloud-onedrive.js`): App Folder via Microsoft Graph API, chunked uploads for large files
- **Google Drive** (`main/cloud-google.js`): `appDataFolder` scope, resumable uploads, retry with exponential backoff

---

## 12. Theming & Branding

### CSS Custom Properties System

All theming uses CSS custom properties defined in `src/styles/global.css`. No inline styles.

Core variables:

| Variable | Purpose |
|----------|---------|
| `--bg` | Background color |
| `--fg` | Foreground (text) color |
| `--accent` | Primary accent color |
| `--accent-faded` | Accent with reduced opacity |
| `--bg-subtle` | Subtle background variation |
| `--bg-hover` | Hover state background |
| `--border-subtle` | Border color |
| `--reader-font-size` | Reader text size |

### Themes

| Theme | Background | Accent |
|-------|-----------|--------|
| Dark | Dark gray/black | User-selected or default |
| Light | White/off-white | User-selected or default |
| Blurby | White | Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946), Core Blue (#2E73FF) |
| E-Ink | White, no animations | Monochrome, large touch targets |
| System | Follows OS preference | User-selected |

### Blurby Brand Theme

The Blurby theme is a locked brand experience: accent color and font customization are disabled when selected. Brand colors from `CLAUDE.md`:

| Element | Color |
|---------|-------|
| Primary Orange | #D04716 |
| Navy | #050F32 |
| Gray | #6D6F6D |
| Off-white | #F9F9F8 |

**In-app Blurby theme:** White background, Highlight Blue (#CAE4FE) for chrome elements, Accent Red (#E63946) for interactive elements, Core Blue (#2E73FF) for dividers and the tri-color header line.

### Accent Color Unification

All interactive elements use `var(--accent)`: WPM slider thumb/track, selected mode button, flow cursor underline, narration word highlight, word selection highlight. Some hardcoded values remain as open bugs (BUG-065, BUG-066).

### WCAG 2.1 AA Compliance

Accessibility work from Sprint 15:
- ARIA labels on all interactive elements
- Keyboard navigation throughout
- Screen reader support
- `prefers-reduced-motion` respected (animations disabled)
- Focus indicators on all interactive elements

---

## 13. Build & Release

### CI/CD (GitHub Actions)

Two workflows in `.github/workflows/`:

| Workflow | Trigger | What |
|----------|---------|------|
| `ci.yml` | Push / PR to main | `npm test` + `npm run build` on Windows + Linux matrix |
| `release.yml` | `v*` tag push or `workflow_dispatch` | Single-job build producing x64 + ARM64 NSIS installers, draft GitHub release |

### NSIS Installer

Configured in `package.json` under `build.nsis`:

- Non-one-click (user can choose install directory)
- Custom installer header and sidebar images (`assets/installer/`)
- Desktop and Start Menu shortcuts
- Runs after finish

Artifact naming: `Blurby-Setup-{version}-{arch}.exe`

### Auto-Updater

`electron-updater` checks for updates via GitHub Releases:

1. `checkForUpdates` IPC triggers check
2. If available, user sees notification in Settings > Help
3. `installUpdate` IPC triggers download and quitAndInstall
4. Delta updates supported for smaller download sizes

The release workflow produces a single `latest.yml` containing both x64 and ARM64 entries (BUG-081 fix: previously two jobs overwrote each other).

### Version Tagging

- Version in `package.json`: currently `2.1.0`
- Git tags: `v2.1.0` format triggers release workflow
- Branch naming: `sprint/<N>-<name>` (e.g., `sprint/td1-tech-debt`)

---

## 14. Testing

### Framework

Vitest 4.1, configured to run with `npm test` (`vitest run`).

### Test File Inventory

27 test files in `tests/`:

| File | Domain |
|------|--------|
| `wpm.test.js` | WPM calculations |
| `text.test.js` | Text tokenization, word counting |
| `rhythm.test.js` | Rhythm pause calculations |
| `chapters.test.ts` | Chapter detection (NCX, nav, heuristic) |
| `highlights.test.js` | Highlight formatting |
| `features.test.js` | Streak tracking, reading stats |
| `pdf-export.test.js` | PDF generation |
| `image-validation.test.js` | Image magic-byte validation |
| `migrations.test.js` | Schema migration framework |
| `sync-hardening.test.js` | Sync conflict resolution |
| `sync-queue.test.js` | Offline queue compaction |
| `ws-server.test.js` | WebSocket server (Chrome extension) |
| `provenance.test.js` | Article provenance extraction |
| `notes-reading-log.test.js` | Notes and reading log export |
| `epub-converter.test.js` | EPUB conversion |
| `epub-fidelity.test.js` | EPUB formatting preservation, image embedding, DOCX→EPUB |
| `useReader.test.ts` | Reader hook (timing, sync, edge cases) |
| `useLibrary.test.ts` | Library hook (CRUD, failures, folders) |
| `useKeyboardShortcuts.test.ts` | Keyboard routing matrix |
| `useNarration.test.ts` | TTS lifecycle |
| `three-mode-reader.test.js` | Mode switching |
| `keyboard-shortcuts.test.js` | Shortcut key mapping |
| `stress.test.ts` | Large document (100k+ words) |
| `menu-flap.test.js` | Menu flap behavior |
| `segmentWords.test.ts` | Intl.Segmenter word tokenization |
| `getOverlayPosition.test.ts` | Overlay positioning |
| `startWordIndex.test.ts` | Start word index calculation |
| `useProgressTracker.test.ts` | Progress tracking and engagement gating |

### Current Coverage

522 tests across 27 files. All passing on `sprint/td1-tech-debt`.

### Coverage Gaps

| Area | Gap |
|------|-----|
| FoliatePageView | No tests for foliate-js rendering (requires real DOM) |
| Cloud sync integration | Unit tests only; no end-to-end with real cloud providers |
| TTS audio output | Mocked; no actual audio verification |
| Electron IPC | Main process handlers tested via function extraction, not via real IPC |
| CSS rendering | No visual regression tests |
| Auto-updater | No E2E update flow test |

---

## 15. Known Technical Debt

### Open Technical Debt Items

| ID | Item | Severity | Location |
|----|------|----------|----------|
| TD-02 | Mode wiring incomplete | High | `src/components/ReaderContainer.tsx` — modes created but not fully wired to all UI controls |
| BUG-031 | Bottom bar not visible in Focus/Flow | High | CSS z-index conflict between reader overlay and bottom bar |
| BUG-040 | Focus mode covers bottom bar (clickable) | High | `position: fixed` overlay intercepts pointer events |
| BUG-090 | EPUB narration no auto-advance | High | Cannot detect page boundary in CSS multi-column layout |
| BUG-091 | EPUB Flow cursor broken | High | Same CSS column visibility issue as BUG-090 |
| BUG-092 | EPUB Focus starts wrong position | Medium | `wordsRef` not populated when Focus starts |
| BUG-032 | Kokoro "App Not Responding" flash | Medium | Initial ONNX model import briefly blocks |
| BUG-033/034 | Book formatting/images stripped | Medium | Text-only extraction pipeline (Sprint 27 will fix) |
| BUG-039 | Space bar doesn't remember last mode | Medium | Always starts Flow instead of last-used |
| BUG-053 | Arrow keys don't adjust NM speed | Medium | Keys adjust WPM in NM instead of TTS rate |
| BUG-054 | Menu flap small click areas | Medium | Button hit targets too small |
| BUG-063 | Define word includes punctuation | Medium | Dictionary lookup fails with trailing punctuation |

### Intl.Segmenter Type Issues

`Intl.Segmenter` is used throughout (`segmentWords.ts`, `FoliatePageView.tsx`) but TypeScript's lib types may not include it in all configurations. The `tsconfig.json` must include `"lib": ["ES2022", "DOM"]` or later for proper typing.

### FoliatePageView Decomposition

`FoliatePageView.tsx` is a large component (~800+ lines) handling EPUB loading, word extraction, overlay rendering, mode integration, and event handling. It should be decomposed into smaller focused modules, but the tight coupling between foliate-js events and DOM Range management makes extraction non-trivial.

---

## 16. Future Architecture

### Per-Book Settings (Sprint 28)

3-tier settings cascade:

```
Global (BlurbySettings)
  → Book overrides (stored on BlurbyDoc, e.g., bookWpm, bookTheme)
    → View overrides (session-only, not persisted)
```

Includes in-book search with CFI navigation and highlight style variants.

### Edge TTS (Sprint 31)

200+ voices via `msedge-tts`:
- SSML support for expressive speech
- Word boundary marks for tight cursor sync
- 3-engine selector UI: System (Web Speech API) / Kokoro (local neural) / Edge (cloud neural)

### E-Ink Display Mode (Sprint 30)

Decouple e-ink from the theme system. Users can use dark/light/blurby themes while keeping e-ink behavior:
- No animations
- Large touch targets
- Ghosting prevention (full-page repaints)
- Dedicated settings panel

### Universal EPUB Pipeline (Sprint 27)

Convert all formats to EPUB on intake. Every document rendered via foliate-js. Eliminates the dual-renderer architecture and fixes formatting/image stripping (BUG-033/034).

### Android Port (Sprint 18C)

React Native with cloud sync, share intent for "Send to Blurby" from other apps. Post-v1 priority.

### RSS Library + Paywall Integration (Sprint 25)

Feed aggregation from authenticated sites, RSS Library UI, seamless article import pipeline.
