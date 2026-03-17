# Blurby — Development Roadmap

> Roadmap for bringing the Blurby app from early design to a production-ready, distributable Windows package (.exe installer).

---

## Phase 0 — Critical Pre-Release (P0)

These items **must** be resolved before any public distribution.

### 0.1 End-to-End Build Verification

- [ ] Run `npm run build` and confirm Vite produces a clean `dist/` output with no warnings
- [ ] Run `npm run package:win` and confirm electron-builder generates an NSIS installer in `release/`
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

### 0.2 Data Schema Versioning

- [ ] Add a `version` field to `settings.json` (e.g., `"schemaVersion": 1`)
- [ ] Add a `version` field to `library.json` (e.g., `"schemaVersion": 1`)
- [ ] On app startup in `loadState()`, check the schema version and apply migrations if the stored version is older than the current expected version
- [ ] Write a migration framework in `main.js` that can run sequential migration functions (v1→v2, v2→v3, etc.) so future schema changes don't break existing user data

### 0.3 React Error Boundaries

- [ ] Create an `ErrorBoundary` component that catches render errors and displays a friendly fallback UI instead of a white screen
- [ ] Wrap the Library view in an error boundary
- [ ] Wrap the Reader view in an error boundary
- [ ] Include a "Reload" button in the error fallback that resets state and returns to the library view
- [ ] Log caught errors to a local error log file for debugging (`%APPDATA%/blurby/blurby-data/error.log`)

---

## Phase 1 — Strongly Recommended Improvements (P1)

These significantly improve code quality, maintainability, and user experience.

### 1.1 Component Architecture — Split `App.jsx`

The entire application lives in a single 698-line `App.jsx`. Split into focused modules:

- [ ] Extract `ReaderView.jsx` — full-screen RSVP reader, word display, top/bottom bars, playback controls
- [ ] Extract `LibraryView.jsx` — document list, header, search, folder selection, empty state
- [ ] Extract `components/ProgressBar.jsx` — progress bar used in both views
- [ ] Extract `components/WpmGauge.jsx` — WPM visual gauge
- [ ] Extract `components/Badge.jsx` — small tag component
- [ ] Extract `components/IconBtn.jsx` — action button with SVG icons
- [ ] Extract `components/AddEditPanel.jsx` — manual document add/edit form
- [ ] Extract `components/HelpPanel.jsx` — keyboard shortcuts documentation panel
- [ ] Extract `components/DocCard.jsx` — individual document list item with metadata and actions
- [ ] Extract `components/DeleteConfirmation.jsx` — inline delete confirmation dialog
- [ ] Extract `hooks/useReader.js` — playback engine (startInterval, togglePlay, adjustWpm, seekWords, exitReader), word index state, interval refs
- [ ] Extract `hooks/useLibrary.js` — library CRUD operations (addDoc, deleteDoc, resetProgress, startEdit, selectFolder), library state
- [ ] Extract `hooks/useKeyboardShortcuts.js` — reader hotkeys and Alt+V quick-read handler
- [ ] Extract `utils/text.js` — `tokenize()`, `formatTime()`, `focusChar()` pure functions
- [ ] Extract `styles/theme.js` — CSS variables object, `btnStyle`, `btnFillStyle` shared style constants
- [ ] Verify all extracted components work identically to the current monolithic implementation

### 1.2 Lazy-Load File Content

Currently every file's full text content is stored in `library.json` and loaded into memory at startup. A folder with large `.txt` files will balloon both disk and memory usage.

- [ ] Remove the `content` field from library entries stored in `library.json` for folder-sourced documents
- [ ] Store only metadata (id, title, filepath, filename, ext, size, modified, position, created, source) in the library JSON
- [ ] Add a `load-doc-content` IPC handler in `main.js` that reads file content on demand when the user opens a document
- [ ] For manual documents, continue storing content in the library JSON (they have no filepath)
- [ ] Update `syncLibraryWithFolder()` to no longer read file content during folder scans — only collect metadata
- [ ] Update the renderer to call `load-doc-content` when opening a document and show a brief loading state
- [ ] Update word count display in the library to either: (a) store word count as metadata during scan, or (b) calculate lazily and cache

