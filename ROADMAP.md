# Blurby — Development Roadmap

**Last updated**: 2026-03-21 — Post-Sprint 17 doc refresh. All sprints (1-17) complete.
**Current branch**: `main` (36 commits — PR #1 squash-merged, then Sprints 2-17 layered on top)
**Current state**: Feature-complete with cloud sync. Sprint 18 (platform expansion: .exe hardening, Chrome extension, Android) is next.

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
| Sprint 16 | E-Ink Display Optimization (WPM ceiling, phrase grouping, paginated scroll, ghosting prevention, touch targets) | ✅ COMPLETED |
| Sprint 9 | Security & Data Integrity (image validation, atomic writes, CSP, error handling, pessimistic updates) | ✅ COMPLETED |
| Sprint 10 | Memory & Scalability (LRU caches, incremental index, PDF cleanup, login dedup) | ✅ COMPLETED |
| Sprint 11 | Renderer Architecture Refactor (App.tsx split into containers, component extraction) | ✅ COMPLETED |
| Sprint 12 | Code Deduplication (metadata consolidation, countWords utility, named constants) | ✅ COMPLETED |
| Sprint 13 | Test Coverage Expansion (135 → 293 tests, hook tests, stress tests) | ✅ COMPLETED |
| Sprint 14 | CSS & Theming Overhaul (cross-theme consistency, dead CSS removal, responsive) | ✅ COMPLETED |
| Sprint 15 | Accessibility (WCAG 2.1 AA — ARIA labels, keyboard nav, screen reader, reduced motion) | ✅ COMPLETED |
| Sprint 17 | Persistent Login & Cloud Sync (OAuth2, OneDrive/GDrive, offline-first sync engine) | ✅ COMPLETED |

### What's on main now

All feature work from phases 0-4 plus Sprints 1-17 are on main. The app has cloud sync (OAuth2 with Microsoft/Google, OneDrive/GDrive sync engine), 293 tests across 14 files, WCAG 2.1 AA accessibility, and full CI/CD. Next milestone is Sprint 18 (platform expansion).

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
| **Sprint 9: Security & Data Integrity** | ✅ COMPLETED | Image validation, atomic writes, CSP, error logging, pessimistic updates |
| **Sprint 10: Memory & Scalability** | ✅ COMPLETED | LRU caches, incremental index updates, PDF parser cleanup, login window dedup |
| **Sprint 11: Renderer Architecture** | ✅ COMPLETED | App.tsx → ReaderContainer + LibraryContainer, component extraction, typed API |
| **Sprint 12: Code Deduplication** | ✅ COMPLETED | Shared metadata enrichment, countWords utility, named constants |
| **Sprint 13: Test Coverage** | ✅ COMPLETED | 293 tests (14 files) — hook tests, stress tests, chapter tests |
| **Sprint 14: CSS & Theming** | ✅ COMPLETED | Cross-theme consistency, dead CSS removal, CSS custom properties, responsive |
| **Sprint 15: Accessibility** | ✅ COMPLETED | WCAG 2.1 AA — ARIA labels, keyboard nav, screen reader support, reduced motion |
| **Sprint 16: E-Ink Display Optimization** | ✅ COMPLETED | WPM ceiling + phrase grouping, paginated scroll, throttled chrome, ghosting prevention, touch targets, static feedback, settings integration |
| **Sprint 17: Auth & Cloud Sync** | ✅ COMPLETED | OAuth2 (Microsoft/Google), OneDrive/GDrive sync, offline-first, conflict resolution, sync UI |
| **Sprint 18A: Windows .exe Production** | ✅ COMPLETED | Branded NSIS, auto-update with deltas, x64+ARM64 CI, no code signing |
| **Sprint 18B: Chrome Extension** | 📋 SPEC'D | "Send to Blurby" — Readability extraction, local WebSocket + cloud fallback |
| **Sprint 18C: Android APK** | 📋 SPEC'D | Full Blurby Mobile — React Native, RSVP + flow, cloud sync, share intent |
| **Sprint 19: Sync Hardening** | 📋 SPEC'D | Revision counters, operation log, staging, tombstones, content sync, reconciliation |

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

## Sprint 9: Security & Data Integrity Hardening ✅ COMPLETED

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

- [x] Image downloads validate MIME type and enforce 10MB size limit
- [x] JSON writes are atomic (write-to-temp + rename pattern)
- [x] Zero empty `catch {}` blocks — all have contextual logging
- [x] CSP header present on all BrowserWindows
- [x] Site login uses ephemeral partition by default
- [x] `addDoc()` waits for API confirmation before updating state
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 10: Memory & Scalability ✅ COMPLETED

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

- [x] epubChapterCache bounded to 50 entries with LRU eviction
- [x] definitionCache bounded to 200 entries with LRU eviction
- [x] failedExtractions auto-cleaned when file removed from library
- [x] Library index updated incrementally — no full rebuild except startup
- [x] Folder sync emits progress events and supports cancellation
- [x] PDF parser properly destroyed on timeout
- [x] No duplicate login windows for same domain
- [ ] App runs for 7 days with 1000+ docs opened without memory growth (manual test)
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 11: Renderer Architecture Refactor ✅ COMPLETED

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

- [x] App.tsx under 150 lines — orchestration only
- [x] ReaderContainer.tsx owns all reader state and playback logic
- [x] LibraryContainer.tsx owns all library state and folder management
- [x] ReaderView receives ≤5 props (rest via context)
- [x] PausedTextView and FlowText are standalone files with tests
- [x] Zero `(window as any)` casts — all use typed API
- [x] Zero `require()` in renderer — all top-level imports
- [x] Settings subpages lazy-loaded with Suspense
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 12: Code Deduplication & Utilities Cleanup ✅ COMPLETED

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

- [x] Metadata extraction logic exists in exactly one place (`main/doc-enrichment.js`)
- [x] `wordCount()` utility used everywhere — zero instances of `split(/\s+/).filter(Boolean).length`
- [x] Chapter detection is O(n) — word index built once, reused
- [x] Multibyte characters handled correctly in chapter offsets
- [x] Zero unexplained magic numbers — all are named constants with comments
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 13: Test Coverage Expansion ✅ COMPLETED

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

- [x] useReader has ≥10 tests covering timing, sync, and edge cases
- [x] useLibrary has ≥8 tests covering CRUD, failures, and folder switching
- [x] useKeyboardShortcuts has ≥6 tests covering modifier keys and mode switching
- [x] Chapter detection tested with 5+ format variants including Roman numerals
- [x] `chaptersFromCharOffsets()` tested with multibyte content
- [x] Zero timezone-dependent tests — all use fixed dates
- [x] Test files import from main/ modules directly — no re-implementations
- [x] 100k-word stress test passes in <2 seconds
- [x] Total test count ≥200 (up from 135) — actual: 293 tests across 14 files
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 14: CSS & Theming Overhaul ✅ COMPLETED

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

- [x] Zero hardcoded `rgba(255,255,255,...)` in global.css — all use CSS variables
- [x] ≤5 repeated values — rest extracted to custom properties
- [x] Zero dead CSS rules (verified by grep against component classnames)
- [x] Focus indicators visible in both light and dark themes
- [x] Reader view readable at 768px window width
- [x] Scrollbar colors update on theme toggle
- [ ] Visual check: dark, light, e-ink, and system themes all render correctly (manual test)
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 15: Accessibility Audit & Remediation ✅ COMPLETED

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

- [x] All decorative elements have `aria-hidden="true"`
- [x] All scrollable regions have `role="region"` and `aria-label`
- [x] Screen reader announces current word on pause
- [x] All interactive elements reachable via keyboard
- [x] Search dropdown returns focus after selection
- [x] `prefers-reduced-motion` disables all animations
- [ ] Core flows tested with NVDA — documented (manual test)
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 16: E-Ink Display Optimization ✅ COMPLETED

**Goal:** Optimize the reading experience for e-ink displays by reducing unnecessary screen refreshes, supporting phrase-grouped RSVP, paginated scroll mode, and touch-friendly layouts.

**Prerequisite:** None (independent of Sprints 9-15 track).

### Completed Sub-tasks

- **16A. Refresh-aware RSVP** — WPM ceiling (default 250) + phrase grouping (2-3 words) to reduce e-ink refresh frequency
- **16B. Paginated scroll reader** — Discrete page flips with "Page X of Y" indicator instead of continuous scroll
- **16C. Throttled UI chrome** — Progress updates every 10th word, toolbar hides during playback
- **16D. Ghosting prevention** — Periodic black-to-white flash + manual refresh button (EinkRefreshOverlay.tsx)
- **16E. Touch-optimized layout** — 48px minimum tap targets, debounced library search input
- **16F. Static feedback** — Border toggles and text-based progress instead of animations
- **16G. Settings integration** — New settings: einkWpmCeiling, einkRefreshInterval, einkPhraseGrouping

### New Components

- `EinkRefreshOverlay.tsx` — Full-screen black/white flash overlay for e-ink ghosting prevention

### Acceptance Criteria

- [x] RSVP mode respects WPM ceiling when e-ink theme active
- [x] Phrase grouping displays 2-3 words per flash
- [x] Scroll reader uses paginated mode with page indicator
- [x] UI chrome throttled during playback
- [x] Ghosting prevention flash works on interval + manual trigger
- [x] All tap targets meet 48px minimum
- [x] New settings persist and migrate correctly
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 17: Persistent Login & Cloud Sync ✅ COMPLETED

**Goal:** Let users sign in with Microsoft or Google, sync their entire Blurby state (library metadata, reading progress, settings, highlights, stats, and document content) to OneDrive or Google Drive, and resume reading seamlessly on any device.

**Prerequisite:** Sprint 16 complete.

**Architecture decision: cloud drive as backend, not a custom server.** Users already have OneDrive or Google Drive. No server to host, no database to manage, no uptime to worry about. Blurby stores its sync data in a hidden app-specific folder on the user's cloud drive (OneDrive: App Folder via Microsoft Graph; Google Drive: `appDataFolder`). The user never sees or touches these files. Offline-first by default — local JSON files are always the working copy, cloud is the backup/sync target.

### Spec

**17A. OAuth2 authentication layer**
- Implement sign-in with Microsoft (MSAL Node + PKCE) and Google (googleapis + OAuth2)
- Microsoft: register app in Azure Entra ID, request `Files.ReadWrite.AppFolder` + `User.Read` + `offline_access` scopes
- Google: register app in Google Cloud Console, request `drive.appdata` + `userinfo.email` scopes
- Auth flow: use Electron's `BrowserWindow` for the OAuth consent screen (not system browser — keeps user in-app)
- Token storage: encrypt refresh tokens with `safeStorage` (Electron's OS-level credential store — Keychain on Mac, DPAPI on Windows, libsecret on Linux). Never store tokens in plain JSON
- Token refresh: auto-refresh access tokens on 401 response. If refresh fails, prompt re-login
- Sign-out: revoke tokens, clear stored credentials, remove sync metadata. Local data stays intact
- New IPC channels: `sign-in-microsoft`, `sign-in-google`, `sign-out`, `get-auth-state`
- New settings fields: `syncProvider: "onedrive" | "google" | null`, `syncEmail: string | null`, `lastSyncAt: number | null`
- Schema migration for new fields
- Files affected: new `main/auth.js` module, `main/ipc-handlers.js`, `src/types.ts`, preload.js

**17B. Cloud storage abstraction layer**
- Create `main/cloud-storage.js` with unified interface regardless of provider:
  - `readFile(path): Promise<Buffer | null>`
  - `writeFile(path, data): Promise<void>`
  - `listFiles(prefix?): Promise<string[]>`
  - `deleteFile(path): Promise<void>`
  - `getFileMetadata(path): Promise<{ modified, size } | null>`
- OneDrive implementation: Microsoft Graph API → `/me/drive/special/approot:/Blurby/{path}`
- Google Drive implementation: googleapis → `files.create/get/update/delete` with `spaces: 'appDataFolder'`
- Both use the hidden app folder — user's regular Drive files are never touched
- Retry logic: exponential backoff on 429 (rate limit) and 5xx errors
- Files affected: new `main/cloud-storage.js`, new `main/cloud-onedrive.js`, new `main/cloud-google.js`

**17C. Sync engine**
- Core design: **offline-first, last-write-wins per field, with conflict detection**
- Sync unit: individual JSON files. Cloud folder structure:
  ```
  Blurby/
    sync-meta.json        ← sync state (device ID, last sync timestamp)
    settings.json         ← user settings
    library.json          ← library metadata (no document content)
    history.json          ← reading stats and sessions
    highlights/           ← one file per document: {docId}.json
    documents/            ← document content for manual + URL-sourced docs
    covers/               ← cover images
  ```
- Folder-sourced documents: sync metadata only. Content stays local (flagged as "local-only")
- Manual and URL-sourced documents: sync full content
- Sync triggers: on app startup (pull), on app quit (push), manual ("Sync Now"), periodic every 5 min (configurable)
- Conflict resolution:
  - Settings: field-level last-write-wins. Each field carries `lastModified` timestamp
  - Library docs: last-write-wins per document by `lastReadAt` or `modified`
  - Reading position: always take the furthest-ahead position (never lose progress)
  - Highlights: union merge — append-only, never lose a highlight
  - Stats/history: union merge, deduplicate by timestamp
- Files affected: new `main/sync-engine.js`, modifications to `main/ipc-handlers.js`

**17D. Document content sync (large file handling)**
- Hash-based change detection (SHA-256 of first 10KB) to avoid unnecessary uploads
- Chunk large documents (≤4MB per request for OneDrive)
- Cover images: compress to ≤200KB before sync
- New device: download library.json first, lazy-download document content on first open
- Bandwidth awareness: detect metered connections, skip large content sync

**17E. Sync UI**
- New settings sub-page: "Cloud Sync"
  - Sign-in buttons: "Sign in with Microsoft" / "Sign in with Google" (branded per provider)
  - Connected state: email, provider icon, last sync time, storage used
  - "Sync Now" button, frequency dropdown (1 / 5 / 15 min / manual only), "Sign Out"
  - Sync status indicator in library header (cloud icon: ✓ synced / ↻ syncing / ○ offline / ✗ error)
- Offline badge when network unavailable; changes queue and sync on reconnection
- Files affected: new `src/components/settings/CloudSyncSettings.tsx`, `LibraryView.tsx` (indicator), new `src/hooks/useSyncStatus.ts`

**17F. Migration path (existing users)**
- First sign-in on existing install: "Upload your library to enable sync?"
- First sign-in on new install: "Found your library in the cloud. Download it?"
- Both have data: merge preview with doc counts, user confirms. Never silent overwrite

**17G. Offline reconnection & sync hardening**

This sub-task addresses the hard edge cases that break naïve sync implementations. Based on research into Kindle Whispersync, offline-first architecture patterns, and common multi-device sync failures:

*Clock skew protection:*
- Never rely on device wall-clock timestamps for conflict resolution ordering. Devices drift by seconds to minutes, DST transitions can jump hours, and users sometimes set clocks incorrectly
- Use a **monotonic revision counter** instead: each sync cycle increments a global revision number stored in `sync-meta.json`. The cloud copy is the authority for the current revision. When a device syncs, it receives the current revision and tags its changes with that revision
- Revision counter eliminates all clock-related bugs and makes ordering deterministic
- Fallback for first-ever sync (no revision yet): use `Date.now()` but only for the initial merge, then switch to revision-based ordering

*Operation log (change queue):*
- Don't sync full state snapshots. Track individual **operations** as they happen offline: `{ op: "update-progress", docId, position, revision, deviceId, timestamp }`
- Queue operations in a local `sync-queue.json` (append-only while offline)
- On reconnection: replay queue against cloud state in order. Each operation is **idempotent** — replaying the same op twice produces the same result (keyed by `deviceId + revision + op`)
- Benefits: bandwidth-efficient (only send deltas), recoverable (replay from any point), debuggable (full audit trail)

*Partial sync failure recovery:*
- Sync is not atomic — uploading 15 files where #8 fails leaves cloud in inconsistent state
- Solution: **two-phase sync** — (1) upload all changed files to `Blurby/.staging/`, (2) once all uploads succeed, atomically move from staging to live by updating a `sync-manifest.json` that lists the current valid file set
- If upload fails partway: staging directory is abandoned. Next sync retries the full batch
- Downloading: same pattern in reverse — download to local `.sync-staging/`, then swap into live data on success

*Tombstone records for deletions:*
- Deleting a document locally while offline, then syncing, must not "resurrect" the doc from another device's older state
- Solution: **soft delete with tombstone**. Deleted docs get `{ deleted: true, deletedAt: revision, deletedBy: deviceId }` in library.json instead of being removed
- Tombstones persist for 30 days (configurable), then are garbage-collected
- On merge: if one side has a tombstone and the other has the live doc, the tombstone wins if its revision is newer. If the live doc has changes after the tombstone revision, prompt the user: "Document X was deleted on Device A but modified on Device B. Keep or delete?"

*Highlight and annotation merge (append-only CRDT):*
- Highlights are modeled as an append-only set — each highlight has a unique ID (`docId + charOffset + deviceId + timestamp`)
- Union merge is always safe: highlights from both sides are combined, duplicates deduplicated by ID
- Highlight *deletion* uses tombstones (same as doc deletion)
- No ordering conflicts possible — highlights don't depend on each other

*Reading position reconciliation:*
- Position sync uses **furthest-ahead-wins** — `max(localPosition, cloudPosition)` per document
- Edge case: user re-reads an earlier section on Device A (position goes backward). Meanwhile Device B is ahead. On sync, Device B's position wins, which is correct — the user can re-navigate on Device A
- Edge case: user resets progress on Device A (position → 0). This is a deliberate action, not a sync artifact. Solution: "reset" is its own operation type in the queue with a higher priority than position updates. If a reset op has a newer revision than the cloud position, it wins

*Bandwidth and retry:*
- On reconnection after long offline period (days/weeks), the change queue may be large
- Prioritize: sync `settings.json` and `library.json` first (small, most impactful for UX), then reading positions, then highlights, then document content (largest)
- Retry with exponential backoff: 1s → 2s → 4s → 8s → max 60s. After 5 consecutive failures, switch to manual-only sync and show error in UI
- Resume interrupted uploads: track which files completed in the staging manifest. On retry, skip already-uploaded files

*Multi-device simultaneous sync:*
- Two devices syncing at the exact same time can create a race condition on `sync-meta.json`
- Solution: use cloud provider's **conditional write** (OneDrive: `@microsoft.graph.conflictBehavior`, Google Drive: `ifGenerationMatch`). If the cloud file changed between read and write, the write fails and the device must re-pull before retrying
- This gives us optimistic concurrency control without a custom server

*Data integrity verification:*
- After every sync, verify checksums of downloaded files match what the cloud reports
- If mismatch detected: re-download the affected file. If still mismatched: flag as corrupt and notify user
- Periodic full reconciliation: every 7 days (or on user request), download the full cloud manifest and compare against local state. Fix any drift silently

- Files affected: `main/sync-engine.js`, new `main/sync-queue.js`, `main/cloud-storage.js` (staging support)

### Dependencies & API Registration

| Provider | Registration | Required Scopes | Key Library |
|----------|-------------|-----------------|-------------|
| Microsoft | Azure Entra ID app registration | `Files.ReadWrite.AppFolder`, `User.Read`, `offline_access` | `@azure/msal-node` + `@microsoft/microsoft-graph-client` |
| Google | Google Cloud Console project | `drive.appdata`, `userinfo.email` | `googleapis` (google-auth-library) |

**Note:** Both providers require app review/verification before public distribution. Plan 2-4 weeks for approval.

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | OAuth2 auth layer + token storage (17A) | `electron-fixer` (sonnet) | — |
| 2 | Cloud storage abstraction + OneDrive impl (17B) | `electron-fixer` (sonnet) | Step 1 |
| 3 | Cloud storage Google Drive impl (17B) | `electron-fixer` (sonnet) | Step 1 |
| 4 | Sync engine core + conflict resolution (17C) | `electron-fixer` (sonnet) | Step 2 |
| 5 | Document content sync + large file handling (17D) | `electron-fixer` (sonnet) | Step 4 |
| 6 | Sync settings UI + status indicator (17E) | `renderer-fixer` (sonnet) | Step 1 |
| 7 | Migration path + first-run experience (17F) | `electron-fixer` + `renderer-fixer` (sonnet) | Steps 4-6 |
| 8 | Sync hardening: operation log, tombstones, staging, clock skew (17G) | `electron-fixer` (sonnet) | Step 4 |
| 9 | Write sync engine tests (conflict resolution, reconnection, partial failure) | `renderer-fixer` (sonnet) | Step 8 |
| 10 | Run full test suite + build | `test-runner` (haiku) | Steps 7-9 |

> **Note:** Steps 2-3 are PARALLELIZABLE. Step 6 is PARALLELIZABLE with Steps 2-5. Step 8 should follow Step 4 closely.

### Acceptance Criteria

- [x] Sign in with Microsoft and Google via OAuth2
- [x] Refresh tokens encrypted with Electron `safeStorage`
- [x] Token auto-refresh on 401; re-login on refresh failure
- [x] Cloud storage abstraction works identically for OneDrive and Google Drive
- [x] Sync data stored in hidden app folder (not visible in user's Drive)
- [x] Settings sync: field-level last-write-wins merge
- [x] Reading position sync: always takes furthest-ahead position
- [x] Highlights sync: union merge, no highlight loss
- [x] Folder-sourced docs: metadata synced, content flagged local-only
- [ ] Manual + URL docs: full content synced with hash-based change detection *(deferred — metadata-only sync implemented)*
- [ ] Lazy download on new device *(deferred — requires content sync)*
- [x] Sync triggers: startup, quit, manual, periodic (configurable)
- [x] Sync status indicator in library header
- [ ] Offline mode: changes queued via operation log, replayed on reconnection *(deferred — full re-merge on reconnection instead)*
- [x] First sync: user prompted, never silent overwrite
- [ ] Revision counter used for ordering (not wall-clock timestamps) *(deferred — uses wall-clock timestamps)*
- [x] Operations are idempotent — replaying the same op twice produces same result
- [ ] Partial sync failure: staging directory pattern prevents inconsistent cloud state *(deferred)*
- [ ] Deletions use tombstone records (soft delete, 30-day TTL) *(deferred)*
- [ ] Tombstone vs live-doc conflict prompts user when ambiguous *(deferred)*
- [ ] Position reset operation has higher priority than position updates *(deferred)*
- [x] Sync priority order: settings → library → positions → highlights → content
- [x] Exponential backoff on failure (1s → 60s max), manual-only after 5 consecutive failures
- [ ] Conditional writes prevent simultaneous-sync race conditions *(partial — OneDrive uses conflictBehavior, Google Drive not implemented)*
- [ ] Post-sync checksum verification on downloaded files *(deferred)*
- [ ] Full reconciliation runs every 7 days (drift detection and repair) *(deferred)*
- [ ] Test: Device A offline 7 days, Device B active — sync produces correct merged state *(manual test)*
- [ ] Test: Delete on A, edit on B while both offline — conflict prompt shown on sync *(requires tombstones)*
- [x] `npm test` passes, `npm run build` succeeds

---

## Sprint 18: Platform Expansion (.exe + Chrome Extension + Android APK)

**Goal:** Three parallel tracks: (1) production-ready Windows installer with auto-update and branded NSIS, (2) Chrome extension that captures web pages and sends them to Blurby via local connection or cloud sync, (3) full-featured Android speed reading app with cloud sync.

**Prerequisite:** Sprint 17 complete (cloud sync is required for cross-device communication).

**Structure:** Three independent workstreams that share the Sprint 17 sync infrastructure but have no dependencies on each other. All three can be developed simultaneously.

### Track A: Windows .exe Production Hardening ✅ COMPLETED

**Goal:** Ship an auto-updating Windows installer (x64 + ARM64) with branded NSIS experience and delta updates. No code signing (explicit decision).

**18A-1. Auto-updater + delta updates**
- electron-updater configured with GitHub Releases publish provider
- Update flow: check on startup (delayed 10s) → download delta in background → notification banner → user clicks "Restart to Update" → `autoUpdater.quitAndInstall()`
- Blockmaps auto-generated by electron-builder for delta updates (~10MB vs ~100MB full)
- `latest.yml` (x64) and `latest-arm64.yml` (ARM64) manifests published with each release
- Files affected: `package.json`, `main/window-manager.js`

**18A-2. Branded NSIS installer**
- Assisted mode (not one-click) — install directory picker, shortcut options
- Branded graphics: header BMP (150x57) and sidebar BMP (164x314) with Blurby mascot
- Multi-size ICO for installer and app icons
- Desktop shortcut, Start Menu entry, "Launch Blurby" on finish
- Clean uninstall preserves user data (`%APPDATA%/Blurby`)
- Files affected: `package.json`, `assets/icon.ico`, `assets/installer/`

**18A-3. Dual-architecture CI + release workflow**
- Build matrix: x64 + ARM64 (cross-compile on windows-latest)
- Triggers: git tag (`v*`) + manual workflow dispatch
- Tests/typecheck run on x64 only (no duplication)
- Publish job: SHA-256 checksums, draft GitHub Releases, auto-generated release notes
- All artifacts uploaded: `.exe`, `.blockmap`, `latest*.yml`, `checksums.sha256`
- Files affected: `.github/workflows/release.yml`

### Track B: Chrome Extension — "Send to Blurby"

**Goal:** A Chrome extension that extracts the current page's readable content (via Readability.js) and sends it to Blurby — either directly to the running desktop app via localhost WebSocket, or to the cloud sync folder if the desktop app isn't running.

**18B-1. Extension architecture (Manifest V3)**
- Manifest V3 (required for Chrome Web Store as of 2025)
- Components:
  - `manifest.json` — permissions: `activeTab`, `storage`, `contextMenus`
  - `service-worker.js` — background script, manages WebSocket connection and cloud auth
  - `content-script.js` — injected into pages, extracts readable content via Readability.js
  - `popup.html/js` — extension popup with status, settings, and "Send to Blurby" button
  - `options.html/js` — configuration page (connection mode, cloud account)
- Bundle Readability.js (Mozilla, ~30KB) into the extension for content extraction
- Extension size target: < 500KB packaged
- Files: new `chrome-extension/` directory at repo root

**18B-2. Page capture & extraction**
- On user click or keyboard shortcut (Ctrl+Shift+B): inject content script into active tab
- Content script runs Readability.js on the page DOM → extracts: title, author, content (HTML), text content, word count, publication date, site name
- Clean the extracted HTML: strip scripts, iframes, tracking pixels, ads
- Extract primary image URL for cover
- Handle edge cases: paywalled content (extract whatever is visible), SPAs (wait for content to load), PDF pages (detect and handle differently)
- Return structured `BlurbyArticle` object to service worker
- Files affected: `chrome-extension/content-script.js`

**18B-3. Local connection (WebSocket to desktop app)**
- Desktop app (Electron) starts a local WebSocket server on a fixed port (e.g., `ws://localhost:48924/blurby`)
  - Port chosen to be unlikely to conflict (high range, memorable)
  - Server only accepts connections from `127.0.0.1` (localhost only)
  - Simple JSON protocol: `{ type: "add-article", payload: BlurbyArticle }`
  - Response: `{ type: "ok", docId: "..." }` or `{ type: "error", message: "..." }`
- Extension service worker attempts WebSocket connection on startup and on "Send" action
- Connection status indicator in popup: "Connected to Blurby" (green) / "Blurby not running" (gray)
- If connected: send article directly → instant add to library → show confirmation in popup
- If not connected: fall back to cloud sync (18B-4)
- Security: generate a one-time pairing token on first connection. Desktop app shows token, user enters it in extension settings. Subsequent connections use stored token. Prevents other localhost apps from injecting content
- New IPC channel in desktop app: `start-ws-server`, `stop-ws-server`
- Files affected: new `main/ws-server.js` (Electron side), `chrome-extension/service-worker.js`

**18B-4. Cloud sync fallback**
- When desktop app isn't running, extension can still send articles via cloud
- Extension stores user's OAuth token (same Microsoft/Google auth as Sprint 17)
- Extension writes article to the user's cloud sync folder: `Blurby/documents/{docId}.json` + updates `Blurby/library.json`
- Desktop app picks up new articles on next sync cycle
- Extension popup shows: "Saved to cloud — will appear in Blurby on next sync"
- OAuth flow in extension: `chrome.identity.launchWebAuthFlow()` for Google, or popup window for Microsoft
- Files affected: `chrome-extension/service-worker.js`, `chrome-extension/cloud-sync.js`

**18B-5. Extension UI**
- Popup (280×400px):
  - Header: Blurby logo + connection status badge
  - "Send to Blurby" primary button (large, prominent)
  - Preview: page title, author, word count, estimated read time
  - Reading mode selector: "Open in Speed Mode" / "Open in Flow Mode" / "Add to Library"
  - Recent sends: last 5 articles sent (stored in extension local storage)
  - Settings link → opens options page
- Context menu: right-click on any page → "Send to Blurby"
- Keyboard shortcut: Ctrl+Shift+B (configurable)
- Options page:
  - Connection mode: "Auto" (try local, fall back to cloud) / "Local only" / "Cloud only"
  - Cloud account: sign-in button, connected email display, sign-out
  - Pairing token for local connection
  - Default reading mode when sending
- Badge icon: shows article count added this session
- Files affected: `chrome-extension/popup.html`, `chrome-extension/popup.js`, `chrome-extension/options.html`

**18B-6. Chrome Web Store publishing**
- Create developer account ($5 one-time fee)
- Privacy policy (required): document what data the extension accesses and where it's sent
- Screenshots: popup, context menu, options page (5 required)
- Listing: title "Blurby — Speed Read Any Page", description, categories
- Review time: typically 1-3 business days
- Files affected: `chrome-extension/store-assets/` (icons, screenshots, description)

### Track C: Android App (Full Blurby Mobile)

**Goal:** A native Android app with all core reading modes (RSVP speed mode + flow/scroll mode), full library management, cloud sync, and share-to-Blurby from any Android app.

**18C-1. Technology choice: React Native**
- React Native (not Kotlin) — maximize code reuse with the existing React renderer codebase
- Share: `src/utils/text.ts` (tokenizer, rhythm, chapter detection), `src/utils/queue.ts`, `src/types.ts`, conflict resolution logic from `sync-engine.js`
- React Native specific: navigation (React Navigation), file picker, share intent handler, local storage (AsyncStorage or MMKV)
- Target: Android 8.0+ (API 26+), supporting ~95% of active devices
- New repo or monorepo? Monorepo recommended — shared `packages/core/` for common logic
- Files: new `android/` directory at repo root (or `packages/mobile/`)

**18C-2. Core reading engine (port from Electron renderer)**
- RSVP speed mode: port `useReader.ts` hook → React Native equivalent
  - ORP highlighting: same `focusChar()` logic from `text.ts`
  - WPM control: same timing math, same rhythm pauses
  - Word display: use React Native `<Text>` with dynamic styling (not DOM manipulation)
  - Ref-based playback: use `useRef` + `requestAnimationFrame` (same pattern as desktop)
- Flow/scroll mode: port `ScrollReaderView.tsx`
  - Use React Native `<FlatList>` or `<ScrollView>` with word-level highlighting
  - Paginated option for e-ink mode (reuse logic from Sprint 16)
- Chapter navigation: reuse `detectChapters()` and `chaptersFromCharOffsets()` from `text.ts`
- Progress tracking: same throttled save pattern (5s / 50 words)
- Files affected: new `android/src/hooks/useReader.ts`, `android/src/screens/ReaderScreen.tsx`

**18C-3. Library & file management**
- Library view: grid and list modes (port `LibraryView.tsx` layout)
- Document sources:
  - Manual text paste (same as desktop)
  - URL import (Readability.js works in React Native via webview or node backend)
  - Share intent: register as share target for text/plain and text/html — user shares from Chrome, Pocket, etc. → Blurby extracts and imports
  - Local file picker: `.txt`, `.epub`, `.pdf`, `.html` via `react-native-document-picker`
- File format support:
  - EPUB: use `epub.js` or port extraction logic from `file-parsers.js`
  - PDF: use `react-native-pdf` for rendering, extract text via server-side or bundled parser
  - TXT/HTML/MD: direct text processing (same as desktop)
- Search, favorites, archives: same UI patterns as desktop library
- Files affected: new `android/src/screens/LibraryScreen.tsx`, `android/src/utils/file-parsers.ts`

**18C-4. Cloud sync integration**
- Reuse sync engine logic from Sprint 17 — port `sync-engine.js` to TypeScript module shared between desktop and mobile
- Auth: use `react-native-app-auth` for OAuth2 (Microsoft and Google)
- Token storage: use Android Keystore (via `react-native-keychain`)
- Sync triggers: on app foreground, on app background, manual, periodic (WorkManager for background sync)
- Offline-first: same as desktop — local SQLite or MMKV as working copy, cloud as sync target
- Shared sync protocol ensures desktop ↔ mobile interop
- Files affected: `packages/core/sync-engine.ts` (shared), `android/src/services/sync.ts`

**18C-5. Android-specific features**
- Share intent receiver: register in AndroidManifest for `text/plain`, `text/html`, `application/*`
  - User shares a URL from Chrome → Blurby extracts article → adds to library
  - User shares selected text → Blurby creates manual document
- Notification: "New article added" with "Read Now" action
- Widget: home screen widget showing current reading progress and "Continue Reading" button
- Dark mode: follow Android system theme, plus e-ink mode for Boox/Onyx devices
- Text-to-speech: use Android's native TTS engine (same pattern as desktop narration)
- Offline reading: all synced documents available offline (stored in app-internal storage)
- Files affected: `android/android/app/src/main/AndroidManifest.xml`, `android/src/services/share-receiver.ts`

**18C-6. Build & distribution**
- Build system: React Native CLI + Gradle
- Generate signed APK and AAB (Android App Bundle)
- Target: Google Play Store distribution
  - Developer account ($25 one-time fee)
  - Content rating questionnaire
  - Privacy policy (required, same as Chrome extension)
  - Screenshots: phone + tablet (8 required)
  - Feature graphic (1024×500px)
- Also distribute APK directly from GitHub Releases (for sideloading)
- CI: GitHub Actions workflow for Android builds (separate from desktop CI)
- Files affected: `android/android/app/build.gradle`, `.github/workflows/android-release.yml`

### Agent Assignments

| Step | What | Agent | Track | Depends On |
|------|------|-------|-------|------------|
| 1 | ~~Code signing~~ REMOVED | — | A | — |
| 2 | Auto-updater + delta updates + branded NSIS (18A-1, 18A-2) | `electron-fixer` | A | — |
| 3 | Dual-arch CI workflow (18A-3) | `electron-fixer` | A | — |
| 4 | Extension manifest + content script + Readability (18B-1, 18B-2) | `renderer-fixer` | B | — |
| 5 | WebSocket server in Electron (18B-3) | `electron-fixer` | B | — |
| 6 | Extension cloud sync fallback (18B-4) | `renderer-fixer` | B | Sprint 17 |
| 7 | Extension UI + publishing prep (18B-5, 18B-6) | `renderer-fixer` | B | Steps 4-6 |
| 8 | React Native project setup + shared core package (18C-1) | `renderer-fixer` | C | — |
| 9 | Port reading engine to React Native (18C-2) | `renderer-fixer` | C | Step 8 |
| 10 | Library + file management (18C-3) | `renderer-fixer` | C | Step 8 |
| 11 | Mobile cloud sync integration (18C-4) | `electron-fixer` | C | Sprint 17 + Step 8 |
| 12 | Android-specific features (18C-5) | `renderer-fixer` | C | Steps 9-10 |
| 13 | Android build + distribution setup (18C-6) | `electron-fixer` | C | Step 12 |
| 14 | Run all test suites | `test-runner` (haiku) | ALL | Steps 3, 7, 13 |

> **All three tracks are FULLY PARALLELIZABLE.** Track A (Windows .exe) is the fastest — mostly config. Track B (Chrome extension) is medium complexity. Track C (Android) is the largest effort.

### Acceptance Criteria

**Track A — Windows .exe:** ✅ COMPLETED
- [x] ~~Installer signed~~ — code signing removed (explicit decision)
- [x] Auto-updater: delta updates via blockmaps, GitHub Releases publish provider
- [x] Branded NSIS installer: header/sidebar BMPs, multi-size ICO, assisted mode
- [x] Windows x64 + ARM64 builds in CI (cross-compile matrix)
- [x] SHA-256 checksums published with each release
- [x] workflow_dispatch for manual releases
- [x] Draft releases with auto-generated notes
- [ ] End-to-end auto-update test: tag v1.0.0 → install → tag v1.0.1 → verify update (manual)

**Track B — Chrome Extension:**
- [ ] Manifest V3, passes Chrome Web Store review
- [ ] Readability.js extracts article content from 90%+ of news/blog sites
- [ ] WebSocket connection to running Blurby desktop app works (localhost)
- [ ] Pairing token prevents unauthorized localhost connections
- [ ] Cloud sync fallback works when desktop app isn't running
- [ ] Extension popup shows page preview (title, author, word count)
- [ ] Context menu "Send to Blurby" works
- [ ] Ctrl+Shift+B keyboard shortcut works
- [ ] Extension size < 500KB

**Track C — Android APK:**
- [ ] RSVP speed mode works with ORP highlighting and WPM control
- [ ] Flow/scroll mode works with word-level highlighting
- [ ] Library view with grid/list, search, favorites, archives
- [ ] EPUB, PDF, TXT, HTML import works
- [ ] Share intent: URL shared from Chrome → extracted and imported
- [ ] Share intent: text shared from any app → imported as document
- [ ] Cloud sync: changes on desktop appear on Android and vice versa
- [ ] Reading position syncs correctly (furthest-ahead wins)
- [ ] Offline reading works for all synced documents
- [ ] Dark mode follows Android system setting
- [ ] Signed APK and AAB generated in CI
- [ ] `npm test` passes (shared core), Android build succeeds

---

## Updated Execution Order

```
Sprints 1-17 ──────────────────────────────────── COMPLETED
    │
    │   All sprints (1-17) including security, a11y, cloud sync
    │
    │
    ├──────────────────────┬──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
TRACK A:              TRACK B:              TRACK C:
Windows .exe          Chrome Extension      Android APK
Production            "Send to Blurby"      Full Blurby Mobile
(PARALLEL)            (PARALLEL)            (PARALLEL)
    │                      │                      │
    └──────────┬───────────┴──────────────────────┘
               │
               ▼
        Sprint 18 Complete ──────────────────── GATE
               │
               ▼
        Sprint 19: Sync Hardening & Content Sync
               │
               ▼
        Someday Backlog
```

---

## Sprint 19: Sync Hardening & Document Content Sync

**Goal:** Harden the Sprint 17 sync engine against every real-world failure mode, and complete the deferred document content sync. After this sprint, Blurby's sync is production-grade — tolerant of clock skew, partial failures, offline weeks, simultaneous device sync, and deletion conflicts. Document content (not just metadata) syncs reliably across all platforms.

**Prerequisite:** Sprint 18 complete (Chrome extension and Android app both depend on robust sync). Can begin in parallel with Sprint 18 Track A (.exe) since that track doesn't touch sync.

**Context:** Sprint 17 shipped the sync engine with hash-based change detection and field/doc/history merge. The following items were explicitly deferred (CLAUDE.md line 178): operation log, tombstones, staging directory, revision counters, document content sync, checksum verification, and full reconciliation. This sprint implements all of them.

### Spec

**19A. Revision counter (replace wall-clock timestamps)**
- Current sync engine uses `Date.now()` timestamps for conflict ordering. This breaks when device clocks drift (seconds to minutes), DST transitions jump hours, or users manually set clocks
- **Fix:** Introduce a monotonic revision counter in `sync-meta.json`. The cloud copy is the authority for the current revision number. Each sync cycle: device pulls current revision → applies local changes tagged with that revision → pushes with incremented revision
- Revision counter makes ordering deterministic and eliminates all clock-related bugs
- Backward compatibility: first sync after upgrade uses existing timestamps for the initial merge, then switches to revision-based ordering. No data loss on migration
- Files affected: `main/sync-engine.js`, `main/sync-meta.json` schema

**19B. Operation log (change queue)**
- Current sync sends full state snapshots on each cycle. This is bandwidth-heavy and loses granularity about what changed
- **Fix:** Track individual operations as they happen: `{ op: "update-progress" | "add-doc" | "delete-doc" | "add-highlight" | "update-settings", docId?, field?, value, revision, deviceId, timestamp }`
- Queue operations in a local `sync-queue.json` (append-only while offline)
- On reconnection: replay queue against cloud state in order. Each operation is **idempotent** — keyed by `deviceId + revision + op + target`, replaying the same op twice produces the same result
- Queue compaction: if multiple `update-progress` ops exist for the same doc, keep only the latest. If `add-doc` followed by `delete-doc` for the same doc, both cancel out
- Benefits: bandwidth-efficient (send deltas not snapshots), recoverable (replay from any point), debuggable (full audit trail of what changed when)
- Files affected: new `main/sync-queue.js`, `main/sync-engine.js`

**19C. Two-phase staging (partial failure recovery)**
- Current sync uploads files directly to the live cloud folder. If upload #8 of 15 fails, cloud state is inconsistent — some files updated, others stale
- **Fix:** Two-phase commit pattern:
  - Phase 1: upload all changed files to `Blurby/.staging/` directory on cloud
  - Phase 2: once all uploads succeed, update `sync-manifest.json` to point to the new file versions, then move files from staging to live
  - If upload fails partway: staging directory is abandoned. Next sync retries the full batch. Stale staging directories older than 24 hours are auto-cleaned
- Download uses the same pattern in reverse: download to local `.sync-staging/`, validate checksums, then swap into live data atomically
- Resume interrupted uploads: track which files completed in the staging manifest. On retry, skip already-uploaded files
- Files affected: `main/sync-engine.js`, `main/cloud-storage.js` (add staging operations), `main/cloud-onedrive.js`, `main/cloud-google.js`

**19D. Tombstone records (deletion reconciliation)**
- Current sync has no deletion tracking. Deleting a doc locally while offline, then syncing, can "resurrect" the doc from another device's state
- **Fix:** Soft delete with tombstone records. Deleted docs get `{ deleted: true, deletedAt: revision, deletedBy: deviceId }` in library.json instead of being removed from the array
- Tombstones persist for 30 days (configurable in settings), then garbage-collected during sync
- Merge rules:
  - Tombstone revision newer than live doc → delete wins
  - Live doc has changes after tombstone revision → conflict prompt: "Document X was deleted on [Device A] but modified on [Device B]. Keep or delete?"
  - Both sides have tombstones → keep the earlier deletion (consistent behavior)
- Highlight deletion uses the same tombstone pattern
- Garbage collection: on each sync, remove tombstones older than TTL. Both devices must have synced at least once after the deletion before GC runs (tracked via device sync timestamps in `sync-meta.json`)
- Files affected: `main/sync-engine.js`, `src/types.ts` (add `deleted` + `deletedAt` fields to BlurbyDoc), `main/ipc-handlers.js` (filter tombstoned docs from library queries)

**19E. Document content sync**
- Sprint 17 syncs library metadata but document content was deferred for manual and URL-sourced docs
- **Fix:** Full content sync for non-folder-sourced documents:
  - Each document's content stored as `Blurby/documents/{docId}.json` on cloud (separate from library.json for granularity)
  - Content hash (SHA-256 of full content) stored in library.json metadata per doc. Only upload when hash changes
  - Large documents (>4MB): use resumable upload for OneDrive (Microsoft Graph upload sessions) and Google Drive (resumable upload protocol). Chunked into 4MB segments with progress tracking
  - Cover images: compress to ≤200KB (JPEG quality 80) before upload. Store in `Blurby/covers/{docId}.jpg`
- Download strategy for new devices:
  - Priority 1: download `library.json` + `settings.json` + `history.json` (small files, immediate UX impact)
  - Priority 2: download document content **on first open** (lazy loading). Show "Downloading from cloud..." progress in reader while content loads
  - Priority 3: background-prefetch remaining documents when on WiFi and app is idle
- Bandwidth awareness: check `navigator.connection.type` (or Electron's `net.online` + system APIs). On metered connections: sync metadata only, defer content sync. Show "Content available on WiFi" badge
- Folder-sourced documents: content stays local, flagged as `syncContent: false` in metadata. If same book exists on both devices via local files, positions still sync via metadata
- Files affected: `main/sync-engine.js`, `main/cloud-storage.js` (resumable upload support), `main/ipc-handlers.js` (lazy content download IPC), renderer (download progress UI)

**19F. Checksum verification & full reconciliation**
- After every sync, verify SHA-256 checksums of downloaded files match what the cloud manifest reports
- If mismatch detected: re-download the affected file. If still mismatched after 3 attempts: flag as corrupt and notify user, skip file, continue sync
- **Full reconciliation** (weekly or on-demand):
  - Download the complete cloud file manifest (paths + checksums + sizes)
  - Compare against local state file by file
  - Identify drift: files that exist locally but not on cloud (orphaned), files on cloud but not locally (missing), files where checksums diverge (corrupted)
  - Auto-fix: upload orphaned, download missing, re-sync corrupted
  - Run automatically every 7 days. Also triggered by user via "Full Sync" button in Cloud Sync settings
  - Log reconciliation results to `sync-reconciliation.log` for debugging
- Files affected: `main/sync-engine.js`, `src/components/settings/CloudSyncSettings.tsx` (add "Full Sync" button and last reconciliation timestamp)

**19G. Simultaneous sync protection**
- Two devices syncing at the exact same moment can race on `sync-meta.json` and `sync-manifest.json`
- **Fix:** Use cloud provider conditional writes:
  - OneDrive: `@microsoft.graph.conflictBehavior: fail` on writes, check `etag` on reads
  - Google Drive: `ifGenerationMatch` parameter on updates
- If conditional write fails (cloud file changed between read and write): re-pull the latest state, re-merge, retry. Maximum 3 retries before falling back to next sync cycle
- This gives optimistic concurrency control without a custom server or database
- Files affected: `main/cloud-onedrive.js`, `main/cloud-google.js`, `main/sync-engine.js` (retry loop)

**19H. Reading position edge cases**
- Furthest-ahead-wins is the default, but two edge cases need explicit handling:
- **Deliberate reset:** User resets progress on Device A (position → 0). This is intentional, not stale data. Solution: "reset-progress" is its own operation type in the queue. If a reset op has a newer revision than the cloud position, it wins over furthest-ahead
- **Re-reading:** User re-reads an earlier section on Device A (position goes backward) while Device B is further ahead. On sync, Device B's position wins. This is correct — the user can re-navigate on Device A. No special handling needed, but document the behavior in the "Cloud Sync" help text
- Files affected: `main/sync-engine.js` (reset op handling), `main/sync-queue.js`

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Revision counter + migration from timestamps (19A) | `electron-fixer` (sonnet) | — |
| 2 | Operation log + queue compaction (19B) | `electron-fixer` (sonnet) | Step 1 |
| 3 | Two-phase staging (19C) | `electron-fixer` (sonnet) | Step 1 |
| 4 | Tombstone records + GC (19D) | `electron-fixer` (sonnet) | Step 1 |
| 5 | Document content sync + resumable uploads (19E) | `electron-fixer` (sonnet) | Steps 2-3 |
| 6 | Checksum verification + full reconciliation (19F) | `electron-fixer` (sonnet) | Step 3 |
| 7 | Simultaneous sync protection (19G) | `electron-fixer` (sonnet) | Step 3 |
| 8 | Reading position edge cases (19H) | `electron-fixer` (sonnet) | Step 2 |
| 9 | Lazy content download UI (19E renderer) | `renderer-fixer` (sonnet) | Step 5 |
| 10 | Full Sync button + reconciliation UI (19F renderer) | `renderer-fixer` (sonnet) | Step 6 |
| 11 | Write sync hardening tests (all edge cases) | `renderer-fixer` (sonnet) | Steps 2-8 |
| 12 | Run full test suite + build | `test-runner` (haiku) | Steps 9-11 |

> **Note:** Steps 2-4 are PARALLELIZABLE after Step 1. Steps 6-8 are PARALLELIZABLE after Step 3.

### Acceptance Criteria

- [ ] Revision counter used for all conflict ordering (not wall-clock timestamps)
- [ ] Existing timestamp-based data migrates cleanly on first sync after upgrade
- [ ] Operations logged individually to `sync-queue.json` while offline
- [ ] Operations are idempotent — replaying same op twice produces same result
- [ ] Queue compaction: redundant progress updates and add+delete pairs are collapsed
- [ ] Two-phase staging: all uploads go to `.staging/` first, then promoted atomically
- [ ] Partial upload failure: staging abandoned, retried on next cycle, no inconsistent cloud state
- [ ] Stale staging directories (>24h) auto-cleaned
- [ ] Interrupted uploads resume from last completed file
- [ ] Deleted documents stored as tombstones with 30-day TTL
- [ ] Tombstone vs live-doc conflict: user prompted when ambiguous
- [ ] Tombstone garbage collection only runs when all devices have synced post-deletion
- [ ] Manual + URL document content syncs to `Blurby/documents/{docId}.json`
- [ ] Large documents use resumable uploads (>4MB chunked)
- [ ] Cover images compressed to ≤200KB before sync
- [ ] New device: lazy-downloads content on first open, shows progress indicator
- [ ] Background prefetch on WiFi when app is idle
- [ ] Metered connection: metadata-only sync, content deferred with badge
- [ ] Post-sync checksum verification on all downloaded files
- [ ] Corrupted files: re-downloaded up to 3 times, then flagged and skipped
- [ ] Full reconciliation runs every 7 days (auto) and on-demand via "Full Sync" button
- [ ] Reconciliation fixes orphaned, missing, and corrupted files automatically
- [ ] Conditional writes prevent simultaneous-sync race conditions
- [ ] Race condition: re-pull + re-merge + retry up to 3 times
- [ ] Progress reset operation overrides furthest-ahead-wins when revision is newer
- [ ] Test: Device A offline 7 days, Device B active — sync produces correct merged state
- [ ] Test: Delete on A, edit on B while both offline — conflict prompt shown
- [ ] Test: Two devices sync simultaneously — no data loss or corruption
- [ ] Test: Upload fails at file 8 of 15 — cloud state remains consistent (staging pattern)
- [ ] Test: 500KB document syncs via resumable upload, downloads lazily on new device
- [ ] `npm test` passes (including all new sync hardening tests)
- [ ] `npm run build` succeeds

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
- iOS app (port Track C to iOS via React Native — same codebase)
- Firefox extension (port Track B to Firefox Manifest V3)
- Safari extension (port Track B via Safari Web Extensions API)
