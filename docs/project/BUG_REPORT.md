# Blurby — Running Bug Report

**Purpose:** Living document tracking all bugs reported during development and testing. Each entry contains enough context for any developer to understand and fix the issue without additional direction.

**Last updated:** 2026-03-25

---

## Incomplete

### BUG-031: Bottom bar not visible in Focus mode (FSM) or Flow mode (FLM)
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/components/ReaderContainer.tsx` (render), `src/styles/global.css` (.reader-container, .reader-view-area)
**Description:** When entering Focus mode (RSVP word-at-a-time) or Flow mode (silent cursor sliding), the unified bottom bar (WPM slider, mode buttons, chapter nav, play/pause) disappears. The bar is rendered at the `reader-layout` level but the reader view fills the entire viewport, covering it.
**Root cause:** `.reader-container` (Focus mode wrapper) was `position: fixed; inset: 0` which covered everything. Changed to `flex: 1` and added `.reader-view-area` wrapper with `flex: 1; overflow: hidden`. May still not be working — needs verification with actual Focus/Flow mode rendering.
**Status:** Partially fixed — wrapper added but user reports bar still missing in FSM/FLM.

### BUG-032: Kokoro "App Not Responding" flash on first use
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/tts-engine.js`, `main/tts-worker.js`
**Description:** When Kokoro TTS is first activated (N key or Narrate button), there is a brief "Not Responding" flash in the Windows title bar while the ONNX model initializes. This happens even with the worker thread — the initial `import("kokoro-js")` and `KokoroTTS.from_pretrained()` in the worker still causes some main thread blocking during IPC setup.
**Root cause:** Dynamic `import()` of kokoro-js module may briefly block. The worker thread handles inference but the initial module import and model download progress events still touch the main thread.
**Mitigation applied:** Worker thread for inference, model preloading when reader opens, warm-up inference after load. Flash is reduced but not eliminated.

### BUG-033: Book formatting stripped too aggressively
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/file-parsers.js`
**Description:** All book formats (EPUB, MOBI, PDF, HTML) are parsed to plain text, stripping lists, headers, bold/italic, tables, and images. Lists that should appear on separate lines are concatenated into single lines. This is most noticeable in books with numbered lists, bullet points, or structured content.
**Root cause:** The parsers use `cheerio.text()` (EPUB/HTML) or regex strip (MOBI) which extracts only text content, discarding all HTML structure. PDF uses `pdf-parse.getText()` which is text-only by design.
**Planned fix:** Wave 3 — parse to lightweight Markdown instead of plain text. See `.claude/plans/wave3-content-pipeline.md`.

### BUG-034: Images in books stripped during import
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/file-parsers.js`
**Description:** Inline images within EPUB, MOBI, and HTML books are completely removed during content extraction. Only cover images are preserved (extracted separately). Users see text-only content even when the original book contains figures, diagrams, or illustrations.
**Root cause:** Same as BUG-033 — text-only extraction pipeline. EPUB images exist in the ZIP archive but are never extracted or referenced in the output content.
**Planned fix:** Wave 3 — extract EPUB images to `userData/images/<docId>/`, reference in Markdown content.

### BUG-035: No chapter detection for non-EPUB formats
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `main/ipc-handlers.js` (get-doc-chapters handler), `main/file-parsers.js`
**Description:** Chapter navigation (bottom bar dropdown, C hotkey) only works for EPUB files that have NCX/nav TOC metadata. PDF, MOBI, TXT, and HTML files always show "Ch. 0" with no chapter list, even when the content clearly contains chapter headings like "Chapter 1", "Part One", etc.
**Root cause:** `get-doc-chapters` returns `[]` for non-EPUB formats. No heuristic chapter detection exists.
**Planned fix:** Wave 3 — pattern-matching chapter detection + auto-generated TOC. See `.claude/plans/wave3-content-pipeline.md`.

### BUG-036: No auto-generated Table of Contents for books without one
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/PageReaderView.tsx`
**Description:** When a book has no embedded TOC (or when chapters are detected heuristically), there is no generated TOC page at the beginning of the book. Users must scroll through content to find section starts.
**Planned fix:** Wave 3 items 7-9.

### BUG-037: E-ink mode is a theme instead of a display mode
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/ThemeProvider.tsx`, `src/styles/global.css`
**Description:** E-ink is implemented as a theme option ("dark", "light", "eink", "system") instead of an independent display mode. This means users on e-ink devices cannot use dark/light themes while keeping e-ink-specific behavior (no animations, large touch targets, ghosting prevention, WPM ceiling). Ghosting prevention only works in ScrollReaderView, not PageReaderView. Phrase grouping only works in Focus mode.
**Planned fix:** Wave 4 — full e-ink mode overhaul. See `.claude/plans/wave4-eink-mode-overhaul.md`.