### 1.3 Async File Reading with Loading States

`scanFolder()` uses `fs.readFileSync` and `fs.readdirSync`, which block the main process. A large folder will freeze the UI.

- [ ] Convert `readFileContent()` to use `fs.promises.readFile()`
- [ ] Convert `scanFolder()` to use `fs.promises.readdir()` and `fs.promises.stat()`
- [ ] Convert `syncLibraryWithFolder()` to be fully async
- [ ] Add a loading indicator in the renderer while folder scanning is in progress
- [ ] Handle the case where a file is being written to while being read (retry with backoff, or skip and re-read on next watcher event)
- [ ] Ensure the file watcher's `change` event handler doesn't produce partial reads — use the `awaitWriteFinish` option (already present, but verify it handles edge cases under load)

### 1.4 Unit Tests for Core Functions

There are currently zero tests in the project.

- [ ] Install Vitest as a dev dependency (`npm install -D vitest`)
- [ ] Add a `test` script to `package.json`: `"test": "vitest run"`
- [ ] Create `tests/text.test.js` with tests for `tokenize()`:
  - Empty string returns empty array
  - Single word returns array with one element
  - Multiple spaces between words are handled
  - Leading/trailing whitespace is trimmed
  - Tabs, newlines, and mixed whitespace are handled
- [ ] Create tests for `focusChar()`:
  - Empty string returns `{ before: "", focus: "", after: "" }`
  - Single character word: pivot at 0
  - 2–5 character words: pivot at 1
  - 6–9 character words: pivot at 2
  - 10–13 character words: pivot at 3
  - 14+ character words: pivot at 4
  - Verify before/focus/after slicing is correct for each bracket
- [ ] Create tests for `formatTime()`:
  - 0 words or 0 WPM returns "0m"
  - Less than 1 minute returns "<1m"
  - Minutes less than 60 return "{N}m"
  - 60+ minutes return hours and minutes format
  - Edge case: exactly 60 minutes returns "1h"
- [ ] Ensure all tests pass in CI-compatible mode (no Electron dependency required)

### 1.5 WPM Accuracy Calibration

The current WPM does not appear to be correctly calibrated. The playback interval is calculated as `Math.round(60000 / wpm)` ms per word, which is mathematically correct for raw words-per-minute but may not match perceived reading speed due to several factors.

- [ ] Audit the current WPM calculation in `startInterval()` (`App.jsx`): confirm that `60000 / wpm` produces the expected interval (e.g., 300 WPM = 200ms per word)
- [ ] Measure actual playback speed: create a test document with a known word count, start at a known WPM, and time how long it takes to play through — compare elapsed time against expected time (`wordCount / wpm * 60` seconds)
- [ ] Investigate `setInterval` drift: at higher WPMs the interval is very short (50ms at 1200 WPM) and JavaScript timer resolution may cause words to display slower than intended
- [ ] Check whether `Math.round()` on the interval introduces cumulative error (e.g., 250 WPM = 240ms, but rounding 60000/250 = 240.0 — no error here, but verify across all WPM steps)
- [ ] Investigate whether `setWordIndex` (React state update) adds latency on top of the interval, effectively reducing the actual WPM
- [ ] Consider compensating for state update overhead by using refs for word advancement and only syncing to React state periodically (e.g., every 10 words) during playback
- [ ] Add a real-time "actual WPM" display (calculated from words advanced / elapsed time) to help users verify calibration
- [ ] Write a test that programmatically runs the playback engine for N words at a target WPM and asserts the elapsed time is within ±5% of the expected duration

---

## Phase 2 — Quality & Distribution Polish (P2)

These improve the user experience and prepare for professional-grade distribution.

### 2.1 Extract Inline Styles to CSS Modules

Every component uses `style={{...}}` objects, making the codebase hard to scan and theme changes tedious.

