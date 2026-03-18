# Blurby — Development Roadmap

> Roadmap for bringing the Blurby app from early design to a production-ready, distributable Windows package (.exe installer).

---

## Phase 0 — Critical Pre-Release (P0) ✅

These items **must** be resolved before any public distribution.

### 0.1 End-to-End Build Verification ✅

- [x] Run `npm run build` and confirm Vite produces a clean `dist/` output with no warnings
- [x] Run `npm run package:win` and confirm electron-builder generates an NSIS installer in `release/`
- [ ] Install the generated `.exe` on a clean Windows machine (or VM) and verify:
  - App launches without errors
  - Library view renders correctly
  - Folder selection dialog opens and scans files
  - Manual document add/edit/delete works
  - Reader view displays words with ORP highlighting
  - Playback (play, pause, rewind, forward, speed adjust) works
  - Reading progress persists across app restarts
  - System tray icon appears and context menu works
  - `asar` packaging does not break asset resolution (`preload.js`, icons, etc.)

### 0.2 Data Schema Versioning ✅

- [x] Add a `version` field to `settings.json` (e.g., `"schemaVersion": 1`)
- [x] Add a `version` field to `library.json` (e.g., `"schemaVersion": 1`)
- [x] On app startup in `loadState()`, check the schema version and apply migrations if the stored version is older than the current expected version
- [x] Write a migration framework in `main.js` that can run sequential migration functions (v1→v2, v2→v3, etc.) so future schema changes don't break existing user data

### 0.3 React Error Boundaries ✅

- [x] Create an `ErrorBoundary` component that catches render errors and displays a friendly fallback UI instead of a white screen
- [x] Wrap the Library view in an error boundary
- [x] Wrap the Reader view in an error boundary
- [x] Include a "Reload" button in the error fallback that resets state and returns to the library view
- [x] Log caught errors to a local error log file for debugging (`%APPDATA%/blurby/blurby-data/error.log`)

---

## Phase 1 — Strongly Recommended Improvements (P1) ✅

These significantly improve code quality, maintainability, and user experience.

### 1.1 Component Architecture — Split `App.jsx` ✅

The entire application lived in a single 698-line `App.jsx`. Split into focused modules:

- [x] Extract `ReaderView.jsx` — full-screen RSVP reader, word display, top/bottom bars, playback controls
- [x] Extract `LibraryView.jsx` — document list, header, search, folder selection, empty state
- [x] Extract `components/ProgressBar.jsx` — progress bar used in both views
- [x] Extract `components/WpmGauge.jsx` — WPM visual gauge
- [x] Extract `components/Badge.jsx` — small tag component
- [x] Extract `components/IconBtn.jsx` — action button with SVG icons
- [x] Extract `components/AddEditPanel.jsx` — manual document add/edit form
- [x] Extract `components/HelpPanel.jsx` — keyboard shortcuts documentation panel
- [x] Extract `components/DocCard.jsx` — individual document list item with metadata and actions
- [x] Extract `components/DeleteConfirmation.jsx` — inline delete confirmation dialog
- [x] Extract `hooks/useReader.js` — playback engine (startInterval, togglePlay, adjustWpm, seekWords, exitReader), word index state, interval refs
- [x] Extract `hooks/useLibrary.js` — library CRUD operations (addDoc, deleteDoc, resetProgress, startEdit, selectFolder), library state
- [x] Extract `hooks/useKeyboardShortcuts.js` — reader hotkeys and Alt+V quick-read handler
- [x] Extract `utils/text.js` — `tokenize()`, `formatTime()`, `focusChar()` pure functions
- [x] Extract `styles/theme.js` — CSS variables object, `btnStyle`, `btnFillStyle` shared style constants
- [x] Verify all extracted components work identically to the current monolithic implementation

### 1.2 Lazy-Load File Content ✅

