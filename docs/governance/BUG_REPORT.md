# Blurby — Running Bug Report

**Purpose:** Tracks bugs in EXISTING implemented features. Each entry contains enough context for any developer to understand and fix the issue without additional direction. New features, enhancements, and architecture changes are tracked in ROADMAP.md.

**Last updated:** 2026-04-04

---

## Incomplete

### ~~BUG-090~~ ✅ Fixed — HOTFIX-7 (v1.4.3) + HOTFIX-8 (v1.4.4)
**Reported:** 2026-03-26 | **Resolved:** 2026-03-29
**Severity:** CRITICAL
**Location:** `src/utils/audioScheduler.ts`, `src/hooks/narration/kokoroStrategy.ts`
**Description:** Narration looped: cursor reset from mid-book (e.g., 1312) to 0, replaying from start. Two distinct failure modes:
1. **Stale onended** (HOTFIX-7): Async `source.onended` from stopped source fired on new session's callbacks. Fixed with epoch counter.
2. **Premature onended** (HOTFIX-8): Scheduler fired onEnd when `activeSources.length === 0` before pipeline delivered chunk 2 via IPC. First ramp-up chunk (13 words, ~3s) finished before async generation completed. Fixed with `pipelineDone` flag — scheduler only fires onEnd when both conditions met (no sources + pipeline done). Restores dual-condition logic from pre-NAR-2 audioQueue.
**Root cause:** NAR-2 replaced audioQueue (which checked `endIdx >= words.length && queue.length === 0`) with audioScheduler (which only checked `activeSources.length === 0`). See LL-053, LL-054.
**Status:** Fixed. Narration pipeline chain complete (NAR-2 → NAR-3 → NAR-4 → HOTFIX-5 → HOTFIX-6 → HOTFIX-7 → HOTFIX-8).

### ~~BUG-093~~ ✅ Fixed — HOTFIX-9 (v1.4.5)
**Reported:** 2026-03-30 | **Resolved:** 2026-03-30
**Severity:** High
**Location:** `src/utils/audioScheduler.ts`
**Description:** Word highlight cursor desynced from narration audio. Root cause: `setSpeed()` boundary recalculation was a no-op (`remaining[i].time = now + (remaining[i].time - now)`). Fix: removed `playbackRate` entirely — generate at actual speed, word boundaries naturally match audio duration.

### ~~BUG-094~~ ✅ Fixed — HOTFIX-9 (v1.4.5)
**Reported:** 2026-03-30 | **Resolved:** 2026-03-30
**Severity:** Medium
**Location:** `src/utils/audioScheduler.ts` (stop)
**Description:** Brief second voice overlap when extraction completes mid-narration. `source.stop()` doesn't instantly silence buffered audio. Fix: `source.disconnect()` before `source.stop()` prevents buffer drain overlap.

### ~~BUG-095~~ ✅ Fixed — HOTFIX-9 (v1.4.5)
**Reported:** 2026-03-30 | **Resolved:** 2026-03-30
**Severity:** Medium
**Location:** `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`
**Description:** Speed changes via `playbackRate` caused pitch distortion (vinyl record effect). Fix: removed `playbackRate` entirely, pipeline generates at actual speed via `config.getSpeed()`, speed changes use debounced stop+restart.

### ~~BUG-092~~ ✅ Fixed — see Complete section

### BUG-031: Bottom bar not visible in Focus mode or Flow mode
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/components/ReaderContainer.tsx` (render), `src/styles/global.css` (.reader-container, .reader-view-area)
**Description:** When entering Focus mode (RSVP) or Flow mode (silent cursor), the unified bottom bar disappears. The `.reader-container` was `position: fixed; inset: 0` which covered everything. Changed to `flex: 1` with `.reader-view-area` wrapper, but user reports bar still missing.
**Status:** Partially fixed. Wrapper added but bar still missing in FSM/FLM — needs verification.

### ~~BUG-032~~ ✅ Fixed — TTS-6D (v1.15.0)
**Reported:** 2026-03-25 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `main/tts-engine.js`, `main/tts-worker.js`
**Description:** When Kokoro TTS is first activated, there is a brief "Not Responding" flash in the Windows title bar while the ONNX model initializes. The worker thread handles inference but the initial `import("kokoro-js")` and `KokoroTTS.from_pretrained()` still causes some main thread blocking during IPC setup.
**Status:** Resolved. TTS-6D added unified engine-status events (`warming`/`ready`/`retrying`/`error`), explicit warming state in narration, delayed prewarm (2s after reader open), and visible "Starting Kokoro..." indicator. Cold start, idle re-warm, and crash recovery are now deterministic and user-visible.

### BUG-033: Book formatting stripped too aggressively
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/epub-converter.js`
**Description:** All book formats (EPUB, MOBI, PDF, HTML) are parsed to plain text, stripping lists, headers, bold/italic, tables, and images. Lists appear concatenated on single lines. Parsers use `cheerio.text()` or regex strip which discards HTML structure.
**Status:** RESOLVED (EPUB-2A, v1.5.0). PDF uses `structuredTextToHtml()` for heading/list detection. MOBI uses `parseMobiHtml()` to preserve HTML formatting. HTML preserves structural elements with sanitization. DOCX uses mammoth for rich HTML.