- [ ] Create a CSS module for each extracted component (e.g., `ReaderView.module.css`, `LibraryView.module.css`)
- [ ] Move all inline style objects into corresponding CSS classes
- [ ] Preserve CSS custom properties (variables) for theming — define them in a global stylesheet
- [ ] Move `btnStyle` and `btnFillStyle` into a shared `styles/buttons.module.css`
- [ ] Move scrollbar styles from `index.html` `<style>` tag into the global stylesheet
- [ ] Verify hover/focus/transition states still work correctly (replace inline `onMouseEnter`/`onMouseLeave` style manipulation with CSS `:hover` pseudo-classes)
- [ ] Ensure Vite bundles CSS modules correctly for the production Electron build

### 2.2 Windows Installer Icon & Branding

- [ ] Generate a proper `.ico` file from `assets/icon.png` with all required sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- [ ] Update `package.json` build config to reference the `.ico` file for Windows: `"win": { "icon": "assets/icon.ico" }`
- [ ] Verify the icon appears correctly in:
  - The installer wizard
  - The installed app's taskbar icon
  - The desktop shortcut (if created)
  - The system tray
  - The "Add or Remove Programs" list
- [ ] Add a `tray-icon.ico` for the system tray on Windows (16x16 and 32x32)
- [ ] Configure NSIS installer metadata: publisher name, license agreement (if any), install directory default

### 2.3 Data Migration Framework

Building on the schema versioning from Phase 0:

- [ ] Create a `migrations/` directory in the project
- [ ] Implement a migration runner that reads the current schema version from stored JSON and applies all pending migrations in sequence
- [ ] Write a template migration file showing the expected structure (input schema → output schema)
- [ ] Add tests for the migration runner:
  - No migrations needed (current version)
  - Single migration applied
  - Multiple sequential migrations applied
  - Corrupt or missing version field handled gracefully (treat as version 0)
- [ ] Back up the existing JSON files before running migrations (copy to `.bak` files)

### 2.4 Code Signing for Windows

Without code signing, Windows SmartScreen will warn users that the app is from an "Unknown Publisher," which significantly reduces install trust and completion rates.

- [ ] Research and obtain a code signing certificate (options: OV certificate from a CA like DigiCert/Sectigo, or use Azure Trusted Signing)
- [ ] Configure `electron-builder` to sign the `.exe` and installer during the build process
- [ ] Add the signing configuration to `package.json` or `electron-builder.yml`:
  - Certificate file path or Windows Certificate Store reference
  - Timestamp server URL for long-term validity
- [ ] Verify the signed installer no longer triggers SmartScreen warnings
- [ ] Document the signing process and renewal timeline for the certificate

---

## Phase 3 — Enhanced Features & Reliability (P3)

These are nice-to-haves that improve the experience and long-term reliability.

### 3.1 Replace `setInterval` with `requestAnimationFrame`

At high WPM (e.g., 1200 WPM = 50ms per word), `setInterval` drift causes inconsistent pacing.

- [ ] Replace the `setInterval`-based playback engine in `startInterval()` with a `requestAnimationFrame` loop
- [ ] Track elapsed time using `performance.now()` timestamps instead of relying on timer accuracy
- [ ] Accumulate time delta each frame and advance words when the accumulated time exceeds the per-word interval (`60000 / wpm` ms)
- [ ] Ensure pause/resume preserves the fractional time remainder so pacing stays smooth
- [ ] Test at extreme WPM values (100 and 1200) to confirm consistent word pacing
- [ ] Verify CPU usage is not significantly increased by the rAF loop (it should be similar since the loop only runs during playback)

### 3.2 Drag-and-Drop File Support

Users expect to be able to drag files onto a document-based app.

- [ ] Add a drop zone overlay to the Library view that appears when files are dragged over the window
- [ ] Accept dropped `.txt`, `.md`, `.markdown`, `.text`, and `.rst` files (same as `SUPPORTED_EXT`)
- [ ] Read dropped file content and add as manual documents (since they may not be in the watched folder)
- [ ] Handle multiple files dropped at once
- [ ] Show a brief toast/notification confirming how many files were imported
- [ ] Reject unsupported file types with a clear message
- [ ] Handle drag-and-drop of folders: scan the folder and offer to set it as the source folder