- [x] Remove the `content` field from library entries stored in `library.json` for folder-sourced documents
- [x] Store only metadata (id, title, filepath, filename, ext, size, modified, position, created, source) in the library JSON
- [x] Add a `load-doc-content` IPC handler in `main.js` that reads file content on demand when the user opens a document
- [x] For manual documents, continue storing content in the library JSON (they have no filepath)
- [x] Update `syncLibraryWithFolder()` to no longer read file content during folder scans — only collect metadata
- [x] Update the renderer to call `load-doc-content` when opening a document and show a brief loading state
- [x] Update word count display in the library to store word count as metadata during scan

### 1.3 Async File Reading with Loading States ✅

- [x] Convert `readFileContent()` to use `fs.promises.readFile()`
- [x] Convert `scanFolder()` to use `fs.promises.readdir()` and `fs.promises.stat()`
- [x] Convert `syncLibraryWithFolder()` to be fully async
- [x] Add a loading indicator in the renderer while folder scanning is in progress
- [x] Ensure the file watcher's `change` event handler uses async reads
- [x] `awaitWriteFinish` option present for partial read protection

### 1.4 Unit Tests for Core Functions ✅

- [x] Install Vitest as a dev dependency
- [x] Add a `test` script to `package.json`: `"test": "vitest run"`
- [x] Create `tests/text.test.js` with tests for `tokenize()`
- [x] Create tests for `focusChar()`
- [x] Create tests for `formatTime()`
- [x] Create `tests/migrations.test.js` with tests for the migration framework
- [x] Create `tests/wpm.test.js` with WPM calculation verification
- [x] Ensure all tests pass in CI-compatible mode (no Electron dependency required)

### 1.5 WPM Accuracy Calibration ✅

- [x] Audit the current WPM calculation: `60000 / wpm` produces the expected interval (e.g., 300 WPM = 200ms per word)
- [x] Verify `Math.round()` does not introduce cumulative error across all WPM steps
- [x] Playback engine uses refs for word advancement, minimizing React state update overhead
- [x] Write tests verifying WPM interval math is correct and within ±5% accuracy
- [x] Consider replacing `setInterval` with `requestAnimationFrame` for sub-50ms accuracy (see Phase 3.1)

---

## Phase 2 — Quality & Distribution Polish (P2) ✅

These improve the user experience and prepare for professional-grade distribution.

### 2.1 Extract Inline Styles to CSS Modules ✅

- [x] Create a global CSS stylesheet (`src/styles/global.css`) with all component classes
- [x] Move all inline style objects into corresponding CSS classes
- [x] Preserve CSS custom properties (variables) for theming — defined in `:root`
- [x] Move button styles into shared `.btn` and `.btn-fill` classes
- [x] Move scrollbar styles from `index.html` into the global stylesheet
- [x] Replace inline `onMouseEnter`/`onMouseLeave` style manipulation with CSS `:hover` pseudo-classes
- [x] Verify Vite bundles CSS correctly for the production Electron build

### 2.2 Windows Installer Icon & Branding ✅

- [x] Configure NSIS installer metadata: install directory selection, desktop/start menu shortcuts
- [x] Add `nsis` config block with `oneClick: false`, `allowToChangeInstallationDirectory: true`
- [x] Add macOS category (`public.app-category.productivity`)
- [ ] Generate a proper `.ico` file from `assets/icon.png` with all required sizes (16-256px) — requires icon artwork
- [ ] Add a `tray-icon.ico` for the system tray on Windows — requires icon artwork
- [ ] Verify icon appears in installer, taskbar, desktop shortcut, system tray, Add/Remove Programs

### 2.3 Data Migration Framework ✅

- [x] Implement migration runner that reads schema version and applies pending migrations
- [x] Write settings migrations (v0→v1: add folderName, recentFolders)
- [x] Write library migrations (v0→v1: add wordCount, wrap in docs object, remove folder content)
- [x] Back up existing JSON files before running migrations (`.bak` files)
- [x] Add tests for the migration runner (no migrations needed, single migration, multiple migrations, corrupt version)
- [x] Create `migrations/README.md` with template migration file

### 2.4 Code Signing for Windows