### BUG-038: Hotkey coaching not shown in reader views
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/HotkeyCoach.tsx`, `src/components/ReaderContainer.tsx`
**Description:** When users click buttons in the reader (page turn, mode switch, WPM change, etc.) with the mouse instead of using keyboard shortcuts, no coaching toast appears suggesting the keyboard shortcut. Coaching only works in the library view for archive/favorite/delete/search actions. User requested: brief message at bottom quarter of screen saying "Next time, hit [HOTKEY] to do this instantly!" in light grey, 80% opacity.
**Planned fix:** Wave 3 item 3 — expand HotkeyCoach to reader views.

### BUG-039: Space bar should start the last-used reading mode
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx` (handleTogglePlay)
**Description:** When in Page view and the user presses Space, it always enters Flow mode (FLM). Instead, Space should start whichever mode the user last used (Focus, Flow, or Narration). The last-used mode should be visually indicated in the bottom bar (e.g., the button appears "selected" or highlighted differently). This preference should persist across sessions via `settings.json`.
**Expected behavior:**
- First-ever app use with no mode history → Space enters Flow mode (default)
- User previously used Focus → Space enters Focus
- User previously used Narration → Space enters Narration
- The "selected" mode is visually distinct in the bottom bar even when paused in Page view

### BUG-040: Focus mode (.reader-container) covers bottom bar — bar visible but not clickable
**Reported:** 2026-03-25
**Severity:** High
**Location:** `src/styles/global.css` (.reader-container), `src/components/ReaderContainer.tsx`
**Description:** In all reading sub-modes (Focus, Flow, Narration), the bottom bar is visible underneath the reader overlay but cannot be clicked. The `.reader-container` (Focus mode) uses `position: fixed; bottom: 80px; z-index: 10` which leaves visual space for the bar but the fixed-position element still intercepts pointer events above the bar. The fundamental tension: Focus mode needs an opaque overlay to hide page content, but the overlay blocks the bar.
**Root cause:** `position: fixed` with any z-index covers the bar's interactive area. The bar needs to be ABOVE the overlay, or the overlay needs `pointer-events: none` on non-interactive areas.
**Fix needed:** Give the bottom bar `z-index: 20` (above the reader container's z-index: 10) so it's clickable on top of the overlay.

### BUG-041: Focus mode paragraph artifact — RESOLVED
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Description:** Paragraph text artifact no longer flashes when entering Focus mode. The opaque `.reader-container` background now covers page content.

### BUG-045: Cannot click words during Narration to change reading position
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
*Moved to Complete section.*

### BUG-046: Narration speed follows WPM instead of TTS rate setting
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Narration mode derived speech rate from WPM (`wpmToRate(350) = 2.0x`) instead of using the user's explicit `ttsRate` setting from Speed Reading > Narration (e.g., 1.4x). "Test voice" in settings played at the correct rate but actual narration was much faster.
**Solution:** After `startCursorDriven()`, immediately call `narration.adjustRate(settings.ttsRate)` to override the WPM-derived rate with the user's chosen speed.

### BUG-044: Last-used mode button should use full accent fill, not just underline
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.rbb-mode-btn--last)
**Description:** When in Page view, the last-used mode button has a subtle bottom border accent. User requests the entire button be filled with the accent color to make the selection more apparent (similar to the active state but perhaps slightly muted).
**Solution:** Changed to `background: var(--accent-faded); border-color: var(--accent)`.

### BUG-051: Clicking a mode button should select it, not auto-start it
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/ReaderContainer.tsx` (handleEnterFocus, handleEnterFlow, handleToggleTts)
**Description:** When the user clicks Focus, Flow, or Narrate in the bottom bar, the mode immediately starts (Focus auto-plays, Flow starts cursor advancement, Narrate begins speaking). Instead, clicking a mode button should only **select** it as the active mode (visually highlighted, becomes the Space bar target) while staying in Page view. Only pressing Space bar should actually start the selected mode. This gives users a chance to position themselves (click a word, navigate to a page) before the mode begins.
**Expected behavior:**
- Click "Focus" → Focus button highlighted as selected (last-used mode), stay in Page view
- Click "Narrate" → Narrate button highlighted as selected, stay in Page view
- Press Space → selected mode starts from current position
- If mode is already active (playing), clicking the same mode button pauses it (returns to Page)
- If mode is active, clicking a different mode button switches selection but pauses current mode first

### BUG-052: NM speed changes should take effect immediately during active narration
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`
**Description:** When Narration mode is active and the user adjusts the TTS rate slider in the bottom bar, the speed change should apply immediately to the current reading — not wait for the next chunk. The user should hear the pace change in real-time as they drag the slider.
**Root cause:** The `onSetTtsRate` handler calls `narration.adjustRate(rate)` which sets the rate for the NEXT utterance/chunk, but doesn't interrupt and restart the currently playing audio at the new speed.
**Expected:** Slider drag → voice speed changes within ~200ms.