### 3.3 Auto-Updater

Once users install the app, there's no mechanism to push updates.

- [ ] Install `electron-updater` as a dependency
- [ ] Configure a release provider (GitHub Releases is the simplest for open-source projects):
  - Add `"publish": { "provider": "github", "owner": "<owner>", "repo": "<repo>" }` to the build config
- [ ] Add update checking logic in `main.js`:
  - Check for updates on app startup (with a delay to not block launch)
  - Notify the user when an update is available
  - Download the update in the background
  - Prompt the user to restart and install
- [ ] Add UI in the renderer for update notifications (subtle banner or badge)
- [ ] Ensure the auto-updater works with code-signed builds (if Phase 2.4 is completed)
- [ ] Test the full update cycle: publish v1.0.1, confirm v1.0.0 detects and installs it

### 3.4 Symlink Path Traversal Protection

The file watcher and folder scanner don't validate that resolved file paths stay within the selected folder. Symlinks could escape the intended directory.

- [ ] In `scanFolder()`, resolve each file's real path using `fs.realpathSync()` (or async equivalent)
- [ ] Verify the resolved path starts with the resolved source folder path
- [ ] Skip files whose real path falls outside the source folder and log a warning
- [ ] Apply the same validation in the Chokidar watcher event handlers

### 3.5 Reader Exit Confirmation

Pressing Escape immediately exits the reader with no confirmation, which can be jarring during focused reading.

- [ ] Add a brief confirmation prompt when pressing Escape during active playback (not when paused)
- [ ] The confirmation should be minimal and non-disruptive — e.g., a small overlay: "Press Esc again to exit"
- [ ] Auto-dismiss the confirmation after 2 seconds if no second press occurs
- [ ] When paused, allow immediate exit without confirmation (progress is already saved)

### 3.6 Recent Folders List

Users must re-select their folder via the system dialog every time they want to switch sources.

- [ ] Store the last 5 selected folder paths in `settings.json`
- [ ] Add a dropdown or menu to the "folder" button in the library header showing recent folders
- [ ] Allow one-click switching to a previously used folder
- [ ] Remove folders from the list if they no longer exist on disk
- [ ] Highlight the currently active folder in the list

### 3.7 Reading Statistics & History

- [ ] Track total words read, total reading time, and average WPM per session
- [ ] Store reading history in a `history.json` file (date, document title, words read, duration, WPM)
- [ ] Add a simple stats panel accessible from the library view showing:
  - Total words read (all time)
  - Total reading time
  - Average WPM across sessions
  - Documents completed count
  - Reading streak (consecutive days)
- [ ] Keep the stats display minimal and in-theme with the existing UI

---

## Phase 4 — Future Enhancements (Backlog)

Lower priority items to consider after the app is stable and distributed.

### 4.1 Additional File Format Support

The app currently only supports plain text formats (`.txt`, `.md`, `.markdown`, `.text`, `.rst`). Expanding format support is essential for a general-purpose speed reading tool.

**EPUB (.epub)** — Most common standard ebook format. Reflowable text, compatible with Kobo, Apple Books, Nook, and most e-readers.

- [ ] Add EPUB parsing support using a library like `epub2` or `epubjs`
- [ ] Extract chapter structure and allow chapter-by-chapter reading
- [ ] Parse embedded HTML content within EPUB sections into plain text
- [ ] Handle EPUB metadata (title, author, cover image) for library display
- [ ] Support nested EPUB table of contents for navigation

**PDF (.pdf)** — Widely used for academic papers, textbooks, and complex-layout documents. Preserves original layout regardless of device.

- [ ] Add PDF text extraction using `pdf-parse` or `pdfjs-dist`
- [ ] Handle multi-page documents with page-level progress tracking
- [ ] Extract text in correct reading order (handle multi-column layouts where possible)
- [ ] Handle PDFs with no extractable text (scanned/image-only) — show a clear "unsupported: scanned PDF" message