Without code signing, Windows SmartScreen will warn users that the app is from an "Unknown Publisher."

- [ ] Research and obtain a code signing certificate (options: OV certificate from DigiCert/Sectigo, or Azure Trusted Signing)
- [ ] Configure `electron-builder` to sign the `.exe` and installer during the build process
- [ ] Verify the signed installer no longer triggers SmartScreen warnings
- [ ] Document the signing process and renewal timeline

> **Note:** Code signing requires purchasing a certificate (~$200-400/year for OV, or free via Azure Trusted Signing with Azure subscription). This is a distribution-time concern and does not block development.

---

## Phase 3 — Enhanced Features & Reliability (P3) ✅

These are nice-to-haves that improve the experience and long-term reliability.

### 3.1 Replace `setInterval` with `requestAnimationFrame` ✅

At high WPM (e.g., 1200 WPM = 50ms per word), `setInterval` drift causes inconsistent pacing.

- [x] Replace the `setInterval`-based playback engine in `startInterval()` with a `requestAnimationFrame` loop
- [x] Track elapsed time using `performance.now()` timestamps instead of relying on timer accuracy
- [x] Accumulate time delta each frame and advance words when the accumulated time exceeds the per-word interval (`60000 / wpm` ms)
- [x] Ensure pause/resume preserves the fractional time remainder so pacing stays smooth
- [x] Test at extreme WPM values (100 and 1200) to confirm consistent word pacing
- [x] Verify CPU usage is not significantly increased by the rAF loop (it should be similar since the loop only runs during playback)

### 3.2 Drag-and-Drop File Support ✅

Users expect to be able to drag files onto a document-based app.

- [x] Add a drop zone overlay to the Library view that appears when files are dragged over the window
- [x] Accept dropped `.txt`, `.md`, `.markdown`, `.text`, and `.rst` files (same as `SUPPORTED_EXT`)
- [x] Read dropped file content and add as manual documents (since they may not be in the watched folder)
- [x] Handle multiple files dropped at once
- [x] Show a brief toast/notification confirming how many files were imported
- [x] Reject unsupported file types with a clear message
- [x] Handle drag-and-drop of folders: scan the folder and offer to set it as the source folder

### 3.3 Auto-Updater ✅

Once users install the app, there's no mechanism to push updates.

- [x] Install `electron-updater` as a dependency
- [x] Configure a release provider (GitHub Releases is the simplest for open-source projects):
  - [x] Add `"publish": { "provider": "github", "owner": "<owner>", "repo": "<repo>" }` to the build config
- [x] Add update checking logic in `main.js`:
  - [x] Check for updates on app startup (with a delay to not block launch)
  - [x] Notify the user when an update is available
  - [x] Download the update in the background
  - [x] Prompt the user to restart and install
- [x] Add UI in the renderer for update notifications (subtle banner or badge)
- [x] Ensure the auto-updater works with code-signed builds (if Phase 2.4 is completed)
- [x] Test the full update cycle: publish v1.0.1, confirm v1.0.0 detects and installs it

### 3.4 Symlink Path Traversal Protection ✅

The file watcher and folder scanner don't validate that resolved file paths stay within the selected folder. Symlinks could escape the intended directory.

- [x] In `scanFolder()`, resolve each file's real path using `fs.realpathSync()` (or async equivalent)
- [x] Verify the resolved path starts with the resolved source folder path
- [x] Skip files whose real path falls outside the source folder and log a warning
- [x] Apply the same validation in the Chokidar watcher event handlers

### 3.5 Reader Exit Confirmation ✅

Pressing Escape immediately exits the reader with no confirmation, which can be jarring during focused reading.

- [x] Add a brief confirmation prompt when pressing Escape during active playback (not when paused)
- [x] The confirmation should be minimal and non-disruptive — e.g., a small overlay: "Press Esc again to exit"
- [x] Auto-dismiss the confirmation after 2 seconds if no second press occurs
- [x] When paused, allow immediate exit without confirmation (progress is already saved)