### BUG-034: Images in books stripped during import
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/epub-converter.js`
**Description:** Inline images within EPUB, MOBI, and HTML books are completely removed during content extraction. Only cover images are preserved. Same root cause as BUG-033 — text-only extraction pipeline.
**Status:** RESOLVED (EPUB-2A, v1.5.0). `buildEpubZip()` accepts `images[]` array. HTML converter extracts base64/local images. MOBI converter extracts image records. DOCX converter uses mammoth image handler. All embedded in EPUB `OEBPS/Images/` with OPF manifest entries.

### BUG-039: Space bar should start last-used reading mode
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx` (handleTogglePlay)
**Description:** When in Page view, Space always enters Flow mode. It should start whichever mode the user last used (Focus, Flow, or Narration), with the preference persisted across sessions via `settings.json`. First-ever use defaults to Flow.
**Status:** ✅ RESOLVED — `useReaderMode.ts` persists `lastReadingMode` in settings. Space bar enters last-used mode. Implemented during TD-1 (Mode Verticals).

### BUG-040: Focus mode covers bottom bar — visible but not clickable
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/styles/global.css` (.reader-container), `src/components/ReaderContainer.tsx`
**Description:** In all reading sub-modes, the bottom bar is visible underneath the reader overlay but cannot be clicked. The `.reader-container` uses `position: fixed` which intercepts pointer events above the bar. Fix needed: give the bottom bar `z-index: 20` (above overlay's z-index: 10).
**Status:** Open. Root cause and fix identified but not applied.

### ~~BUG-053~~ ✅ Fixed — TTS-6C + TTS-6G (v1.18.0)
**Reported:** 2026-03-25 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderContainer.tsx`
**Description:** During Narration mode, Up/Down arrow keys adjust WPM (irrelevant in NM). They should adjust TTS speech rate by 0.1 increments (0.5-2.0 range), immediately applied to slider and audio.
**Status:** Resolved. TTS-6C wired `adjustSpeed` (engine-aware: Kokoro steps buckets 1.0x/1.2x/1.5x, Web Speech uses 0.1 increments). TTS-6G added Kokoro bucket buttons to bottom bar and accessibility polish.

### BUG-054: Small/misaligned click areas in menu flap buttons
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/MenuFlap.tsx`, `src/styles/global.css`
**Description:** Buttons inside the menu flap have very small clickable areas. Users must click precisely on the text/icon — surrounding padding does nothing. Suspected cause: button elements have small intrinsic size with non-forwarding parent padding, or overlapping invisible elements absorb pointer events.
**Status:** Open.

### BUG-049: Window control buttons don't match theme background
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `main/window-manager.js` (BrowserWindow config), `src/styles/global.css`
**Description:** Minimize/maximize/close buttons use default Windows title bar color instead of matching the app's theme. Requires either `titleBarStyle: "hidden"` with custom CSS buttons, or `titleBarOverlay` with color matching.
**Status:** ✅ RESOLVED — `window-manager.js` uses `titleBarOverlay` with per-theme colors from `getThemeColors()`. `updateWindowTheme()` calls `setTitleBarOverlay()` on theme change.

### BUG-063: Define word includes punctuation
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/PageReaderView.tsx` (word selection), `src/components/HighlightMenu.tsx` (define action)
**Description:** When right-clicking a word and selecting "Define", the word includes adjacent punctuation (e.g., "word." or "word,"), causing dictionary API lookup failure. Punctuation must be stripped before lookup.
**Status:** Open.

### BUG-064: Definition popup cannot be dismissed by clicking elsewhere
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/DefinitionPopup.tsx`
**Description:** After viewing a word definition, clicking elsewhere on the screen does not close the popup. Only the close button or Escape key works.
**Status:** Open.

### BUG-065: Word highlight color should use theme accent
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/styles/global.css` (highlight styles)
**Description:** Word selection/highlight in Page view uses hardcoded values instead of `var(--accent)`.
**Status:** Open.

### BUG-066: UI accent elements should all use theme accent color
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/styles/global.css`
**Description:** WPM slider thumb/track, selected mode button background, flow cursor underline, and narration word highlight should use `var(--accent)` — some currently use hardcoded colors.
**Status:** Open.

### ~~BUG-101~~ ✅ Fixed — TTS-7C (v1.31.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx`
**Description:** Narration start blocked main thread 200ms–1,400ms. Fix: added `setTimeout(0)` yield between extraction result processing and ref updates. DOM restamp already deferred via `requestIdleCallback`.
**Status:** Resolved. Sprint: TTS-7C.