**AZW3/KFX** — Proprietary Amazon Kindle formats. AZW3 (KF8) is the current standard; KFX is the newest format with enhanced typesetting.

- [ ] Research and integrate a library for parsing AZW3 format (e.g., convert via `calibre` CLI or use a Node parser if available)
- [ ] Extract text content and chapter structure from AZW3 files
- [ ] Add KFX support if a suitable parser exists, otherwise document the limitation and recommend converting to EPUB first
- [ ] Handle DRM-protected files gracefully — detect and show a clear "DRM-protected file, cannot import" message

**MOBI (.mobi)** — Older Amazon format, largely replaced by AZW3 but still found in many existing ebook libraries.

- [ ] Add MOBI parsing support (MOBI is structurally similar to older PalmDOC/PRC formats)
- [ ] Extract text content and basic metadata (title, author)
- [ ] Handle the transition: if a library contains both `.mobi` and `.azw3` versions of the same book, avoid duplicates

**HTML** — Web articles, saved pages, and locally stored web content.

- [ ] Add HTML file import (`.html`, `.htm`)
- [ ] Strip HTML tags and extract readable text content (use a library like `cheerio` or the built-in DOMParser approach)
- [ ] Preserve paragraph structure for natural reading flow
- [ ] Handle common web article patterns (skip nav bars, footers, ads if identifiable)
- [ ] Support both local `.html` files in the watched folder and manual paste of HTML content

**General format infrastructure:**

- [ ] Update `SUPPORTED_EXT` in `main.js` to include all new format extensions
- [ ] Update the folder scanner to recognize new file types
- [ ] Add format-specific icons or badges in the library view (e.g., "epub", "pdf", "kindle")
- [ ] Create a unified content extraction interface so each format parser returns the same structure: `{ text: string, chapters?: Array<{ title: string, text: string }>, metadata?: { author?: string, ... } }`
- [ ] Add a format detection layer that routes files to the correct parser based on extension and file magic bytes

### 4.2 TypeScript Migration

- [ ] Add TypeScript and `@types/react` as dev dependencies
- [ ] Create `tsconfig.json` with strict mode
- [ ] Rename `.jsx` files to `.tsx` and `.js` files to `.ts`
- [ ] Add type definitions for IPC messages, document schema, settings schema
- [ ] Add type definitions for all component props
- [ ] Fix all type errors and ensure the build passes cleanly

### 4.3 Multi-Window Support

- [ ] Allow opening multiple reader windows simultaneously
- [ ] Each reader window tracks its own document and playback state independently
- [ ] Ensure progress saves correctly when multiple windows are open

### 4.4 Theming & Appearance

- [ ] Add a light theme option alongside the existing dark theme
- [ ] Add a "system" theme option that follows the OS dark/light mode setting
- [ ] Allow customizing the accent color
- [ ] Allow customizing the reader font family and size
- [ ] Persist theme preferences in settings

### 4.5 Import/Export

- [ ] Export reading progress and library metadata to a JSON backup file
- [ ] Import from a previously exported backup
- [ ] Export reading statistics to CSV

### 4.6 Accessibility

- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works throughout the library view (tab, enter, arrow keys)
- [ ] Add screen reader announcements for reader state changes (play, pause, document complete)
- [ ] Ensure sufficient color contrast ratios in both views
- [ ] Support reduced motion preferences (disable animations when OS prefers-reduced-motion is set)

---

## Execution Notes

- **Phases are sequential** — complete Phase 0 before starting Phase 1, etc.
- **Items within a phase can be parallelized** where they don't depend on each other (e.g., 1.1 and 1.4 can happen concurrently).
- **Phase 0 is the minimum** to produce a distributable `.exe` with confidence.
- **Phase 1 is the minimum** for a maintainable codebase that can evolve.
- **Phase 2 is the minimum** for professional-grade distribution.
- After Phase 2, the app is ready for public release. Phases 3 and 4 are iterative improvements.
