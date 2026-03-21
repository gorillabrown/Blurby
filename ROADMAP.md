# Blurby — Development Roadmap

**Last updated**: Session 1 (2026-03-21) — Full rewrite. Prior roadmap archived in old ROADMAP.md on dev branch.
**Current branch**: `claude/review-blurby-roadmap-1lsoT` (102 commits ahead of main, PR #1 open)
**Current state**: Feature-complete MVP. Phases 0-4 of original roadmap substantially built. Performance, distribution, and platform expansion remain.

> **Navigation:** Sprints are numbered sequentially. Each sprint has a scope statement, agent assignments, and acceptance criteria ready for dispatch to Claude Code CLI.

---

## Where We Are

### Completed Work (all on dev branch, PR #1)

| Phase | What | Status |
|-------|------|--------|
| Phase 0 | Critical Pre-Release (schema versioning, error boundaries, build verification) | ✅ COMPLETED |
| Phase 1 | Code Quality (component split, lazy-load content, async I/O, unit tests, WPM calibration) | ✅ COMPLETED |
| Phase 2 | Distribution Polish (CSS extraction, NSIS branding, migration framework) | ✅ COMPLETED |
| Phase 3 | Enhanced Features (rAF TBD, drag-drop, auto-updater dep, reader exit TBD, recent folders, reading queue) | ⚠️ PARTIAL |
| Phase 4 | Format Expansion (EPUB, PDF, MOBI/AZW3, HTML, URL import) | ✅ COMPLETED |
| Sprint 2 | Menu Flap, Settings, PDF Export, Scroll Reader, Highlights, Narration | ✅ COMPLETED |

### What's NOT on main

**Critical:** The `main` branch has only 12 commits (the Day 1 skeleton). ALL feature work lives on the dev branch. PR #1 must squash-merge before any further work makes sense.

---

## Phase Status Summary

| Sprint | Status | Key Milestone |
|--------|--------|---------------|
| **Sprint 1: Merge & Stabilize** | 🔶 READY | Squash-merge PR #1, verify build, establish baseline |
| **Sprint 2: Performance — React Rendering** | 🔶 READY | Memoize LibraryView, React.memo on list items, stabilize callbacks |
| **Sprint 3: Main.js Modularization** | 🔶 READY | Split 93KB main.js into 6 focused modules |
| **Sprint 4: Performance — Main Process** | 🔶 READY | Async I/O audit, debounced saves, library index-by-ID, lazy-load modules |
| **Sprint 5: Performance — Reader Modes** | 📋 SPEC'D | Ref-based playback, throttled progress saves |
| **Sprint 6: Polish Sprint** | 📋 SPEC'D | Auto-updater, exit confirmation, drag-drop, recent folders |
| **Sprint 7: Stats & History** | 📋 SPEC'D | Reading history, stats panel, reading streaks |
| **Sprint 8: Distribution** | 📋 SPEC'D | CI/CD, code signing research, GitHub Actions |
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

- [ ] Dev branch rebased cleanly onto main
- [ ] PR #1 squash-merged — single commit on main
- [ ] `npm test` passes — all 135+ tests
- [ ] `npm run build` succeeds with no errors
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] CLAUDE.md updated to reflect post-merge state

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

- [ ] LibraryView computed values wrapped in useMemo
- [ ] DocCard and DocGridCard wrapped in React.memo with custom comparators
- [ ] All callback props extracted to useCallback — no inline functions passed as props
- [ ] useReaderKeys uses ref-based callback pattern — single useEffect, empty deps
- [ ] `npm test` passes (all existing + any new tests)
- [ ] `npm run build` succeeds
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

- [ ] main.js is under 200 lines — orchestrator only
- [ ] 6 new modules in `main/` directory, each under 15KB
- [ ] All CommonJS (require/module.exports) — no ESM in main process
- [ ] Zero behavior change — all existing IPC channels work identically
- [ ] `npm test` passes — all 135+ existing tests
- [ ] `npm run build` succeeds
- [ ] Electron app launches and runs identically to pre-modularization (manual smoke test)
- [ ] `electron-builder` packages correctly (all modules included in asar)

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

- [ ] Zero `readFileSync` / `writeFileSync` across all `main/` modules (except app quit save)
- [ ] Library saves debounced to 500ms, broadcasts to 200ms
- [ ] `Map<id, doc>` index used for all single-document lookups
- [ ] Readability, JSDOM, PDFKit loaded lazily (not at startup)
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
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

- [ ] RSVP playback uses ref-based DOM updates during active play
- [ ] Flow mode uses ref-based word highlighting during active play
- [ ] Progress saves throttled to 5s / 50 words
- [ ] Reader components receive only the settings fields they need
- [ ] 100K-word book plays smoothly at 300+ WPM (manual smoke test)
- [ ] `npm test` passes, `npm run build` succeeds

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

- [ ] Auto-updater checks on startup, shows notification, downloads and installs
- [ ] Reader exit requires double-Escape during playback
- [ ] Drag-drop handles multi-file, shows toast, rejects unsupported types
- [ ] Recent folders dropdown shows last 5, removes stale paths
- [ ] `npm test` passes, `npm run build` succeeds

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

- [ ] Reading sessions saved to history.json with schema versioning
- [ ] Stats panel displays 5 KPIs correctly
- [ ] Reading streak calculates consecutive days accurately
- [ ] New tests for history data layer
- [ ] `npm test` passes, `npm run build` succeeds

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

- [ ] CI workflow runs on push to main — tests + build pass
- [ ] Release workflow triggers on tag — produces Windows installer
- [ ] Code signing options documented with cost estimates
- [ ] Workflows committed to `.github/workflows/`

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

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support (multiple reader windows simultaneously)
- Import/export (backup library, stats to CSV)
- Accessibility audit (ARIA labels, keyboard nav, screen reader, reduced motion)
- Symlink path traversal protection in folder scanner
- requestAnimationFrame migration for all remaining setInterval timers