### ~~BUG-102~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** CRITICAL
**Location:** `src/hooks/narration/kokoroStrategy.ts`, `src/utils/ttsCache.ts`, `main/tts-cache.js`
**Description:** `kokoroStrategy.ts` sliced 148 words for any cache hit. Fix: store actual `wordCount` in cache entry at write time (manifest + IPC), read it back on cache hit. `loadCachedChunk` uses real word count to slice correctly.
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-103~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/components/ReaderContainer.tsx`
**Description:** Background cacher used `settings.kokoroVoice`. Fix: changed to `settings.ttsVoiceName` (the actual settings field).
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-104~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/backgroundCacher.ts`
**Description:** Background cacher omitted override hash from cache key. Fix: added `overrideHash()` to `cacheBook()` and `isBookFullyCached()`, matching kokoroStrategy identity.
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-105~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/backgroundCacher.ts`, `src/components/ReaderContainer.tsx`
**Description:** Background cacher seeded from persisted position. Fix: added `updateCursorPosition()` method, wired to `onWordAdvance` in ReaderContainer. When narration is active, warms ahead of live cursor; falls back to persisted position otherwise.
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-106~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/backgroundCacher.ts`
**Description:** File header claimed 3-slot priority system, but runLoop was serial. Fix: removed misleading comment, documented actual serial behavior. Kept serial design (sufficient for use case).
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-107~~ ✅ Fixed — TTS-7B (v1.30.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/components/ReaderContainer.tsx`
**Description:** EPUB word clicks bypassed TTS resync path. Fix: foliate `onWordClick` now routes through `handleHighlightedWordChange` instead of raw `setHighlightedWordIndex`. Handler only resyncs when `narration.speaking` (not when paused), implementing the dual cursor contract.
**Status:** Resolved. Sprint: TTS-7B.

### ~~BUG-108~~ ✅ Fixed — TTS-7B (v1.30.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/hooks/useReaderMode.ts`, `src/components/PageReaderView.tsx`
**Description:** Pause after browse-away didn't reconcile cursor. Fix: `handlePauseToPage` now reads the current page's start word via `getCurrentPageStart()` when `isBrowsedAway` is true, updating `highlightedWordIndex` before stopping narration. Next resume plays from the browsed-to position.
**Status:** Resolved. Sprint: TTS-7B.

### ~~BUG-109~~ ✅ Fixed — TTS-7B (v1.30.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/hooks/useNarration.ts`
**Description:** Kokoro fallback started Web Speech without stopping Kokoro first. Fix: `onFallbackToWeb` now calls `kokoroStrategy.stop()` before switching engine, with a `setTimeout(0)` yield before starting Web Speech. Diagnostics event recorded.
**Status:** Resolved. Sprint: TTS-7B.

### ~~BUG-110~~ ✅ Fixed — TTS-7C (v1.31.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/components/settings/SpeedReadingSettings.tsx`
**Description:** Rhythm pause controls visible but non-functional for Kokoro. Fix: conditionally hide rhythm pause toggles when `ttsEngine === "kokoro"`, show explanatory note instead. Controls remain for Web Speech engine.
**Status:** Resolved. Sprint: TTS-7C.

### ~~BUG-111~~ ✅ Fixed — TTS-7B (v1.30.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/utils/generationPipeline.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/hooks/useNarration.ts`
**Description:** Kokoro pause only suspended audio, not chunk emission. Fix: added `pause()`/`resume()` to GenerationPipeline (buffers chunks internally when paused, flushes on resume). Kokoro strategy wires both scheduler + pipeline pause/resume. `useNarration.resume()` accepts optional `currentWordIndex` for cursor-moved-during-pause resync.
**Status:** Resolved. Sprint: TTS-7B.

### ~~BUG-112~~ ✅ Fixed — TTS-7C (v1.31.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx`
**Description:** Duplicate concurrent extraction. Fix: module-level `dedupeExtractWords()` returns existing promise for same book ID. Both extraction paths (background + narration-start) use the dedupe wrapper.
**Status:** Resolved. Sprint: TTS-7C.

### ~~BUG-113~~ ✅ Fixed — TTS-7C (v1.31.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/utils/ttsCache.ts`, `main/ipc/tts.js`
**Description:** Cache IPC used `Array.from()` round-trips. Fix: pass `Float32Array` directly — Electron structured clone preserves typed arrays. IPC handler accepts both Float32Array and plain array for backward compat.
**Status:** Resolved. Sprint: TTS-7C.

### ~~BUG-114~~ ✅ Fixed — TTS-7A (v1.29.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/components/LibraryContainer.tsx`, `src/hooks/useNarration.ts`
**Description:** Bug reporter read wrong field names and had no live diagnostics call sites. Fix: corrected `ttsVoice`→`ttsVoiceName`, `ttsSpeed`→`ttsRate`. Added `recordSnapshot()` at narration start, chunk delivery (web + kokoro), and stop. Added `recordDiagEvent()` at start/stop/pause/resume.
**Status:** Resolved. Sprint: TTS-7A.

### ~~BUG-115~~ ✅ Fixed — TTS-7C (v1.31.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/utils/generationPipeline.ts`, `src/hooks/narration/kokoroStrategy.ts`
**Description:** No backpressure enforcement. Fix: pipeline tracks `pendingChunks` counter, holds emission when `>= TTS_QUEUE_DEPTH` (5). `acknowledgeChunk()` called by kokoroStrategy on scheduler consumption. Backpressure self-heals on acknowledgment.
**Status:** Resolved. Sprint: TTS-7C.

### ~~BUG-116~~ ✅ Fixed — TTS-7F (v1.33.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts`
**Description:** Narration started before Foliate finished rendering the target page DOM, producing `highlightWordByIndex miss` logs and visible page motion. Fix: `TTS-7F` replaced UI-mutating readiness probing with pure `isWordInDom()` checks and closed the duplicate-launch path with a single-launch token.
**Status:** Resolved. Sprint: TTS-7F.

### ~~BUG-117~~ ✅ Verified resolved — TTS-7G (v1.33.2)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `message` handler (renderer IPC response path for `tts-generate`)
**Description:** `[Violation] 'message' handler took 910ms` logged on first narration start of a new book. The response handler deserialized the audio payload and fired `onChunkReady` + `scheduler.scheduleChunk()` in one synchronous block.
**Root cause analysis (TTS-7G):** Three prior fixes eliminated the root causes:
1. **TTS-7C (BUG-113):** Switched IPC audio transport from `Array.from()` round-trips to native `Float32Array` structured clone — eliminated the dominant deserialization cost.
2. **NAR-5 ramp-up:** First chunk is now 13 words (~1s audio, ~24k samples) instead of the old larger sizing — reduced the data volume in the critical first-chunk path.
3. **TTS-7E:** Deferred `pipeline.acknowledgeChunk()` via `queueMicrotask` — broke the synchronous block into two tasks.
**Verification evidence (TTS-7G):** Code-level analysis of the synchronous path: Float32Array copy (~48k samples, <0.5ms) + AudioBuffer creation (<0.5ms) + word boundary computation (13 words, trivial) = total synchronous work < 2ms. Well under the 50ms steady-state budget. DEV instrumentation added (`first-chunk-response` and `schedule-chunk` perf events with meta) for ongoing monitoring. 6 regression tests confirm the response path is bounded.
**Status:** Resolved. No additional hardening needed — existing fixes are sufficient.

### ~~BUG-118~~ ✅ Fixed — TTS-7F (v1.33.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx`
**Description:** Readiness gate caused page jump + duplicate launch. Fix: replaced `highlightWordByIndex` (UI-mutating) with pure `isWordInDom` probe (read-only DOM query). Added `narrationLaunchRef` single-launch token to prevent reentrant starts.
**Status:** Resolved. Sprint: TTS-7F.

### ~~BUG-119~~ ✅ Fixed — TTS-7F (v1.33.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/backgroundCacher.ts`, `src/components/ReaderContainer.tsx`
**Description:** Cold-start ramp had long pauses. Fix: proactive entry-coverage system caches first 5 minutes of narration audio for every non-archived reading. Opening a book queues entry-coverage job immediately. Playback starts from cached audio instead of reactive ramp-up.
**Status:** Resolved. Sprint: TTS-7F.

### ~~BUG-120~~ ✅ Fixed — TTS-7F (v1.33.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/backgroundCacher.ts`, `src/components/ReaderContainer.tsx`, `main/tts-cache.js`
**Description:** No guaranteed opening narration coverage. Fix: `ENTRY_COVERAGE_TARGET_MS` (300000ms / 5 min) constant. `getOpeningCoverageMs()` manifest inspector. Background cacher `queueEntryCoverage()` method stops at 5-minute target. Entry-coverage jobs run at highest priority in the cacher loop.
**Status:** Resolved. Sprint: TTS-7F.

### ~~BUG-121~~ ✅ Fixed — TTS-7F (v1.33.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx`, `src/utils/backgroundCacher.ts`
**Description:** Opening a reading didn’t start cruise cache warming. Fix: ReaderContainer queues entry-coverage job on reader mount when Kokoro + cache enabled. Active book set as priority-1 for full cruise warming via existing setActiveBook path.
**Status:** Resolved. Sprint: TTS-7F.

### ~~BUG-096~~ ✅ Fixed — TTS-6S (v1.28.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/audioScheduler.ts`
**Description:** Cursor highlight drifted from spoken audio during long Kokoro narration.
**Status:** Resolved. TTS-6S: tick() now advances ALL crossed word boundaries in one pass instead of one-per-tick, eliminating accumulating drift from setTimeout jitter.

### ~~BUG-097~~ ✅ Fixed — TTS-6S (v1.28.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Medium
**Location:** `src/utils/audioScheduler.ts`
**Description:** Inappropriate pauses mid-clause and double-pausing at sentence boundaries during Kokoro narration.
**Status:** Resolved. TTS-6S: Reduced punctuation weight boosts in `computeWordWeights` from 1.4/1.15 to 1.12/1.05 — Kokoro already bakes prosodic pauses into generated audio, so extra scheduler-side inflation caused stacking.

### ~~BUG-098~~ ✅ Fixed — TTS-6S (v1.28.0)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** High
**Location:** `src/utils/generationPipeline.ts`
**Description:** Audible silence gaps during Kokoro narration from backlog/cache starvation and duplicate chunk dispatches.
**Status:** Resolved. TTS-6S: First two ramp-up chunks now fire in parallel (overlap IPC) instead of sequential. Duplicate-chunk guard (`lastEmittedStartIdx`) prevents repeated emission at the same cursor position.

### ~~BUG-099~~ ✅ Fixed — HOTFIX-11 (v1.27.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Low (tooling)
**Location:** `src/utils/bugReportState.ts`, `src/components/BugReportModal.tsx`
**Description:** The bug report dialog captures a screenshot and basic app state but did not capture narration-specific diagnostics.
**Status:** Resolved. HOTFIX-11 added `narrateDiagSnapshot` and `narrateDiagEvents` to `BugReportAppState`, wired from `narrateDiagnostics.ts`. Modal shows collapsible "Narration Diagnostics" section with snapshot + event log.

### ~~BUG-100~~ ✅ Fixed — HOTFIX-11 (v1.27.1)
**Reported:** 2026-04-04 | **Resolved:** 2026-04-04
**Severity:** Low (tooling)
**Location:** `src/utils/consoleCapture.ts`, `src/main.tsx`
**Description:** Console output was not included in the bug report JSON.
**Status:** Resolved. HOTFIX-11 added `consoleCapture.ts` ring buffer (200 entries), installed before React mount. `consoleLog` field added to `BugReportAppState`. Modal shows collapsible "Console Log" section with color-coded entries.

---

## Complete

### BUG-092: EPUB Focus mode starts from wrong position
**Reported:** 2026-03-26 | **Fixed:** 2026-03-27
**Location:** `src/hooks/useReaderMode.ts` (startFocus, startFlow)
**Problem:** Focus/Flow on EPUBs started from word 0 because `wordsRef` wasn't populated with foliate words before the mode started. On cover pages or freshly loaded EPUBs, `getWords()` returned empty.
**Solution:** Added section-load retry: if `effectiveWords.length === 0` on an EPUB, trigger `renderer.next()` and retry after `FOLIATE_SECTION_LOAD_WAIT_MS` (same pattern already used by startNarration). Also switched from `reader.wordsRef.current.length` to `effectiveWords.length` for start word resolution, avoiding stale ref reads (Sprint TD-2, commit 237ecb4).

### BUG-091: EPUB Flow mode cursor not working
**Reported:** 2026-03-26 | **Fixed:** 2026-03-27
**Location:** `src/components/FoliatePageView.tsx` (highlightWordByIndex), `src/styles/global.css`
**Problem:** FlowCursorController couldn't find `[data-word-index]` spans in foliate shadow DOM iframes. External overlay div couldn't reach across the shadow DOM boundary.
**Solution:** Two-part fix: (1) FlowMode class drives word-by-word timing for EPUBs via `useReadingModeInstance`, calling `highlightWordByIndex` on each advance. (2) `highlightWordByIndex` applies `page-word--flow-cursor` CSS class (3px accent underline) when `readingModeRef.current === "flow"`, injected into EPUB iframes via `injectStyles` (Sprint TD-2, commit 237ecb4).

### BUG-080: Kokoro AI button unclickable in Speed Reading settings
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/settings/SpeedReadingSettings.tsx`, `src/styles/global.css`
**Problem:** The System/Kokoro AI toggle buttons rendered visually but clicking "Kokoro AI" had no effect due to `-webkit-app-region: drag` inheritance.
**Solution:** Added `-webkit-app-region: no-drag` to `.settings-mode-toggle` and `.settings-mode-btn` in global.css.

### BUG-081: Auto-updater latest.yml only contains ARM64 architecture
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `.github/workflows/release.yml`
**Problem:** Two-job matrix build caused ARM64 job to overwrite `latest.yml`, leaving x64 users unable to receive updates.
**Solution:** Replaced two-job matrix with single-job multi-arch build (`--x64 --arm64`). electron-builder produces single latest.yml natively.

### BUG-082: EPUB starts on page ~3 instead of cover
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** New EPUBs (no saved position) skipped cover/TOC and landed on the first text content section.
**Solution:** Guard initial CFI — only pass `lastLocation` when saved CFI exists. Explicit `goToFraction(0)` fallback for first open.

### BUG-083: Opening a book falsely marks it as "started" with >0% progress
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/ReaderContainer.tsx`, `src/types.ts`
**Problem:** EPUB word extraction started at first real text word (past cover), giving non-zero word index and >0% progress on open.
**Solution:** Engagement-gated progress via `hasEngagedRef`. Progress only saved after mode start, word click, or deliberate page turn. Added high-water mark backtrack prompt.

### BUG-084: Flow mode invisible on EPUBs (no underline cursor)
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx`, `src/utils/FlowCursorController.ts`
**Problem:** FlowCursorController looked for `[data-word-index]` DOM elements that don't exist in foliate's shadow DOM.
**Solution:** Range-based overlay cursor using `getOverlayPosition()` with iframe coordinate transform. GPU-accelerated `translate3d()`.

### BUG-085: Focus mode not centered in foliate overlay for EPUBs
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/ReaderContainer.tsx`, `src/styles/global.css`
**Problem:** Focus mode word display appeared offset from center, positioned relative to foliate's container.
**Solution:** Changed Focus overlay from `position: absolute` to `position: fixed` with `inset: 0` for viewport-level centering.

### BUG-086: Narration highlight doesn't advance in foliate DOM for EPUBs
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** During narration on EPUBs, word highlight stayed on first word or disappeared after page turn. `<mark>` injection broke when foliate re-rendered sections.
**Solution:** Replaced `<mark>` DOM injection with overlay highlight div. Removed all `surroundContents` code.

### BUG-087: Word click maps to wrong position in EPUB
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx`
**Problem:** Clicking a common word highlighted the first occurrence. Click handler used `split(/\s+/)` while word extractor used `Intl.Segmenter`, producing different word counts.
**Solution:** Unified click handler tokenization with `countWordsSegmenter()` from shared `segmentWords.ts` utility.

### BUG-088: Stale Range objects after foliate page navigation
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx`
**Problem:** Words extracted from section N held DOM Range references that threw or returned garbage after foliate navigated to section M.
**Solution:** Re-extract words on section change via merge algorithm. `isConnected` guards on all Range operations.

### BUG-073: NM page browsing yanks user back to narration position
**Reported:** 2026-03-25 | **Fixed:** 2026-03-26
**Location:** `src/components/PageReaderView.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** During active narration, manual page navigation was immediately overridden by the page-sync effect snapping back to the narration word.
**Solution:** Decouple view from highlight when narration paused. Added `ReturnToReadingPill` component with Enter key shortcut.

### BUG-052: NM speed changes should take effect immediately
**Reported:** 2026-03-25 | **Fixed:** 2026-03-26
**Location:** `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** TTS rate slider changes during narration did not apply until the next chunk.
**Solution:** Added `generationIdRef` guard to discard stale Kokoro IPC results. Pre-buffer invalidated synchronously on rate change.

### BUG-072: Time-to-complete should reflect active mode's speed
**Reported:** 2026-03-25 | **Fixed:** 2026-03-26
**Location:** `src/components/ReaderBottomBar.tsx`, `src/components/LibraryView.tsx`
**Problem:** Time remaining display always used WPM, not mode-aware (Narration should use TTS rate).
**Solution:** Replaced magic number 150 with `TTS_RATE_BASELINE_WPM` constant. Mode-aware calculation was already wired.

### BUG-051: Clicking a mode button should select it, not auto-start it
**Reported:** 2026-03-25 | **Fixed:** 2026-03-26
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Clicking Focus, Flow, or Narrate in the bottom bar immediately started the mode instead of only selecting it.
**Solution:** Narrate button already routed through `handleSelectMode`. Added mode deselect (clicking already-selected mode reverts to flow).

### BUG-041: Focus mode paragraph artifact
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`, `src/styles/global.css`
**Problem:** Paragraph text artifact flashed when entering Focus mode.
**Solution:** Opaque `.reader-container` background now covers page content.

### BUG-044: Last-used mode button accent fill
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.rbb-mode-btn--last)
**Problem:** Last-used mode button only had a subtle bottom border, not prominent enough.
**Solution:** Changed to `background: var(--accent-faded); border-color: var(--accent)` for visible tinted fill.

### BUG-045: Cannot click words during Narration to change position
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Clicking a word during narration did not resync TTS to that position.
**Solution:** Created `handleHighlightedWordChange` wrapper that calls `narration.resyncToCursor(index, wpm)` in narration mode.

### BUG-046: Narration speed follows WPM instead of TTS rate setting
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Narration derived speech rate from WPM (350 WPM -> 2.0x) instead of user's `ttsRate` setting.
**Solution:** After `startCursorDriven()`, call `narration.adjustRate(settings.ttsRate)` to override WPM-derived rate.

### BUG-068: Blurby theme should lock accent/font modifications
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/settings/ThemeSettings.tsx`
**Problem:** When "Blurby" brand theme was selected, accent color and font were still editable.
**Solution:** Wrapped accent color and font sections in `{settings.theme !== "blurby" && (...)}` guard.

### BUG-071: Tab key not opening settings flap in Library view
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useKeyboardShortcuts.ts`
**Problem:** Tab in Library view did nothing. Handler referenced `s.toggleFlap?.()` (reader scope) instead of `a.onToggleFlap?.()` (library scope).
**Solution:** Fixed variable reference from `s.toggleFlap?.()` to `a.onToggleFlap?.()`.

### BUG-001: Stray checkbox in top-left window corner
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/DocGridCard.tsx`
**Problem:** Every library grid card rendered a selection checkbox because `selected !== undefined` was always true for booleans.
**Solution:** Guard changed to only show checkbox when card is actually selected.

### BUG-002: Grid gaps block scrolling and clicks
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (body element)
**Problem:** `-webkit-app-region: drag` on `body` made all empty space act as window drag zones, blocking scrolling and clicks.
**Solution:** Removed `drag` from `body`. Added dedicated `.reader-drag-handle` and `.library-titlebar` for window dragging.

### BUG-003: Progress not saving through book
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx` (handleExitReader)
**Problem:** Exiting after reading 100+ pages showed 0% progress because exit handler used Focus mode's `wordIndexRef` (always 0 if Focus never entered).
**Solution:** `handleExitReader` now calls `finishReading(highlightedWordIndex)` directly. Added debounced auto-save (2s).

### BUG-004: Progress percentage shows 0% for early positions
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx`
**Problem:** `Math.round()` rounded small progress to 0% (e.g., word 200 of 100,000).
**Solution:** Added minimum 1% display: `rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct)`.

### BUG-005: Accent color not applying instantly
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/settings/ThemeSettings.tsx`, `src/components/ThemeProvider.tsx`
**Problem:** Changing accent color saved to settings but didn't update ThemeProvider state until restart.
**Solution:** ThemeSettings now calls `setAccentColor()` and `setFontFamily()` directly on the ThemeContext.

### BUG-006: Filter tabs wrapping on narrow windows
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.library-tabs responsive rule)
**Problem:** Filter tabs wrapped to multiple lines on narrow windows with count numbers cut off.
**Solution:** Changed to `flex-wrap: nowrap` with `overflow-x: auto` and hidden scrollbar.

### BUG-007: N key doesn't toggle narration in Page view
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useKeyboardShortcuts.ts`
**Problem:** N was only mapped to "next chapter" in non-page modes, with no handler for page mode.
**Solution:** Added `KeyN` -> `toggleNarration` in page-mode keyboard handler.

### BUG-008: Command palette settings actions not working
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/CommandPalette.tsx`
**Problem:** ACTION items in Ctrl+K palette (Toggle Theme, Open Reading Log) did nothing when clicked.
**Solution:** Fixed the `act()` helper and added sub-section entries for all settings pages.

### BUG-009: Bottom bar controls not centered
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.reader-bottom-bar-controls)
**Problem:** Bottom bar controls were left-aligned instead of centered.
**Solution:** Added `justify-content: center`.

### BUG-010: No play/pause button in Page view
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`, `src/styles/global.css`
**Problem:** No visible play/pause control existed in the bottom bar.
**Solution:** Added `.rbb-play-btn` circular button with play/pause icons, accent border.

### BUG-011: Click-anywhere page navigation interferes with word selection
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Left/right page halves acted as navigation zones, conflicting with word selection and interaction.
**Solution:** Removed click-zone handler. Added persistent translucent arrow buttons on page edges.

### BUG-012: Kokoro TTS crashes on speed change
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts`
**Problem:** Concurrent `kokoroGenerate()` IPC calls raced without serialization, corrupting engine state.
**Solution:** Added `kokoroInFlightRef` guard. Speed change takes effect on next chunk. Added buffer invalidation on speed change.

### BUG-013: Kokoro TTS freezes app on first use
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `main/tts-engine.js`, `main/tts-worker.js`
**Problem:** First Kokoro request triggered model download + ONNX initialization on the main thread, freezing the window for 10-60 seconds.
**Solution:** Moved inference to `worker_threads`. Added model preloading and warm-up inference. Switched to q4 quantization.

### BUG-014: Pauses between Kokoro TTS audio chunks
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts`
**Problem:** 200-500ms silence between chunks due to sequential generation with no overlap.
**Solution:** Added pre-buffering — next chunk generates while current plays.

### BUG-015: TTS settings not synced to narration engine
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/settings/SpeedReadingSettings.tsx`, `src/hooks/useNarration.ts`
**Problem:** Changing voice/rate in settings had no effect on playback. `useNarration` maintained independent state.
**Solution:** Added `useEffect` syncs bridging settings to `narration.selectVoice()`, `narration.adjustRate()`, and `narration.setEngine()`.

### BUG-016: TTS choppy speech quality
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts`, `src/constants.ts`
**Problem:** Web Speech API was extremely choppy with audible gaps between 4-word chunks.
**Solution:** Increased `TTS_CHUNK_SIZE` from 4 to 40 words. Added sentence-boundary detection for natural chunking.

### BUG-017: Flow cursor and TTS running simultaneously on different pages
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** Flow cursor controller and TTS advanced independently, causing cursor to draw at stale positions.
**Solution:** When `ttsActive`, flow cursor controller is disabled. TTS drives word position directly.

### BUG-018: Focus mode conflicting with narration
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Toggling narration then entering Focus caused both to run simultaneously, crashing on ESC.
**Solution:** Implemented 4-mode mutually exclusive architecture. `stopAllModes()` called before entering any mode.

### BUG-019: Play/pause button not reflecting narration state
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** Play/pause button showed play icon during narration because `playing` was tied to Focus mode state.
**Solution:** Changed `playing` prop to `readingMode !== "page"`.

### BUG-020: Narration button styled differently from Focus/Flow buttons
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** Narration was a small speaker icon separate from the Focus/Flow button group.
**Solution:** Moved narration into `.rbb-mode-group` as a proper `rbb-mode-btn` labeled "Narrate".

### BUG-021: C hotkey for chapter list
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderBottomBar.tsx`
**Problem:** No keyboard shortcut existed to open chapter navigation dropdown.
**Solution:** Added `KeyC` binding. ReaderBottomBar exposes `chapterListRef` with `toggle()` method.

### BUG-022: Flow cursor slow start delay
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** 16ms+ delay between pressing Space and cursor appearing.
**Solution:** Removed unnecessary `setTimeout`. Used forced reflow (`offsetWidth` read) to eliminate delays.

### BUG-023: Flow cursor position not saving on pause/resume
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Pausing and resuming flow caused cursor to jump back to original position due to React batch updates.
**Solution:** Added `flowStopPosRef` to pass position synchronously between effect cleanup and re-run.

### BUG-024: Flow cursor stale closures after page turn
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** Controller callbacks captured stale `currentPage` from render closure.
**Solution:** Added `currentPageRef` that updates on every render. Callbacks read from ref.

### BUG-025: Flow cursor invisible after React re-render
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** Controller's div was orphaned when React re-renders destroyed/recreated the container.
**Solution:** React renders the cursor div (always present). Controller receives ref and only styles it.

### BUG-026: Flow mode rendering as infinite scroll
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Flow mode rendered all words in document, creating enormous DOM.
**Solution:** Flow cursor operates on same paginated word set as page mode. Controller handles page turns.

### BUG-027: Page text truncated at bottom
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Text overflowed past visible page area with last line cut off.
**Solution:** Tuned character width estimation. Adjusted footer position from `bottom: 120px` to `70px`.

### BUG-028: Page turn delay too long in flow mode
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/constants.ts` (FLOW_PAGE_TURN_PAUSE_MS)
**Problem:** 600ms pause at end of page felt sluggish.
**Solution:** Reduced `FLOW_PAGE_TURN_PAUSE_MS` to 200ms.

### BUG-029: Underline cursor rendering through text
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`
**Problem:** Flow cursor underline drew through middle of text due to incorrect Y positions when TTS was active.
**Solution:** When TTS is active, cursor controller is disabled. TTS drives highlighting directly.

### BUG-030: -webkit-app-region: drag on body breaks all clickability
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css`
**Problem:** `drag` on `body` made every element a potential drag zone, breaking flap buttons, toggles, and other UI.
**Solution:** Removed `drag` from `body`. Added dedicated drag regions.

### BUG-042: Flow/Narration mode page auto-advance delay (~24 seconds)
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** ~24-second delay before page turn at end of page during Flow/Narration. Stale closure for `currentPage`.
**Solution:** Added `currentPage` to page-sync effect's dependency array.

### BUG-043: Narration mode page auto-advance (same as BUG-042)
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Same root cause as BUG-042.
**Solution:** Same fix — page-sync effect now watches `currentPage` in deps.

### BUG-047: Bottom bar dimmed during active reading modes
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** Bottom bar had `opacity: 0.08` during Focus/Flow/Narration, making controls nearly invisible.
**Solution:** Remov
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
