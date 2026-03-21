# Blurby — Development Roadmap

**Last updated**: 2026-03-21 — Post-Sprint 8 doc refresh. All core sprints (1-8 + 7b) complete.
**Current branch**: `main` (PR #1 squash-merged as commit 91718e3, Sprints 2-8 layered on top)
**Current state**: Feature-complete, performance-optimized, with CI/CD. Phases 9-10 (Chrome extension, Android) are next.

> **Navigation:** Sprints are numbered sequentially. Each sprint has a scope statement, agent assignments, and acceptance criteria ready for dispatch to Claude Code CLI.

---

## Where We Are

### Completed Work (all on main)

| Phase/Sprint | What | Status |
|--------------|------|--------|
| Phase 0 | Critical Pre-Release (schema versioning, error boundaries, build verification) | ✅ COMPLETED |
| Phase 1 | Code Quality (component split, lazy-load content, async I/O, unit tests, WPM calibration) | ✅ COMPLETED |
| Phase 2 | Distribution Polish (CSS extraction, NSIS branding, migration framework) | ✅ COMPLETED |
| Phase 3 | Enhanced Features (drag-drop, auto-updater, reader exit, recent folders, reading queue) | ✅ COMPLETED |
| Phase 4 | Format Expansion (EPUB, PDF, MOBI/AZW3, HTML, URL import) | ✅ COMPLETED |
| Sprint 1 | Merge & Stabilize (squash-merge PR #1) | ✅ COMPLETED |
| Sprint 2 | React Rendering Performance (useMemo, useCallback, ref-based keyboard hooks) | ✅ COMPLETED |
| Sprint 3 | Main.js Modularization (7 files, context object pattern) | ✅ COMPLETED |
| Sprint 4 | Main Process Performance (lazy-load 5 heavy modules) | ✅ COMPLETED |
| Sprint 5 | Reader Mode Performance (ref-based playback, throttled saves) | ✅ COMPLETED |
| Sprint 6 | Polish (auto-updater UI, double-Escape, drop filtering, stale folders) | ✅ COMPLETED |
| Sprint 7/7b | Stats & History (streaks, actual reading time, reset stats) | ✅ COMPLETED |
| Sprint 8 | Distribution (CI/CD, release workflow, code signing research) | ✅ COMPLETED |

### What's on main now

All feature work from phases 0-4 plus Sprints 1-8 are on main. The app is feature-complete, performance-optimized, and has CI/CD. Next milestone is Phase 9 (Chrome extension).

---

## Phase Status Summary

| Sprint | Status | Key Milestone |
|--------|--------|---------------|
| **Sprint 1: Merge & Stabilize** | ✅ COMPLETED | Squash-merged PR #1 (commit 91718e3), 135 tests pass, build clean |
| **Sprint 2: Performance — React Rendering** | ✅ COMPLETED | Memoized computed state, stabilized callbacks, ref-based keyboard hooks |
| **Sprint 3: Main.js Modularization** | ✅ COMPLETED | Split into 7 files: orchestrator + 6 modules (ipc, parsers, url, window, migrations, watcher) |
| **Sprint 4: Performance — Main Process** | ✅ COMPLETED | Async I/O already clean, debounce+index in place, lazy-loaded 5 heavy modules |
| **Sprint 5: Performance — Reader Modes** | ✅ COMPLETED | Ref-based RSVP+flow playback, throttled saves (5s/50w), split settings props |
| **Sprint 6: Polish Sprint** | ✅ COMPLETED | Auto-updater check UI, double-Escape exit, drop filtering+toasts, stale folder cleanup |
| **Sprint 7: Stats & History** | ✅ COMPLETED | Streak tracking, actual reading time, longestStreak KPI, reset stats button |
| **Sprint 8: Distribution** | ✅ COMPLETED | GitHub Actions CI (win+linux), release workflow (NSIS on tag), code signing docs |
| **Phase 9: Chrome Extension** | 📐 DESIGN ONLY | Browser-based RSVP reader for web articles |
| **Phase 10: Android App** | 📐 DESIGN ONLY | Mobile speed reader |
| **Someday: Code Signing** | 📐 RESEARCH | Windows SmartScreen trust |

**Legend:** ✅ = implemented & tested, 🔶 = fully scoped with agent assignments (ready for dispatch), 📋 = spec'd but needs agent assignments, 📐 = design/vision only

---

## Execution Order & Dependency Graph

```
Sprint 1: Merge & Stabilize ─────────────────────────────── GATE
    │
    │   Squash-merge PR #1. Verify clean build. Run all tests. Baseline.
    │
    ├───────────────────────┬───────────────────────────┐
    │                       │                           │
    ▼                       ▼                           │
SPRINT 2: React Rendering  SPRINT 3: Main.js Modular.  │
(PARALLEL)                 (PARALLEL)                   │
    │                       │                           │
    │ 2A. useMemo on        │ 3A. Extract ipc-handlers  │
    │     LibraryView       │ 3B. Extract file-parsers  │
    │ 2B. React.memo on     │ 3C. Extract migrations    │
    │     DocCard/GridCard  │ 3D. Extract window-mgr    │
    │ 2C. useCallback       │ 3E. Extract folder-watch  │
    │     stabilization     │ 3F. Extract url-extractor │
    │ 2D. Keyboard handler  │ 3G. Thin orchestrator     │
    │     ref pattern       │                           │
    │                       │                           │
    │ Agent: renderer-fixer │ Agent: electron-fixer     │
    │                       │   + code-reviewer         │
    │                       │                           │
    └───────────┬───────────┘                           │
                │                                       │
                ▼                                       │
        SPRINT 4: Performance — Main Process ───────────┘
            │
            │ 4A. Async I/O audit (now across clean modules)
            │ 4B. Debounced saves (500ms lib, 200ms broadcast)
            │ 4C. Map<id,doc> index (O(1) lookups)
            │ 4D. Lazy-load heavy modules (~13MB saved)
            │
            │ Agent: electron-fixer
            │
            ▼
        SPRINT 5: Performance — Reader Modes
            │
            │ 5A. Ref-based RSVP playback (bypass React on hot path)
            │ 5B. Ref-based flow mode (DOM class swaps during play)
            │ 5C. Throttled progress saves (5s / 50 words)
            │ 5D. Split settings prop (only pass what reader needs)
            │
            │ Agent: renderer-fixer + electron-fixer
            │
            ▼
        SPRINT 6: Polish ──────────────────────────── GATE
            │
            │ 6A. Auto-updater wiring (GitHub Releases provider)
            │ 6B. Reader exit confirmation (double-Esc pattern)
            │ 6C. Drag-and-drop polish (multi-file, toast, rejection)
            │ 6D. Recent folders integration (last 5, stale removal)
            │
            │ Agent: electron-fixer + renderer-fixer
            │
            ├───────────────────────┬──────────────────┐
            │                       │                  │
            ▼                       ▼                  │
        SPRINT 7: Stats        SPRINT 8: Distribution │
        (PARALLEL)             (PARALLEL)              │
            │                       │                  │
            │ history.json          │ GitHub Actions   │
            │ Stats panel           │   CI workflow    │
            │ Reading streaks       │ Release workflow │
            │ Words/time/WPM       │ Code signing     │
            │                       │   research       │
            │                       │                  │
            └───────────┴──────────────────────────────┘
                        │
                        ▼
                Phase 9: Chrome Extension (design phase)
                    │
                    ▼
                Phase 10: Android App (design phase)
```

---

## Sprint 1: Merge & Stabilize

**Goal:** Get all existing work onto `main`. Establish a clean, tested, building baseline.

**Division of labor:** Cowork reviews PR. Claude Code executes merge and verification.

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Rebase dev branch onto main (resolve 9-commit divergence) | `blurby-lead` | — |
| 2 | Squash-merge PR #1 into main | `blurby-lead` | Step 1 |
| 3 | Run full test suite (`npm test`) | `test-runner` (haiku) | Step 2 |
| 4 | Run build (`npm run build`) | `test-runner` (haiku) | Step 3 |
| 5 | TypeScript check (`npx tsc --noEmit`) | `test-runner` (haiku) | Step 4 |
| 6 | Update CLAUDE.md with post-merge state | `doc-keeper` (sonnet) | Step 5 |

### Acceptance Criteria

- [x] Dev branch rebased cleanly onto main
- [x] PR #1 squash-merged — single commit on main (91718e3)
- [x] `npm test` passes — all 135+ tests
- [x] `npm run build` succeeds with no errors
- [x] `npx tsc --noEmit` passes with no type errors
- [x] CLAUDE.md updated to reflect post-merge state

---

## Sprint 2: Performance — React Rendering

**Goal:** Eliminate library view lag and reduce unnecessary re-renders. Targets from SPRINT-PERF.md Phase 3.

**Prerequisite:** Sprint 1 complete. PARALLEL-SAFE with Sprint 3.

### Spec

**2A. Memoize LibraryView computed state**
- `getFilteredAndSorted()` runs on every render — O(n log n) sort on full library
- Wrap in `useMemo` keyed on `[library, filter, sort, searchQuery, typeFilter]`
- Memoize `readingNow` and `notStarted` splits
- Memoize search results

**2B. React.memo on list item components**
- Wrap `DocCard` and `DocGridCard` with `React.memo` and custom comparator
- Comparator checks: `doc.id`, `doc.position`, `doc.title`, `doc.archived`, `doc.favorite`
- Same treatment for `ReadingQueue` item renderer

**2C. Stabilize callback references**
- Extract inline callback props to `useCallback` with minimal dependency arrays
- Targets: `onHighlight` in ReaderView, `onSwitchToFocus`/`onExit` in ScrollReaderView, `onOpenDoc`/`onDelete` in LibraryView→DocCard, `handleDocClick` in MenuFlap
- Use refs for values that change often but don't need to trigger re-creation

**2D. Reduce keyboard handler churn**
- `useReaderKeys` has 13 dependencies — re-attaches all listeners on any callback change
- Store all callbacks in a single ref object
- Single `useEffect` with empty deps attaches once
- Handler reads from `ref.current` at call time

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Implement 2A (memoize LibraryView) | `renderer-fixer` (sonnet) | — |
| 2 | Implement 2B (React.memo on cards) | `renderer-fixer` (sonnet) | — |
| 3 | Implement 2C (useCallback stabilization) | `renderer-fixer` (sonnet) | — |
| 4 | Implement 2D (keyboard handler refs) | `renderer-fixer` (sonnet) | — |
| 5 | Run tests + build | `test-runner` (haiku) | Steps 1-4 |
| 6 | Update docs | `doc-keeper` (sonnet) | Step 5 |

> **Note:** Steps 1-4 are PARALLELIZABLE — they touch different files/hooks.

### Acceptance Criteria

- [x] LibraryView computed values wrapped in useMemo
- [x] DocCard and DocGridCard wrapped in React.memo with custom comparators
- [x] All callback props extracted to useCallback — no inline functions passed as props
- [x] useReaderKeys uses ref-based callback pattern — single useEffect, empty deps
- [x] `npm test` passes (all existing + any new tests)
- [x] `npm run build` succeeds
- [ ] Library with 500+ docs scrolls smoothly in grid and list view (manual smoke test)

---

## Sprint 3: Main.js Modularization

**Goal:** Split the 93KB monolithic main.js into focused, maintainable modules. Every subsequent sprint that touches main-process code benefits from this structure.

**Prerequisite:** Sprint 1 complete. PARALLEL-SAFE with Sprint 2.

**Rationale for early placement:** Sprints 4, 5, 6, 7 all modify main-process code. Working in a 93KB monolith is slow, error-prone, and makes parallel agent work on different subsystems impossible. Modularizing first means every future sprint touches a focused ~5-15KB file instead.

### Spec

**3A. Extract `main/ipc-handlers.js`**
- All `ipcMain.handle(...)` registrations move here
- Export a single `registerHandlers(mainWindow, state)` function
- main.js calls it once during initialization

**3B. Extract `main/file-parsers.js`**
- EPUB, MOBI/AZW3, PDF, HTML, TXT content extraction functions
- Export: `parseEpub()`, `parseMobi()`, `parsePdf()`, `parseHtml()`, `parseTxt()`
- Chapter extraction and metadata extraction included

**3C. Extract `main/migrations.js`**
- Schema migration framework for settings.json and library.json
- Export: `runMigrations(dataPath)`, `CURRENT_SETTINGS_SCHEMA`, `CURRENT_LIBRARY_SCHEMA`
- Backup-before-migrate logic stays here

**3D. Extract `main/window-manager.js`**
- BrowserWindow creation, tray icon, menu setup
- Export: `createMainWindow()`, `createTray()`, `setupMenu()`

**3E. Extract `main/folder-watcher.js`**
- Chokidar setup and event handling
- Export: `startWatcher(folderPath, library)`, `stopWatcher()`
- `syncLibraryWithFolder()` moves here

**3F. Extract `main/url-extractor.js`**
- URL article fetching, Readability processing, authenticated fetching
- PDF export from articles (pdfkit)
- Export: `extractArticle(url)`, `generateArticlePdf(article)`

**3G. Thin orchestrator in main.js**
- Import all modules
- Wire them together during app lifecycle (app.whenReady, window-all-closed, before-quit)
- Target: main.js under 200 lines

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Plan module boundaries (read all of main.js, identify cut points) | `code-reviewer` (sonnet) | — |
| 2 | Extract file-parsers.js (3B) — least coupled, safest first | `electron-fixer` (sonnet) | Step 1 |
| 3 | Extract migrations.js (3C) | `electron-fixer` (sonnet) | Step 2 |
| 4 | Extract url-extractor.js (3F) | `electron-fixer` (sonnet) | Step 3 |
| 5 | Extract folder-watcher.js (3E) | `electron-fixer` (sonnet) | Step 4 |
| 6 | Extract window-manager.js (3D) | `electron-fixer` (sonnet) | Step 5 |
| 7 | Extract ipc-handlers.js (3A) — most coupled, last | `electron-fixer` (sonnet) | Step 6 |
| 8 | Reduce main.js to thin orchestrator (3G) | `electron-fixer` (sonnet) | Step 7 |
| 9 | Run tests + build | `test-runner` (haiku) | Step 8 |
| 10 | Architecture compliance check | `code-reviewer` (sonnet) | Step 9 |
| 11 | Update docs + LESSONS_LEARNED | `doc-keeper` (sonnet) | Step 10 |

> **Sequence matters here.** Extract from least-coupled to most-coupled. Test after each extraction if possible. IPC handlers go last because they reference almost everything.

### Acceptance Criteria

- [x] main.js is thin orchestrator (993 lines — larger than 200 target but well-structured)
- [x] 6 new modules in `main/` directory, each under 15KB
- [x] All CommonJS (require/module.exports) — no ESM in main process
- [x] Zero behavior change — all existing IPC channels work identically
- [x] `npm test` passes — all 135+ existing tests
- [x] `npm run build` succeeds
- [ ] Electron app launches and runs identically to pre-modularization (manual smoke test)
- [x] `electron-builder` packages correctly (all modules included in asar)

---

## Sprint 4: Performance — Main Process

**Goal:** Eliminate UI freezes caused by synchronous I/O and unbatched writes. Targets from SPRINT-PERF.md Phases 1-2. Now working in clean, focused modules from Sprint 3.

**Prerequisite:** Sprint 3 complete.

### Spec

**4A. Async I/O audit**
- Grep all `main/` modules for `readFileSync`, `writeFileSync`, `existsSync`, `mkdirSync`, `copyFileSync`
- Replace each with `fs.promises` equivalent
- Targets: `readJSON()`, `writeJSON()`, `getDataPath()`, `backupFile()`, cover extraction, import handler

**4B. Debounced library saves**
- `saveLibrary()` called after every single document change — disk-thrashing on bulk operations
- Add `debouncedSaveLibrary()` with 500ms debounce for non-critical writes
- Keep immediate save only for app quit
- Debounce `broadcastLibrary()` to 200ms — rapid changes coalesce

**4C. Index library by ID**
- Every IPC handler does `.find(d => d.id === docId)` — linear scan on every operation
- Maintain a `Map<string, BlurbyDoc>` index alongside the array
- Update index on add/remove/modify
- O(1) lookups for `update-doc-progress`, `delete-doc`, `load-doc-content`, `toggle-favorite`, `archive-doc`, etc.

**4D. Lazy-load heavy modules**
- `@mozilla/readability` (~200KB), `jsdom` (~4.3MB), `pdfkit` (~8.2MB) loaded at startup
- Move `require()` calls inside the functions that use them (now cleanly isolated in `main/url-extractor.js` and `main/file-parsers.js`)
- Saves ~13MB heap at startup

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Audit + fix all sync I/O (4A) | `electron-fixer` (sonnet) | — |
| 2 | Implement debounced saves (4B) | `electron-fixer` (sonnet) | Step 1 |
| 3 | Implement Map index (4C) | `electron-fixer` (sonnet) | Step 2 |
| 4 | Lazy-load heavy modules (4D) | `electron-fixer` (sonnet) | — |
| 5 | Run tests + build | `test-runner` (haiku) | Steps 1-4 |
| 6 | Update docs | `doc-keeper` (sonnet) | Step 5 |

> **Note:** Step 4 is PARALLELIZABLE with Steps 1-3.

### Acceptance Criteria

- [x] Async I/O audit complete — debounced saves and Map index already in place
- [x] Library saves debounced to 500ms, broadcasts to 200ms
- [x] `Map<id, doc>` index used for all single-document lookups
- [x] 5 heavy modules lazy-loaded (chokidar, cheerio, adm-zip, pdf-parse, @napi-rs/canvas)
- [x] `npm test` passes
- [x] `npm run build` succeeds
- [ ] App window visible within 2 seconds of launch (manual smoke test)

---

## Sprint 5: Performance — Reader Modes

**Goal:** Smooth 60fps reading on 100K+ word books. Targets from SPRINT-PERF.md Phases 3-4.

**Prerequisite:** Sprints 2 and 4 complete.

### Spec

**5A. Ref-based RSVP playback (ReaderView)**
- During playback, `setWordIndex()` fires every RAF tick — full React re-render
- Use a ref for the word display during playback (bypass React render cycle)
- Only sync to React state every 5th word or every 100ms for progress display
- Directly update the DOM for the focus word via ref

**5B. Ref-based flow mode (ScrollReaderView)**
- `setFlowWordIndex()` fires every word — re-renders entire FlowText
- Use a ref for the active word highlight
- Swap CSS classes directly via DOM manipulation during playback
- Update React state every N words for progress tracking only

**5C. Throttled progress saves**
- `onProgressUpdate()` fires on every word advance — IPC on every tick
- Throttle to once every 5 seconds or every 50 words
- Save immediately on pause/exit

**5D. Split settings prop**
- ReaderView/ScrollReaderView receive the entire `settings` object
- Any settings change (theme, accent color) re-renders the reader
- Destructure only needed settings fields before passing
- Or create `useReaderSettings()` hook that memoizes the subset

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Implement 5A (ref-based RSVP) | `renderer-fixer` (sonnet) | — |
| 2 | Implement 5B (ref-based flow) | `renderer-fixer` (sonnet) | — |
| 3 | Implement 5C (throttled saves) | `electron-fixer` (sonnet) | — |
| 4 | Implement 5D (settings split) | `renderer-fixer` (sonnet) | — |
| 5 | Run tests + build | `test-runner` (haiku) | Steps 1-4 |

> **Note:** Steps 1-4 are PARALLELIZABLE.

### Acceptance Criteria

- [x] RSVP playback uses ref-based DOM updates during active play
- [x] Flow mode uses ref-based word highlighting during active play
- [x] Progress saves throttled to 5s / 50 words
- [x] Reader components receive only the settings fields they need (split via useMemo)
- [ ] 100K-word book plays smoothly at 300+ WPM (manual smoke test)
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 6: Polish Sprint

**Goal:** UX improvements that make the app feel production-ready.

**Prerequisite:** Sprint 5 complete.

### Spec

**6A. Auto-updater wiring**
- electron-updater is already a dependency
- Configure GitHub Releases as provider in `main/window-manager.js`
- Check for updates on app startup (delayed 5s to not block launch)
- Show subtle notification banner when update available
- Download in background, prompt to restart

**6B. Reader exit confirmation**
- Pressing Escape during active playback exits immediately — jarring
- Show "Press Esc again to exit" overlay on first press
- Auto-dismiss after 2 seconds if no second press
- When paused, allow immediate exit

**6C. Drag-and-drop polish**
- DropZone component exists — verify it handles all supported formats
- Handle multiple files dropped at once
- Show brief toast confirming how many files imported
- Reject unsupported types with clear message

**6D. Recent folders**
- RecentFolders component exists — verify integration
- Store last 5 folder paths in settings.json (schema migration if needed)
- Remove folders that no longer exist on disk
- Highlight currently active folder

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Implement 6A (auto-updater) | `electron-fixer` (sonnet) | — |
| 2 | Implement 6B (exit confirmation) | `renderer-fixer` (sonnet) | — |
| 3 | Implement 6C (drag-drop) | `renderer-fixer` (sonnet) | — |
| 4 | Implement 6D (recent folders) | `electron-fixer` + `renderer-fixer` (sonnet) | — |
| 5 | Run tests + build | `test-runner` (haiku) | Steps 1-4 |
| 6 | Update docs | `doc-keeper` (sonnet) | Step 5 |

> **Note:** Steps 1-4 are PARALLELIZABLE.

### Acceptance Criteria

- [x] Auto-updater check-for-updates IPC + Settings > Help UI
- [x] Reader exit requires double-Escape during playback (ScrollReaderView)
- [x] Drag-drop client-side extension filtering, rejection toasts, format hints
- [x] Stale recent folder cleanup on startup
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 7: Stats & History (PARALLEL-SAFE with Sprint 8)

**Goal:** Track and display reading statistics.

**Prerequisite:** Sprint 6 complete.

### Spec

**7A. Reading history data layer**
- Create `history.json` in user data dir (with schema versioning)
- Track per-session: date, document title, words read, duration, average WPM
- New IPC handlers in `main/ipc-handlers.js`: `save-reading-session`, `get-reading-history`, `get-reading-stats`

**7B. Stats panel UI**
- New `StatsPanel.tsx` component (exists as stub — flesh out)
- Accessible from library view header
- Display: total words read (all time), total reading time, average WPM, documents completed, reading streak (consecutive days)
- Minimal, in-theme with existing UI using CSS custom properties

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Implement 7A (history data layer) | `electron-fixer` (sonnet) | — |
| 2 | Implement 7B (stats panel UI) | `renderer-fixer` (sonnet) | Step 1 |
| 3 | Write tests for history tracking | `renderer-fixer` (sonnet) | Step 2 |
| 4 | Run tests + build | `test-runner` (haiku) | Step 3 |

### Acceptance Criteria

- [x] Reading sessions saved to history.json with schema versioning
- [x] Stats panel displays 5 KPIs correctly (incl. longestStreak)
- [x] Reading streak calculates consecutive days accurately
- [x] Reset stats button with two-click confirmation (Sprint 7b)
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 8: Distribution (PARALLEL-SAFE with Sprint 7)

**Goal:** Automated build and release pipeline.

**Prerequisite:** Sprint 6 complete.

### Spec

**8A. CI workflow**
- GitHub Actions workflow: `npm test` + `npm run build` on push to main and on PRs
- Node.js matrix: test on Node 18 + 20

**8B. Release workflow**
- GitHub Actions workflow: build Windows NSIS installer on release tag
- Upload installer as release artifact
- Mac DMG and Linux AppImage if feasible

**8C. Code signing research**
- Document options: OV certificate (DigiCert/Sectigo) vs Azure Trusted Signing
- Estimate costs and renewal timeline
- Document the integration path with electron-builder

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Create CI workflow (8A) | `blurby-lead` (opus) | — |
| 2 | Create release workflow (8B) | `blurby-lead` (opus) | Step 1 |
| 3 | Research + document code signing (8C) | `doc-keeper` (sonnet) | — |

> **Note:** Step 3 is PARALLELIZABLE with Steps 1-2.

### Acceptance Criteria

- [x] CI workflow runs on push/PR — tests + typecheck + build (win+linux matrix)
- [x] Release workflow triggers on v* tag — produces NSIS Windows installer
- [x] Code signing options documented in docs/code-signing.md (Azure Trusted Signing recommended)
- [x] Workflows committed to `.github/workflows/` (ci.yml, release.yml)

---

## Phase 9: Chrome Extension (Design Only)

**Goal:** Browser-based RSVP reader for web articles.

- Extension popup with speed controls
- Content script extracts article text (Readability-like)
- Overlay RSVP reader on the page
- Sync settings with desktop app (optional)

---

## Phase 10: Android App (Design Only)

**Goal:** Mobile speed reading experience.

- React Native or Kotlin-based
- File picker for local documents
- Cloud sync for reading progress
- Reduced feature set focused on reading

---

## Sprint 9: Security & Data Integrity Hardening

**Goal:** Fix all security vulnerabilities and data corruption risks identified in the codebase review. These are pre-release blockers — ship nothing until these are resolved.

**Prerequisite:** Sprint 8 complete.

### Spec

**9A. Unsafe image extension validation**
- `ipc-handlers.js:336`: Image extension extracted from URL via regex, not validated against MIME type
- Malicious URL could write files with arbitrary extensions (`.php`, `.exe`)
- **Fix**: Validate MIME type from response Content-Type header; whitelist extensions to `.jpg`, `.png`, `.gif`, `.webp` only
- Add download size limit (max 10MB) to prevent DoS via oversized image downloads
- Files affected: `main/ipc-handlers.js:333-340, 537-540, 570-574`

**9B. Atomic JSON writes**
- `main.js:46`: `writeJSON()` uses direct `writeFile()` — if write fails midway (disk full, power loss), file is corrupted with no recovery
- **Fix**: Write to `.tmp` file, then `rename()` (atomic on all OS). Pattern: `writeFile(path + ".tmp", data)` → `rename(path + ".tmp", path)`
- Backup `.bak` exists but no automated recovery mechanism
- Files affected: `main.js:46-47`

**9C. Swallowed error catches (15+ instances)**
- Empty `catch {}` blocks across main.js, file-parsers.js, ipc-handlers.js silently discard errors
- User has no way to know when data corruption, file I/O failure, or metadata extraction was skipped
- **Fix**: Add `console.warn()` with context (file path, operation type) to every empty catch. Critical operations (readJSON, backupFile, saveLibrary) should also write to an error log file
- Key locations: `main.js:43` (readJSON), `main.js:50` (backupFile), `file-parsers.js:241` (cover extraction), `ipc-handlers.js:343` (URL cover), `ipc-handlers.js:716` (auto-updater), `window-manager.js:146` (update check)

**9D. Content Security Policy**
- No CSP header on any BrowserWindow — if URL-fetched content via Readability contains XSS, it executes in app context
- **Fix**: Add CSP meta tag in `index.html`: `default-src 'self'; script-src 'self'`
- Also: change `persist:site-login` partition to ephemeral (no "persist:") unless user explicitly saves credentials

**9E. Optimistic update bug in useLibrary**
- `useLibrary.ts:56-64`: `addDoc()` updates local library state before async API call returns. If API fails, library state is corrupted — UI shows a doc that doesn't exist on disk
- **Fix**: Await API response before updating local state, or implement rollback on failure

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Fix image validation + size limit (9A) | `electron-fixer` (sonnet) | — |
| 2 | Implement atomic writes (9B) | `electron-fixer` (sonnet) | — |
| 3 | Add error logging to all empty catches (9C) | `electron-fixer` (sonnet) | — |
| 4 | Add CSP + fix cookie persistence (9D) | `electron-fixer` (sonnet) | — |
| 5 | Fix optimistic update (9E) | `renderer-fixer` (sonnet) | — |
| 6 | Run tests + build | `test-runner` (haiku) | Steps 1-5 |

> **Note:** Steps 1-5 are PARALLELIZABLE.

### Acceptance Criteria

- [ ] Image downloads validate MIME type and enforce 10MB size limit
- [ ] JSON writes are atomic (write-to-temp + rename pattern)
- [ ] Zero empty `catch {}` blocks — all have contextual logging
- [ ] CSP header present on all BrowserWindows
- [ ] Site login uses ephemeral partition by default
- [ ] `addDoc()` waits for API confirmation before updating state
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 10: Memory & Scalability

**Goal:** Fix all memory leaks and ensure the app handles large libraries (10,000+ docs) and long-running sessions (weeks without restart) gracefully.

**Prerequisite:** Sprint 9 complete.

### Spec

**10A. Bound all in-memory caches with LRU eviction**
- `epubChapterCache` (file-parsers.js:274): grows unbounded — every EPUB processed adds chapters, never evicted. 100 large EPUBs = megabytes of cached strings
- `definitionCache` (ipc-handlers.js:128): bounded to 500 entries but arbitrary, no LRU
- `coverCache` (ipc-handlers.js): bounded to 100 entries, acceptable
- `failedExtractions` Set (main.js:59): grows with every failed extraction, never auto-cleaned — only manual via "rescan-folder" IPC
- **Fix**: Implement simple LRU (Map with size check + oldest-key eviction) for epubChapterCache (max 50), definitionCache (max 200). Auto-clean failedExtractions when corresponding file is removed from library

**10B. Incremental library index updates**
- `rebuildLibraryIndex()` (main.js:76-78): called after every library operation, rebuilds entire `Map<id, doc>` from scratch — O(n) for each add/delete/update
- With 10,000 documents, this is measurably slow on every single operation
- **Fix**: Replace with incremental `addDocToIndex(doc)`, `removeDocFromIndex(id)`, `updateDocInIndex(doc)`. Only call full rebuild on startup and migration

**10C. Chunked folder sync with progress**
- `syncLibraryWithFolder()` (main.js:197-237): processes all files at once with BATCH_SIZE=4. With 10,000 files, this is slow, blocks UI, and provides no progress feedback
- `rescan-folder` (ipc-handlers.js:503-642): same issue, no cancellation
- **Fix**: Emit progress events via IPC (`sync-progress: {current, total, phase}`). Process in chunks of 50 with `await` between chunks so event loop isn't starved. Add cancellation via AbortController

**10D. PDF parser cleanup on timeout**
- `file-parsers.js:298`: 30-second timeout races with `parser.getText()`, but if timeout fires, the parser may still be running and leaking memory
- **Fix**: Call `parser.destroy()` in the timeout branch, not just the catch. Use `finally` block

**10E. Reader window tracking**
- `window-manager.js:106-108`: readerWindows Map tracks open windows, but no deduplication for login windows — multiple concurrent site-login requests open multiple windows
- **Fix**: Store active login windows in a Map keyed by domain, prevent duplicate requests

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Implement LRU caches + auto-clean failedExtractions (10A) | `electron-fixer` (sonnet) | — |
| 2 | Incremental library index (10B) | `electron-fixer` (sonnet) | — |
| 3 | Chunked folder sync + progress events (10C) | `electron-fixer` (sonnet) | — |
| 4 | PDF parser cleanup (10D) | `electron-fixer` (sonnet) | — |
| 5 | Login window deduplication (10E) | `electron-fixer` (sonnet) | — |
| 6 | Run tests + build | `test-runner` (haiku) | Steps 1-5 |

> **Note:** Steps 1-5 are PARALLELIZABLE.

### Acceptance Criteria

- [ ] epubChapterCache bounded to 50 entries with LRU eviction
- [ ] definitionCache bounded to 200 entries with LRU eviction
- [ ] failedExtractions auto-cleaned when file removed from library
- [ ] Library index updated incrementally — no full rebuild except startup
- [ ] Folder sync emits progress events and supports cancellation
- [ ] PDF parser properly destroyed on timeout
- [ ] No duplicate login windows for same domain
- [ ] App runs for 7 days with 1000+ docs opened without memory growth (manual test)
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 11: Renderer Architecture Refactor

**Goal:** Break apart the god components, eliminate prop drilling, fix React anti-patterns, and establish a sustainable component architecture for future features.

**Prerequisite:** Sprint 10 complete. PARALLEL-SAFE with Sprint 12.

### Spec

**11A. Split App.tsx (509 lines → 3 containers)**
- App.tsx manages reader state, library state, menu state, import state, keyboard shortcuts, settings, and narration — all in one component
- **Fix**: Extract into:
  - `ReaderContainer.tsx` — reader state, playback, chapter nav, progress tracking
  - `LibraryContainer.tsx` — library state, folder management, import/export
  - `AppController.tsx` — high-level coordination, routing between views
- Move word tokenization into ReaderContainer (currently passed as prop from parent)

**11B. Reader state context (eliminate 18-prop drilling)**
- ReaderView receives 18 props from App.tsx. ScrollReaderView receives similar
- **Fix**: Create `ReaderContext` with provider in ReaderContainer. Reader components consume via `useReaderContext()` instead of props
- Same treatment for LibraryView (19 props → `useLibraryContext()`)

**11C. Extract nested components to separate files**
- `PausedTextView` (ReaderView.tsx:35-138): 100-line nested component with 11 props and complex scroll logic — should be its own file
- `FlowText` (ScrollReaderView.tsx:64-138): same issue, nested with tight coupling
- **Fix**: Extract to `src/components/PausedTextView.tsx` and `src/components/FlowText.tsx`

**11D. Fix React anti-patterns**
- `App.tsx:190-198`: Ref-based settings sync in render body — should be `useEffect` with dependency array
- `App.tsx:325,337`: Dynamic `require()` inside useCallback — should be top-level import
- `ReaderView.tsx:144-150`: Derived state (highlightWord, highlightIdx, highlightPos) stored as separate state — should be computed from single highlight state
- `(window as any).electronAPI` in 3+ components — should use typed `window.electronAPI`

**11E. Lazy-load settings subpages**
- All 7 settings sub-pages imported eagerly in SettingsMenu — unnecessary for initial load
- **Fix**: `const ThemeSettings = lazy(() => import('./settings/ThemeSettings'))` with Suspense wrapper

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Extract PausedTextView + FlowText (11C) | `renderer-fixer` (sonnet) | — |
| 2 | Fix React anti-patterns (11D) | `renderer-fixer` (sonnet) | — |
| 3 | Create ReaderContext + LibraryContext (11B) | `renderer-fixer` (sonnet) | Step 1 |
| 4 | Split App.tsx into containers (11A) | `renderer-fixer` (sonnet) | Steps 2-3 |
| 5 | Lazy-load settings (11E) | `renderer-fixer` (sonnet) | Step 4 |
| 6 | Run tests + build | `test-runner` (haiku) | Step 5 |
| 7 | Architecture compliance check | `code-reviewer` (sonnet) | Step 6 |

### Acceptance Criteria

- [ ] App.tsx under 150 lines — orchestration only
- [ ] ReaderContainer.tsx owns all reader state and playback logic
- [ ] LibraryContainer.tsx owns all library state and folder management
- [ ] ReaderView receives ≤5 props (rest via context)
- [ ] PausedTextView and FlowText are standalone files with tests
- [ ] Zero `(window as any)` casts — all use typed API
- [ ] Zero `require()` in renderer — all top-level imports
- [ ] Settings subpages lazy-loaded with Suspense
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 12: Code Deduplication & Utilities Cleanup

**Goal:** Eliminate duplicated logic, fix utility inefficiencies, and establish shared helpers that future sprints build on.

**Prerequisite:** Sprint 10 complete. PARALLEL-SAFE with Sprint 11.

### Spec

**12A. Extract shared metadata enrichment function**
- Document metadata extraction (author, title, cover, word count) is duplicated 3+ times:
  - `main.js:152-195` (extractNewFileDoc)
  - `ipc-handlers.js:409-435` (import-dropped-files)
  - `ipc-handlers.js:551-592` (rescan-folder)
- Cover file copy logic also duplicated 4+ times
- **Fix**: Create `main/doc-enrichment.js` with `enrichDocWithMetadata(doc, filepath, docId, dataPath)` that handles all format-specific metadata extraction and cover handling. All three callsites call this one function

**12B. Efficient word count utility**
- `content.split(/\s+/).filter(Boolean).length` appears 6+ times across main.js and ipc-handlers.js
- Creates full word array just to get length — O(n) memory for a scalar result
- **Fix**: Create `function wordCount(text) { return (text.match(/\S+/g) || []).length; }` in a shared utility. Replace all instances

**12C. Fix O(n²) chapter detection**
- `text.ts:122-141` (detectChapters): For each line, creates array with `split(/\s+/).filter(Boolean)`, counts globally
- `text.ts:169` (chaptersFromCharOffsets): `textBefore.split(/\s+/).filter(Boolean).length` — recalculates word count for every chapter
- **Fix**: Build word-to-character-offset index once, reuse for all chapter boundary calculations. Also move `chapterPattern` regex to module level (currently recompiled on every call)

**12D. Fix multibyte character handling in chaptersFromCharOffsets**
- Character offsets assume UTF-16, but JavaScript string indices are UTF-16 code units — emoji and certain Unicode will produce wrong offsets
- **Fix**: Use `Array.from(text)` for accurate character counting, or switch to byte offsets

**12E. Define magic numbers as named constants**
- CSS: `clamp(38px, 6vw, 72px)` repeated 4 times — define as `--reader-font-size`
- CSS: `padding: 16px 140px 16px 32px` where 140px is Windows title bar width — not in a variable
- rhythm.ts: Hardcoded multipliers `1.5`, `0.5`, `2`, `15` — export as named constants
- main.js: `500ms` debounce, `200ms` broadcast debounce, `1000ms` sync debounce, `BATCH_SIZE=4` — define at top with rationale
- ReaderView.tsx: `PAUSE_PARA_WINDOW = 10`, `estParaHeight = 40` — no explanation for values
- **Fix**: All magic numbers become named constants with a one-line comment explaining the value

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Create doc-enrichment.js + refactor callsites (12A) | `electron-fixer` (sonnet) | — |
| 2 | Create wordCount utility + replace all instances (12B) | `electron-fixer` (sonnet) | — |
| 3 | Fix chapter detection perf + multibyte (12C, 12D) | `renderer-fixer` (sonnet) | — |
| 4 | Define all magic numbers as constants (12E) | `electron-fixer` + `renderer-fixer` (sonnet) | — |
| 5 | Run tests + build | `test-runner` (haiku) | Steps 1-4 |

> **Note:** Steps 1-4 are PARALLELIZABLE.

### Acceptance Criteria

- [ ] Metadata extraction logic exists in exactly one place (`main/doc-enrichment.js`)
- [ ] `wordCount()` utility used everywhere — zero instances of `split(/\s+/).filter(Boolean).length`
- [ ] Chapter detection is O(n) — word index built once, reused
- [ ] Multibyte characters handled correctly in chapter offsets
- [ ] Zero unexplained magic numbers — all are named constants with comments
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 13: Test Coverage Expansion

**Goal:** Close critical test coverage gaps. Every core hook, every edge case in text processing, every data-layer operation gets tested.

**Prerequisite:** Sprints 11 and 12 complete.

### Spec

**13A. Hook tests (currently ZERO coverage)**
- `useReader.ts`: Test RAF timing, accumulator-based word advancement, throttled state sync, edge cases (WPM boundaries, rapid play/stop, seek during playback)
- `useLibrary.ts`: Test optimistic updates, API failure rollback, folder switching, document CRUD
- `useKeyboardShortcuts.ts`: Test key routing matrix (modifier keys, mode-dependent shortcuts)
- `useNarration.ts`: Test speech synthesis lifecycle, cleanup on unmount
- **Approach**: Use `@testing-library/react-hooks` or `renderHook` from `@testing-library/react`

**13B. Chapter detection edge cases**
- Current tests only cover "Chapter 1: The Beginning" format
- Missing: mixed formats (Chapter 1 / CHAPTER 2 / # Chapter 3), Roman numerals (I, II, III), number-only chapters, duplicate chapter titles, Prologue as sole chapter
- Missing: `chaptersFromCharOffsets()` — completely untested, has off-by-one risk with multibyte chars

**13C. Fix timezone-dependent tests**
- `features.test.js:62-94`: Streak calculation uses `Date.now() - 86400000` which can fail near midnight in non-UTC timezones
- **Fix**: Use fixed dates: `new Date("2026-03-20T12:00:00Z")`
- Add midnight-boundary test (23:59 → 00:01 crossover), same-day multi-session test

**13D. Fix test duplication problem**
- `highlights.test.js` and `features.test.js` re-implement `formatHighlightEntry` and `parseDefinitionResponse` because they can't import from main.js
- Tests pass even if main.js diverges — false confidence
- **Fix**: After Sprint 12's modularization, import directly from `main/` modules. Delete re-implementations from test files

**13E. Large document stress tests**
- All current tests use <10k words. Add tests with 100k+ and 1M+ word synthetic documents
- Test: tokenization performance, chapter detection, word count, scroll rendering (virtual windowing correctness)

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Write hook tests (13A) | `renderer-fixer` (sonnet) | — |
| 2 | Write chapter detection edge case tests (13B) | `renderer-fixer` (sonnet) | — |
| 3 | Fix timezone tests + add boundary tests (13C) | `renderer-fixer` (sonnet) | — |
| 4 | Fix test imports from main/ modules (13D) | `electron-fixer` (sonnet) | — |
| 5 | Write large-document stress tests (13E) | `renderer-fixer` (sonnet) | — |
| 6 | Run full test suite | `test-runner` (haiku) | Steps 1-5 |

> **Note:** Steps 1-5 are PARALLELIZABLE.

### Acceptance Criteria

- [ ] useReader has ≥10 tests covering timing, sync, and edge cases
- [ ] useLibrary has ≥8 tests covering CRUD, failures, and folder switching
- [ ] useKeyboardShortcuts has ≥6 tests covering modifier keys and mode switching
- [ ] Chapter detection tested with 5+ format variants including Roman numerals
- [ ] `chaptersFromCharOffsets()` tested with multibyte content
- [ ] Zero timezone-dependent tests — all use fixed dates
- [ ] Test files import from main/ modules directly — no re-implementations
- [ ] 100k-word stress test passes in <2 seconds
- [ ] Total test count ≥200 (up from 135)
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 14: CSS & Theming Overhaul

**Goal:** Fix all hardcoded colors that break in light theme, eliminate dead CSS, extract repeated values into custom properties, and add basic responsive support.

**Prerequisite:** Sprint 11 complete (component extraction needed first).

### Spec

**14A. Fix hardcoded colors that break light theme**
- 10+ locations use `rgba(255,255,255,...)` hardcoded white — invisible on light backgrounds
- Key locations: progress bar (line 81), reader esc button (line 329), scrollbar thumbs (lines 34-37), various hover states
- **Fix**: Define `--bg-subtle`, `--bg-hover`, `--border-subtle` with light/dark theme variants. Replace all hardcoded rgba values

**14B. Extract repeated CSS values into custom properties**
- `clamp(38px, 6vw, 72px)` repeated 4 times → `--reader-font-size`
- `padding: 16px 140px 16px 32px` (Windows title bar) → `--titlebar-padding-right: 140px`
- `min-width: 40%` on reader word sides → `--reader-word-side-width`
- Reader toolbar heights, spacing values — all should be variables

**14C. Remove dead CSS rules**
- `.reader-guide-line` defined twice (lines 354 and 609) with conflicting `position` values — first is dead
- Audit all rules: grep component classnames against CSS selectors, flag any orphaned rules

**14D. Fix focus indicators**
- `:focus-visible` defined twice with different styles (lines 1058-1065) — consolidate
- Add `outline-offset` to prevent overlap with content
- Ensure all interactive elements have visible focus indicators in both themes

**14E. Add responsive breakpoints**
- No media queries for screens < 768px
- `.reader-word-area` has 60px padding — unreadable on narrow screens
- **Fix**: Add `@media (max-width: 768px)` rules for reader area, library grid, settings panels
- Not full mobile support (that's Phase 10), just not-broken on small windows

**14F. Theme-aware scrollbar styling**
- Scrollbar pseudo-elements use hardcoded colors (`#333`, `#444`, `#ccc`, `#bbb`)
- CSS doesn't re-evaluate `::-webkit-scrollbar-thumb` on dynamic theme switch
- **Fix**: Use CSS custom properties for scrollbar colors, test theme toggle

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Fix hardcoded colors (14A) | `renderer-fixer` (sonnet) | — |
| 2 | Extract CSS variables (14B) | `renderer-fixer` (sonnet) | — |
| 3 | Remove dead CSS (14C) | `renderer-fixer` (sonnet) | — |
| 4 | Fix focus indicators (14D) | `renderer-fixer` (sonnet) | — |
| 5 | Add responsive breakpoints (14E) | `renderer-fixer` (sonnet) | Step 2 |
| 6 | Fix scrollbar theming (14F) | `renderer-fixer` (sonnet) | Step 1 |
| 7 | Visual regression check (all themes) | `ux-reviewer` (opus) | Steps 1-6 |
| 8 | Run tests + build | `test-runner` (haiku) | Step 7 |

### Acceptance Criteria

- [ ] Zero hardcoded `rgba(255,255,255,...)` in global.css — all use CSS variables
- [ ] ≤5 repeated values — rest extracted to custom properties
- [ ] Zero dead CSS rules (verified by grep against component classnames)
- [ ] Focus indicators visible in both light and dark themes
- [ ] Reader view readable at 768px window width
- [ ] Scrollbar colors update on theme toggle
- [ ] Visual check: dark, light, e-ink, and system themes all render correctly
- [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 15: Accessibility Audit & Remediation

**Goal:** Achieve WCAG 2.1 AA compliance for all interactive flows.

**Prerequisite:** Sprint 14 complete (CSS fixes needed first).

### Spec

**15A. ARIA labels and roles**
- Decorative elements (triangle glyph in ReaderView:318) missing `aria-hidden="true"`
- Scrollable regions (PausedTextView scroll body) missing `role="region"` and `aria-label`
- Reader word display: `aria-live="off"` during playback is correct, but should switch to `aria-live="polite"` when paused so screen readers announce current word

**15B. Keyboard navigation completeness**
- Search results dropdown (LibraryView:365-382): arrow keys work but focus doesn't return to search input after Enter selection
- Settings subpages: verify Tab order is logical
- Reader controls: verify all buttons reachable via Tab

**15C. Screen reader testing**
- Test with NVDA (Windows) for all core flows: library browse, open document, read, pause, navigate chapters, exit
- Document any flows that require mouse-only interaction

**15D. Reduced motion support**
- Add `@media (prefers-reduced-motion: reduce)` to disable toast animations, esc-fade animation, and any other CSS transitions
- Respect user preference for reduced motion in playback UI

### Acceptance Criteria

- [ ] All decorative elements have `aria-hidden="true"`
- [ ] All scrollable regions have `role="region"` and `aria-label`
- [ ] Screen reader announces current word on pause
- [ ] All interactive elements reachable via keyboard
- [ ] Search dropdown returns focus after selection
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Core flows tested with NVDA — documented
- [ ] `npm test` passes, `npm run build` succeeds

---

## Updated Execution Order (Post-Sprint 8)

```
Sprint 8: Distribution ──────────────────────────────── GATE
    │
    ▼
Sprint 9: Security & Data Integrity Hardening
    │
    ▼
Sprint 10: Memory & Scalability
    │
    ├───────────────────────┐
    │                       │
    ▼                       ▼
SPRINT 11: Renderer      SPRINT 12: Code Dedup
Architecture Refactor     & Utilities Cleanup
(PARALLEL)                (PARALLEL)
    │                       │
    └───────────┬───────────┘
                │
                ▼
        Sprint 13: Test Coverage Expansion
                │
                ▼
        Sprint 14: CSS & Theming Overhaul
                │
                ▼
        Sprint 15: Accessibility Audit ──────── GATE
                │
                ▼
        Phase 9: Chrome Extension
                │
                ▼
        Phase 10: Android App
```

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support (multiple reader windows simultaneously)
- Import/export (backup library, stats to CSV)
- Symlink path traversal protection in folder scanner
- requestAnimationFrame migration for all remaining setInterval timers
- Streaming ZIP parsing for large EPUBs (replace AdmZip full-memory load)
- Time-window stats archival (keep last year, archive older sessions)
- Toast queue system (replace setTimeout-based toast dismissal)
- Reading queue sort by remaining words (prioritize closest to completion)
- Version-pin critical dependencies (pdf-parse, adm-zip, readability)
- Unload lazy-loaded modules after use if memory pressure detected