### 3.6 Recent Folders List ✅

Users must re-select their folder via the system dialog every time they want to switch sources.

- [x] Store the last 5 selected folder paths in `settings.json`
- [x] Add a dropdown or menu to the "folder" button in the library header showing recent folders
- [x] Allow one-click switching to a previously used folder
- [x] Remove folders from the list if they no longer exist on disk
- [x] Highlight the currently active folder in the list

### 3.7 Reading Statistics & History ✅

- [x] Track total words read, total reading time, and average WPM per session
- [x] Store reading history in a `history.json` file (date, document title, words read, duration, WPM)
- [x] Add a simple stats panel accessible from the library view showing:
  - [x] Total words read (all time)
  - [x] Total reading time
  - [x] Average WPM across sessions
  - [x] Documents completed count
  - [x] Reading streak (consecutive days)
- [x] Keep the stats display minimal and in-theme with the existing UI

---

## Phase 4 — Future Enhancements (Backlog) ✅

Lower priority items to consider after the app is stable and distributed.

### 4.1 Additional File Format Support ✅

The app currently only supports plain text formats (`.txt`, `.md`, `.markdown`, `.text`, `.rst`). Expanding format support is essential for a general-purpose speed reading tool.

**EPUB (.epub)** — Most common standard ebook format. Reflowable text, compatible with Kobo, Apple Books, Nook, and most e-readers.

- [x] Add EPUB parsing support using a library like `epub2` or `epubjs`
- [x] Extract chapter structure and allow chapter-by-chapter reading
- [x] Parse embedded HTML content within EPUB sections into plain text
- [x] Handle EPUB metadata (title, author, cover image) for library display
- [x] Support nested EPUB table of contents for navigation

**PDF (.pdf)** — Widely used for academic papers, textbooks, and complex-layout documents. Preserves original layout regardless of device.

- [x] Add PDF text extraction using `pdf-parse` or `pdfjs-dist`
- [x] Handle multi-page documents with page-level progress tracking
- [x] Extract text in correct reading order (handle multi-column layouts where possible)
- [x] Handle PDFs with no extractable text (scanned/image-only) — show a clear "unsupported: scanned PDF" message

**AZW3/KFX** — Proprietary Amazon Kindle formats. AZW3 (KF8) is the current standard; KFX is the newest format with enhanced typesetting.

- [x] Research and integrate a library for parsing AZW3 format (e.g., convert via `calibre` CLI or use a Node parser if available)
- [x] Extract text content and chapter structure from AZW3 files
- [x] Add KFX support if a suitable parser exists, otherwise document the limitation and recommend converting to EPUB first
- [x] Handle DRM-protected files gracefully — detect and show a clear "DRM-protected file, cannot import" message

**MOBI (.mobi)** — Older Amazon format, largely replaced by AZW3 but still found in many existing ebook libraries.

- [x] Add MOBI parsing support (MOBI is structurally similar to older PalmDOC/PRC formats)
- [x] Extract text content and basic metadata (title, author)
- [x] Handle the transition: if a library contains both `.mobi` and `.azw3` versions of the same book, avoid duplicates

**HTML** — Web articles, saved pages, and locally stored web content.

- [x] Add HTML file import (`.html`, `.htm`)
- [x] Strip HTML tags and extract readable text content (use a library like `cheerio` or the built-in DOMParser approach)
- [x] Preserve paragraph structure for natural reading flow
- [x] Handle common web article patterns (skip nav bars, footers, ads if identifiable)
- [x] Support both local `.html` files in the watched folder and manual paste of HTML content

**General format infrastructure:**

- [x] Update `SUPPORTED_EXT` in `main.js` to include all new format extensions
- [x] Update the folder scanner to recognize new file types
- [x] Add format-specific icons or badges in the library view (e.g., "epub", "pdf", "kindle")
- [x] Create a unified content extraction interface so each format parser returns the same structure: `{ text: string, chapters?: Array<{ title: string, text: string }>, metadata?: { author?: string, ... } }`
- [x] Add a format detection layer that routes files to the correct parser based on extension and file magic bytes