### BUG-053: Up/Down arrow keys should adjust NM speed by 0.1 increments during narration
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderContainer.tsx`
**Description:** During Narration mode, Up and Down arrow keys currently adjust WPM (which is irrelevant in NM since the TTS rate slider is shown instead). They should instead adjust the TTS speech rate by 0.1 increments (matching the slider step). Up = faster (e.g., 1.4 → 1.5), Down = slower (1.4 → 1.3). Clamped to 0.5–2.0 range.
**Expected behavior:**
- NM active + Up arrow → ttsRate += 0.1, immediately applied
- NM active + Down arrow → ttsRate -= 0.1, immediately applied
- Visual: slider in bottom bar moves, rate label updates
- Audio: narration speed changes immediately

### BUG-054: Small/misaligned click areas in menu flap buttons
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/MenuFlap.tsx`, `src/styles/global.css`
**Description:** Buttons and interactive elements inside the menu flap have very small clickable areas. Users must click precisely on the text or icon to trigger the action — clicking on the surrounding padding or whitespace within the button does nothing. This is a recurring issue that was partially fixed earlier by removing `-webkit-app-region: drag` from body, but the flap's internal button styling still has insufficient hit targets.
**Root cause (suspected):** Button elements may have small intrinsic size with padding on a parent container that doesn't forward clicks, or there may be overlapping invisible elements absorbing pointer events.

### BUG-055: Combine Text Size and Layout settings into "Reading Layout"
**Reported:** 2026-03-25
**Severity:** Low (UX improvement)
**Location:** `src/components/MenuFlap.tsx`, `src/components/settings/`
**Description:** The settings menu currently has separate "Text Size" and "Layout" options. These should be combined into a single settings page called "Reading Layout" that contains all reading-related visual settings: text size, line spacing, character spacing, word spacing, font family, and any other layout controls.

### BUG-056: New settings page — "Library Layout"
**Reported:** 2026-03-25
**Severity:** Low (feature request)
**Location:** `src/components/settings/` (new file), `src/components/MenuFlap.tsx`
**Description:** Create a new settings page called "Library Layout" with the following configurable options:
1. **Default Sort** — dropdown matching existing sort options (closest to done, A-Z title, A-Z author, newest, oldest). Persisted in settings so the library always opens with this sort.
2. **Default Layout** — toggle between List View and Grid View. Persisted.
3. **Card/List Size** — three options: Small, Medium, Large. Controls the size of grid cards or list row height.
4. **Card/List Spacing** — three options: Compact, Cozy, Roomy. Controls the gap between cards/rows.
5. **List View Columns** — 1 or 2 columns when in List View mode. Controls whether list items stack in a single column or flow into two columns side-by-side.

Each option must be persisted in `BlurbySettings` and applied immediately when changed. The library grid/list components must read these settings and apply appropriate CSS classes or style values.

### BUG-057: Library Layout settings — implement CSS rules and code adaptations
**Reported:** 2026-03-25
**Severity:** Low (feature request)
**Location:** `src/styles/global.css`, `src/components/LibraryView.tsx`, `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx`
**Description:** Implement the visual rules for BUG-056 Library Layout options:
- **Card Size Small:** grid `minmax(120px, 1fr)`, smaller cover images, compact text
- **Card Size Medium:** current default grid `minmax(160px, 1fr)`
- **Card Size Large:** grid `minmax(220px, 1fr)`, larger covers, more text visible
- **Spacing Compact:** grid gap 8px, list gap 4px
- **Spacing Cozy:** current default grid gap 16px, list gap 8px
- **Spacing Roomy:** grid gap 24px, list gap 16px
- **Default Sort:** applied on library load from `settings.defaultSort`
- **Default Layout:** applied on library load from `settings.defaultViewMode`

### BUG-058: Make Library Layout and Reading Layout searchable in Ctrl+K
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/CommandPalette.tsx`
**Description:** Add "Settings: Library Layout" and "Settings: Reading Layout" entries to the command palette, along with sub-entries for each individual setting within those pages (Default Sort, Default Layout, Card Size, Card Spacing, Text Size, Line Spacing, etc.).

### BUG-059: Every individual setting must be searchable in Ctrl+K
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/CommandPalette.tsx`
**Description:** The command palette should contain an entry for EVERY individual setting in the app — not just the settings page headers. When the user searches for "line spacing" or "card size" or "default sort" or "focus marks" or "phrase grouping", they should find a matching entry that navigates directly to the settings page containing that option. This requires a comprehensive audit of all settings pages and adding an entry for each toggle, slider, dropdown, and option.

