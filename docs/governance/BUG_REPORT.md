# Blurby — Running Bug Report

**Purpose:** Tracks bugs in EXISTING implemented features. Each entry contains enough context for any developer to understand and fix the issue without additional direction. New features, enhancements, and architecture changes are tracked in ROADMAP.md.

**Last updated:** 2026-03-27

---

## Incomplete

### BUG-090: EPUB narration does not auto-advance pages
**Reported:** 2026-03-26
**Severity:** High
**Location:** `src/components/FoliatePageView.tsx` (highlightWordByIndex, narration page-sync)
**Description:** During Kokoro TTS narration on EPUBs, the page does not advance when narration reads past visible content. Audio continues correctly and word highlighting works within the visible page, but the foliate view stays on the same page. Multiple approaches attempted (CSS column visibility detection, span-not-found, fraction comparison) all failed due to foliate's CSS multi-column layout keeping all section words in DOM simultaneously. See LL-035 for full analysis.
**Status:** Open. Root cause identified but no viable fix yet.

### BUG-092: EPUB Focus mode starts from wrong position
**Reported:** 2026-03-26
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx` (startFocus)
**Description:** Focus mode on EPUBs starts from word 0 or wrong position instead of the clicked word. The `wordsRef` in useReader may not be populated with foliate words at the time Focus starts.
**Status:** Open.

### BUG-031: Bottom bar not visible in Focus mode or Flow mode
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/components/ReaderContainer.tsx` (render), `src/styles/global.css` (.reader-container, .reader-view-area)
**Description:** When entering Focus mode (RSVP) or Flow mode (silent cursor), the unified bottom bar disappears. The `.reader-container` was `position: fixed; inset: 0` which covered everything. Changed to `flex: 1` with `.reader-view-area` wrapper, but user reports bar still missing.
**Status:** Partially fixed. Wrapper added but bar still missing in FSM/FLM — needs verification.

### BUG-032: Kokoro "App Not Responding" flash on first use
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/tts-engine.js`, `main/tts-worker.js`
**Description:** When Kokoro TTS is first activated, there is a brief "Not Responding" flash in the Windows title bar while the ONNX model initializes. The worker thread handles inference but the initial `import("kokoro-js")` and `KokoroTTS.from_pretrained()` still causes some main thread blocking during IPC setup.
**Status:** Mitigated (worker thread, preloading, warm-up inference). Flash reduced but not eliminated.

### BUG-033: Book formatting stripped too aggressively
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/file-parsers.js`
**Description:** All book formats (EPUB, MOBI, PDF, HTML) are parsed to plain text, stripping lists, headers, bold/italic, tables, and images. Lists appear concatenated on single lines. Parsers use `cheerio.text()` or regex strip which discards HTML structure.
**Status:** Open. Planned fix in Wave 3 — parse to lightweight Markdown. See `.claude/plans/wave3-content-pipeline.md`.

### BUG-034: Images in books stripped during import
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/file-parsers.js`
**Description:** Inline images within EPUB, MOBI, and HTML books are completely removed during content extraction. Only cover images are preserved. Same root cause as BUG-033 — text-only extraction pipeline.
**Status:** Open. Planned fix in Wave 3 — extract EPUB images to `userData/images/<docId>/`.

### BUG-039: Space bar should start last-used reading mode
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx` (handleTogglePlay)
**Description:** When in Page view, Space always enters Flow mode. It should start whichever mode the user last used (Focus, Flow, or Narration), with the preference persisted across sessions via `settings.json`. First-ever use defaults to Flow.
**Status:** Open.

### BUG-040: Focus mode covers bottom bar — visible but not clickable
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/styles/global.css` (.reader-container), `src/components/ReaderContainer.tsx`
**Description:** In all reading sub-modes, the bottom bar is visible underneath the reader overlay but cannot be clicked. The `.reader-container` uses `position: fixed` which intercepts pointer events above the bar. Fix needed: give the bottom bar `z-index: 20` (above overlay's z-index: 10).
**Status:** Open. Root cause and fix identified but not applied.

### BUG-053: Arrow keys should adjust NM speed by 0.1 increments
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderContainer.tsx`
**Description:** During Narration mode, Up/Down arrow keys adjust WPM (irrelevant in NM). They should adjust TTS speech rate by 0.1 increments (0.5-2.0 range), immediately applied to slider and audio.
**Status:** Open.

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
**Status:** Open.

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

---

## Complete

### BUG-091: EPUB Flow mode cursor not working
**Reported:** 2026-03-26 | **Fixed:** 2026-03-26
**Location:** `src/components/FoliatePageView.tsx` (Flow cursor overlay)
**Problem:** Flow mode overlay cursor in the rAF loop queried foliate iframes for word spans but could not determine visibility in CSS columns. Same coordinate space mismatch as BUG-090.
**Solution:** Fixed flow cursor visibility and narration start position (commit ee812a9).

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
**Solution:** Removed opacity fade — bar always fully opaque.

### BUG-048: WPM slider should show TTS rate in Narration mode
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** WPM slider showed in Narration mode where it was irrelevant.
**Solution:** In narration mode, slider swaps to show rate (0.5-2.0) and updates narration engine directly.