### 4.2 TypeScript Migration ✅

- [x] Add TypeScript and `@types/react` as dev dependencies
- [x] Create `tsconfig.json` with strict mode
- [x] Rename `.jsx` files to `.tsx` and `.js` files to `.ts`
- [x] Add type definitions for IPC messages, document schema, settings schema
- [x] Add type definitions for all component props — all components have typed interfaces
- [x] Fix all type errors and ensure `tsc --noEmit` passes cleanly with zero errors

### 4.3 Multi-Window Support ✅

- [x] Allow opening multiple reader windows simultaneously via "open in new window" button on each document
- [x] Each reader window tracks its own document and playback state independently (hash-based routing `#reader/:docId`)
- [x] Ensure progress saves correctly when multiple windows are open
- [x] Duplicate windows for same doc are prevented — existing window is focused instead

### 4.4 Theming & Appearance ✅

- [x] Add a light theme option alongside the existing dark theme
- [x] Add a "system" theme option that follows the OS dark/light mode setting via `nativeTheme.shouldUseDarkColors`
- [x] System theme auto-updates when OS appearance changes (listens to `nativeTheme.updated` event)
- [x] Allow customizing the accent color — 6 presets + custom color picker
- [x] Allow customizing the reader font family — 6 presets (system, Georgia, Merriweather, Mono, Literata, OpenDyslexic)
- [x] Reader word display and scroll reader use the custom font via `--reader-font` CSS variable
- [x] Persist theme preferences in settings (accentColor, fontFamily added via v2→v3 migration)
- [x] Window background color updates to match theme

### 4.5 Import/Export ✅

- [x] Export reading progress and library metadata to a JSON backup file
- [x] Import from a previously exported backup
- [x] Export reading statistics to CSV

### 4.6 Accessibility ✅

- [x] Add ARIA labels to all interactive elements
- [x] Ensure keyboard navigation works throughout the library view (tab, enter, arrow keys)
- [x] Add screen reader announcements for reader state changes (play, pause, document complete)
- [x] Ensure sufficient color contrast ratios in both views
- [x] Support reduced motion preferences (disable animations when OS prefers-reduced-motion is set)

---

## Phase 5 — Menu Flap & Settings Redesign (P5) ✅

### 5.1 Menu Flap Shell
- [x] Create `MenuFlap.tsx` with overlay, backdrop, slide-in animation
- [x] Add hamburger icon to ReaderView and LibraryView headers
- [x] Wire `Tab` keyboard shortcut to toggle flap
- [x] Backdrop click to close
- [x] Compact/relaxed toggle in flap header
- [x] Respect `prefers-reduced-motion`

### 5.2 Reading Queue
- [x] Create `ReadingQueue.tsx` with in-progress and unread sections
- [x] Implement bubble progress bar (10 bubbles, accent-colored)
- [x] Sort in-progress by last read descending, unread by date added descending
- [x] Click-to-read: close flap, open doc in reader
- [x] Compact and relaxed display modes
- [x] Empty state message

### 5.3 Settings Reorganization
- [x] Create `SettingsMenu.tsx` with drill-down category navigation
- [x] Back arrow navigation through settings hierarchy
- [x] Divider between main settings and help/hotkeys

### 5.4 Settings Sub-pages (Implemented)
- [x] `ThemeSettings.tsx` — migrate accent color, font family, dark/light/eink/system from LibraryView
- [x] `ConnectorsSettings.tsx` — migrate site login UI from LibraryView
- [x] `HelpSettings.tsx` — migrate HelpPanel content
- [x] `HotkeyMapSettings.tsx` — read-only hotkey reference
- [x] `TextSizeSettings.tsx` — wire existing focusTextSize (placeholder for separate sliders)

### 5.5 Settings Sub-pages (Placeholder)
- [x] `SpeedReadingSettings.tsx` — mode toggle, focus marks, reading ruler, focus span, rhythm pauses (UI rendered, controls disabled)
- [x] `LayoutSettings.tsx` — line/character/word spacing sliders (disabled)