Current settings pages and their individual settings that need entries:
- **Theme:** dark/light/system, accent color presets, custom color, font presets
- **Reading Layout (new):** text size, line spacing, character spacing, word spacing
- **Speed Reading:** reading mode, focus marks, reading ruler, focus span, words per highlight, cursor style, rhythm pauses (commas, sentences, paragraphs, numbers, longer words), TTS enable, TTS engine, TTS voice, TTS rate
- **Library Layout (new):** default sort, default view mode, card size, card spacing
- **Hotkeys:** (read-only reference, but should be searchable)
- **Connectors:** site logins
- **Cloud Sync:** provider, sync interval, metered connection
- **Help:** version, updates

### BUG-061: Replace hamburger menu button with Blurby icon across all themes
**Reported:** 2026-03-25
**Severity:** Low (branding)
**Location:** `src/components/MenuFlap.tsx` or wherever the hamburger (☰) is rendered, `src/styles/global.css`
**Description:** The top-left menu button currently shows a generic hamburger icon (three horizontal lines). It should be replaced with the Blurby brand icon/logo across all themes. The icon should be appropriately sized (~24-28px), respect the current theme's text color for contrast, and function identically to the current hamburger (click to toggle the menu flap, keyboard shortcut Tab/M).
**Assets available:** `Blurby Brand/Blurby.icon.png`, `Blurby Brand/Blurby.icon.jpeg`, `Blurby Brand/Blurby.tray-icon.png`. Use the PNG icon scaled to ~24px for the menu button.

### BUG-062: New "Blurby" default theme based on brand standards
**Reported:** 2026-03-25
**Severity:** Low (branding)
**Location:** `src/components/ThemeProvider.tsx`, `src/styles/global.css`
**Description:** Create a new theme option called "Blurby" (or make it the default) based on the official Blurby brand color palette:
- **Background:** Crisp white (#FFFFFF or near-white)
- **Menu flap & reader bottom bar:** Highlight Blue (#CAE4FE)
- **Accent color:** Accent Red (#E63946) — used for active buttons, progress bars, highlights
- **Dividers and lines:** Core Blue (#2E73FF) — used for borders, separators, tab underlines
- **Text:** Dark/black for readability against white background

This theme should be added to the theme selector alongside dark, light, and system. All CSS custom properties (`--bg`, `--accent`, `--border`, `--bg-raised`, etc.) need Blurby-specific values. The menu flap background, reader bottom bar background, and any chrome areas should use the Highlight Blue, while content areas remain white.

**Brand palette reference:**
| Token | Color | Use |
|-------|-------|-----|
| Background | #FFFFFF | Page/content background |
| Highlight Blue | #CAE4FE | Menu flap, bottom bar, raised surfaces |
| Core Blue | #2E73FF | Dividers, borders, lines, tab indicators |
| Accent Red | #E63946 | Active states, buttons, progress, highlights |
| Text | #1A1A1A | Primary text |
| Text Dim | #666666 | Secondary/muted text |

### BUG-060: Remove "[Sample]" prefix from first-run onboarding book title
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/OnboardingOverlay.tsx` or `main/ipc-handlers.js` (wherever the sample doc is created)
**Description:** The book pre-loaded for first-time users is titled "[Sample] Meditations — Marcus Aurelius". The "[Sample]" prefix is unnecessary and looks unprofessional — it's a full legitimate public-domain book, not a demo excerpt. The title should simply be "Meditations" with author "Marcus Aurelius".

### BUG-049: Window control buttons (min/max/close) don't match theme background
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `main/window-manager.js` (BrowserWindow config), `src/styles/global.css`
**Description:** The minimize, maximize, and close buttons in the top-right window chrome use the default Windows title bar color instead of matching the app's selected background theme. In light/warm themes, the dark default title bar buttons clash visually. These buttons should adopt the same background color as the current theme.
**Root cause:** Electron's default frame uses the OS title bar. To customize, either use `titleBarStyle: "hidden"` with custom CSS buttons, or use `titleBarOverlay` with color matching.
**Expected:** Button area background matches `var(--bg)` from the active theme.

### BUG-050: Library cards should show three lines — Title, Author, Book Data
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx`
**Description:** Library cards currently show Title and Author (or "X% read"). They should consistently show three lines of text:
1. **Title** — book title (truncated with ellipsis if too long)
2. **Author** — author name
3. **Book Data** — contextual reading stats:
   - If currently reading (progress > 0%): `7% | 16/323p | 1.1h/6.2h` (percent read | current page/total pages | time read/total time)
   - If not started: `323p | 6.2h` (total pages | total reading time estimate)

Page count is derived from word count and the pagination algorithm (or estimated at ~250 words/page). Time estimate uses current WPM setting. Time read is calculated from `position / wordCount * totalTime`.

### BUG-063: Define word includes punctuation, preventing dictionary lookup
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/PageReaderView.tsx` (word selection), `src/components/HighlightMenu.tsx` (define action)
**Description:** When right-clicking a word and selecting "Define", the word passed to the dictionary lookup includes adjacent punctuation (e.g., "word." or "word,"). This causes the dictionary API to fail to find the word. All conjoined punctuation marks must be stripped before lookup.

### BUG-064: Definition popup cannot be dismissed by clicking elsewhere
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/DefinitionPopup.tsx`
**Description:** After viewing a word definition, the user should be able to click anywhere on the screen to close the definition popup. Currently the popup only closes via its own close button or Escape key.

### BUG-065: Word highlight color should use theme accent color
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/styles/global.css` (highlight styles)
**Description:** Word selection/highlight in Page view should use `var(--accent)` as the highlight color instead of hardcoded values. Applies to all highlight-related elements.

### BUG-066: UI accent elements should all use theme accent color
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/styles/global.css`
**Description:** The following elements must use `var(--accent)` for their primary color: WPM slider thumb/track, selected mode button background, flow cursor underline, and narration word highlight. Currently some use hardcoded colors.

### BUG-067: "New" dot on library cards should clear after being seen
**Reported:** 2026-03-25
**Severity:** Low
**Location:** `src/components/DocGridCard.tsx`, `src/components/LibraryContainer.tsx`
**Description:** Library cards show a "new" dot indicator. This dot should vanish after: (1) the item has scrolled into the visible viewport at least once, AND (2) the user has navigated away from Library view after observing it. Requires IntersectionObserver tracking and a `seenAt` timestamp on the doc metadata.

### BUG-068: Blurby theme should lock accent/font modifications
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Severity:** Low
**Location:** `src/components/settings/ThemeSettings.tsx`
**Description:** When the "Blurby" brand theme is selected, accent color and font family modifications should be disabled (greyed out). Only other themes allow customization. The Blurby theme is a locked brand experience.
**Solution:** Wrapped accent color and font sections in `{settings.theme !== "blurby" && (...)}` guard.

### BUG-069: Shift+Left/Right should jump between paragraphs in reading modes
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/PageReaderView.tsx`
**Description:** In all reading modes, Shift+Left should jump back to the 1st word of the current paragraph. Pressing again jumps to the previous paragraph's first word. Shift+Right does the opposite — jumps to next paragraph start. Requires paragraph boundary detection in the words array.

### BUG-070: Mouse scroll wheel should advance word-by-word
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/components/PageReaderView.tsx`
**Description:** In reading modes, the mouse scroll wheel should advance or retreat one word at a time (scroll down = forward, scroll up = backward) instead of scrolling the page. This gives fine-grained navigation control.

### BUG-071: Tab key not opening settings flap in Library view
**Reported:** 2026-03-25
**Severity:** Medium
**Location:** `src/hooks/useKeyboardShortcuts.ts`
**Description:** Pressing Tab in Library view should toggle the menu flap open/closed. Currently nothing happens. The keyboard handler was referencing `s.toggleFlap?.()` (reader scope variable) instead of `a.onToggleFlap?.()` (library scope).
**Solution:** Fixed variable reference from `s.toggleFlap?.()` to `a.onToggleFlap?.()` in the library keyboard handler.

---

## Complete

### BUG-001: Stray checkbox in top-left window corner
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/DocGridCard.tsx`
**Problem:** Every library grid card rendered a selection checkbox because the guard `onToggleSelect && selected !== undefined` was always true — `selected` is `boolean` (never `undefined`). The top-left card's checkbox bled into the window corner.
**Solution:** Guard changed to only show checkbox when card is actually selected.

### BUG-002: Grid gaps block scrolling and clicks
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (body element)
**Problem:** The `body` element had `-webkit-app-region: drag`, which made all empty space between grid cards act as window drag zones. Users couldn't scroll when cursor was over gaps, and couldn't click gaps to close the menu flap.
**Solution:** Removed `drag` from `body`. Added a dedicated `.reader-drag-handle` (8px strip at top) and `.library-titlebar` for window dragging. Added `no-drag` to `.menu-flap`.

### BUG-003: Progress not saving through book
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx` (handleExitReader)
**Problem:** When user advanced 100+ pages in Page view then pressed ESC to exit, library showed 0% progress. The exit handler called `requestExit()` which used `wordIndexRef.current` from the Focus mode engine (always 0 if Focus was never entered), overwriting the real page position.
**Solution:** `handleExitReader` now calls `finishReading(highlightedWordIndex)` directly instead of `requestExit()`, using the actual page position. Also added debounced auto-save (2s) that watches both `highlightedWordIndex` (Page/Flow) and `wordIndex` (Focus).

### BUG-004: Progress percentage shows 0% for early reading positions
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx`
**Problem:** `Math.round((position / wordCount) * 100)` rounds to 0% when position is small relative to total words (e.g., word 200 of 100,000). Books in "READING NOW" showed 0% even though progress was saved.
**Solution:** Added minimum 1% display: `rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct)`.

### BUG-005: Accent color not applying instantly
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/settings/ThemeSettings.tsx`, `src/components/ThemeProvider.tsx`
**Problem:** Changing accent color in Settings saved to `settings.json` but didn't update the ThemeProvider's `accentColor` state until app restart. Theme and font changes applied instantly because they went through `setTheme`/`setFontFamily` on the context.
**Solution:** ThemeSettings now calls `setAccentColor()` and `setFontFamily()` directly on the ThemeContext alongside `onSettingsChange()`. Exported `ThemeContext` from ThemeProvider.

### BUG-006: Filter tabs wrapping on narrow windows
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.library-tabs responsive rule)
**Problem:** At narrow window widths, the filter tabs (all, new, favorites, archived, all types, articles, books, PDFs) wrapped to multiple lines, with the count numbers getting cut off.
**Solution:** Changed `flex-wrap: wrap` to `flex-wrap: nowrap` with `overflow-x: auto` and hidden scrollbar. Tabs now scroll horizontally instead of wrapping.

### BUG-007: N key doesn't toggle narration in Page view
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useKeyboardShortcuts.ts`
**Problem:** In Page view, pressing N did nothing. N was only mapped to "next chapter" in non-page modes, and Shift+N was mapped to "make note" in page mode. No unmodified N handler existed for page mode.
**Solution:** Added `KeyN` → `toggleNarration` in the page-mode keyboard handler section.

### BUG-008: Command palette settings actions not working
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/CommandPalette.tsx`
**Problem:** Ctrl+K command palette showed "Toggle Theme" and "Open Reading Log" as ACTION items, but clicking them did nothing. SETTING items (like "Settings: Speed Reading") worked. The `act()` wrapper used `setTimeout(fn, 0)` to defer execution after palette close, but action callbacks were not firing.
**Solution:** Fixed the `act()` helper and added sub-section entries for all settings pages (Reading Mode, Focus Options, Flow Options, Rhythm Pauses, Narration, Accent Color, Font, Line/Char/Word Spacing).

### BUG-009: Bottom bar controls not centered
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.reader-bottom-bar-controls)
**Problem:** The bottom bar controls (WPM, font size, mode buttons) were left-aligned instead of centered.
**Solution:** Added `justify-content: center` to `.reader-bottom-bar-controls`.

### BUG-010: No play/pause button in Page view
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`, `src/styles/global.css`
**Problem:** No visible play/pause control existed in the bottom bar. Users had to know Space was the shortcut.
**Solution:** Added `.rbb-play-btn` — a prominent circular button with ▶/❚❚ icons, positioned between font controls and mode buttons. Slightly raised with accent border.

### BUG-011: Click-anywhere page navigation interferes with word selection
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Clicking anywhere on the left half of the page went back, right half went forward. This conflicted with word selection, note-taking, and general interaction. Users couldn't click empty space without accidentally turning pages.
**Solution:** Removed `handlePageClick` click-zone handler. Added persistent translucent `‹` / `›` arrow buttons on left/right edges of the page (`.page-nav-btn`), visible on hover.

### BUG-012: Kokoro TTS crashes on speed change
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts` (updateWpm, speakNextChunkKokoro)
**Problem:** Changing WPM while Kokoro was generating audio crashed the app. Two concurrent `kokoroGenerate()` IPC calls raced without serialization, corrupting engine state.
**Solution:** Added `kokoroInFlightRef` guard — `updateWpm` won't interrupt if a generation request is in-flight. Speed change takes effect on the next chunk instead. Also added `nextChunkBufferRef` invalidation on speed change.

### BUG-013: Kokoro TTS freezes app on first use
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25 (partially)
**Location:** `main/tts-engine.js`, `main/tts-worker.js`
**Problem:** First Kokoro TTS request triggered model download + ONNX initialization on the main Electron thread, freezing the entire window for 10-60 seconds.
**Solution:** Moved all Kokoro inference to a `worker_threads` worker (`main/tts-worker.js`). Main thread never blocks during inference. Added model preloading when reader opens (`tts-kokoro-preload` IPC). Added warm-up inference after model load. Switched to q4 quantization (~30-50% faster).

### BUG-014: Pauses between Kokoro TTS audio chunks
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts` (speakNextChunkKokoro)
**Problem:** After each audio chunk finished playing, there was a 200-500ms silence while the next chunk generated. Sequential generation with no overlap.
**Solution:** Added pre-buffering — next chunk generates in the background while current chunk plays. On chunk end, cached result used immediately if available, falling back to on-demand generation.

### BUG-015: TTS settings not synced to narration engine
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/settings/SpeedReadingSettings.tsx`, `src/hooks/useNarration.ts`
**Problem:** Changing voice or speech rate in Settings > Speed Reading > Narration had no effect on actual TTS playback. Settings wrote to `settings.json` but the `useNarration` hook maintained independent voice/rate state.
**Solution:** Added `useEffect` syncs in ReaderContainer that bridge `settings.ttsVoiceName` → `narration.selectVoice()`, `settings.ttsRate` → `narration.adjustRate()`, and `settings.ttsEngine` → `narration.setEngine()`.

### BUG-016: TTS choppy speech quality
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useNarration.ts`, `src/constants.ts`
**Problem:** Web Speech API TTS was extremely choppy, with audible gaps between utterances. Each 4-word chunk had startup overhead.
**Solution:** Increased `TTS_CHUNK_SIZE` from 4 to 40 words. Added sentence-boundary detection to chunk at natural pause points (`.`, `!`, `?`) instead of fixed word counts.

### BUG-017: Flow cursor and TTS running simultaneously on different pages
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** When TTS was active during Flow mode, the flow cursor controller slid through its line map independently while TTS advanced `highlightedWordIndex` to different pages. This caused the cursor bar to draw at stale Y positions on the wrong page's words.
**Solution:** When `ttsActive` is true, the flow cursor controller is disabled entirely. TTS drives word position via `onWordAdvance` callbacks, and page turns happen through `highlightedWordIndex` changes.

### BUG-018: Focus mode conflicting with narration
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** If narration was toggled on and then Focus mode was entered, both ran simultaneously. Space bar started narration instead of stopping Focus. ESC from the conflict state crashed the app.
**Solution:** Implemented 4-mode mutually exclusive architecture. `readingMode` is now `"page" | "focus" | "flow" | "narration"`. `stopAllModes()` is called before entering any mode, ensuring clean transitions. TTS is no longer a layered boolean — it's a discrete mode.

### BUG-019: Play/pause button not reflecting narration state
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** When narration was playing, the play/pause button still showed ▶ instead of ❚❚. The `playing` prop was tied to Focus mode's `playing` state, not the overall mode state.
**Solution:** Changed `playing` prop to `readingMode !== "page"` — shows pause icon whenever any sub-mode is active.

### BUG-020: Narration button styled differently from Focus/Flow buttons
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** The narration toggle was a small speaker icon (🔊) styled as `.rbb-tts-btn`, separate from the Focus/Flow button group. It looked like an overlay toggle rather than a peer mode button.
**Solution:** Moved narration into the `.rbb-mode-group` as a proper `rbb-mode-btn` labeled "Narrate", matching Focus/Flow styling. Highlights orange when active.

### BUG-021: C hotkey for chapter list
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** No keyboard shortcut existed to open the chapter navigation dropdown. Users had to click the small chapter name in the bottom bar.
**Solution:** Added `KeyC` binding in all reader modes. ReaderBottomBar exposes a `chapterListRef` with a `toggle()` method. ReaderContainer passes the ref and wires `handleOpenChapterList` to the keyboard hook.

### BUG-022: Flow cursor — slow start delay
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** 16ms+ delay between pressing Space and the flow cursor bar appearing. User perceives a lag before reading begins.
**Solution:** Removed unnecessary `setTimeout` wrapper. Used forced reflow technique (`offsetWidth` read) already in the controller to eliminate the need for rAF/setTimeout delays.

### BUG-023: Flow cursor — position not saving on pause/resume
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Pressing Space to pause flow, then Space to resume, caused the cursor to jump back to the original starting position instead of resuming from where it stopped. React state batch update meant `highlightedWordIndex` wasn't updated before the new effect run.
**Solution:** Added `flowStopPosRef` to pass position between effect cleanup and re-run synchronously, bypassing React's batched state updates.

### BUG-024: Flow cursor — stale closures after page turn
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** The controller's `onPageTurn` and `getCurrentPageIdx` callbacks captured `currentPage` from the render when created. After a page turn, closures returned stale page index values.
**Solution:** Added `currentPageRef` that updates on every render. Callbacks read `currentPageRef.current` instead of the captured closure value.

### BUG-025: Flow cursor — cursor sometimes invisible after React re-render
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`, `src/components/PageReaderView.tsx`
**Problem:** The controller created its own div and appended to `.page-reader-content`. React re-renders destroyed/recreated the container, orphaning the controller's div.
**Solution:** React renders the cursor div (always present, hidden when not flowing). Controller receives a ref to this React-owned div and only styles it — never creates or removes it.

### BUG-026: Flow mode rendering as infinite scroll instead of paginated
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Flow mode rendered all words in the document (`flowPlaying ? 0 : page.start`), making the DOM enormous. `buildLineMap()` found thousands of lines, and the controller raced through them instantly.
**Solution:** Flow cursor operates on the same paginated word set as page mode. Controller handles page turns at end-of-page.

### BUG-027: Page text truncated at bottom
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx`
**Problem:** Text overflowed past the bottom of the visible page area, with the last line partially cut off. The char-width estimation for pagination was too generous.
**Solution:** Tuned character width estimation and ensured `usedHeight` starts at `lineHeight` (counting the first line). Adjusted footer position from `bottom: 120px` to `70px`.

### BUG-028: Page turn delay too long in flow mode
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/constants.ts` (FLOW_PAGE_TURN_PAUSE_MS)
**Problem:** 600ms pause at end of page before auto-turning felt sluggish during flow reading.
**Solution:** Reduced `FLOW_PAGE_TURN_PAUSE_MS` from 600ms to 200ms.

### BUG-029: Underline cursor rendering through text instead of below
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/utils/FlowCursorController.ts`
**Problem:** The flow cursor underline bar drew through the middle of text instead of underneath. The `line.bottom` calculation from `getBoundingClientRect()` landed at incorrect Y positions when TTS was simultaneously advancing pages.
**Solution:** When TTS is active, cursor controller is disabled. TTS drives word highlighting directly.

### BUG-030: `-webkit-app-region: drag` on body breaks all clickability
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css`
**Problem:** Setting `-webkit-app-region: drag` on `body` made every element a potential drag zone. Adding `no-drag` to interactive elements wasn't sufficient because intermediate container divs with padding still absorbed clicks. Flap settings buttons, theme toggles, and other UI elements had tiny or non-existent click areas.
**Solution:** Removed `drag` from `body` entirely. Added dedicated drag regions: `.reader-drag-handle` (8px strip at top of reader) and `.library-titlebar`. Added `no-drag` to `.menu-flap` contents.

### BUG-042: Flow/Narration mode page auto-advance delay (~24 seconds)
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/PageReaderView.tsx` (page-sync effect)
**Problem:** When Flow or Narration mode reached the end of a page, there was a ~24-second delay before the page turned. TTS audio continued reading the next page's words while the display stayed on the old page.
**Solution:** Added `currentPage` to the page-sync effect's dependency array. Without it, the effect used a stale closure value for `currentPage` and couldn't detect when the highlighted word had crossed to a new page. Now fires correctly on every `highlightedWordIndex` change.

### BUG-043: Narration mode page auto-advance — same fix as BUG-042
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Solution:** Same root cause and fix as BUG-042 — the page-sync effect now watches `currentPage` in its deps.

### BUG-044: Last-used mode button accent fill
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/styles/global.css` (.rbb-mode-btn--last)
**Problem:** Last-used mode button only had a subtle bottom border, not prominent enough.
**Solution:** Changed to `background: var(--accent-faded); border-color: var(--accent)` for a visible tinted fill.

### BUG-045: Cannot click words during Narration to change reading position
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Clicking a word during narration didn't resync TTS to that position.
**Solution:** Created `handleHighlightedWordChange` wrapper that calls `narration.resyncToCursor(index, wpm)` when in narration mode.

### BUG-046: Narration speed follows WPM instead of TTS rate setting
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderContainer.tsx`
**Problem:** Narration derived speech rate from WPM (350 WPM → 2.0x) instead of user's `ttsRate` setting (e.g., 1.4x).
**Solution:** After `startCursorDriven()`, call `narration.adjustRate(settings.ttsRate)` to override WPM-derived rate.

### BUG-047: Bottom bar dimmed to near-invisible during active reading modes
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`
**Problem:** The bottom bar had `opacity: 0.08` during Focus/Flow/Narration modes (designed for the old 3-mode system where the bar was hidden). This made the TTS rate slider and mode buttons nearly invisible.
**Solution:** Removed the opacity fade — bar is now always fully opaque (`opacity: 1`) in all modes.

### BUG-048: Bottom bar WPM slider should show TTS rate in Narration mode
**Reported:** 2026-03-25 | **Fixed:** 2026-03-25
**Location:** `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`
**Problem:** WPM slider showed in all modes including Narration, where it was irrelevant. Users needed to control TTS speech rate directly.
**Solution:** When `readingMode === "narration"`, the slider swaps to show `{rate}x` (0.5–2.0 range) instead of WPM. Changing the rate immediately updates both `settings.ttsRate` and the live narration engine via `narration.adjustRate()`.