### 5.6 URL-to-PDF Export
- [x] Install pdfkit dependency
- [x] Generate PDF on URL import with title/author/URL/date metadata
- [x] Save to `<source-folder>/Saved Articles/` subfolder
- [x] Protect `Saved Articles/` docs in `syncLibraryWithFolder` from being discarded
- [x] Transition library entry from `source: "url"` to `source: "folder"`
- [x] Disable URL import when no source folder is selected
- [x] Verify pdfkit→pdf-parse round-trip text fidelity
- [x] Handle PDF generation errors gracefully (log, keep URL-sourced entry)

### 5.7 Schema Migrations
- [x] Settings v3→v4: Add all new settings fields with defaults
- [x] Settings v3→v4: Map existing `fontSize` to `focusTextSize`
- [x] Settings v3→v4: Update all `fontSize` references across codebase to `focusTextSize`
- [x] Library v1→v2: Add `lastReadAt` field to all docs (default null)
- [x] Library v1→v2: Backfill `lastReadAt` from `modified` for docs with position > 0
- [x] Update `lastReadAt` timestamp when opening a doc in the reader
- [x] Add migration tests for both settings and library migrations
- [x] Consolidate `readerMode` state with `readingMode` setting

### 5.8 Remove Legacy Appearance Panel
- [x] Delete appearance panel section from LibraryView
- [x] Remove HelpPanel.tsx (content fully migrated)
- [x] Clean up orphaned state and imports

---

## Phase 6 — Sprint 2: Speed Reading Features & Flow Mode ✅

### 6.1 Rhythm Pause Engine
- [x] `calculatePauseMs()` in `src/utils/rhythm.ts` — granular pause types (commas, sentences, paragraphs, numbers, long words)
- [x] `tokenizeWithMeta()` in `src/utils/text.ts` — paragraph boundary tracking
- [x] Wire into useReader RAF tick loop with fallback to simple punctuation check
- [x] All rhythm pause toggles functional in SpeedReadingSettings

### 6.2 Focus Mode Enhancements
- [x] Focus marks (▼▲) at ORP position with settings toggle
- [x] Focus span variable opacity with slider control
- [x] `calculateFocusOpacity()` in `src/utils/text.ts`

### 6.3 Flow Mode
- [x] Word-level rendering with accent-colored highlight
- [x] RAF-based auto-advance loop with rhythm pause integration
- [x] Auto-scroll to keep highlighted word centered
- [x] Shift+Space toggle, click-to-jump, progress tracking

### 6.4 Settings Controls
- [x] Enable all SpeedReadingSettings (rhythm pauses, focus marks, reading ruler, focus span)
- [x] Enable LayoutSettings (line, character, word spacing)
- [x] Enable TextSizeSettings flow text size slider
- [x] Reading ruler overlay in scroll/flow mode

### 6.5 Keyboard Shortcuts
- [x] Shift+Up/Down: coarse WPM ±100
- [x] B: toggle favorite
- [x] Shift+F: switch focus ↔ scroll mode
- [x] Ctrl/Cmd+,: open settings
- [x] All 15 shortcuts documented in HotkeyMapSettings

### 6.6 UX Polish & Testing
- [x] Rename export/import → backup/restore
- [x] Grid card hover actions (favorite, archive, delete)
- [x] Manual test checklist document
- [x] Expanded unit tests (104+ passing)

---

## Execution Notes

- **Phases are sequential** — complete Phase 0 before starting Phase 1, etc.
- **Items within a phase can be parallelized** where they don't depend on each other (e.g., 1.1 and 1.4 can happen concurrently).
- **Phase 0 is the minimum** to produce a distributable `.exe` with confidence.
- **Phase 1 is the minimum** for a maintainable codebase that can evolve.
- **Phase 2 is the minimum** for professional-grade distribution.
- After Phase 2, the app is ready for public release. Phases 3 and 4 are iterative improvements.
