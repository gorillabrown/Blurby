# Roadmap Archive — Completed Sprint Specs

**Purpose:** Full specs for all completed sprints, extracted from `ROADMAP.md` to keep the roadmap forward-looking. Reference only — do not modify.

**Last archived:** 2026-04-05

---

## GOV-6D [v1.15.0]: Claude CLI Agent Staging Alignment ✅ COMPLETED (2026-04-04)

**Version:** v1.15.0
**Branch:** `sprint/gov-6d-agent-staging-alignment`
**Tier:** Quick (governance only, no app/runtime code)
**Result:** APPROVED — all 12 SUCCESS CRITERIA met. Merged to `main` and pushed.

**Goal:** Align Blurby's living governance docs and project subagent files with the real Claude Code subagent model so upcoming sprints dispatch cleanly.

**Implementation:**
- `.claude/agents/blurby-lead.md` rewritten so only the four real specialist subagents are callable, while `electron-fixer`, `renderer-fixer`, and `format-parser` remain documented as non-spawnable scope labels.
- `CLAUDE.md` live operational terminology normalized to `spec-compliance-reviewer` and `quality-reviewer`, preserving the useful scope-label reference tables and tier-aware review policy.
- `ROADMAP.md` forward-looking specs updated so code work uses `Primary CLI (... scope)` and verification/docs/git use the real callable subagent names.
- `docs/governance/SPRINT_QUEUE.md` aligned to the real Claude CLI staging model before the next product sprints were queued.

**SUCCESS CRITERIA:** All 12 met.
- Five callable project subagents remain loadable with valid YAML frontmatter.
- Legacy labels remain scope/reference labels only.
- Full-tier future specs now stage `quality-reviewer` after `spec-compliance-reviewer`.
- No app/runtime source files changed outside governance docs and `.claude/agents/`.

---

## FLOW-3A [v1.6.0]: Flow Mode Infinite Scroll ✅ COMPLETED (2026-04-01)

**Version:** v1.6.0
**Branch:** `sprint/flow-3a-redesign`
**Tier:** Full (new feature + architecture change)
**Baseline:** v1.5.1, 897 tests / 46 files
**Result:** APPROVED — all 12 SUCCESS CRITERIA met. 35 new tests (932 total, 47 files). Build passes.

**Goal:** Replace paginated cursor-on-pages Flow Mode with infinite-scroll reading. Text flows continuously, scrolls upward at WPM speed through a reading zone (upper third of viewport). Shrinking underline cursor paces the reader line-by-line. Works on foliate-rendered EPUBs via `flow="scrolled"`.

**Architecture decision:** Reverses LL-013 — Flow Mode gets its own scroll-based rendering path (see LL-067). Page Mode stays paginated. FlowScrollEngine (imperative class per LL-014) replaces FlowCursorController.

**Key deliverables:**
- `src/utils/FlowScrollEngine.ts` — 339-line imperative class (line map, shrinking cursor, auto-scroll, pause/resume, manual scroll detection)
- `src/components/FlowScrollView.tsx` — Non-EPUB fallback (all docs are EPUB since EPUB-2B)
- `src/components/FoliatePageView.tsx` — `flowMode` prop toggles `flow="scrolled"`/`"paginated"`, hides pagination, exposes scroll container
- `src/components/ReaderContainer.tsx` — FlowScrollEngine wiring, cursor in JSX, mode routing
- `src/hooks/useKeyboardShortcuts.ts` — Flow keyboard: ↑/↓ lines, Shift+↑/↓ paragraphs, ←/→ WPM
- `src/constants.ts` — FLOW_READING_ZONE_POSITION (0.25), FLOW_CURSOR_HEIGHT_PX (3), FLOW_CURSOR_EINK_HEIGHT_PX (4), FLOW_SCROLL_RESUME_DELAY_MS (2000), FLOW_LINE_ADVANCE_BUFFER_MS (50)
- `src/styles/global.css` — .flow-scroll-container, .flow-shrink-cursor, e-ink overrides
- `tests/flow-scroll-engine.test.js` — 35 tests

**SUCCESS CRITERIA (all 12 met):**
1. Infinite scroll renders (no page breaks)
2. Auto-scroll at WPM (active line at ~25% viewport)
3. Shrinking underline cursor (var(--accent), CSS transition)
4. Reading zone (25% from top)
5. EPUB foliate integration (flow="scrolled" toggle)
6. Keyboard nav parity (↑/↓/Shift+↑/↓/←/→/Space/Escape)
7. Pause/resume (Space + manual scroll 2s delay)
8. Position preservation (Page↔Flow)
9. Word index tracking
10. Tests pass (35 new, 932 total)
11. No regressions (897 existing pass)
12. Theming (var(--accent), e-ink, WCAG AA)

---

## EPUB-2B [v1.5.1]: Pipeline Completion — URL→EPUB, Legacy Removal

**Completed:** 2026-04-01 | **Branch:** `sprint/epub-2b-pipeline` | **Tier:** Full

**Goal:** URL-imported articles produce EPUB (not PDF). Legacy text renderer eliminated. Every document renders through foliate-js via EPUB. Single canonical format, single rendering path.

**Findings addressed:** BUG-075 (intake pipeline completion), BUG-079 (universal EPUB)

**Implementation:**
- URL→EPUB: `extractArticleFromHtml()` now returns `contentHtml` (cleaned HTML from Readability). `htmlToEpub()` converts to EPUB with article metadata (title, author, date, source URL) in OPF. Cover image (og:image) embedded when available. PDF generation removed.
- Chrome extension→EPUB: `ws-server.js` `handleAddArticle()` converts to EPUB via `htmlToEpub()` instead of saving as `.txt`.
- Legacy migration: Library schema v5→v6 flags docs with `needsEpubConversion`. Actual re-conversion is lazy (on-demand in `load-doc-content`).
- `load-doc-content` IPC: Attempts on-demand EPUB conversion for docs without EPUB path. Returns EPUB filepath or error — no more plain text for rendering.
- `ReaderContainer.tsx`: Removed non-foliate rendering path (PageReaderView/ReaderView switch). Non-EPUB docs show "needs re-import" error.
- `buildEpubZip()` now supports `dc:date` and `dc:source` OPF metadata fields.
- `url-extractor.js`: `extractArticleFromHtml()` returns `contentHtml` field with Readability cleaned HTML.
- `library.js` sync-folder: URL docs converted to EPUB instead of PDF during folder sync.

**Tests:** 16 new tests across URL→EPUB, metadata, cover embedding, legacy migration, lazy conversion, rendering logic. 897 total (46 files).

**SUCCESS CRITERIA:** All met. URL articles → EPUB, Chrome ext → EPUB, legacy migration, single rendering path, ≥10 new tests, 897 tests pass, build succeeds.

---

## EPUB-2A [v1.5.0]: Content Fidelity — Formatting, Images, DOCX

**Completed:** 2026-04-01 | **Branch:** `sprint/epub-2a-fidelity` | **Tier:** Full

**Goal:** Converted EPUBs preserve rich formatting (headings, bold, italic, lists, blockquotes) and images from source documents. DOCX→EPUB support added.

**Findings addressed:** BUG-033, BUG-034, partial BUG-079 (DOCX support)

**Implementation:**
- PDF→EPUB: `structuredTextToHtml()` detects ALL-CAPS headings, bullet/numbered lists
- MOBI→EPUB: `parseMobiHtml()` preserves HTML formatting; `extractMobiImages()` pulls image records
- HTML→EPUB: Sanitizes while preserving formatting; extracts base64/local images
- DOCX→EPUB: `docxToEpub()` via mammoth with image extraction handler
- `buildEpubZip()` accepts `images[]` array, writes to `OEBPS/Images/`, adds to OPF manifest
- `.docx` added to folder-watcher SUPPORTED_EXT and DropZone hints
- 18 new tests in `tests/epub-fidelity.test.js`
- mammoth added as dependency

**Spec compliance:** APPROVED_WITH_CONCERNS (PDF bold/italic and PDF images limited by pdf-parse capabilities)

**Key files changed:** `main/epub-converter.js`, `main/file-parsers.js`, `main/folder-watcher.js`, `src/components/DropZone.tsx`, `tests/epub-fidelity.test.js`, `package.json`

---

## NAR-5 [v1.4.7]: Dual-Worker Eager Pre-Generation & Ramp-Up Fix

**Completed:** 2026-03-30 | **Branch:** `sprint/nar-5-eager-pregen` | **Tier:** Quick

**Problem:** (1) ~1-1.5s cold start delay before first audio, (2) cursor freezes at chunk boundaries during ramp-up when single ONNX worker can't keep up at 1.5x, (3) single-worker contention between real-time playback and background caching, (4) cache alignment mismatch (pipeline requests 13/44-word chunks but cache has 148-word chunks), (5) backgroundCacher.ts was dead code since NAR-4.

**Fix:** Dual ONNX worker architecture. Marathon worker (`tts-engine-marathon.js`) runs independently for background caching — no idle timeout, no loading UI, stays warm from book open. Sprint worker handles real-time playback. backgroundCacher wired in ReaderContainer with marathon IPC. Cache alignment: `produceChunk` returns actual consumed word count, pipeline skips ramp-up on cruise-sized cache hits. Doubling ramp-up: 13→26→52→104→148 (was geometric 13→44→148).

**Files changed:** `main/tts-engine-marathon.js` (new), `main/ipc/tts.js`, `preload.js`, `src/components/ReaderContainer.tsx`, `src/utils/generationPipeline.ts`, `src/constants.ts`, `src/test-harness/electron-api-stub.ts`, `tests/generationPipeline.test.ts`, `package.json`

**Tests:** 860 pass, 0 fail. Build: success.

---

## HOTFIX-10 [v1.4.6]: Global Index Alignment

**Completed:** 2026-03-30 | **Branch:** `hotfix/10-global-index-alignment` | **Tier:** Quick

**Problem:** After HOTFIX-6 extraction completes, narration pipeline uses book-wide global word indices but foliate DOM `<span data-word-index="N">` attributes still used section-local indices. Every `highlightWordByIndex(globalIdx)` query missed, freezing the cursor and triggering a miss-handler storm of `.next()` calls (~3/sec).

**Fix:** (1) `wrapWordsInSpans` uses extraction's `startWordIdx` as `globalOffset` when `bookWordSections` available, (2) post-extraction re-stamp unwraps+rewraps all loaded foliate sections with global indices before `narration.updateWords()`, (3) miss handler skips `.next()` when extraction is complete (NAR-3 handles navigation). Added `unwrapWordSpans` helper and `bookWordsCompleteRef` to `useReadingModeInstance`.

**Files changed:** `src/components/FoliatePageView.tsx` (new props, `unwrapWordSpans`, `wrapWordsInSpans` exported), `src/components/ReaderContainer.tsx` (re-stamp logic, `bookWordsCompleteRef`), `src/hooks/useReadingModeInstance.ts` (miss handler guard), `package.json`

**Tests:** 860 pass, 0 fail. Build: success.

---

## HOTFIX-9 [v1.4.5]: Native Speed Generation + Cursor Fix + Overlap Fix

**Completed:** 2026-03-30 | **Branch:** `sprint/hotfix9-native-speed` | **Tier:** Full

**Problem:** Three bugs from NAR-2's decision to generate at 1.0x and use Web Audio `playbackRate` for speed: (1) cursor desync — `setSpeed()` boundary recalculation was a no-op, (2) audio overlap on `updateWords` restart — `source.stop()` doesn't immediately silence buffered audio, (3) pitch distortion — `playbackRate` changes both speed and pitch.

**Fix:** Removed `playbackRate`-based speed changes entirely. Pipeline now generates at actual target speed via `config.getSpeed()`. Speed changes use debounced stop+restart (500ms). `source.disconnect()` before `source.stop()` prevents overlap. Cache reads/writes bypassed when speed !== 1.0.

**Files changed:** `src/utils/audioScheduler.ts` (removed `setSpeed`, `playbackRate`, added disconnect), `src/utils/generationPipeline.ts` (added `getSpeed` to config), `src/hooks/narration/kokoroStrategy.ts` (wired `getSpeed`, cache bypass), `src/hooks/useNarration.ts` (debounced `adjustRate`), `tests/audioScheduler.test.ts`, `tests/generationPipeline.test.ts`, `package.json`

**Tests:** 860 pass, 0 fail. Build: success.

---

## HOTFIX-8 [v1.4.4]: Pipeline-Aware Scheduler onEnd

**Completed:** 2026-03-29 | **Branch:** `sprint/hotfix8-pipeline-onend` | **Tier:** Quick

**Problem:** audioScheduler fired `callbacks.onEnd()` when `activeSources.length === 0`, which was met prematurely when the first ramp-up chunk (13 words) finished playing before the generationPipeline delivered chunk 2 via IPC. This caused cursor reset to 0 and narration replay from the beginning.

**Fix:** Added `pipelineDone` flag to audioScheduler. The scheduler only fires `onEnd` when BOTH `activeSources.length === 0` AND `pipelineDone === true`. `markPipelineDone()` also checks if sources are already empty (fires immediately if so). Flag resets in both `stop()` and `play()`. Pipeline's `onEnd` callback wired to `scheduler.markPipelineDone()` in kokoroStrategy.ts.

**Files changed:** `src/utils/audioScheduler.ts`, `src/hooks/narration/kokoroStrategy.ts`, `package.json`

**Tests:** 860 pass, 0 fail.

---

## HOTFIX-7 [v1.4.3]: Stale onended Race Condition — Fix 15-Word Narration Loop

**Completed:** 2026-03-29 | **Branch:** `sprint/hotfix7-stale-onended` | **Tier:** Quick | **Outcome:** PASS

**Root cause:** `source.stop()` in Web Audio fires `onended` asynchronously. When `updateWords()` called `stop()` then `play()`, the stale `onended` fired with the new session's callbacks, triggering `onEnd()` → section-end navigation → cursor reset to 0 → infinite 15-word loop.

**Fix (3 files, +12/-5 lines):**
- `audioScheduler.ts`: Added `schedulerEpoch` counter — incremented on `stop()`, captured in `scheduleChunk()` closure, checked in `source.onended`. Stale callbacks silently exit.
- `ReaderContainer.tsx`: Section-end callback checks `bookWordsRef.current?.complete` first — if full-book words loaded, calls `narration.stop()` instead of navigating foliate.
- `package.json`: Version bump to 1.4.3.

**Verification:** 860 tests pass, clean build, code review PASS (spec-compliant, no scope creep).

**Related:** LL-053 (Web Audio onended async), LL-051 (no visible foliate navigation for background work)

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
               ├──────────────────────────────────────────┐
               ▼                                          ▼
        Sprint 19: Sync Hardening          Sprint 20: Keyboard-First UX
        & Content Sync                     (Superhuman-Inspired)
        (PARALLEL)                         (PARALLEL)
               │                                          │
               └──────────────┬───────────────────────────┘
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

**19I. Article provenance metadata extraction (URL imports)**
- Current state: `extractArticleFromHtml()` returns `{ title, content, imageUrl }` but does NOT extract author, source domain, or publication date — even though `generateArticlePdf()` already has slots for `author` and renders it in the PDF header. The `author` field in `ipc-handlers.js` line 389 always receives `result.author` which is currently always `undefined` from the extraction function
- **Fix:** Extend `extractArticleFromHtml()` to extract three new fields:
  - **Author(s)**: Check in priority order:
    1. JSON-LD `author.name` or `author[].name` (most structured)
    2. `__preloadedData` → `article.bylines` (NYT-specific)
    3. `<meta name="author">` content
    4. `<meta property="article:author">` content
    5. Readability `byline` field (from `reader.parse().byline`)
    6. DOM selectors: `[class*="byline"]`, `[class*="author"]`, `[rel="author"]`
    - Clean up: strip "By " prefix, normalize whitespace, handle multiple authors (join with " & ")
  - **Source domain** (display name): Check in priority order:
    1. `<meta property="og:site_name">` content (e.g., "The New York Times")
    2. `<meta name="application-name">` content
    3. JSON-LD `publisher.name`
    4. Fallback: derive from hostname — strip `www.`, extract domain name, title-case it (e.g., `www.nytimes.com` → "Nytimes", `arstechnica.com` → "Arstechnica")
  - **Publication date**: Check in priority order:
    1. JSON-LD `datePublished`
    2. `<meta property="article:published_time">` content
    3. `<meta name="date">` or `<meta name="publication_date">` content
    4. `<time>` element with `datetime` attribute inside article
    5. Fallback: null (use fetch date as display fallback)
    - Parse to ISO 8601 string, store as `publishedDate: string | null`
- **Lead image (hardening)**: The extractor already grabs `og:image` and `twitter:image`, and `ipc-handlers.js` already downloads them to `covers/{docId}.ext` and stores the path as `coverPath`. However, the current implementation has gaps:
  - Only tries `og:image` and `twitter:image` — no further fallbacks
  - **Add fallback cascade** (after existing og:image/twitter:image):
    1. JSON-LD `image` or `image.url` field
    2. `__preloadedData` → `article.leadMedia` or `article.promotionalMedia` (NYT-specific)
    3. First `<img>` inside the article body with `width >= 400px` (heuristic: skip tiny icons/avatars)
    4. `<meta property="og:image:secure_url">` (some sites use this instead of `og:image`)
  - **Image validation**: Before saving, verify the downloaded image is valid (check first bytes for JPEG/PNG/GIF/WebP magic numbers). Reject HTML error pages served as images (common with CDN auth failures)
  - **Minimum dimensions**: Skip images smaller than 200x200 (likely icons or tracking pixels). Use image header inspection (read dimensions without decoding full image)
  - **WebP conversion note**: If image is WebP, save as `.webp` — current regex only matches `.jpg|.jpeg|.png|.gif` and falls back to `.jpg`. Add `.webp` to the extension match
- Return signature changes to: `{ title, content, imageUrl, author, sourceDomain, publishedDate }`
- Update `ipc-handlers.js` URL import handler to pass all new fields into the BlurbyDoc
- Files affected: `main/url-extractor.js` (extractArticleFromHtml), `main/ipc-handlers.js` (import-url handler)

**19J. Article provenance in PDF generation (APA format)**
- Current PDF header renders: title (centered, 18pt), author as "by Author" (centered, 11pt gray), source URL (centered, 9pt gray link), fetch date
- **Fix:** Reformat the PDF header to follow APA-style citation rendering:
  - Line 1: **Author(s)** — `Last, F. M.` format if parseable, otherwise raw byline. Multiple authors: `Last, F. M., & Last, F. M.` (11pt, black, left-aligned)
  - Line 2: **(Year, Month Day)** — from `publishedDate` if available, otherwise `fetchDate`. Formatted as `(2026, March 21).` (11pt, black, left-aligned)
  - Line 3: **Title** — article title in italics (14pt, black, left-aligned)
  - Line 4: **Source** — `sourceDomain`. Displayed as-is from `og:site_name` (e.g., "The New York Times"). (11pt, black, left-aligned)
  - Line 5: **URL** — full source URL as clickable link (9pt, gray, left-aligned)
  - Separator: horizontal rule (0.5pt, `#D04716` brand orange) after the header block, 1em spacing before body text
- Update PDF metadata fields: `Author`, `Title`, `Keywords` (include `source:domain`, `published:date`)
- Files affected: `main/url-extractor.js` (generateArticlePdf function)

**19K. BlurbyDoc schema extension for provenance**
- Add three new fields to `BlurbyDoc` in `src/types.ts`:
  - `sourceDomain?: string` — display name of source (e.g., "The New York Times", "Ars Technica")
  - `publishedDate?: string` — ISO 8601 date string of original publication
  - `authorFull?: string` — full byline string for display (existing `author` field kept for backward compat, `authorFull` stores the complete multi-author string)
- Schema migration: existing URL-imported docs get `sourceDomain` derived from `sourceUrl` hostname (fallback extraction), `publishedDate` as null, `authorFull` copied from `author`
- These fields sync via the existing field-level sync (Sprint 17) — no special handling needed
- Files affected: `src/types.ts`, `main/migrations.js`

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
| 9 | Article provenance extraction + schema (19I, 19K) — extend extractArticleFromHtml, add BlurbyDoc fields, migration | `electron-fixer` (sonnet) | — |
| 10 | APA-format PDF header (19J) — reformat generateArticlePdf with APA citation style | `electron-fixer` (sonnet) | Step 9 |
| 11 | Lazy content download UI (19E renderer) | `renderer-fixer` (sonnet) | Step 5 |
| 12 | Full Sync button + reconciliation UI (19F renderer) | `renderer-fixer` (sonnet) | Step 6 |
| 13 | Write sync hardening tests + provenance extraction tests | `renderer-fixer` (sonnet) | Steps 2-10 |
| 14 | Run full test suite + build | `test-runner` (haiku) | Steps 11-13 |

> **Note:** Steps 2-4 are PARALLELIZABLE after Step 1. Steps 6-8 are PARALLELIZABLE after Step 3. Steps 9-10 are INDEPENDENT of Steps 1-8 (can run fully in parallel with sync work).

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
- [ ] `extractArticleFromHtml` returns `author`, `sourceDomain`, `publishedDate` from URL-imported articles
- [ ] Author extracted from JSON-LD, meta tags, Readability byline, or DOM selectors (priority cascade)
- [ ] Source domain extracted from `og:site_name` with hostname fallback
- [ ] Publication date extracted from JSON-LD `datePublished` or `article:published_time` meta tag
- [ ] BlurbyDoc stores `sourceDomain`, `publishedDate`, `authorFull` fields
- [ ] Schema migration backfills `sourceDomain` from existing `sourceUrl` hostname for URL-imported docs
- [ ] Generated PDF uses APA-style citation header: Author last-name-first, (Year, Month Day), *Title* in italics, Source domain, URL as link
- [ ] PDF header uses brand orange (#D04716) separator line between citation block and body text
- [ ] Multi-author articles formatted as `Last, F. M., & Last, F. M.` in PDF header
- [ ] Lead image extracted via expanded fallback cascade: og:image → twitter:image → JSON-LD image → article body first large `<img>` → og:image:secure_url
- [ ] Downloaded images validated: magic bytes checked, HTML error pages rejected
- [ ] Images below 200x200 skipped (icons, tracking pixels)
- [ ] WebP images saved with `.webp` extension (not misnamed `.jpg`)
- [ ] Test: NYT article extracts author, "The New York Times" as domain, publish date, AND lead image
- [ ] Test: Article with no og:image falls back to first large in-article image
- [ ] Test: Article with no author gracefully falls back (no "by Unknown" in APA format — omit author line)
- [ ] Test: Article with no publish date uses fetch date with "(n.d.)" APA convention
- [ ] `npm test` passes (including all new sync hardening + provenance tests)
- [ ] `npm run build` succeeds

---

## Sprint 20: Keyboard-First UX (Superhuman-Inspired)

**Goal:** Transform Blurby from "keyboard-supported" to "keyboard-first." Adopt proven patterns from Superhuman's shortcut system — command palette, J/K navigation, G-sequences, single-key actions — and extend them for a speed reading context. After this sprint, a power user can do everything in Blurby without touching a mouse.

**Prerequisite:** Sprint 18A (.exe production) complete. Independent of Sprints 18B/18C/19 — can run in parallel.

**Tier:** Full (new feature, touches hooks, components, settings, and global CSS).

**Inspiration:** Superhuman Keyboard Shortcuts v7 (Windows & Linux Edition). Direct adoption where concepts overlap; novel extensions where Blurby's reading-app context creates unique opportunities.

### Spec

**20A. Command Palette (`Ctrl+K`)**
- Superhuman's "Superhuman Command" — the single most impactful keyboard feature
- Full-screen fuzzy search overlay that searches EVERYTHING:
  - Documents (by title, author, source)
  - Actions ("archive", "favorite", "open settings", "toggle theme")
  - Settings (jump directly to any settings sub-page)
  - Chapters (within current document, if in reader)
  - Keyboard shortcuts (type a shortcut name to learn its key)
- Ranked results with type badges: 📄 Doc, ⚡ Action, ⚙️ Setting, 📑 Chapter, ⌨️ Shortcut
- Arrow keys to navigate results, `Enter` to select, `Escape` to dismiss
- Recent actions shown on open (before typing) for repeat access
- Implementation: New `CommandPalette.tsx` component, mounted at App level, triggered by global keydown handler
- Fuzzy matching via simple scored substring (no external dependency — keep it Pike Rule 3)
- Files affected: new `src/components/CommandPalette.tsx`, `src/hooks/useKeyboardShortcuts.ts` (add Ctrl+K handler), `src/styles/global.css` (overlay styles)

**20B. Library Search (`/`)**
- Superhuman's `/` for Search
- From library view, pressing `/` focuses the search/filter input instantly
- If search input doesn't exist yet, create a persistent filter bar at top of library
- Type to filter documents by title/author in real-time
- `Escape` clears search and returns focus to library grid
- Files affected: `src/components/LibraryContainer.tsx` or `src/components/LibraryView.tsx`, `useKeyboardShortcuts.ts`

**20C. Shortcuts Overlay (`?`)**
- Superhuman's `?` for Shortcuts
- Lightweight modal overlay showing ALL keyboard shortcuts, organized by context (Global, Library, Reader — RSVP, Reader — Scroll, Highlight Menu)
- Dismissible with `Escape` or `?` again
- Replaces the need to navigate to Settings > Hotkeys for reference
- Current `HotkeyMapSettings.tsx` remains for settings page, but this overlay is the quick-reference
- Shows context-appropriate shortcuts highlighted based on current view
- Files affected: new `src/components/ShortcutsOverlay.tsx`, `useKeyboardShortcuts.ts`, `global.css`

**20D. Undo System (`Z`)**
- Superhuman's `Z` for Undo
- Introduce an undo stack for reversible actions:
  - Archive / un-archive
  - Favorite / un-favorite
  - Delete (soft — moves to trash, undo restores)
  - Queue add / remove
  - Tag add / remove
- On action, show a toast with undo prompt: "Archived 'Document Title' — Press Z to undo"
- `Z` triggers undo while toast is visible (5-second window)
- Stack depth of 1 (undo the last action only, not arbitrary depth)
- Uses existing `ToastContext.tsx` — extend toast to accept an `onUndo` callback
- Files affected: `src/contexts/ToastContext.tsx`, `useKeyboardShortcuts.ts`, `LibraryContainer.tsx`

**20E. Library Navigation (`J`/`K`, `Enter`, `X`, `Ctrl+Shift+A`)**
- Superhuman's `J`/`K` (next/previous), `Enter` (open), `X` (select), `Ctrl+Shift+A` (select all)
- Currently Blurby library has NO keyboard navigation — this is the biggest gap
- **J/K movement:** Maintain a `focusedIndex` state in LibraryContainer. `J` increments, `K` decrements. Visual focus ring (2px orange outline) on the focused document card. Scrolls into view automatically
- **Enter to open:** Opens focused document in reader at last reading position
- **X to select:** Toggles multi-select on focused document. Selected docs get a checkbox overlay. Enables batch actions (archive, delete, tag, queue)
- **Ctrl+A / Ctrl+Shift+A:** Select all visible (filtered) documents
- **Escape:** Clears selection, then clears search, then closes menu (layered dismiss)
- Grid vs list view: `J`/`K` move linearly through documents regardless of visual layout. In grid view, also support arrow keys (←/→ for column, ↑/↓ for row)
- Files affected: `LibraryContainer.tsx` (focus state, selection state), `DocCard.tsx` / `GridCard.tsx` (focus ring + selection checkbox), `useKeyboardShortcuts.ts`, `global.css`

**20F. Single-Key Document Actions (`E`, `Shift+E`, `S`, `#`, `U`, `R`)**
- Superhuman's single-key action model — no modifier keys for common operations
- All operate on the focused document (via J/K) or current document (in reader):
  - **`E`** → Archive document (Superhuman: Mark Done). Toast with undo. In library, auto-advance focus to next document
  - **`Shift+E`** → Restore from archive (Superhuman: Mark Not Done). Available when viewing archive
  - **`S`** → Toggle star/favorite (Superhuman: Star). **Replaces current `B` binding.** `S` is more intuitive and matches Superhuman. `B` retired
  - **`#`** → Trash document (Superhuman: Trash). Requires Shift+3, which is slightly deliberate — prevents accidental deletion. Toast with undo via `Z`
  - **`U`** → Toggle read/unread status (Superhuman: Mark Read or Unread). New concept for Blurby: marks a document as "unread" even if partially read. Visual: unread docs show bold title + dot indicator in library. Useful for "I need to revisit this"
  - **`R`** → Resume reading (NEW — no Superhuman equivalent). Opens focused document at last reading position. Distinct from `Enter` which could open doc detail/info in a future update
- Files affected: `useKeyboardShortcuts.ts`, `LibraryContainer.tsx` (action dispatch), `DocCard.tsx` (unread indicator), `src/types.ts` (add `unread` field to BlurbyDoc)

**20G. Go-To Sequences (`G then ...`)**
- Superhuman's signature two-key navigation pattern
- Press `G` to enter "go-to mode" — a subtle indicator appears (small "G..." badge in bottom-left corner, 2-second timeout). Then press a second key to navigate:
  - **`G` then `L`** → Library (all documents)
  - **`G` then `F`** → Favorites
  - **`G` then `A`** → Archive
  - **`G` then `Q`** → Queue
  - **`G` then `R`** → Recent
  - **`G` then `S`** → Stats panel
  - **`G` then `T`** → Settings (T for sTuff? or reassign)
- Implementation: State machine in keyboard hook — `pendingSequence` flag with 2-second auto-clear timeout
- After navigation, focus returns to library with the new filter applied
- Files affected: `useKeyboardShortcuts.ts` (sequence state machine), `LibraryContainer.tsx` (filter activation), new `src/components/GoToIndicator.tsx` (the "G..." badge), `global.css`

**20H. Snooze / Read Later (`H`)**
- Superhuman's "Remind Me" — adapted for reading
- Press `H` on focused document. Quick-picker overlay appears:
  - `1` → In 1 hour
  - `2` → Tonight (8 PM)
  - `3` → Tomorrow morning (8 AM)
  - `4` → This weekend (Saturday 9 AM)
  - `5` → Next week (Monday 8 AM)
  - `Escape` → Cancel
- Snoozed documents:
  - Disappear from main library view
  - Stored with `snoozedUntil` timestamp in BlurbyDoc
  - Reappear automatically when time arrives (checked on app launch + periodic 60s check)
  - System notification on reappearance: "Time to read: 'Document Title'"
  - Viewable anytime via `G then H` (Go to Snoozed)
- Add `G then H` to the Go-To sequence table in 20G
- Files affected: `src/types.ts` (add `snoozedUntil` to BlurbyDoc), new `src/components/SnoozePickerOverlay.tsx`, `useKeyboardShortcuts.ts`, `LibraryContainer.tsx` (filter snoozed), `main/ipc-handlers.js` (snooze timer + notification)

**20I. Tags System (`L`, `V`)**
- Superhuman's Labels (`L`) and Move (`V`) — adapted for reading collections
- **`L`** → Add/remove tag. Opens a small overlay listing existing tags with checkboxes. Type to filter or create a new tag. `Enter` to toggle, `Escape` to close
- **`V`** → Move to collection. Same overlay but single-select (moves the doc into exactly one collection, removing from others). Collections are higher-order grouping than tags
- Tags are free-form strings stored in `BlurbyDoc.tags: string[]`
- Collections stored in `BlurbyDoc.collection: string | null`
- Library view: filter by tag (`Shift+L` opens tag filter) or collection (via `G then C` — add to Go-To sequences)
- Files affected: `src/types.ts` (add `tags`, `collection` to BlurbyDoc), new `src/components/TagPickerOverlay.tsx`, `useKeyboardShortcuts.ts`, `LibraryContainer.tsx` (tag/collection filters), `main/ipc-handlers.js` (persist tags)

**20J. Filter Shortcuts (`Shift+U`, `Shift+S`, `Shift+R`, `Shift+I`)**
- Superhuman's filter keys — instant library filtering without opening a menu
- **`Shift+U`** → Filter: unread only
- **`Shift+S`** → Filter: starred/favorites only
- **`Shift+R`** → Filter: currently reading (has progress > 0% but < 100%)
- **`Shift+I`** → Filter: imported today
- Pressing the same filter again clears it (toggle behavior)
- Active filter shown as a pill/chip below the search bar: "Showing: Unread" with `×` to clear
- Multiple filters are NOT combinable (each replaces the previous — keep it simple per Pike Rule 4)
- Files affected: `LibraryContainer.tsx` (filter state + UI), `useKeyboardShortcuts.ts`, `global.css`

**20K. Open Source / Original (`O`)**
- Superhuman uses `O` to expand a message
- In Blurby library: if the focused document was imported from a URL, `O` opens the original URL in the default browser via `shell.openExternal()`. For local files, opens the file's parent folder in the system file manager. Toast feedback: "Opening source..." or "No source URL available"
- In reader: same behavior — opens the source of the current document
- Files affected: `useKeyboardShortcuts.ts`, `main/ipc-handlers.js` (new `open-doc-source` IPC channel), `preload.js` (expose channel)

**20L. Chapter Navigation Aliases (`N`/`P`)**
- Superhuman uses `N`/`P` for next/previous message
- In Blurby reader, add `N` = next chapter, `P` = previous chapter as aliases for existing `]`/`[`
- More discoverable than bracket keys. Both bindings coexist
- Files affected: `useKeyboardShortcuts.ts` only (add `N`/`P` cases alongside `]`/`[`)

**20M. Highlights & Notes Quick-Access (`;`)**
- Superhuman uses `;` for Snippets
- In Blurby, `;` opens a searchable overlay of ALL saved highlights and notes across every document
- Each entry shows: highlighted text, document title, date saved
- Type to filter. `Enter` to jump to that document at the highlight's position
- Personal knowledge base at your fingertips
- Files affected: new `src/components/HighlightsOverlay.tsx`, `useKeyboardShortcuts.ts`, `main/ipc-handlers.js` (new `get-all-highlights` IPC for cross-document query), `preload.js`

**20N. Quick Settings Popover (`Ctrl+Shift+,`)**
- Beyond `Ctrl+,` (full settings), add a compact, context-sensitive settings popover
- In reader: shows WPM slider, font size, theme toggle, reading mode switch
- In library: shows sort order, view mode (grid/list), density
- Small floating panel, not a full-page navigation. Dismiss with `Escape`
- Enables rapid setting tweaks without leaving the current context
- Files affected: new `src/components/QuickSettingsPopover.tsx`, `useKeyboardShortcuts.ts`, `global.css`

**20O. Font Size Controls (`Ctrl+=`, `Ctrl+-`, `Ctrl+0`)**
- Match Superhuman AND universal browser convention
- **`Ctrl+=`** → Increase font size (reader text, replaces bare `=`)
- **`Ctrl+-`** → Decrease font size (reader text, replaces bare `-`)
- **`Ctrl+0`** → Reset font size to default (NEW — Blurby has no reset)
- Bare `=`/`-` freed up for future use
- Regular `Up`/`Down` remain as WPM fine-tune (±25). `Shift+Up`/`Shift+Down` remain as coarse WPM (±100). No change to speed controls
- Files affected: `useKeyboardShortcuts.ts` (modify existing handlers to require Ctrl)

**20P. Jump to Top/Bottom (`Ctrl+↑`/`Ctrl+↓`)**
- Superhuman's jump-to-top/bottom navigation
- In scroll reader: `Ctrl+↑` jumps to start of document, `Ctrl+↓` jumps to end
- In library: `Ctrl+↑` jumps focus to first document, `Ctrl+↓` to last
- Regular `Up`/`Down` remain as WPM speed controls in reader — no conflict since Ctrl modifier distinguishes them
- Files affected: `useKeyboardShortcuts.ts`, `ScrollReaderView.tsx` (scroll-to-position)

**20Q. Tab / Zone Cycling**
- Superhuman uses `Tab`/`Shift+Tab` for split navigation
- **Library:** `Tab` cycles focus between zones — search bar → library grid → sidebar. `Shift+Tab` reverses. Sidebar menu toggle available via `G then M`
- **Reader:** `Tab` cycles reading mode: Focus → Flow → Page → Focus. `Shift+Tab` reverses: Focus → Page → Flow → Focus. Menu flap toggle moves to `M` (standalone key, no conflict — `M` is only used inside G-sequences as `G then M` in library context)
- `Shift+F` (old mode toggle) **removed** — replaced by `Tab`
- Files affected: `useKeyboardShortcuts.ts` (Tab handler context logic), `LibraryContainer.tsx` (zone focus management), `ReaderContainer.tsx` (mode cycling)

**20R. Escape Layering**
- Superhuman's `Esc` → Back — adopt layered dismiss pattern
- `Escape` closes the topmost open layer in this priority:
  1. Command palette (20A)
  2. Snooze picker (20H)
  3. Tag picker (20I)
  4. Shortcuts overlay (20C)
  5. Highlights overlay (20M)
  6. Quick settings popover (20N)
  7. Highlight menu (existing)
  8. Search bar focus (return to library)
  9. Multi-select (clear selection)
  10. Reader (exit to library — keep existing double-Escape in scroll mode)
- Implementation: Escape handler checks overlay/focus state top-down, first match wins
- Files affected: `useKeyboardShortcuts.ts` (unified Escape handler), all overlay components (expose `isOpen` state)

**20S. Article Provenance Display (renderer side of Sprint 19I)**
- Sprint 19 adds `sourceDomain`, `publishedDate`, `authorFull`, and hardened lead image extraction to BlurbyDoc and the generated PDF. Sprint 20 displays this metadata in the Blurby UI
- **Library view (DocCard / GridCard):**
  - **Lead image as card hero**: For URL-imported docs with a `coverPath`, display the lead image as the card's hero/thumbnail — the primary visual anchor in both grid and list view. Grid view: image fills top portion of card (aspect ratio preserved, object-fit cover, max-height ~140px). List view: square thumbnail on the left (~60x60px). This uses the existing `get-cover-image` IPC + LRU cache — same pipeline as EPUB/MOBI covers
  - For URL-imported docs: show APA-style subtext below the title: `Author Last, F. M. (Year, Month Day). Source Domain.`
  - If no author: show `Source Domain. (Year, Month Day).`
  - If no published date: show `Author. Source Domain. (n.d.).`
  - If no lead image: show a placeholder card with the source domain's first letter as a large monogram (styled with `--color-primary` background, white text) — visually distinct from book covers
  - For books (EPUB/MOBI/PDF): continue showing `by Author` and book cover as-is (no APA — books aren't articles)
  - Subtext styled: 11px, `var(--color-text-secondary)`, single line with text-overflow ellipsis
- **Reader header (ReaderContainer / ScrollReaderView):**
  - For URL-imported docs: display APA citation line below the document title at the top of the reader
  - Format: `Author Last, F. M. (Year, Month Day). Source Domain.` — matching the PDF header
  - Styled as secondary text, smaller than title, clickable source domain opens original URL
  - For books: show `by Author` as currently implemented
- **Command palette (20A):** Include `sourceDomain` and `authorFull` in the fuzzy search index so users can search by source (e.g., typing "NYT" finds all New York Times articles)
- Files affected: `DocCard.tsx`, `GridCard.tsx`, `ReaderContainer.tsx`, `ScrollReaderView.tsx`, `CommandPalette.tsx`, `global.css`

**20T. Settings & Docs Updates**
- Update `HotkeyMapSettings.tsx` to show ALL new shortcuts (currently missing some even before this sprint)
- Organize into sections: Global, Library, Reader (Universal), Reader (Focus), Reader (Flow), Reader (Page), Overlays
- Add "Keyboard-first mode" toggle in settings that shows a subtle cheat-sheet tooltip on first launch
- Update `src/types.ts` with new fields: `BlurbyDoc.unread`, `BlurbyDoc.snoozedUntil`, `BlurbyDoc.tags`, `BlurbyDoc.collection` (note: `sourceDomain`, `publishedDate`, `authorFull` added in Sprint 19K)
- Schema migration in `main/migrations.js` to add new fields with defaults to existing library data
- Files affected: `HotkeyMapSettings.tsx`, `src/types.ts`, `main/migrations.js`

**20U. Page-as-Parent Reader Architecture**
- **Design spec:** `docs/project/three-mode-reader-redesign.md`
- **Paradigm shift**: Page is the DEFAULT reading view (parent). Focus and Flow are speed-reading sub-modes launched FROM Page. User always returns to Page on pause.
- **Workflow**: Open document → Page view → `Space` enters Focus at highlighted word → `Space` pauses back to Page → `Shift+Space` enters Flow → `Space` pauses back to Page
- Add `"page"` to `readingMode` type in `types.ts` (was `"focus" | "flow"`, now `"focus" | "flow" | "page"`, default `"page"`)
- **New component: `PageReaderView.tsx`** — Default reading view, paginated book-like display
  - Derived from existing e-ink pagination in `ScrollReaderView.tsx` (uses `VirtualScrollText` with computed page blocks)
  - Full text paginated into screen-sized pages based on viewport height minus bottom bar
  - Left/Right arrows flip pages, tap left/right screen halves also flips
  - CSS opacity fade transition between pages (100ms)
  - **Word selection**: Click a word to highlight it (sets anchor for Focus/Flow). `Shift+←`/`→`/`↑`/`↓` moves highlight between words for precision selection
  - **Context menu**: Right-click highlighted word → "Define" or "Make Note" submenu
  - **Hotkeys on selected word**: `Shift+D` = define, `Shift+N` = make note (opens inline note popover)
  - `Space` = enter Focus at highlighted word. `Shift+Space` = enter Flow at highlighted word
- **New component: `ReaderBottomBar.tsx`** — Unified bottom bar for Page/Focus/Flow
  - Rendered by `ReaderContainer.tsx`, NOT by individual view components
  - Always visible with identical layout across all views
  - Row 1: Progress bar
  - Row 2: WPM label + slider (always visible), A-/A+ font controls, Focus + Flow mode buttons (brand orange when active, neutral in Page), chapter nav, e-ink refresh
  - Row 3: percentage (left), context-sensitive hints (center), time remaining (right)
  - Hint text: Page → `← → page ↑ ↓ speed space focus ⇧space flow M menu`, Focus → `← → rewind ↑ ↓ speed space pause M menu`, Flow → `← → seek ↑ ↓ speed space pause M menu`
  - Opacity: full in Page, fades to ~8% during Focus/Flow playback. E-ink: always full
- **Refactor `ReaderContainer.tsx`:**
  - Page is default view on document open (not Focus)
  - Focus/Flow are sub-modes entered via Space/Shift+Space, exited via Space (pause) back to Page
  - Position mapping: highlighted word in Page → wordIndex in Focus/Flow → highlighted word in Page on pause
- **Refactor `useReaderKeys`:**
  - Remove `if (s.readerMode !== "speed") return;` gate — Up/Down WPM works in all views
  - Page view: Space → enter Focus, Shift+Space → enter Flow, Shift+arrows → word selection, Shift+D/N → define/note
  - Focus/Flow: Space → pause + return to Page (not just toggle play)
  - `M` → toggle menu flap (all views). Remove `Shift+F` and old Tab-for-menu
- **Clean up per-mode components:**
  - `ScrollReaderView.tsx`: Remove local Space handler (lines 261-266), remove mode switch buttons, remove local bottom bar
  - `ReaderView.tsx`: Remove "scroll mode" button, remove local bottom bar
- Files affected: `src/types.ts`, new `src/components/PageReaderView.tsx`, new `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`, `src/components/ReaderView.tsx`, `src/components/ScrollReaderView.tsx`, `src/hooks/useKeyboardShortcuts.ts`, `src/styles/global.css`

**20V. Notes System**
- **Inline note-taking** from Page view when a word/phrase is highlighted
- `Shift+N` or right-click → "Make Note" opens a floating note popover anchored to the highlighted word
- Popover: single text field + "Save" button, auto-focused, `Enter` saves, `Escape` cancels
- Saved notes indicated by subtle dot/underline on the word in Page view; hover shows tooltip preview
- Notes exported to a running `.docx` file in the source folder: `{Document Title} — Reading Notes.docx`
- **Docx format**: Linked Table of Contents → document header sections → entries with: quoted highlight, APA citation, user's note, timestamp
- Newest notes appended to bottom; same-document notes grouped under shared header
- APA citation derived from BlurbyDoc metadata (author, title, sourceUrl, publishedDate)
- IPC: `save-reading-note` channel → main process generates/appends docx (requires `docx` npm package)
- Toast on save: "Note saved to Reading Notes.docx" with "Open" action
- Files affected: new note popover component, `main/ipc-handlers.js`, `preload.js`, `src/styles/global.css`

**20W. Reading Log (Excel Workbook)**
- **Template**: `docs/project/Reading_Log_Blurby_Template.xlsx` — match structure exactly
- Automated reading session logging to `Blurby Reading Log.xlsx` in source folder
- On first reading session, auto-create workbook from template if it doesn't exist
- **Tab 1 — "Reading Log"** (named table `ReadLog`, one row per work):
  - Columns: `#` (auto-increment), `Title`, `Lead Author Last Name`, `Lead Author First Name`, `Other Authors`, `Pub. Year`, `Publisher / Source`, `Edition / Vol.`, `DOI / URL`, `Work Type` (Book/Article), `Format` (Print/Digital/Audio), `Pages`, `Pages Read` (formula: Pages × % Read), `Date Started`, `Date Finished`, `Days to Complete` (formula: Finished − Started), `Sessions`, `Total Time (min)`, `Avg WPM`, `Completed?` (Y/N), `% Read`, `Rating (1–5)`, `Notes / Key Takeaway`
  - Blurby auto-populates on first read: Title, Author (split into Last/First), Pub. Year, Publisher/Source, DOI/URL, Work Type, Format (always "Digital"), Pages (from word count ÷ ~250), Date Started
  - Blurby updates incrementally: Sessions (++), Total Time (+=session duration), Avg WPM (session-weighted), % Read (from progress), Date Finished (when 100%)
  - User manually fills: Other Authors, Edition/Vol., Rating, Notes/Key Takeaway, Completed? override
- **Tab 2 — "Dashboard"** (KPIs with formulas from ReadLog table):
  - **Volume & Pace**: Total Works Read, Works Read YTD, Total Pages Read, Avg Pages/Day, Avg Days/Book, Books/Month
  - **Volume & Pace (detail row)**: Most Pages Read, Fewest Pages Read, Longest Read (Days), Quickest Read (Days), Books/Year, Pages Read YTD
  - **Sessions & Speed**: Total Sessions, Avg Sessions/Book, Total Reading Time (hrs), Avg Time/Session (min), Weighted Avg WPM, Completed Time (hrs)
  - **Sessions & Speed (detail row)**: Most Sessions (Single Work), Fewest Sessions, Fastest WPM, Slowest WPM, Avg Time/Book (min), Longest Read Time (hrs)
  - **Completion & Commitment**: Completion Rate, Abandonment Rate, Total DNFs, Avg % Read on DNF, DNF: Books, DNF: Articles
  - **Temporal Patterns**: Median Publication Year, Median Publication Lag (Yrs), Oldest Work (Pub Year), Newest Work (Pub Year), Reading Since, Reading Span (Months)
  - **Monthly Reading Volume**: Jan–Dec bar chart data (COUNTIFS by month from Date Started, year-selectable)
  - **Diversity & Breadth**: Unique Authors, Most-Read Author Count, Repeat Author Rate, Books count, Articles count, PDFs/Other count
  - **Format breakdown**: Print/Digital/Audio counts and percentages
  - **Quality & Preference**: Avg Rating, Highest Rating, Lowest Rating, 5-Star Reads, Below 3-Star, Avg Rating (Completed)
  - **Rating Distribution**: ★1 through ★5 counts
  - **Footer**: "Blurby. — Fast · Friendly · Focused"
- All dashboard cells use formulas referencing the ReadLog structured table — no hardcoded values
- IPC: `log-reading-session` channel → main process opens/creates workbook, appends/updates row
- IPC: `open-reading-log` channel → `shell.openPath()` to open in user's default spreadsheet app
- In Reading Statistics panel, replace "Export CSV" with "Open Reading Log" button
- Requires `exceljs` npm package for .xlsx read/write with formula preservation
- Files affected: `main/ipc-handlers.js`, `preload.js`, stats panel component, `package.json`

**20X. Search Split (`/` vs `Ctrl+K`)**
- `/` = Library search overlay (documents only — titles, authors, source domains, tags, collections)
- `Ctrl+K` = Command palette scoped to NON-library items (actions, settings, chapters, shortcuts)
- Library search uses same visual treatment as command palette but filtered to documents
- Both available from any view
- Files affected: `src/components/CommandPalette.tsx`, `src/hooks/useKeyboardShortcuts.ts`

### Summary of Key Reassignments

| Key | Before Sprint 20 | After Sprint 20 | Rationale |
|-----|------------------|-----------------|-----------|
| `B` | Toggle favorite | **Retired** | Replaced by `S` (Superhuman convention) |
| `S` | Save highlight (in highlight menu only) | **Star/Favorite** (global) + save highlight (in highlight menu) | Context-dependent: library/reader = star, highlight menu = save |
| `=`/`-` (bare) | Font size ±10% | **Freed up** | Moved to `Ctrl+=`/`Ctrl+-` (browser convention) |
| `Tab` (library) | Toggle sidebar | **Zone cycling** (search → grid → sidebar) | Sidebar toggle moves to `G then M` |
| `M` (reader) | N/A | **Toggle menu flap** | Replaces Tab in reader |
| `Shift+F` (reader) | Toggle mode (speed ↔ scroll) | **Removed** | Replaced by Space/Shift+Space from Page |
| `Space` (page) | N/A | **Enter Focus** at highlighted word | Page is parent, Space launches Focus |
| `Shift+Space` (page) | N/A | **Enter Flow** at highlighted word | Page is parent, Shift+Space launches Flow |
| `Space` (focus/flow) | Play/pause toggle | **Pause + return to Page** | Pausing always returns to Page for context |
| `Shift+←`/`→`/`↑`/`↓` (page) | N/A | **Word-level selection** | Navigate between words to set anchor |
| `Shift+D` (page) | N/A | **Define** highlighted word | Quick define from Page |
| `Shift+N` (page) | N/A | **Make Note** on highlighted word | Opens inline note popover |
| `↑`/`↓` (all reader views) | WPM (focus only) | **Adjust WPM** (±25) in all views | Universal |
| `/` (any) | Focus search (library only) | **Library search** (dedicated overlay) | Fastest key for most common search |
| `Ctrl+K` (any) | Command palette (everything) | **Command palette** (non-library only) | Actions, settings, chapters, shortcuts |

### New Data Model Fields

```typescript
interface BlurbyDoc {
  // ... existing fields ...
  unread?: boolean;        // 20F: mark-as-unread feature
  snoozedUntil?: number;   // 20H: epoch ms, null = not snoozed
  tags?: string[];          // 20I: free-form tags
  collection?: string;      // 20I: single collection assignment
}

// Settings type change (20U):
// readingMode: "focus" | "flow"        ← before
// readingMode: "focus" | "flow" | "page"  ← after
```

### New Components

| Component | Sprint Task | Purpose |
|-----------|-------------|---------|
| `CommandPalette.tsx` | 20A | Fuzzy search everything |
| `ShortcutsOverlay.tsx` | 20C | Quick-reference shortcut sheet |
| `GoToIndicator.tsx` | 20G | "G..." pending sequence badge |
| `SnoozePickerOverlay.tsx` | 20H | Time picker for read-later |
| `TagPickerOverlay.tsx` | 20I | Tag/collection manager |
| `HighlightsOverlay.tsx` | 20M | Cross-document highlights search |
| `QuickSettingsPopover.tsx` | 20N | Context-sensitive mini settings |
| `PageReaderView.tsx` | 20U | Default reading view — paginated, word selection, note/define triggers |
| `ReaderBottomBar.tsx` | 20U | Unified bottom bar across Page/Focus/Flow |
| `NotePopover.tsx` | 20V | Inline floating note input anchored to highlighted word |
| `ReadingLogExporter.tsx` | 20W | Session logging UI + "Open Reading Log" button |

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Data model + migrations (types.ts, migrations.js) — add `unread`, `snoozedUntil`, `tags`, `collection` fields with defaults | `electron-fixer` (sonnet) | — |
| 2 | Keyboard state machine — refactor `useKeyboardShortcuts.ts`: G-sequence engine, Escape layering, context routing (library vs reader), Ctrl-modified font size, `N`/`P` chapter aliases | `renderer-fixer` (sonnet) | — |
| 3 | Library navigation + selection — `J`/`K` focus, `Enter` open, `X` select, `Ctrl+Shift+A` select all, focus ring + selection checkbox in DocCard/GridCard | `renderer-fixer` (sonnet) | Step 2 |
| 4 | Single-key actions — `E` archive, `Shift+E` restore, `S` star, `#` trash, `U` unread toggle, `R` resume, `O` open source. Undo system (`Z`) with toast integration | `renderer-fixer` (sonnet) | Steps 1, 3 |
| 5 | Command palette (`Ctrl+K`) — fuzzy search component, action registry, result ranking, keyboard navigation within overlay | `renderer-fixer` (sonnet) | Step 2 |
| 6 | Library search (`/`) — focus filter input, instant filtering, Escape clear | `renderer-fixer` (sonnet) | Step 3 |
| 7 | G-sequence navigation — Go-To indicator badge, all `G then X` routes, 2-second timeout | `renderer-fixer` (sonnet) | Steps 2, 3 |
| 8 | Overlays — Shortcuts (`?`), Highlights (`;`), Quick Settings (`Ctrl+Shift+,`), Snooze (`H`), Tag/Collection (`L`/`V`) | `renderer-fixer` (sonnet) | Steps 2, 4 |
| 9 | Filter shortcuts — `Shift+U`/`Shift+S`/`Shift+R`/`Shift+I`, filter pill UI, toggle behavior | `renderer-fixer` (sonnet) | Step 3 |
| 10 | IPC channels — `open-doc-source`, `get-all-highlights`, snooze timer + notification in main process | `electron-fixer` (sonnet) | Step 1 |
| 11 | Tab zone cycling (library) — focus management between search/grid/sidebar | `renderer-fixer` (sonnet) | Steps 3, 6 |
| 12 | Article provenance display (20S) — APA subtext in DocCard/GridCard, reader header, command palette search index | `renderer-fixer` (sonnet) | Steps 3, 5 |
| 13 | Three-mode reader (20U) — `PageReaderView.tsx`, `ReaderBottomBar.tsx`, ReaderContainer three-way rendering, unified `useReaderKeys` (remove mode gates, add Tab/M/universal hotkeys), remove per-mode bottom bars, position mapping between modes | `renderer-fixer` (sonnet) | Step 2 |
| 14 | Settings update — `HotkeyMapSettings.tsx` full rewrite with all new shortcuts, organized by section (Global, Library, Reader Universal, Reader Focus, Reader Flow, Reader Page, Overlays) | `renderer-fixer` (sonnet) | Steps 2-13 |
| 15 | CSS — focus rings, overlay styles, filter pills, command palette, Go-To badge, selection checkboxes, provenance subtext, mode selector buttons, page transition, unified bottom bar. All via CSS custom properties | `renderer-fixer` (sonnet) | Steps 3-13 |
| 16 | Tests — keyboard shortcut tests (all contexts + all 3 reader modes), overlay dismiss tests, undo stack tests, G-sequence timeout tests, filter toggle tests, provenance display tests, page mode pagination tests, mode cycling tests | `renderer-fixer` (sonnet) | Steps 2-15 |
| 17 | Full test suite + build verification | `test-runner` (haiku) | Step 16 |

> **Parallelization:** Steps 1-2 are parallel (main vs renderer). Steps 5-9 + 12-13 are all parallelizable after their deps. Step 10 is parallel with Steps 3-9. Steps 14-15 wait for all feature work.

### Acceptance Criteria

**Command Palette (20A)**
- [ ] `Ctrl+K` opens command palette from any view
- [ ] Fuzzy search matches documents, actions, settings, chapters, and shortcuts
- [ ] Results ranked by relevance with type badges
- [ ] Arrow keys navigate results, `Enter` selects, `Escape` dismisses
- [ ] Recent actions shown before typing

**Library Search (20B)**
- [ ] `/` focuses search input from library view
- [ ] Real-time filtering by title/author as user types
- [ ] `Escape` clears search and returns focus

**Shortcuts Overlay (20C)**
- [ ] `?` shows shortcuts overlay from any view
- [ ] All shortcuts organized by context (Global, Library, Reader RSVP, Reader Scroll, Overlays)
- [ ] Dismissible with `Escape` or `?`

**Undo System (20D)**
- [ ] `Z` undoes last reversible action while toast is visible
- [ ] Toast shows action description and "Press Z to undo" prompt
- [ ] Undo works for: archive, favorite, delete, queue, tag operations

**Library Navigation (20E)**
- [ ] `J`/`K` move focus through library documents
- [ ] Focused document has visible focus ring (2px orange, `--color-primary`)
- [ ] Focused document scrolls into view automatically
- [ ] `Enter` opens focused document in reader
- [ ] `X` toggles multi-select on focused document
- [ ] `Ctrl+Shift+A` selects all visible documents
- [ ] `Escape` clears selection, then search, then menu (layered)
- [ ] Arrow keys work for grid navigation (← → ↑ ↓)

**Single-Key Actions (20F)**
- [ ] `E` archives focused/current document, auto-advances focus
- [ ] `Shift+E` restores from archive
- [ ] `S` toggles star/favorite (replaces `B`)
- [ ] `#` trashes document with undo via `Z`
- [ ] `U` toggles read/unread — unread docs show bold title + dot indicator
- [ ] `R` opens document at last reading position (resume)

**Go-To Sequences (20G)**
- [ ] `G` enters go-to mode with visible "G..." badge
- [ ] Badge auto-clears after 2 seconds if no second key pressed
- [ ] All sequences work: `G+L` (library), `G+F` (favorites), `G+A` (archive), `G+Q` (queue), `G+R` (recent), `G+S` (stats), `G+H` (snoozed), `G+C` (collections), `G+M` (toggle menu)

**Snooze (20H)**
- [ ] `H` opens snooze picker on focused document
- [ ] Number keys 1-5 select time option, `Escape` cancels
- [ ] Snoozed docs disappear from main library
- [ ] Snoozed docs reappear on schedule with system notification
- [ ] `G then H` navigates to snoozed documents view

**Tags & Collections (20I)**
- [ ] `L` opens tag picker overlay
- [ ] Type to filter or create new tags, `Enter` to toggle
- [ ] `V` opens collection picker (single-select move)
- [ ] Tags stored in `BlurbyDoc.tags`, collection in `BlurbyDoc.collection`
- [ ] `G then C` navigates to collection view

**Filter Shortcuts (20J)**
- [ ] `Shift+U` filters to unread, `Shift+S` to starred, `Shift+R` to reading, `Shift+I` to imported today
- [ ] Same filter key toggles off (clears filter)
- [ ] Active filter shown as pill/chip with `×` to clear
- [ ] Filters are mutually exclusive (one active at a time)

**Open Source (20K)**
- [ ] `O` opens original URL in default browser (for URL-imported docs)
- [ ] `O` opens parent folder in file manager (for local files)
- [ ] Toast feedback for all cases including "No source available"

**Chapter Aliases (20L)**
- [ ] `N` = next chapter (alias for `]`), `P` = previous chapter (alias for `[`)

**Highlights Search (20M)**
- [ ] `;` opens searchable highlights overlay
- [ ] Shows highlight text, document title, date
- [ ] Type to filter, `Enter` to jump to source document at highlight position

**Quick Settings (20N)**
- [ ] `Ctrl+Shift+,` opens context-sensitive mini settings
- [ ] Reader context: WPM, font size, theme, reading mode
- [ ] Library context: sort order, view mode, density
- [ ] Dismissible with `Escape`

**Font Size (20O)**
- [ ] `Ctrl+=` increases, `Ctrl+-` decreases, `Ctrl+0` resets font size
- [ ] Bare `=`/`-` no longer trigger font size changes
- [ ] Regular `Up`/`Down` remain as WPM fine-tune (±25 WPM) — unchanged

**Jump Top/Bottom (20P)**
- [ ] `Ctrl+↑` jumps to start, `Ctrl+↓` jumps to end in scroll reader
- [ ] In library: `Ctrl+↑` focuses first doc, `Ctrl+↓` focuses last doc

**Tab / Zone Cycling (20Q)**
- [ ] Library: `Tab` cycles focus — search bar → library grid → sidebar. `Shift+Tab` reverses
- [ ] Reader: `Tab` cycles reading mode — Focus → Flow → Page → Focus
- [ ] Reader: `Shift+Tab` reverses — Focus → Page → Flow → Focus
- [ ] Reader: `M` toggles menu flap (replaces old Tab behavior)
- [ ] `Shift+F` mode switch removed (Tab replaces it)
- [ ] Sidebar menu toggle available via `G then M` in library

**Escape Layering (20R)**
- [ ] `Escape` closes topmost layer in defined priority order
- [ ] All overlays respect the layered dismiss pattern
- [ ] Double-Escape in scroll reader maintained for exit confirmation

**Article Provenance Display (20S)**
- [ ] URL-imported docs with lead image display it as card hero (grid: top fill ~140px; list: 60x60 thumbnail)
- [ ] URL-imported docs without lead image show source-domain monogram placeholder (first letter, brand orange bg)
- [ ] Lead images loaded via existing `get-cover-image` IPC + LRU cache (same pipeline as book covers)
- [ ] URL-imported docs show APA-style subtext in library cards: `Author Last, F. M. (Year, Month Day). Source Domain.`
- [ ] Books continue showing `by Author` and book cover (no APA formatting for non-article sources)
- [ ] Reader header displays APA citation line below document title for URL-imported docs
- [ ] Source domain in reader header is clickable (opens original URL)
- [ ] Command palette fuzzy search matches `sourceDomain` and `authorFull` fields
- [ ] Graceful fallbacks: no author → omit; no date → "(n.d.)"; no domain → hostname

**Settings & Data (20T)**
- [ ] `HotkeyMapSettings.tsx` displays ALL shortcuts organized by section (Global, Library, Reader Universal, Reader Focus, Reader Flow, Reader Page, Overlays)
- [ ] Schema migration adds `unread`, `snoozedUntil`, `tags`, `collection` with safe defaults
- [ ] Existing library data migrates without data loss

**Page-as-Parent Reader (20U)**
- [ ] `readingMode` type is `"focus" | "flow" | "page"` in `types.ts`, default `"page"`
- [ ] Opening a document from library lands in Page view (not Focus)
- [ ] `PageReaderView.tsx` renders paginated text with no word highlighting
- [ ] Page: Left/Right arrows flip pages, tap left/right screen halves also flips
- [ ] Page: CSS opacity fade transition between pages (100ms)
- [ ] Page: Click a word to highlight it (sets anchor for Focus/Flow)
- [ ] Page: `Shift+←`/`→`/`↑`/`↓` moves highlight between words for precision selection
- [ ] Page: `Shift+D` defines highlighted word, `Shift+N` opens note popover
- [ ] Page: Right-click highlighted word → context menu with "Define" and "Make Note"
- [ ] Page: `Space` enters Focus at highlighted word, `Shift+Space` enters Flow
- [ ] Focus/Flow: `Space` pauses AND returns to Page view (not just toggle play)
- [ ] On return to Page: word position is highlighted, user can re-enter Focus or Flow
- [ ] `ReaderBottomBar.tsx` renders identically across Page/Focus/Flow
- [ ] Bottom bar: WPM slider always visible, font controls, Focus + Flow mode buttons (orange when active), chapter nav
- [ ] Bottom bar hint text adapts per view
- [ ] Bottom bar opacity: full in Page, fades to ~8% during Focus/Flow playback
- [ ] Per-mode bottom bars removed from `ReaderView.tsx` and `ScrollReaderView.tsx`
- [ ] `Up/Down` = ±25 WPM in all views. `Shift+Up/Down` = ±100 WPM in all views
- [ ] `M` toggles menu flap in all views. `Shift+F` removed. Tab removed from reader
- [ ] Position mapping: Page highlight ↔ Focus wordIndex ↔ Flow flowWordIndex

**Notes System (20V)**
- [ ] `Shift+N` on highlighted word opens floating note popover
- [ ] Popover: text field, Save button, auto-focused, `Enter` saves, `Escape` cancels
- [ ] Saved notes shown as subtle dot/underline on word in Page view
- [ ] Hover on noted word shows tooltip preview
- [ ] Notes exported to `{Document Title} — Reading Notes.docx` in source folder
- [ ] Docx format: TOC → document headers → quoted highlight + APA citation + note + timestamp
- [ ] Same-document notes grouped under shared header
- [ ] Toast: "Note saved to Reading Notes.docx" with "Open" action
- [ ] `save-reading-note` IPC channel in main process

**Reading Log (20W)**
- [ ] Each Focus/Flow session logged as a row in `Blurby Reading Log.xlsx`
- [ ] Session timer starts on entering Focus/Flow, stops on pause/exit
- [ ] Final WPM recorded (not intermediate changes)
- [ ] Tab 1: Reading Log table (Date, Document, Author, Format, Duration, Words Read, WPM, Pages, Mode, Chapter)
- [ ] Tab 2: Dashboard with KPIs and charts (formulas from Tab 1)
- [ ] "Export CSV" replaced with "Open Reading Log" in Reading Statistics
- [ ] `log-reading-session` IPC channel in main process

**Search Split (20X)**
- [ ] `/` opens library search overlay (documents only)
- [ ] `Ctrl+K` scoped to non-library items (actions, settings, chapters, shortcuts)
- [ ] Both available from any view

**General**
- [ ] No shortcut conflicts between contexts (library keys don't fire in reader and vice versa)
- [ ] All shortcuts respect input focus (don't fire when typing in search bar, command palette, or tag picker)
- [ ] All overlay components use CSS custom properties for theming
- [ ] All overlays accessible: ARIA roles, keyboard-navigable, screen-reader-announced
- [ ] E-ink mode respected: overlays use solid borders instead of shadows, no animations
- [ ] `npm test` passes (including all new keyboard/overlay tests)
- [ ] `npm run build` succeeds

---

## Sprint 21: UX Polish & Reading Intelligence

**Goal:** Close the gap between functional and polished. Fix known UX friction, add reading session intelligence, and elevate the library experience to feel professional and intentional.

**Prerequisite:** Sprint 20 (keyboard-first UX, Page-as-parent reader). Independent of Sprints 18B/18C/19.

**Tier:** Full (touches library, reader, stats, main process, CSS).

**Design spec references:** `docs/project/three-mode-reader-redesign.md`, `docs/project/hotkey-reference.md`

### Spec

**21A. Enter Opens Last Read**
- In library, pressing `Enter` on any document opens it at its last reading position (existing `position` field in BlurbyDoc)
- If no prior position, opens at the beginning (page 1 in Page view)
- Files affected: `LibraryContainer.tsx`, `ReaderContainer.tsx`

**21B. Click-Outside Closes Flap**
- When the menu flap is open, clicking anywhere outside the flap closes it
- Implement via overlay backdrop or document-level click listener with `stopPropagation` on flap
- Files affected: `MenuFlap.tsx`, `src/styles/global.css`

**21C. Move Settings to Top-Right of Flap**
- Settings gear icon/link moves to the top-right corner of the menu flap panel
- Currently at bottom — easy to miss
- Files affected: `MenuFlap.tsx`, `src/styles/global.css`

**21D. Book Thumbnails in List Mode**
- List mode currently shows no images for books. Add small square thumbnails (~60x60px) on the left side, matching URL article cards (visible in the library screenshot)
- Use existing `get-cover-image` IPC + LRU cache pipeline
- For docs without covers: show monogram placeholder (first letter of title, brand orange bg)
- Files affected: `DocCard.tsx`, `src/styles/global.css`

**21E. File Type Badge in Grid Mode**
- List mode shows file type badges (epub, pdf, mobi, url) but grid mode does not
- Add file type badge to top-right corner of the hero image/cover in grid cards
- Styled: small pill, semi-transparent background, white text, same design as list mode badges
- Files affected: `GridCard.tsx`, `src/styles/global.css`

**21F. Hover Actions as Buttons, Not Text**
- When hovering over a library card's hero image, action buttons appear but currently render as text
- Replace with proper icon buttons (star, copy, queue, archive, trash) with tooltips
- Files affected: `DocCard.tsx`, `GridCard.tsx`, `src/styles/global.css`

**21G. Frozen Top Menu on Scroll**
- As user scrolls down in library, the top menu bar (title row, filter tabs, and the line under filters) should be sticky/frozen
- Use `position: sticky; top: 0; z-index: 10;` with a background color matching the theme
- Ensure the scroll content starts below the frozen header
- Files affected: `LibraryView.tsx` or `LibraryContainer.tsx`, `src/styles/global.css`

**21H. Search Bar → Magnifying Glass Icon**
- Remove the full-width search bar from the library
- Replace with a magnifying glass icon placed left of the grid/list toggle buttons
- Clicking the icon (or pressing `/`) opens the search overlay
- Files affected: `LibraryView.tsx`, `src/styles/global.css`

**21I. Move Sort Dropdown to Filter Line**
- Sort dropdown ("closest to done", etc.) currently sits right of search bar
- Move it to the filter tab line, right-justified (aligned with filter tabs like "all", "favorites", "archived")
- Files affected: `LibraryView.tsx`, `src/styles/global.css`

**21J. Open Reading Log from Stats**
- In Reading Statistics panel, replace "Export CSV" button with "Open Reading Log"
- Opens the `Blurby Reading Log.xlsx` file in the user's default spreadsheet app via `shell.openPath()`
- If the file doesn't exist yet, create it from template first
- Files affected: stats panel component, `main/ipc-handlers.js`

**21K. Rename "Sources" to "Readings"**
- At the top of the library view, the label currently says "sources" (e.g., "31 sources")
- Change to "readings" (e.g., "31 readings")
- Files affected: `LibraryView.tsx`

**21L. Paywall Login Prompt**
- When a URL import fails due to paywall (detected via HTTP 403, paywall meta tags, or content length suspiciously short), prompt the user to log in to the site
- UI flow: Toast → "This article may be behind a paywall. Log in to access it?" → Button opens site login modal (existing authenticated fetch infrastructure from `url-extractor.js` line 220-230)
- Connection saved for future imports from the same domain
- Files affected: `main/url-extractor.js`, `main/ipc-handlers.js`, renderer toast/dialog

**21M. Hotkey Coaching Toasts**
- When a user mouse-clicks something they could have hotkey'd, briefly show a light gray floating tooltip in the bottom-right corner: "Next time try `[HOTKEY]` to get there faster"
- Rounded corners, subtle, auto-dismisses after 3 seconds
- Tracking: only show each coaching toast once per action (store shown hints in settings to avoid nagging)
- Examples: clicking archive → "Try `E`", clicking star → "Try `S`", clicking search → "Try `/`"
- Files affected: new `HotkeyCoach.tsx` component, settings persistence, `src/styles/global.css`

**21N. Reading Session Timer**
- Each reading session (Focus or Flow) must be timed from entry to exit/pause
- Total session duration recorded alongside final WPM
- If WPM changes during session, only the final WPM is logged
- Data stored in reading log (20W) and existing Reading Statistics (`history.json`)
- Files affected: `ReaderContainer.tsx` (session state), `main/ipc-handlers.js` (log entry)

**21O. Fix AVG WPM Miscalculation**
- Current "AVG WPM" in Reading Statistics shows dramatically low values (e.g., 26 WPM)
- Likely counting paused/idle time in the denominator, or using total elapsed time instead of active reading time
- Fix: AVG WPM = total words read ÷ total active reading time (Focus + Flow time only, excluding paused/Page time)
- Files affected: stats calculation in `main/ipc-handlers.js` or renderer stats component

**21P. Drag-and-Drop Anywhere**
- Currently drag-and-drop file import only works when hovering over the "NOT STARTED" section
- Must be viable over the entire app window (library, reader, settings — any view)
- Implement at the App.tsx level with a full-window drop zone overlay
- Files affected: `App.tsx` or `LibraryContainer.tsx`, `src/styles/global.css`

**21Q. Focus Mode Time Displays**
- In Focus mode, display two time indicators:
  - **Time to end of chapter**: calculated from current word position to chapter end at current WPM
  - **Time to end of document**: calculated from current word position to document end at current WPM
- Shown in the bottom bar or as subtle overlays in the Focus view
- Updates live as WPM changes
- Files affected: `ReaderView.tsx` or `ReaderBottomBar.tsx`

### Acceptance Criteria

**21A** — [ ] `Enter` opens document at last `position`; no position → page 1
**21B** — [ ] Clicking outside open flap closes it; clicking inside flap does not close it
**21C** — [ ] Settings link/icon is in top-right corner of flap
**21D** — [ ] List mode shows ~60x60 thumbnails for all docs; monogram fallback for missing covers
**21E** — [ ] Grid mode shows file type badge (epub/pdf/mobi/url) in top-right of hero image
**21F** — [ ] Hover actions on cards render as icon buttons with tooltips, not text
**21G** — [ ] Top menu (title, filters, divider line) stays visible while scrolling library
**21H** — [ ] Search bar replaced with magnifying glass icon; clicking or `/` opens search overlay
**21I** — [ ] Sort dropdown on the filter line, right-justified
**21J** — [ ] "Open Reading Log" button in stats opens .xlsx; creates from template if needed
**21K** — [ ] "sources" label changed to "readings" throughout library
**21L** — [ ] Paywall detection prompts user to log in; saved connection reused for future imports
**21M** — [ ] Mouse-click on hotkey-able action shows coaching toast once; auto-dismisses after 3s
**21N** — [ ] Session timer tracks Focus/Flow duration; final WPM logged per session
**21O** — [ ] AVG WPM uses active reading time only; no idle/paused inflation
**21P** — [ ] Drag-and-drop works from any area of the app window, not just "NOT STARTED"
**21Q** — [ ] Focus mode shows time-to-end-of-chapter and time-to-end-of-document

---

## Sprint 22: Reading Animation + TTS Sync

**Goal:** Transform the reading experience with smooth, elegant cursor/highlight motion in Flow and Focus modes, and introduce text-to-speech that reads at the exact pace of the user's WPM setting. After this sprint, reading in Blurby feels fluid rather than mechanical.

**Prerequisite:** Sprint 21 complete (reading intelligence features provide the session timer and WPM tracking that TTS sync depends on).

**Context:** Flow mode currently jumps the highlight between words — it should glide. Focus mode swaps words instantly — it should transition. TTS exists (`useNarration.ts`) but operates independently from the cursor. This sprint marries the visual and audio reading experiences under a single clock: user WPM → cursor advance → TTS output.

### Spec

**22A. Smooth highlight sliding in Flow mode (ScrollReaderView)**
- Current behavior: word-level highlight jumps discretely from word to word in the scrolling text body
- Target behavior: highlight slides smoothly between words as a continuous glide animation
- Implementation approach:
  - Use CSS `transition` on the highlight element's `transform`/`left`/`top` properties
  - On each word advance from `useReader`, calculate the pixel position of the next word in the text flow
  - Apply a CSS transition duration derived from the current WPM interval (`60000 / wpm` ms)
  - The highlight should arrive at the next word position just as the word advance fires
  - Use `getBoundingClientRect()` on the next word's `<span>` to get target coordinates
  - Handle line wraps gracefully — when the highlight reaches end of line, it should flow to the start of the next line (not teleport diagonally)
  - Handle page/scroll boundaries — auto-scroll should stay smooth and not fight the highlight animation
- Performance constraints:
  - Use CSS `transform: translate3d()` for GPU-accelerated movement (avoid `top`/`left` which trigger layout)
  - No React re-renders per word — continue using the existing ref-based DOM callback pattern
  - At 600 WPM (100ms per word), the animation must complete within the interval
- Edge cases:
  - Pause/resume: on pause, highlight freezes at current position; on resume, glides to next word
  - WPM change mid-read: transition duration updates immediately on next word advance
  - Chapter boundaries: no animation across chapter breaks (instant jump to new chapter's first word)
  - Window resize: recalculate positions on resize without visual glitch
- Files affected: `src/components/ScrollReaderView.tsx`, `src/styles/global.css`

**22B. Smooth word transition in Focus mode (ReaderView)**
- Current behavior: RSVP display hard-swaps the current word for the next word
- Target behavior: subtle, fast transition that doesn't interfere with reading at speed
- Implementation approach:
  - Outgoing word fades/slides out while incoming word fades/slides in
  - Animation must be **fast** — transition duration ≤ 15% of the word display interval
    - At 300 WPM (200ms/word): transition ≤ 30ms
    - At 600 WPM (100ms/word): transition ≤ 15ms
    - At 100 WPM (600ms/word): transition ≤ 90ms
  - ORP (Optimal Recognition Point) anchor position stays fixed — the pivot character doesn't move
  - Use CSS `opacity` + `transform: translateX()` for the swap animation
  - Two-element approach: element A displays current word, element B waits offscreen; on advance, A slides out, B slides in; roles swap for next word
  - At WPM > 500, disable transition entirely (too fast to perceive, would just blur)
- Performance constraints:
  - GPU-accelerated properties only (`opacity`, `transform`)
  - No layout thrash — both word elements are absolutely positioned
  - Continue using ref-based DOM updates (no React state per word)
- Edge cases:
  - Rhythm pauses: transition still plays at pause boundaries, but hold time extends
  - Punctuation pauses: transition duration stays the same, only the dwell time increases
  - Very long words: ensure no text overflow during transition
- Files affected: `src/components/ReaderView.tsx`, `src/styles/global.css`

**22C. TTS toggle and WPM cap architecture**
- New TTS toggle button in `ReaderBottomBar` — visible only in Page view (before entering Focus/Flow)
- Toggle states: OFF (default) → ON (speaker icon, highlighted in accent color)
- When TTS is ON and user enters Focus or Flow mode:
  - If user's current WPM > 400: WPM is capped to 400 on mode entry
  - Store the user's original WPM so it restores when TTS is toggled off or mode is exited
  - WPM slider in bottom bar shows the cap indicator when TTS-limited
  - User can still lower WPM below 400 while TTS is active
  - If user raises WPM above 400 while TTS is on: clamp to 400
- When TTS is OFF:
  - No WPM cap — user's full range (MIN_WPM to MAX_WPM) is available
  - WPM restores to original value if it was capped
- TTS toggle is NOT available within Focus/Flow modes — must be set from Page view before entering
- Keyboard shortcut: `N` toggles narration (from Page view only)
- Files affected: `src/components/ReaderBottomBar.tsx`, `src/hooks/useReader.ts`, `src/types.ts`
- New constants: `TTS_WPM_CAP = 400`, `TTS_TRANSITION_DISABLE_WPM = 500` → add to `src/constants.ts` (or existing constants location)

**22D. Cursor-driven TTS engine**
- Architecture: **cursor drives TTS** — the user's WPM controls the cursor, and TTS reads at the cursor's pace
- Implementation:
  - On each word advance (from `useReader` RAF loop), feed the current word (or short phrase) to `speechSynthesis`
  - Chunk strategy: buffer 3-5 words ahead and queue as a single utterance for natural speech flow
  - Each utterance's `rate` is dynamically calculated to match the cursor's pace:
    - Measure the time window for the chunk (number of words × ms per word at current WPM)
    - Set `utterance.rate` so the speech fills that window
    - Rate clamped to speechSynthesis limits (0.1–10.0 on most engines, practically 0.5–3.0)
  - Use `SpeechSynthesisUtterance.onend` to detect when a chunk finishes — if cursor has advanced past it, skip; if cursor hasn't reached the end, let the next chunk handle it
  - Use `onboundary` events for fine-grained word-level sync feedback (optional visual indicator)
- Sync protocol:
  - Cursor is the master clock — TTS follows
  - If TTS falls behind (slow voice at high WPM): cancel current utterance, re-queue from cursor position
  - If TTS gets ahead (fast voice at low WPM): pause TTS, wait for cursor to catch up
  - On pause: `speechSynthesis.pause()`; on resume: `speechSynthesis.resume()`
  - On WPM change: cancel current utterance, re-queue with new rate from cursor position
  - On mode exit: `speechSynthesis.cancel()`
- Voice selection: respect user's voice choice from settings (existing `useNarration` voice picker)
- Works in both Flow and Focus modes — same engine, different visual layers
- Files affected: `src/hooks/useNarration.ts` (major refactor), `src/hooks/useReader.ts` (add TTS callback), `src/components/ReaderView.tsx`, `src/components/ScrollReaderView.tsx`

**22E. TTS settings integration**
- Add TTS section to existing Speed Reading Settings page:
  - Voice picker dropdown (shows system voices, defaults to first English)
  - "Test voice" button — speaks a sample sentence at current settings
  - TTS WPM cap display: "When narration is active, max WPM is 400"
- Persist TTS preferences in `settings.json`:
  - `tts.enabled` (boolean, default false) — last toggle state
  - `tts.voiceURI` (string) — selected voice URI
  - `tts.volume` (number, 0.0–1.0, default 1.0)
- Settings sync via cloud sync engine (existing settings merge handles new fields)
- Files affected: `src/components/settings/SpeedReadingSettings.tsx`, `main/ipc-handlers.js` (settings schema)

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Smooth highlight sliding in Flow mode (22A) | `renderer-fixer` | — |
| 2 | Smooth word transition in Focus mode (22B) | `renderer-fixer` | — |
| 3 | TTS toggle + WPM cap architecture (22C) | `renderer-fixer` | — |
| 4 | Cursor-driven TTS engine (22D) | `renderer-fixer` | Steps 1-3 |
| 5 | TTS settings integration (22E) | `renderer-fixer` | Step 4 |
| 6 | Spec compliance review | `spec-reviewer` | Steps 1-5 |
| 7 | Run all tests + build verification | `test-runner` | Step 6 |

> Steps 1, 2, and 3 are PARALLELIZABLE. Step 4 depends on all three. Step 5 depends on 4. Steps 6-7 are sequential gates.

### Acceptance Criteria

**22A** — [ ] Flow mode highlight glides smoothly between words (no discrete jumping)
**22A** — [ ] Highlight handles line wraps (end-of-line → start-of-next-line) without diagonal teleport
**22A** — [ ] Animation uses GPU-accelerated CSS properties only (`transform`, `opacity`)
**22A** — [ ] At 600 WPM, animation completes within 100ms interval with no stutter
**22A** — [ ] Pause freezes highlight in place; resume continues glide
**22B** — [ ] Focus mode words transition with subtle slide/fade instead of hard swap
**22B** — [ ] ORP pivot character stays anchored during transition
**22B** — [ ] Transition duration ≤ 15% of word display interval at any WPM
**22B** — [ ] Transition disabled at WPM > 500 (too fast to perceive)
**22C** — [ ] TTS toggle visible in bottom bar from Page view only
**22C** — [ ] Toggling TTS ON + entering Focus/Flow caps WPM to 400 (when user's WPM > 400)
**22C** — [ ] Original WPM restores when TTS toggled off or mode exited
**22C** — [ ] `N` keyboard shortcut toggles narration from Page view
**22D** — [ ] TTS reads words synchronized to cursor position in Focus mode
**22D** — [ ] TTS reads words synchronized to cursor position in Flow mode
**22D** — [ ] TTS auto-recovers when voice falls behind cursor (cancel + re-queue)
**22D** — [ ] Pause/resume pauses and resumes both cursor and TTS together
**22D** — [ ] WPM change mid-read re-queues TTS at new rate
**22D** — [ ] Mode exit cancels all speech
**22E** — [ ] Voice picker in Speed Reading Settings shows available system voices
**22E** — [ ] "Test voice" button speaks sample sentence
**22E** — [ ] TTS preferences persist in `settings.json` and sync across devices
**22E** — [ ] `npm test` passes, `npm run build` succeeds

---

## Sprint 25S: Stabilization Sprint

**Goal:** Fix 13 critical bugs to achieve a fully stable reader across all four modes (Page, Focus, Flow, Narration) for both EPUB and non-EPUB formats. Two previously-fixed bugs (S-13, S-15) verified only.

**Prerequisite:** Sprint 22 complete.
**Branch:** `sprint/25s-stabilization`

**Design spec:** `docs/superpowers/specs/2026-03-26-stabilization-sprint-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-03-26-stabilization-sprint.md`

### Phase 1: Critical Blockers (serial) ✅ COMPLETED
- [x] **S-01** — Kokoro AI button unclickable (CSS `-webkit-app-region: no-drag` on `.settings-mode-toggle`) ✅ COMPLETED
- [x] **S-02** — Auto-updater latest.yml missing x64 (single-job multi-arch build, eliminated sed merge) ✅ COMPLETED
- [x] **S-03** — EPUB starts on page ~3 (guard initial CFI, `goToFraction(0)` fallback) ✅ COMPLETED
- [x] **S-04** — False progress on open (engagement-gated progress + high-water mark backtrack prompt) ✅ COMPLETED
- [x] **S-05** — Narrate auto-starts on click (fixed button wiring + added mode deselect) ✅ COMPLETED

### Phase 2: Mode Integrity (parallel tracks) ✅ COMPLETED

**Track A: Foliate DOM (serial, S-10 first)**
- [x] **S-10** — Stale Range objects (re-extract on section change, full-doc word array, Range nulling, shared utilities) ✅ COMPLETED
- [x] **S-09** — Word click wrong position (unified tokenization via shared `segmentWords` using `Intl.Segmenter`) ✅ COMPLETED
- [x] **S-06** — Flow invisible on EPUBs (Range-based overlay cursor via `getOverlayPosition`) ✅ COMPLETED
- [x] **S-07** — Focus not centered (full-viewport `position: fixed` overlay) ✅ COMPLETED
- [x] **S-08** — Narrate highlight doesn't advance (overlay highlight div, removed `<mark>` injection) ✅ COMPLETED

**Track B: Narration UX (parallel with Track A)**
- [x] **S-11** — Page browsing yanks back (decouple on pause + "Return to reading" pill + Enter shortcut) ✅ COMPLETED
- [x] **S-12** — Speed changes delayed (generation ID guard for Kokoro, pre-buffer invalidation) ✅ COMPLETED
- [x] **S-14** — Time-to-complete ignores mode (uses `TTS_RATE_BASELINE_WPM` constant for narration) ✅ COMPLETED

### Verified (no implementation — confirm in Phase 4)
- [x] **S-13** — TTS rate slider synced between bottom bar and flap (fixed prior session)
- [x] **S-15** — Kokoro page-turn pause (fixed prior session, pre-buffer crosses pages, rhythm pauses tuned)

### Acceptance Criteria
- [x] `npm test` passes (522 tests across 24 files)
- [x] `npm run build` succeeds
- [ ] V-01 through V-15 manual verification matrix passes (pending smoke test)
- [ ] I-01 through I-06 integration tests pass (pending smoke test)
- [ ] No console errors during EPUB reading across 3+ sections (pending smoke test)
- [ ] All four modes work identically for EPUB and non-EPUB content (pending smoke test)

---

## Sprint 23: V1 Hardening

**Goal:** Everything that stands between the current app and a confident v1.0.0 release. First-run experience, error recovery, constants extraction, accessibility audit on new components, performance baselines, and the manual auto-update E2E verification.

**Prerequisite:** Sprint 22 complete (TTS adds new UI components that need a11y audit).

**Context:** The app is feature-rich but hasn't been polished for first-time users or edge-case failures. No performance baselines exist. Constants are still scattered. The 11 new components from Sprint 20/21 haven't been audited for WCAG 2.1 AA. The auto-update pipeline has never been tested end-to-end.

### Spec

**23A. First-run onboarding experience**
- Detect first launch: check for absence of `settings.json` or a `firstRunCompleted` flag
- Welcome screen (full-window overlay):
  - Blurby branding (logo, tagline)
  - Brief intro: "Blurby helps you read faster and remember more"
  - "Get Started" button
- Sample document pre-loaded:
  - Include a public-domain classic (e.g., opening chapter of a Dickens novel, or a Thoreau essay — confirm no copyright concern)
  - Pre-loaded into library on first run so the user sees content immediately
  - Document title clearly marked as "[Sample] ..."
- Guided tooltips (3-step tour):
  1. Point to library → "Your reading library — add documents here"
  2. Point to a document card → "Click to open in Page view"
  3. Point to mode buttons in bottom bar → "Switch between Focus (speed reading) and Flow (guided scroll)"
- Tooltip implementation: simple overlay with arrow pointing to target, "Next" / "Skip" buttons
- Set `firstRunCompleted: true` in settings after tour completion or skip
- Files affected: new `src/components/OnboardingOverlay.tsx`, `src/components/App.tsx`, `main/ipc-handlers.js` (settings schema)

**23B. Error recovery UX pass**
- Audit every error boundary and catch block for user-facing quality
- Specific scenarios to handle gracefully:
  - **PDF parse failure**: Show toast "Could not read this PDF — the file may be encrypted or corrupted" + "Try Again" / "Remove" options
  - **EPUB extraction failure**: Show specific error (missing content.opf, corrupted ZIP, etc.)
  - **URL import failure**: "Could not extract article from this URL" + "Open in browser" fallback
  - **Cloud sync conflict**: Show conflict resolution dialog (already exists from Sprint 17, verify it still works post-Sprint 19)
  - **WebSocket disconnect** (Chrome ext → desktop): Extension popup shows "Reconnecting..." with spinner, auto-retry 3x
  - **Network failure during sync**: Toast "Sync paused — will retry when online" with offline indicator
  - **File watcher permission error**: "Can't watch this folder — check permissions" with folder path
- Each error should have: clear message (no technical jargon), actionable suggestion, retry option where applicable
- Add error logging to `error.log` for all caught errors (already exists from Sprint 9, verify coverage)
- Files affected: multiple components (audit-driven), `src/styles/global.css` (error toast styles)

**23C. Constants extraction (AF-001)**
- Create `src/constants.ts` for renderer constants:
  - `MIN_WPM`, `MAX_WPM`, `WPM_STEP`, `DEFAULT_WPM`
  - `INITIAL_PAUSE_MS`, `PUNCTUATION_PAUSE_MS`
  - `REWIND_WORDS`, `FOCUS_TEXT_SIZE_STEP`
  - `DEFAULT_WORDS_PER_FLOW_PAGE`
  - `SNOOZE_INTERVALS` (array of durations)
  - `TOAST_DURATION_MS`, `COACHING_TOAST_LIMIT`
  - `TTS_WPM_CAP`, `TTS_TRANSITION_DISABLE_WPM` (from Sprint 22)
  - `G_SEQUENCE_TIMEOUT_MS` (2000ms for keyboard G-sequences)
  - `SEARCH_DEBOUNCE_MS`
- Create `main/constants.js` for main process constants:
  - `LRU_CACHE_SIZE`
  - `SYNC_INTERVAL_MS`, `SYNC_RETRY_DELAY_MS`
  - `TOMBSTONE_TTL_MS`, `RECONCILIATION_PERIOD_MS`
  - `SAVE_THROTTLE_MS`, `SAVE_THROTTLE_WORDS`
  - `WS_PORT` (WebSocket port for Chrome extension)
  - `PAIRING_TOKEN_LENGTH`
  - `MAX_DOCUMENT_SIZE_BYTES`
- Update all source files to import from the new constants files instead of hardcoding
- CSS custom properties in `global.css` are exempt (already centralized)
- Files affected: new `src/constants.ts`, new `main/constants.js`, all files that currently define inline constants

**23D. Accessibility audit on Sprint 20/21 components**
- Components to audit (added after Sprint 15 a11y pass):
  - `CommandPalette.tsx` — keyboard nav, ARIA role=dialog, search input labeling
  - `ShortcutsOverlay.tsx` — ARIA role=dialog, close on Escape
  - `GoToIndicator.tsx` — ARIA live region for position announcements
  - `SnoozePickerOverlay.tsx` — ARIA role=dialog, time picker accessibility
  - `TagPickerOverlay.tsx` — ARIA role=dialog, listbox pattern for tag selection
  - `HighlightsOverlay.tsx` — ARIA role=dialog, list navigation
  - `QuickSettingsPopover.tsx` — ARIA role=menu, focus trapping
  - `NotePopover.tsx` — ARIA role=dialog, textarea labeling
  - `HotkeyCoach.tsx` — ARIA role=status (live region), auto-dismiss timing
  - `ReaderBottomBar.tsx` — ARIA labels on all icon buttons, slider accessibility
  - `PageReaderView.tsx` — reading region labeling, word selection ARIA
- For each component verify:
  - Proper ARIA roles and labels
  - Keyboard navigation (Tab, Escape, Enter, Arrow keys as appropriate)
  - Focus trapping in overlays/dialogs
  - Screen reader announcement of state changes
  - Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
  - Reduced motion respected (`prefers-reduced-motion`)
- Files affected: all 11 listed components, `src/styles/global.css`

**23E. Performance baselines**
- Create a performance benchmark script (`tests/perf-baseline.js`) that measures:
  - **Startup time**: app launch → first paint → interactive (library visible)
  - **Document open time**: click document → reader view rendered (for TXT, EPUB, PDF at various sizes)
  - **Memory usage**: RSS at startup, after opening 1/5/20 documents, after 30-minute reading session
  - **Word advance latency**: time from RAF callback to DOM update in Focus mode (target: < 2ms)
  - **Scroll performance**: FPS during Flow mode at various WPM (target: 60fps)
  - **Sync cycle time**: full sync cycle duration (local → cloud → resolve → apply)
- Output results to `tests/perf-baseline-results.json` with timestamps for tracking over time
- Establish pass/fail thresholds:
  - Startup to interactive: < 3s (cold), < 1.5s (warm)
  - Document open (50k words): < 500ms
  - Word advance latency: < 2ms (p99)
  - Flow mode FPS: > 55fps sustained
- Files affected: new `tests/perf-baseline.js`, `package.json` (add `npm run perf` script)

**23F. Auto-update E2E verification**
- Manual test procedure (documented in `docs/testing/auto-update-e2e.md`):
  1. Tag `v0.9.9-test` → CI builds → install the resulting .exe
  2. Tag `v0.9.10-test` → CI builds → verify the installed app detects and applies the update
  3. Verify delta update (blockmap) is used (smaller download than full installer)
  4. Verify Settings > Help shows "Update available" → "Downloading" → "Restart to update"
  5. After restart, verify version number updated in Settings > Help
- Document results and any issues found
- Files affected: new `docs/testing/auto-update-e2e.md`

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | First-run onboarding (23A) | `renderer-fixer` | — |
| 2 | Error recovery UX audit + fixes (23B) | `renderer-fixer` + `electron-fixer` | — |
| 3 | Constants extraction (23C) | `renderer-fixer` + `electron-fixer` | — |
| 4 | Accessibility audit (23D) | `renderer-fixer` | Steps 1 (new components need audit too) |
| 5 | Performance baseline script (23E) | `perf-auditor` | — |
| 6 | Auto-update E2E doc (23F) | `doc-keeper` | — |
| 7 | Spec compliance review | `spec-reviewer` | Steps 1-6 |
| 8 | Run all tests + build | `test-runner` | Step 7 |

> Steps 1, 2, 3, 5, and 6 are PARALLELIZABLE. Step 4 depends on 1. Steps 7-8 are sequential gates.

### Acceptance Criteria

**23A** — [x] First launch shows welcome screen with branding and "Get Started" ✅ COMPLETED
**23A** — [x] Sample public-domain document pre-loaded in library on first run ✅ COMPLETED
**23A** — [x] 3-step tooltip tour points to library, document card, mode buttons ✅ COMPLETED
**23A** — [x] Tour can be skipped; `firstRunCompleted` flag prevents re-showing ✅ COMPLETED
**23B** — [x] PDF parse failure shows user-friendly toast with "Try Again" / "Remove" ✅ COMPLETED
**23B** — [x] URL import failure shows "Open in browser" fallback ✅ COMPLETED
**23B** — [x] Sync conflict shows resolution dialog ✅ COMPLETED
**23B** — [x] Network failure shows "Sync paused — will retry when online" ✅ COMPLETED
**23B** — [x] All caught errors logged to `error.log` ✅ COMPLETED
**23C** — [x] `src/constants.ts` contains all renderer constants (no inline magic numbers remain) ✅ COMPLETED
**23C** — [x] `main/constants.js` contains all main process constants ✅ COMPLETED
**23C** — [x] All source files import from constants files instead of hardcoding ✅ COMPLETED
**23D** — [x] All 11 Sprint 20/21 components pass WCAG 2.1 AA audit ✅ COMPLETED
**23D** — [x] Keyboard navigation works in all overlays/dialogs ✅ COMPLETED
**23D** — [x] Screen reader announcements verified for state changes ✅ COMPLETED
**23D** — [x] `prefers-reduced-motion` respected in all new components ✅ COMPLETED
**23E** — [x] `npm run perf` produces `perf-baseline-results.json` with all 6 metrics ✅ COMPLETED
**23E** — [x] Startup to interactive < 3s (cold start) ✅ COMPLETED (manual procedure documented)
**23E** — [x] Word advance latency < 2ms (p99) ✅ COMPLETED
**23E** — [x] Flow mode FPS > 55fps sustained ✅ COMPLETED (manual procedure documented)
**23F** — [x] Auto-update E2E test procedure documented in `docs/testing/` ✅ COMPLETED
**23F** — [x] `npm test` passes, `npm run build` succeeds ✅ COMPLETED (639 tests, 29 files)


## Sprint TH-1: Narration Test Hardening

**Goal:** Add 80-120 new tests for the narration pipeline — the highest complexity-to-coverage ratio in the codebase. Tests only, no production code changes.

**Branch:** `sprint/th1-narration-tests` | **Tier:** Quick (tests only)

### KEY CONTEXT
Three critical narration bugs were found and fixed during manual testing on 2026-03-28: (1) handleSelectMode didn't start modes (LL-042), (2) NarrateMode.destroy() race condition corrupted shared hook state (LL-043), (3) Kokoro inFlight guard blocked re-dispatch after speed change (LL-044). All three required multi-hour debugging sessions because the narration pipeline had no integration-level test coverage — only shallow unit tests for pure functions. The existing `useNarration.test.ts` tests (30 tests) only cover rate clamping, voice selection, text slicing, and simple state boolean toggling. Zero tests cover the critical async paths: strategy dispatch, IPC result handling, stale generation detection, chunk chaining, pre-buffering, destroy lifecycle, or the reducer state machine under concurrent transitions.

### PROBLEM
The narration subsystem has the highest complexity-to-test-coverage ratio in the codebase. Five files with zero or near-zero test coverage form the core of a multi-layered async pipeline:

1. **`narrationReducer`** (`src/types/narration.ts`) — 17-action state machine with guard conditions (PAUSE only from speaking, RESUME from paused/holding). Zero reducer tests exist.
2. **`createKokoroStrategy`** (`src/hooks/narration/kokoroStrategy.ts`) — Async IPC + pre-buffer + stale generation detection + inFlight guard + fallback-to-web path. Zero tests.
3. **`createWebSpeechStrategy`** (`src/hooks/narration/webSpeechStrategy.ts`) — SpeechSynthesis API wrapper with word boundary tracking. Zero tests.
4. **`audioPlayer`** (`src/utils/audioPlayer.ts`) — Web Audio API PCM playback with time-based word advance estimation. Zero tests.
5. **`findSentenceBoundary`** (`src/hooks/useNarration.ts`) — Chunk boundary logic with page-end awareness. Zero tests.
6. **Mode lifecycle** — NarrateMode.destroy() must NOT stop shared narration (LL-043). Only 1 test covers this (added during fix). No tests cover the full mode switch sequence (stop old → start new → destroy old fires late).

### EVIDENCE OF PROBLEM
- **LL-042**: handleSelectMode bug went undetected because no test verified that mode button click → mode start.
- **LL-043**: NarrateMode.destroy race condition caused Kokoro IPC results to be silently discarded. Console showed `status: idle` despite valid audio (165600 samples). No test simulated the useEffect cleanup timing.
- **LL-044**: Speed change during playback caused permanent stall. `genId mismatch` → `inFlight: true` deadlock. No test covered the speed-change-during-generation path.
- `useNarration.test.ts` line 120-162: "speaking state transitions" tests just toggle booleans — they don't test the actual reducer or any async flow.
- `modes.test.ts` NarrateMode section has 10 tests, all synchronous. None test the async interplay between NarrateMode and its NarrationInterface dependency.

### HYPOTHESIZED SOLUTION
Five test files targeting the five untested layers, plus integration tests for the cross-layer interactions that caused the three bugs. All tests run in Vitest (no Electron needed) using mocks for Web Audio API, SpeechSynthesis, and IPC. Estimated 80-120 new tests.

### Workstreams

| ID | Task | Agent | Model |
|----|------|-------|-------|
| TH-1A | `tests/narrationReducer.test.ts` — all 17 actions, guard conditions, SET_SPEED generationId increment, STOP reset | `renderer-fixer` | sonnet |
| TH-1B | `tests/findSentenceBoundary.test.ts` — sentence endings, extended scan, pageEnd boundary, no-boundary fallback, empty/single-word edge cases | `renderer-fixer` | sonnet |
| TH-1C | `tests/kokoroStrategy.test.ts` — happy path, stale genId re-dispatch, inFlight guard, pre-buffer hit/miss, fallback-to-web on IPC error, status=idle discard | `renderer-fixer` | sonnet |
| TH-1D | `tests/webSpeechStrategy.test.ts` — speakChunk creates utterance, word boundary counting, onend chains onEnd, onerror chains onError, stop cancels | `renderer-fixer` | sonnet |
| TH-1E | `tests/audioPlayer.test.ts` — playBuffer creates AudioContext + source, word timer fires at intervals, stop clears timer + source, pause/resume suspend/resume context, isPlaying reflects state | `renderer-fixer` | sonnet |
| TH-1F | `tests/narrationIntegration.test.ts` — mode switch destroy-race (LL-043 regression), speed change during generation (LL-044 regression), chunk chaining across page boundaries, engine fallback kokoro→web | `renderer-fixer` | sonnet |
| TH-1G | Expand `tests/modes.test.ts` NarrateMode section — updateWords during playback, getTimeRemaining accuracy, destroy-then-resume no-op safety | `renderer-fixer` | sonnet |

### Agent Assignments

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | All 7 test files (TH-1A through TH-1G). Must mock Web Audio API (AudioContext, AudioBufferSourceNode), SpeechSynthesis API, and `window.electronAPI.kokoroGenerate` IPC. Use `vi.fn()` for all external APIs. Use `vi.useFakeTimers()` for time-dependent tests. |
| `test-runner` | haiku | Full test + build verification |
| `doc-keeper` | sonnet | Post-sprint documentation updates |

### Execution Order

```
[1–2] PARALLEL (pure function tests, no shared dependencies):
    ├─ [1] narrationReducer tests (renderer-fixer)
    └─ [2] findSentenceBoundary tests (renderer-fixer)
    ↓ (both complete)
[3–5] PARALLEL (strategy + player tests, independent modules):
    ├─ [3] kokoroStrategy tests (renderer-fixer)
    ├─ [4] webSpeechStrategy tests (renderer-fixer)
    └─ [5] audioPlayer tests (renderer-fixer)
    ↓ (all complete)
[6–7] PARALLEL (integration + mode expansion, depend on understanding from 1-5):
    ├─ [6] narrationIntegration tests (renderer-fixer)
    └─ [7] modes.test.ts NarrateMode expansion (renderer-fixer)
    ↓ (all complete)
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### Read Order
1. `CLAUDE.md` — System state, test policy, standing rules
2. `docs/governance/LESSONS_LEARNED.md` — LL-042, LL-043, LL-044 (the three bugs these tests must prevent)
3. `src/types/narration.ts` — Reducer + state machine + TtsStrategy interface (TH-1A target)
4. `src/hooks/narration/kokoroStrategy.ts` — KokoroStrategyDeps, async IPC flow (TH-1C target)
5. `src/hooks/narration/webSpeechStrategy.ts` — SpeechSynthesis wrapper (TH-1D target)
6. `src/utils/audioPlayer.ts` — Web Audio API playback (TH-1E target)
7. `src/hooks/useNarration.ts` — findSentenceBoundary, speakNextChunk (TH-1B, TH-1F targets)
8. `src/modes/NarrateMode.ts` — Mode lifecycle, destroy behavior (TH-1G target)
9. `tests/modes.test.ts` — Existing NarrateMode tests (extend, don't duplicate)
10. `tests/useNarration.test.ts` — Existing shallow tests (reference for patterns)

### Additional Guidance
- **Mock patterns for Web Audio API**: Create a `MockAudioContext` class with `createBuffer`, `createBufferSource`, `suspend`, `resume`, `state` property, and `destination`. `AudioBufferSourceNode` mock needs `connect`, `start`, `stop`, `onended`, and `buffer` property. Register on `globalThis` before each test.
- **Mock patterns for SpeechSynthesis**: Create a mock `speechSynthesis` on `window` with `speak`, `cancel`, `pause`, `resume`, `getVoices`. `SpeechSynthesisUtterance` mock needs `onboundary`, `onend`, `onerror`, `rate`, `voice` properties.
- **Mock pattern for Kokoro IPC**: Set `window.electronAPI = { kokoroGenerate: vi.fn() }`. Return `{ audio: new Float32Array(24000), sampleRate: 24000, durationMs: 1000 }` for success, `{ error: "model not found" }` for failure.
- **Regression tests MUST name their LL**: Each regression test should reference the LL entry, e.g., `it("LL-043: destroy does not corrupt status during async IPC", ...)`.
- **KokoroStrategy async testing**: The speakChunk method fires an async IIFE. Tests must `await` the next microtask tick to let the IPC promise resolve before asserting.
- **inFlight deadlock test (LL-044)**: Key scenario: (a) speakChunk starts, sets inFlight=true, (b) IPC returns, genId doesn't match, (c) old code path called onStaleGeneration BEFORE setInFlight(false). Test must verify inFlight is false AND onStaleGeneration was called.
- **Destroy race test (LL-043)**: Simulate useEffect cleanup: (a) new mode starts (calls startCursorDriven), (b) old mode destroy fires (must NOT call narration.stop), (c) IPC returns — status must still be "speaking", not "idle".
- **No production code changes in this sprint.** Tests only. If a test reveals production code needs modification for testability, note it in AGENT_FINDINGS.md but do not modify source.

### Acceptance Criteria
1. `tests/narrationReducer.test.ts` exists with ≥20 tests covering all 17 action types + guard conditions
2. `tests/findSentenceBoundary.test.ts` exists with ≥10 tests
3. `tests/kokoroStrategy.test.ts` exists with ≥15 tests
4. `tests/webSpeechStrategy.test.ts` exists with ≥8 tests
5. `tests/audioPlayer.test.ts` exists with ≥10 tests
6. `tests/narrationIntegration.test.ts` exists with ≥8 tests
7. `tests/modes.test.ts` NarrateMode section expanded by ≥3 tests
8. Total new tests: ≥80
9. All regression tests reference the LL entry they prevent
10. `npm test` passes (all existing 764 + new ≥80 = ≥844 total), `npm run build` succeeds
11. No production code modified — tests only
12. Branch `sprint/th1-narration-tests` merged to main with `--no-ff`

---

---

## Archived 2026-03-29 — NAR-2 through HOTFIX-6

## Sprint NAR-2 [v1.2.0]: TTS Pipeline Redesign — Zero-Latency Narration

**Goal:** Replace the callback-chain audio pipeline with a pre-scheduled Web Audio pipeline. Geometric chunk ramp-up for ≤1s cold start, crossfade splicing for zero dead air, AudioContext.currentTime word timer for drift-free highlights, PCM disk cache for instant replay, hybrid speed via playbackRate (1.5x cap). Foliate-drives-narration unchanged (Phase 2 scope).

**Design spec:** `docs/superpowers/specs/2026-03-29-tts-pipeline-redesign-design.md`
**Branch:** `sprint/nar2-tts-pipeline` | **Tier:** Full (architecture change + new files)

### KEY CONTEXT

NAR-1 delivered rolling audio queue and smart pause heuristics (841 tests). HOTFIX-4/4B fixed pause slider disconnection, chunk splitting on abbreviations, highlight drift at >1x, and resume latency. Despite these fixes, the fundamental architecture has structural limits: `onended` callback-driven handover creates 5-20ms dead air at chunk boundaries, word highlighting uses setTimeout with cumulative drift at >1x, speed changes flush the entire queue and regenerate, and cold start is ~2-3s per chunk. This sprint replaces the audio pipeline while keeping the foliate integration unchanged.

### PROBLEM

1. **5-20ms dead air at chunk boundaries.** `onended` fires → create buffer → `source.start(0)` introduces callback latency. Audible as micro-gaps in continuous narration.
2. **Cumulative word-highlight drift at >1x speed.** setTimeout-based timer accumulates error. At 1.3x over a 148-word chunk, highlight can lag by 200-400ms.
3. **~2-3s cold start per chunk.** Fixed 40-word chunk size means every chunk takes the same generation time regardless of pipeline state.
4. **Queue flush on speed change.** Changing speed discards all pre-generated audio and regenerates from scratch. 3-5s interruption.
5. **No disk cache.** Returning to a previously-narrated book re-generates everything from the Kokoro worker.

### EVIDENCE OF PROBLEM

- `src/utils/audioQueue.ts` lines 185-195: `onended` → `consumeNext()` callback chain
- `src/constants.ts` line 64: `TTS_CHUNK_SIZE = 40` (fixed, no ramp-up)
- `src/constants.ts` line 66: `TTS_MAX_RATE = 2.0` (will be capped to 1.5)
- `src/hooks/useNarration.ts`: setTimeout-based word timer with no self-correction
- HOTFIX-4B user reports: "Still a significant pause between pause and resume", "Highlight is falling well behind narration at 1.3x speed"

### HYPOTHESIZED SOLUTION

Five workstreams aligned with the design spec sections:

- **NAR-2A: Progressive chunk sizing** — Geometric ramp-up formula: `min(13 × (0.95 × R)^n, 148)`. Cold start chunk (13 words) generates in ≤1s. Cruise chunks (148 words) by iteration 3.
- **NAR-2B: Pre-scheduled playback + crossfade** — Replace `onended` chain with `source.start(nextStartTime)`. 8ms linear crossfade at boundaries. `audioCtx.suspend()/resume()` for pause.
- **NAR-2C: Self-correcting word timer** — AudioContext.currentTime-based timer. Pre-compute word boundaries as absolute times at schedule time. Single setTimeout loop self-corrects on each tick.
- **NAR-2D: PCM disk cache** — Main process writes raw Float32Array to `userData/tts-cache/{bookId}/{voiceId}/chunk-{startIdx}.pcm`. Manifest tracks chunks per book. Cache hit skips Kokoro entirely.
- **NAR-2E: Hybrid speed change + warm AudioContext** — Generate at 1.0x, apply `playbackRate` at playback time. Single cache per voice for all speeds. AudioContext created on book open (not first play). Predictive pre-gen on book open.

### EVIDENCE FOR HYPOTHESIS

- Web Audio `source.start(when)` is sample-accurate by spec — eliminates callback latency entirely
- `AudioContext.currentTime` is monotonic and hardware-synced — no JS timer drift
- Geometric ramp-up math verified in design spec §1: headroom grows each iteration, producer ahead permanently after chunk 3
- `playbackRate` on AudioBufferSourceNode is instantaneous — no queue flush needed
- `audioCtx.suspend()/resume()` freezes all scheduled nodes atomically — simpler than current multi-state pause logic

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Create `src/utils/audioScheduler.ts` — pre-scheduled playback engine with crossfade, word timer, pause/resume via AudioContext suspend/resume | renderer-fixer | sonnet |
| 2 | Create `src/utils/generationPipeline.ts` — producer with progressive chunk sizing, IPC queue pipelining, ramp-up sequence | renderer-fixer | sonnet |
| 3 | Create `src/utils/ttsCache.ts` — renderer-side cache interface (request cached chunks from main, receive ArrayBuffers) | renderer-fixer | sonnet |
| 4 | Create `main/tts-cache.js` — disk cache writer, manifest CRUD, chunk read/write, eviction, startup cleanup | electron-fixer | sonnet |
| 5 | Update `main/tts-worker.js` — Transferable postMessage for PCM Float32Array (zero-copy) | electron-fixer | sonnet |
| 6 | Update `main/tts-engine.js` — Transferable transfer from worker, forward ArrayBuffer to renderer | electron-fixer | sonnet |
| 7 | Add cache IPC handlers to `main/ipc/tts.js` — `tts-cache-read`, `tts-cache-write`, `tts-cache-evict`, `tts-cache-manifest` | electron-fixer | sonnet |
| 8 | Update `preload.js` — expose cache IPC channels via electronAPI | electron-fixer | sonnet |
| 9 | Update `src/hooks/useNarration.ts` — wire to new generationPipeline + audioScheduler, remove old chunk dispatch and setTimeout timer | renderer-fixer | sonnet |
| 10 | Update `src/hooks/narration/kokoroStrategy.ts` — adapt to new pipeline interface (progressive chunk requests) | renderer-fixer | sonnet |
| 11 | Update `src/components/ReaderContainer.tsx` — AudioContext warm-up on book open, predictive pre-gen, cache-aware playback init | renderer-fixer | sonnet |
| 12 | Update `src/constants.ts` — add NAR-2 constants (TTS_COLD_START_CHUNK_WORDS, TTS_CRUISE_CHUNK_WORDS, TTS_CROSSFADE_MS, etc.), update TTS_MAX_RATE to 1.5 | renderer-fixer | sonnet |
| 13 | Update `main/constants.js` — add TTS_CACHE_SUBDIR, TTS_CACHE_MAX_MB, TTS_GENERATION_MAX_RETRIES | electron-fixer | sonnet |
| 14 | Update `src/components/settings/TTSSettings.tsx` — cap speed slider max at 1.5x | renderer-fixer | sonnet |
| 15 | Update `src/test-harness/electron-api-stub.ts` — add stubs for cache IPC channels | renderer-fixer | sonnet |
| 16 | Retire or gut `src/utils/audioQueue.ts` — replaced by audioScheduler (keep file if referenced, remove internals) | renderer-fixer | sonnet |
| 17 | Write unit tests: progressive chunk sizing formula at 1.0x/1.3x/1.5x, crossfade sample math, cache key format, word timer self-correction, hybrid speed recalculation | renderer-fixer | sonnet |
| 18 | Write integration tests: cache lifecycle (write → read → verify), manifest consistency after simulated crash, voice change full eviction, Transferable transfer verification | electron-fixer | sonnet |
| 19 | Run `npm test` — all 841+ tests pass, 0 failures | test-runner | haiku |
| 20 | Run `npm run build` — clean build, no TypeScript errors | test-runner | haiku |
| 21 | Update `docs/governance/LESSONS_LEARNED.md` with discoveries | doc-keeper | sonnet |
| 22 | Update `CLAUDE.md` — architecture section (new files), feature status, test counts | doc-keeper | sonnet |
| 23 | Bump `package.json` to `1.2.0` | blurby-lead | opus |
| 24 | Git: commit on branch `sprint/nar2-tts-pipeline`, merge to main with `--no-ff` | blurby-lead | opus |
| 25 | Print terminal summary: old pipeline vs new pipeline comparison, latency targets, test count, cache structure | blurby-lead | opus |

### WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules, architecture overview, test policy
2. `ROADMAP.md` §Sprint NAR-2 — This spec
3. `docs/superpowers/specs/2026-03-29-tts-pipeline-redesign-design.md` — **Full design spec with all architecture details, data flows, formulas, and edge cases. This is the primary reference.**
4. `docs/governance/LESSONS_LEARNED.md` — TTS-related anti-patterns, known traps
5. `src/utils/audioQueue.ts` — Current audio pipeline (being replaced). Understand consumer/producer pattern, onended chain, pause/resume logic.
6. `src/hooks/useNarration.ts` — Current narration hook. Understand state machine, chunk dispatch, word timer, mode transitions.
7. `src/hooks/narration/kokoroStrategy.ts` — Kokoro TTS strategy interface. Understand how chunks are requested and audio returned.
8. `src/components/ReaderContainer.tsx` — Narration wiring point. Understand how useNarration connects to reader modes.
9. `main/tts-engine.js` — Main-process TTS engine. Understand worker communication, PCM handling.
10. `main/tts-worker.js` — Kokoro worker thread. Understand generation pipeline, current postMessage serialization.
11. `main/ipc/tts.js` — Current TTS IPC handlers.
12. `preload.js` — Current electronAPI surface for TTS.
13. `src/constants.ts` — All TTS constants (lines 64-88, 197, 241-243, 299-303).
14. `main/constants.js` — Main process constants.

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read spec + design doc, dispatch agents in sequence, verify each deliverable against design spec, git merge, terminal summary |
| renderer-fixer | sonnet | New renderer files (audioScheduler, generationPipeline, ttsCache), update useNarration, kokoroStrategy, ReaderContainer, constants, TTSSettings, test harness stub, retire audioQueue, write renderer unit tests |
| electron-fixer | sonnet | New main file (tts-cache.js), update tts-worker, tts-engine, ipc/tts, preload, main constants, write main-process integration tests |
| test-runner | haiku | Run `npm test` + `npm run build` after all implementation |
| doc-keeper | sonnet | LESSONS_LEARNED, CLAUDE.md updates |

**Execution mode notes:**
- All IPC and main-process work (steps 4-8, 13) can run in parallel with renderer work (steps 1-3) — no shared files.
- Steps 9-11 (useNarration, kokoroStrategy, ReaderContainer) depend on steps 1-3 (new files they import) AND steps 7-8 (IPC surface they call). Must be sequential after both groups complete.
- Long-running test suite — run directly in bash, not through sub-agents.

### WHEN (Execution Order)

```
[1-3] PARALLEL (new renderer files, no shared deps):
    ├─ [1] audioScheduler.ts (renderer-fixer)
    ├─ [2] generationPipeline.ts (renderer-fixer)
    └─ [3] ttsCache.ts (renderer-fixer)
    ↓
[4-8] PARALLEL (main-process files, independent of renderer internals):
    ├─ [4] main/tts-cache.js (electron-fixer)
    ├─ [5] tts-worker.js Transferable (electron-fixer)
    ├─ [6] tts-engine.js Transferable (electron-fixer)
    ├─ [7] ipc/tts.js cache handlers (electron-fixer)
    └─ [8] preload.js cache surface (electron-fixer)
    ↓ (1-3 AND 7-8 complete — renderer files exist + IPC surface ready)
[9-11] SEQUENTIAL (wiring — imports new modules + calls new IPC):
    [9] useNarration.ts (renderer-fixer)
    ↓
    [10] kokoroStrategy.ts (renderer-fixer)
    ↓
    [11] ReaderContainer.tsx (renderer-fixer)
    ↓
[12-16] PARALLEL (independent updates):
    ├─ [12] constants.ts (renderer-fixer)
    ├─ [13] main/constants.js (electron-fixer)
    ├─ [14] TTSSettings.tsx speed cap (renderer-fixer)
    ├─ [15] electron-api-stub.ts cache stubs (renderer-fixer)
    └─ [16] Retire audioQueue.ts (renderer-fixer)
    ↓ (all complete)
[17-18] PARALLEL (tests):
    ├─ [17] Renderer unit tests (renderer-fixer)
    └─ [18] Main integration tests (electron-fixer)
    ↓
[19-20] SEQUENTIAL:
    [19] npm test (test-runner)
    ↓
    [20] npm run build (test-runner)
    ↓
[21-22] PARALLEL (docs):
    ├─ [21] LESSONS_LEARNED (doc-keeper)
    └─ [22] CLAUDE.md (doc-keeper)
    ↓
[23-24] SEQUENTIAL:
    [23] Bump package.json to 1.2.0 (blurby-lead)
    ↓
    [24] Git commit + merge (blurby-lead)
    ↓
[25] Terminal summary (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Design spec is authoritative.** The full design doc at `docs/superpowers/specs/2026-03-29-tts-pipeline-redesign-design.md` has all formulas, data flows, constants, edge cases, and error handling. Read it completely before starting any implementation. This ROADMAP spec is the dispatch — the design doc is the payload.
- **audioScheduler.ts is the hardest file.** Pre-scheduled playback with crossfade, word timer, and suspend/resume. Get this right first. Key invariant: `nextStartTime` must always be updated BEFORE scheduling, and crossfade overlap must be subtracted from each chunk's scheduled duration.
- **Crossfade math:** At 24kHz, 8ms = 192 samples. Last 192 samples of chunk N ramp down (1.0→0.0 linear). First 192 samples of chunk N+1 ramp up (0.0→1.0). Additive overlap. Apply to the Float32Array BEFORE creating AudioBuffer.
- **Transferable transfer is zero-copy.** After `postMessage(buffer, [buffer.buffer])`, the source ArrayBuffer is detached. Do NOT reference it after transfer. Workers and main process must handle detached buffers gracefully.
- **Cache key uses section-local word index.** Phase 1 retains foliate section-scoped word arrays. Cache key is `{bookId}/{voiceId}/chunk-{startIdx}.pcm` where startIdx is into the current section. This means cache keys are section-dependent — if the user jumps to a different section, different cache keys apply.
- **Manifest cleanup on startup.** Check for orphan .pcm files (exist on disk, not in manifest) and zero-byte files. Delete them. This handles app-quit-during-write scenarios.
- **Web Speech fallback preserved.** If Kokoro generation fails after 1 retry, fall back to the existing Web Speech API path for that chunk range. The audioScheduler must handle mixed-quality audio gracefully.
- **AudioContext warm-up timing.** Create AudioContext on book open, not on narration start. This eliminates ~50-200ms audio driver wake-up latency. On book close, close the AudioContext to free resources.
- **Do NOT modify foliate integration.** Section loading, word extraction, page advance — all unchanged. Narration still receives words from foliate's per-section extraction. The foliate inversion is Phase 2 (NAR-3).
- **Speed cap enforcement.** Update TTS_MAX_RATE from 2.0 to 1.5. Update the speed slider max in TTSSettings.tsx. Update any clamping logic in adjustRate().
- **Branch:** `sprint/nar2-tts-pipeline`. Merge to main with `--no-ff`. Delete branch after merge.

### SUCCESS CRITERIA

1. Cold start (uncached book): audio plays within ≤1s of pressing play
2. No audible gaps between chunks — crossfade splice eliminates dead air
3. Word highlight stays within ±50ms of spoken word at 1.0x, 1.3x, and 1.5x over a 148-word chunk
4. Speed change mid-playback: no interruption, no queue flush, playbackRate applied instantly
5. Pause/resume: `audioCtx.suspend()/resume()` — instant, no state reset, no re-scheduling
6. PCM disk cache: returning to a previously-narrated book plays audio instantly (no Kokoro generation)
7. Cache invalidation: voice change evicts book cache; speed change does NOT invalidate cache
8. Manifest tracks all cached chunks; startup cleanup removes orphan/zero-byte files
9. `TTS_MAX_RATE` = 1.5 enforced in constants, slider, and adjustRate()
10. Predictive pre-gen: opening a book pre-generates chunk 1 in background before play pressed
11. AudioContext created on book open (warm), closed on book close
12. Transferable transfer: PCM moves worker→main→renderer without Array.from() serialization
13. Web Speech fallback fires on Kokoro failure after 1 retry (existing path preserved)
14. `audioQueue.ts` internals removed or file deleted — no dead code
15. Test harness stubs added for all new IPC channels
16. ≥20 new tests covering: chunk sizing formula, crossfade math, cache key format, word timer, speed recalc, cache lifecycle, manifest cleanup, voice eviction
17. All 860+ tests pass (841 existing + new), 0 failures
18. Clean `npm run build`, no TypeScript errors
19. `package.json` version bumped to `1.2.0`
20. Branch `sprint/nar2-tts-pipeline` merged to main with `--no-ff`

---

## Sprint NAR-3 [v1.3.0]: Foliate Inversion — Narration-Drives-Display

**Goal:** Decouple narration from foliate's section-by-section rendering. Build a full-book word stream via eager section loading, invert the control flow so narration drives page advancement, and eliminate the ~300ms section-transition pause.

**Design spec:** `docs/superpowers/specs/2026-03-29-tts-pipeline-redesign-design.md` §Future Work — Phase 2
**Prerequisite:** NAR-2 complete (new audio pipeline operational)
**Branch:** `sprint/nar3-foliate-inversion` | **Tier:** Full (architecture change)

### PROBLEM

Phase 1 (NAR-2) retains foliate-drives-narration: narration waits for foliate to load each section before extracting words. This causes a ~300ms pause at every chapter/section boundary while foliate loads the next section. Additionally, cache keys are section-local (word indices reset per section), which complicates position tracking across the book.

### SCOPE

1. **Eager section loading** — On book open, request all foliate sections in sequence. Extract words from each as it loads. Build a complete book-wide word array with global indices.
2. **Narration-drives-foliate** — Narration maintains a `currentGlobalWordIndex` into the book-wide array. Tells foliate which section/page to display based on the current narration position, rather than foliate telling narration what to read.
3. **Seamless chapter-boundary advance** — No pause at section transitions. The audio pipeline has pre-generated audio spanning the boundary. foliate display catches up.
4. **Global cache keys** — Cache keys use global word index (`chunk-{globalStartIdx}.pcm`) instead of section-local index. Migration path for existing NAR-2 caches.

### KEY FILES (Estimated)

- `src/hooks/useNarration.ts` — Invert control flow, global word index tracking
- `src/components/FoliatePageView.tsx` — Eager section loading, narration-driven page advance
- `src/utils/generationPipeline.ts` — Accept global word ranges, request words across section boundaries
- `src/utils/ttsCache.ts` — Global cache key scheme
- `main/tts-cache.js` — Cache key migration, global index manifest
- New: `src/utils/bookWordStream.ts` — Book-wide word extraction and indexing

### SUCCESS CRITERIA (Draft)

1. Full-book word array built on book open (all sections extracted eagerly)
2. Zero pause at chapter/section boundaries during narration
3. Cache keys use global word indices
4. Existing NAR-2 caches gracefully invalidated or migrated
5. Narration position saved/restored using global word index
6. foliate display follows narration position (not the other way around)
7. All NAR-2 success criteria remain passing (no regressions)
8. All tests pass, clean build
9. `package.json` version bumped to `1.3.0`

---

## Sprint NAR-4 [v1.4.0]: Library-Wide Caching & Compression

**Goal:** Compress cached audio with Opus (WASM encoder), extend caching to all Reading Now books via background generation, add cache progress indicators in the library UI, and implement LRU eviction across multiple books.

**Design spec:** `docs/superpowers/specs/2026-03-29-tts-pipeline-redesign-design.md` §Future Work — Phase 3
**Prerequisite:** NAR-3 complete (global word indices, full-book word stream)
**Branch:** `sprint/nar4-library-caching` | **Tier:** Full (new feature + WASM integration)

### PROBLEM

NAR-2 caches raw PCM Float32Array — a 10-hour book at 24kHz mono float32 is ~2.8GB. Only the active book is cached. Users with multiple books in "Reading Now" must wait for cold-start generation each time they switch books. No visibility into cache state from the library.

### SCOPE

1. **Opus compression** — WASM-based Opus encoder in a worker thread. Encode PCM chunks to Opus on write, decode on read. Target: ~80-100KB per minute of audio (~50-60MB per 10-hour book vs ~2.8GB raw PCM).
2. **Background caching** — 3-slot priority queue: active book (highest) > currently open book > all Reading Now books (round-robin). Background generation runs when app is idle. Pauses when user starts active narration.
3. **Cache progress indicators** — Checkmark badge on DocCard/DocGridCard for fully cached books. Partial cache shows progress ring. "Cached for offline narration" tooltip.
4. **Settings integration** — "Cache books for offline narration" toggle in TTS Settings (default on). "Clear cache" button showing total size. `ttsCacheEnabled` setting field.
5. **LRU eviction** — When total cache exceeds `TTS_CACHE_MAX_MB`, evict least-recently-narrated books first. Never evict the currently-playing book. Eviction runs on startup and after each cache write.
6. **Predictive pre-generation** — On book open, if no cache exists for the current position, fire chunk 1 generation in the background before the user presses play.

### KEY FILES (Estimated)

- New: `main/opus-encoder.js` — WASM Opus encoder worker
- New: `src/components/CacheBadge.tsx` — Cache indicator for library cards
- `main/tts-cache.js` — Opus encode/decode, LRU eviction, background generation queue
- `src/utils/ttsCache.ts` — Opus decode on read, cache status queries
- `src/components/DocCard.tsx` / `DocGridCard.tsx` — Cache badge integration
- `src/components/settings/TTSSettings.tsx` — Cache toggle, clear button, size display
- `src/constants.ts` — Cache-related constants
- `main/constants.js` — Opus encoder config, LRU thresholds

### SUCCESS CRITERIA (Draft)

1. Opus-encoded cache: 10-hour book ≤ 100MB on disk (vs ~2.8GB raw PCM)
2. Background caching generates audio for all Reading Now books when idle
3. Cache badge visible on fully-cached books in library view
4. "Cache books for offline narration" toggle works (on/off)
5. "Clear cache" button shows total size, clears all cached audio
6. LRU eviction triggers when total cache exceeds threshold
7. Currently-playing book never evicted
8. Predictive pre-gen: opening a cached book → instant play; opening uncached book → chunk 1 pre-generated before play
9. All NAR-2 + NAR-3 success criteria remain passing
10. All tests pass, clean build
11. `package.json` version bumped to `1.4.0`


## Sprint 24R [v0.9.1]: CRIT Remediation

**Goal:** Fix the 1 actionable CRITICAL from Sprint 24 audit. CRIT-2 (OAuth placeholder creds) deferred to v1.1.0. CRIT-3 dismissed — `.Workflow/` exists on Windows host, invisible to Linux VM audit agents.

**Branch:** `sprint/24r-crit-remediation` | **Tier:** Quick

### KEY CONTEXT
Sprint 24 external audit found 3 CRITICALs. CRIT-1 is a real security hole (arbitrary file read via IPC). CRIT-2 (placeholder OAuth creds) deferred to v1.1.0 — app ships local-only first. CRIT-3 is a false positive — `.Workflow/` exists at `C:\Users\estra\OneDrive\Projects\Blurby\.Workflow` on the Windows host; audit agents running in Linux VM couldn't see it.

### PROBLEM
**CRIT-1:** `read-file-buffer` IPC handler at `main/ipc/library.js:135-143` accepts arbitrary filesystem paths from the renderer with no validation. A compromised renderer could read `~/.ssh/id_rsa`, auth tokens, etc.

### EVIDENCE OF PROBLEM
- `docs/project/AGENT_FINDINGS.md` §CRIT-1 — Full finding with file path and line numbers

### HYPOTHESIZED SOLUTION
Add path allowlist validation to `read-file-buffer`. Resolve the requested path, verify it starts with either `ctx.getDataPath()` or `settings.sourceFolder`. Return null for disallowed paths. Also audit other file-read IPC handlers (`load-doc-content`, `read-file`) for the same pattern.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Audit all file-read IPC handlers for path validation gaps | code-reviewer | sonnet |
| 2 | Add path allowlist to `read-file-buffer` + any other unvalidated handlers found in step 1 | electron-fixer | sonnet |
| 3 | Write tests for path validation (allowed paths pass, disallowed paths return null, path traversal blocked) | electron-fixer | sonnet |
| 4 | Run `npm test` — all tests pass | test-runner | haiku |
| 5 | Run `npm run build` — clean build | test-runner | haiku |
| 6 | Git: commit on branch, merge to main with `--no-ff` | blurby-lead | opus |
| 7 | Print terminal summary: CRITs addressed, test count, what's deferred | blurby-lead | opus |

### WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules
2. `ROADMAP.md` §Sprint 24R — This spec
3. `docs/project/AGENT_FINDINGS.md` — Full audit findings (CRIT-1 details)
4. `main/ipc/library.js` — `read-file-buffer` handler (CRIT-1 target)
5. `main/ipc/` — All 8 IPC handler files (audit for same pattern)
6. `docs/governance/LESSONS_LEARNED.md` — Anti-patterns

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read spec, dispatch, verify, git merge, summary |
| code-reviewer | sonnet | Audit all IPC handlers for path validation gaps (step 1 only, read-only) |
| electron-fixer | sonnet | Implement path validation + tests (steps 2-3) |
| test-runner | haiku | Run tests + build (steps 4-5) |

### WHEN (Execution Order)

```
[1] Audit IPC handlers (code-reviewer, read-only)
    ↓
[2-3] SEQUENTIAL:
    [2] Add path validation (electron-fixer)
    [3] Write path validation tests (electron-fixer)
    ↓
[4-5] SEQUENTIAL:
    [4] npm test (test-runner)
    [5] npm run build (test-runner)
    ↓
[6] Git commit + merge (blurby-lead)
    ↓
[7] Terminal summary (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Path validation must cover traversal attacks.** `../../etc/passwd` resolved against an allowed root should still fail. Use `path.resolve()` then `startsWith()` on the resolved path vs resolved root.
- **CRIT-2 and CRIT-3 are explicitly OUT OF SCOPE.** CRIT-2: don't touch `main/auth.js` OAuth credentials (deferred v1.1.0). CRIT-3: `.Workflow/` exists on Windows host — false positive, no action needed.
- **Branch:** `sprint/24r-crit-remediation`. Merge to main with `--no-ff`. Delete branch after merge.

### SUCCESS CRITERIA

1. `read-file-buffer` rejects paths outside app data dir and source folder
2. Path traversal attacks (e.g., `../../etc/passwd`) return null
3. All other file-read IPC handlers validated (or confirmed already safe)
4. `package.json` version bumped to `0.9.1`
5. All 776+ tests pass, 0 failures
6. Clean `npm run build`
7. Branch merged to main with `--no-ff`

---

## Sprint KB-1 [v0.10.0]: Keyboard Navigation Remap

**Goal:** Swap Ctrl+Arrow and Shift+Arrow bindings to match OS-native conventions. Ctrl = fine-grained word/sentence navigation. Shift = coarse structural paragraph/chapter jumps. All modes.

**Branch:** `sprint/kb1-keyboard-nav` | **Tier:** Quick (single-component change + tests)

### KEY CONTEXT
Pre-v1.0.0 polish. Current keyboard bindings use Shift+Arrow for word-level movement (Page mode only) and Ctrl+Arrow for paragraph/document jumps. This is backwards from OS-native conventions (Word, Notepad, VS Code) where Ctrl+Arrow = word jump. Swapping to native conventions reduces learning curve for every new user. Also extends word-level navigation to Focus and Flow modes (currently Page-only) and adds sentence boundary navigation.

### PROBLEM
1. **Ctrl+Arrow is non-native.** Ctrl+Left/Right = paragraph jump, Ctrl+Up/Down = doc start/end. In every OS text editor, Ctrl+Arrow = word-level movement.
2. **Shift+Arrow is Page-mode only.** Focus and Flow modes have no single-word seek binding.
3. **No sentence navigation exists.** `hasPunctuation()` detects sentence boundaries but nothing uses it for navigation.
4. **Shift+Up/Down coarse WPM (±50) is dropped.** Up/Down ±25 WPM is sufficient.

### EVIDENCE OF PROBLEM
- `src/hooks/useKeyboardShortcuts.ts` lines 189-212: Current Ctrl+Arrow and Shift+Arrow handlers
- `src/hooks/useKeyboardShortcuts.ts` lines 229-246: Mode-specific arrow handling (Shift+Up/Down = ±50 WPM in Focus/Flow)
- `src/components/ReaderContainer.tsx` lines 440-445: `handleMoveWordSelection` only called from Page mode path

### HYPOTHESIZED SOLUTION
Remap all arrow modifier bindings in `useKeyboardShortcuts.ts` and extend to all modes:

**New Ctrl+Arrow (fine-grained, all modes):**
- `Ctrl+Left`: Seek -1 word (`seekWords(-1)`)
- `Ctrl+Right`: Seek +1 word (`seekWords(1)`)
- `Ctrl+Up`: Seek to previous sentence start (scan backward for `hasPunctuation()`, jump to word after previous sentence-ending word)
- `Ctrl+Down`: Seek to next sentence start (scan forward for `hasPunctuation()`, jump to word after next sentence-ending word)

**New Shift+Arrow (coarse structural, all modes):**
- `Shift+Left`: Paragraph prev (`paragraphPrev()`)
- `Shift+Right`: Paragraph next (`paragraphNext()`)
- `Shift+Up`: Chapter prev (`handlePrevChapter()`)
- `Shift+Down`: Chapter next (`handleNextChapter()`)

**Removed:**
- Shift+Up/Down coarse WPM adjustment (±50) — dropped entirely

**New utility needed:** `findSentenceBoundary(words, currentIndex, direction)` in `src/utils/text.ts` — scans words array using existing `hasPunctuation()` to find sentence starts.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add `findSentenceBoundary(words, currentIndex, direction)` to `src/utils/text.ts` | renderer-fixer | sonnet |
| 2 | Remap Ctrl+Arrow handlers in `useKeyboardShortcuts.ts`: Ctrl+Left/Right → seekWords(±1), Ctrl+Up/Down → sentence nav callbacks | renderer-fixer | sonnet |
| 3 | Remap Shift+Arrow handlers in `useKeyboardShortcuts.ts`: Shift+Left/Right → paragraphPrev/Next (all modes), Shift+Up/Down → chapter prev/next (all modes) | renderer-fixer | sonnet |
| 4 | Remove Shift+Up/Down coarse WPM (±50) from Focus/Flow mode handler | renderer-fixer | sonnet |
| 5 | Wire `handleSentencePrev`/`handleSentenceNext` callbacks in `ReaderContainer.tsx`, pass to `useReaderKeys()` | renderer-fixer | sonnet |
| 6 | Extend paragraph nav to Focus/Flow modes (currently Page-only gated) | renderer-fixer | sonnet |
| 7 | Update shortcuts overlay data (help text) to reflect new bindings | renderer-fixer | sonnet |
| 8 | Update `electron-api-stub.ts` keyboard shortcut help data if applicable | renderer-fixer | sonnet |
| 9 | Write tests: sentence boundary scanning (edge cases: start of doc, end of doc, consecutive punctuation, no punctuation) | renderer-fixer | sonnet |
| 10 | Run `npm test` — all 776+ tests pass | test-runner | haiku |
| 11 | Run `npm run build` — clean build | test-runner | haiku |
| 12 | Update `docs/governance/LESSONS_LEARNED.md` if any non-obvious discoveries | doc-keeper | sonnet |
| 13 | Git: commit on branch `sprint/kb1-keyboard-nav`, merge to main with `--no-ff` | blurby-lead | opus |
| 14 | Print terminal summary: old bindings → new bindings table, test count, build status | blurby-lead | opus |

### WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules, test policy
2. `ROADMAP.md` §Sprint KB-1 — This spec
3. `src/hooks/useKeyboardShortcuts.ts` — Current key handlers (the main file being changed)
4. `src/components/ReaderContainer.tsx` — Callback wiring, `handleMoveWordSelection`, paragraph nav handlers
5. `src/utils/text.ts` — `hasPunctuation()`, `tokenizeWithMeta()`, paragraph breaks
6. `src/modes/` — Mode interface, FocusMode, FlowMode, PageMode (understand `jumpTo()` and `seekWords()`)
7. `src/utils/FlowCursorController.ts` — Line map, `prevLine()`/`nextLine()` (understand current Flow nav)
8. `docs/governance/LESSONS_LEARNED.md` — Anti-patterns to avoid

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read spec, dispatch renderer-fixer, verify results, git merge, terminal summary |
| renderer-fixer | sonnet | All implementation: text.ts utility, useKeyboardShortcuts remap, ReaderContainer wiring, shortcuts overlay, tests |
| test-runner | haiku | Run `npm test` + `npm run build` after implementation |
| doc-keeper | sonnet | Update LESSONS_LEARNED if applicable |

### WHEN (Execution Order)

```
[1] Add findSentenceBoundary to text.ts (renderer-fixer)
    ↓
[2-4] SEQUENTIAL (same file — useKeyboardShortcuts.ts):
    [2] Remap Ctrl+Arrow handlers
    [3] Remap Shift+Arrow handlers
    [4] Remove coarse WPM
    ↓
[5-6] SEQUENTIAL (ReaderContainer.tsx):
    [5] Wire sentence nav callbacks
    [6] Extend paragraph nav to all modes
    ↓
[7-8] PARALLEL:
    ├─ [7] Update shortcuts overlay (renderer-fixer)
    └─ [8] Update stub help data (renderer-fixer)
    ↓ (both complete)
[9] Write sentence boundary tests (renderer-fixer)
    ↓
[10-11] SEQUENTIAL:
    [10] npm test (test-runner)
    [11] npm run build (test-runner)
    ↓
[12] Update LESSONS_LEARNED (doc-keeper)
    ↓
[13] Git commit + merge (blurby-lead)
    ↓
[14] Terminal summary (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Sentence boundary edge cases:** First word of document has no "previous sentence." Last word of document has no "next sentence." Handle both by clamping to 0 / words.length-1. Consecutive punctuation words (e.g., `"...`) should be treated as one boundary — skip to the actual sentence start.
- **Paragraph nav in Focus/Flow:** Currently gated behind `mode === "page"` in useKeyboardShortcuts. Remove the gate so Shift+Left/Right triggers `paragraphPrev()`/`paragraphNext()` regardless of mode. The underlying `setHighlightedWordIndex` / `seekWords` should work for all modes — verify by testing.
- **Chapter nav already exists:** `handlePrevChapter` and `handleNextChapter` are already wired. Just map Shift+Up/Down to call them.
- **Ctrl+Up/Down doc start/end is removed.** These bindings are not being relocated. Home/End could be added later but are not in scope.
- **Do NOT change plain Arrow behavior.** Left/Right arrows (no modifier) in Focus/Flow modes keep their existing ±5 word rewind / line jump behavior. Up/Down arrows (no modifier) keep WPM ±25.
- **Branch:** `sprint/kb1-keyboard-nav`. Merge to main with `--no-ff`. Delete branch after merge.

### SUCCESS CRITERIA

1. `Ctrl+Left`/`Ctrl+Right` seeks ±1 word in Page, Focus, and Flow modes
2. `Ctrl+Up`/`Ctrl+Down` seeks to previous/next sentence start in all modes
3. `Shift+Left`/`Shift+Right` jumps to paragraph boundaries in all modes
4. `Shift+Up`/`Shift+Down` jumps to prev/next chapter in all modes
5. Shift+Up/Down no longer adjusts WPM in any mode
6. Plain arrow keys unchanged (Left/Right = page/rewind/line, Up/Down = WPM ±25)
7. `findSentenceBoundary()` handles edge cases: doc start, doc end, consecutive punctuation, no punctuation in text
8. Shortcuts overlay/help text reflects new bindings
9. All 776+ tests pass, 0 failures
10. Clean `npm run build`
11. `package.json` version bumped to `0.10.0`
12. Branch `sprint/kb1-keyboard-nav` merged to main with `--no-ff`

---

## Sprint CT-2: Test Harness Hardening + Bug Fixes

**Goal:** Fix the 33 SKIPs and 5 of the 6 FAILs from the CT-1 click-through test run. Rich seed data, stub persistence, and 3 app bugs.

**Branch:** `sprint/ct2-harness-hardening` | **Tier:** Full (modifies stub + production code)

### KEY CONTEXT
Sprint CT-1 delivered a working browser-based test harness. On 2026-03-28, a full click-through test run produced 82 PASS, 6 FAIL, 33 SKIP. The test report is at `docs/testing/test-run-2026-03-28.md`. The 33 SKIPs are dominated by a single root cause: the stub's Meditations seed data is only ~100 words across 3 tiny chapters, all fitting on one page. A secondary limitation is that stub state doesn't survive page reloads. Five bugs were also discovered.

### PROBLEM
Three gaps prevent the test harness from being useful for ongoing QA:

1. **Short stub content (~100 words):** Blocks 15+ checklist items: page advance/back, chapter jump, extended playback in Focus/Flow, Narrate tracking, WPM adjustment verification, position preservation across mode switches.
2. **No state persistence across reloads:** `electron-api-stub.ts` initializes fresh state on every page load. Any "change → reload → verify" test is impossible.
3. **Five app bugs:**
   - KB-01: `?` opens search palette instead of shortcuts overlay
   - ERR-04: `update-available` event produces no visible notification
   - ERR-05: `cloud-auth-required` event produces no visible response
   - MODE-04: Shift+Space doesn't cycle Narrate → Focus (one-way cycle)
   - Single seed doc prevents multi-doc testing (J/K nav, search filtering, delete-one)

### EVIDENCE OF PROBLEM
- `docs/testing/test-run-2026-03-28.md` — Full 121-item test report: 82 PASS, 6 FAIL, 33 SKIP
- OB-05 FAIL: `setFirstRunCompleted(true)` + `location.reload()` → onboarding reappeared
- READ-03/04 SKIP: "content fits on 1 page — stub data limitation"
- MODE-04 FAIL: Shift+Space in Narrate mode → remained in Narrate
- KB-01 FAIL: `?` key → search palette instead of ShortcutsOverlay

### HYPOTHESIZED SOLUTION
Five workstreams:
- **CT-2A:** Rich seed data — expand Meditations to ~2,000 words / 12 chapters (original placeholder prose — philosophical reflections matching chapter titles, NOT verbatim public domain text, to avoid content filter blocks). Add second seed doc ("sample-article", ~500 words, also original).
- **CT-2B:** sessionStorage persistence — hydrate stub state from sessionStorage on init, persist on every mutation. Add `clearPersistence()` method.
- **CT-2C:** `?` shortcut fix — opens ShortcutsOverlay instead of search palette.
- **CT-2D:** Event notification handlers — `update-available` and `cloud-auth-required` produce visible toasts.
- **CT-2E:** Mode cycling fix — Shift+Space cycles Narrate → Focus, completing the circular cycle.

### Workstreams

| ID | Task | Agent | Model |
|----|------|-------|-------|
| CT-2A.1 | Expand Meditations seed content to ~2,000 words / 12 chapters in `electron-api-stub.ts` | `renderer-fixer` | sonnet |
| CT-2A.2 | Add second seed document ("sample-article", ~500 words) to stub library | `renderer-fixer` | sonnet |
| CT-2B | Implement sessionStorage persistence in `electron-api-stub.ts` | `renderer-fixer` | sonnet |
| CT-2C | Fix `?` shortcut to open ShortcutsOverlay instead of search | `renderer-fixer` | sonnet |
| CT-2D.1 | Add `update-available` toast handler in renderer | `renderer-fixer` | sonnet |
| CT-2D.2 | Add `cloud-auth-required` toast handler in renderer | `renderer-fixer` | sonnet |
| CT-2E | Fix Shift+Space mode cycling from Narrate → Focus | `ui-investigator` + `renderer-fixer` | opus + sonnet |

### Agent Assignments

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | All stub improvements (CT-2A, CT-2B), shortcut fix (CT-2C), event handlers (CT-2D), mode cycling fix implementation (CT-2E) |
| `ui-investigator` | opus | Root-cause analysis for MODE-04 (Shift+Space in Narrate). Read-only investigation of key event flow through useReaderMode → NarrateMode → useKeyboardShortcuts. Output: exact diagnosis + fix spec. |
| `test-runner` | haiku | Full test + build verification |
| `doc-keeper` | sonnet | Post-sprint documentation updates |

### Execution Order

```
[1–3] PARALLEL (independent stub modifications):
    ├─ [1-2] Rich seed data — expand Meditations + add second doc (renderer-fixer)
    └─ [3] sessionStorage persistence (renderer-fixer)
    ↓ (all complete)
[4–6] PARALLEL (independent bug fixes, no shared files):
    ├─ [4] ? shortcut fix (renderer-fixer)
    ├─ [5-6] Event notification handlers (renderer-fixer)
    └─ [7a] Mode cycling investigation (ui-investigator) — read-only
    ↓ (7a complete)
[7b] Mode cycling fix implementation (renderer-fixer) — depends on 7a diagnosis
    ↓ (all complete)
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### Read Order
1. `CLAUDE.md` — System state, standing rules, test harness section
2. `docs/testing/test-run-2026-03-28.md` — Full test report with all FAIL/SKIP details
3. `docs/governance/LESSONS_LEARNED.md` — LL-042/043/044 for narration mode context
4. `src/test-harness/electron-api-stub.ts` — Current stub (expand content, add persistence)
5. `src/hooks/useKeyboardShortcuts.ts` — `?` key handler (CT-2C fix target)
6. `src/components/ShortcutsOverlay.tsx` — Verify component exists and how it's triggered
7. `src/hooks/useReaderMode.ts` — Mode cycling logic, Shift+Space handler (CT-2E target)
8. `src/modes/NarrateMode.ts` — Narrate mode key handling (may intercept Shift+Space)
9. `src/App.tsx` — IPC event listener wiring (CT-2D target)
10. `src/contexts/ToastContext.tsx` — Toast API for event notifications

### Additional Guidance
- **Meditations text source:** DO NOT use verbatim public domain text (triggers API content filter on large outputs). Instead, write ORIGINAL placeholder prose — philosophical reflections that match the chapter titles ("Book One: Debts and Lessons", "Book Two: On the River Gran", etc.). Keep the philosophical tone of Meditations but use entirely original sentences. Books 1-12, ~150-200 words/chapter, ~2,000 total. Generate content in 2-3 chunks if needed to stay under output limits.
- **Second seed doc:** Original short essay (~500 words, NOT copied from any source). Set `type: "article"`, `source: "sample"`, `id: "sample-article"`. Enables multi-doc J/K nav, search, delete-one, and "articles" type filter.
- **Content filter workaround:** The API blocks large outputs of verbatim public domain text. All seed content must be ORIGINAL prose. If a single generation triggers the filter, split into smaller chunks (3-4 chapters at a time) and concatenate.
- **sessionStorage key:** `'blurbyStubState'`. Serialize as JSON. Only persist 4 mutable stores: `settings`, `library`, `highlights`, `readingStats`.
- **`clearPersistence()` method:** Add to `window.__blurbyStub` alongside `reset()`, `emit()`, etc. Calls `sessionStorage.removeItem('blurbyStubState')` + `reset()`.
- **Mode cycling fix:** Key question: does `Shift+Space` in Narrate mode get intercepted by narration key handler (Space as pause) BEFORE reaching the cycle handler (Shift+Space as cycle)? If so, fix: check for Shift modifier in narration handler and let Shift+Space pass through.
- **Event handlers:** Minimal — toast notification with optional action button. Don't build elaborate update management or re-auth UI.

### Acceptance Criteria
1. `SAMPLE_CONTENT` in `electron-api-stub.ts` contains ≥2,000 words across ≥10 chapters
2. `MEDITATIONS_CHAPTERS` array has ≥10 entries with correct character offsets
3. `sampleMeditationsDoc.wordCount` matches actual `SAMPLE_CONTENT` word count
4. A second seed document ("sample-article") appears in the stub library on init
5. `sessionStorage.getItem('blurbyStubState')` is populated after any mutating stub call
6. Page reload preserves settings changes (theme switch survives reload)
7. Page reload preserves library mutations (favorite toggle survives reload)
8. `window.__blurbyStub.clearPersistence()` removes sessionStorage and resets to defaults
9. Pressing `?` in library view opens ShortcutsOverlay (not search palette)
10. `window.__blurbyStub.emit("update-available", "2.0.0")` produces a visible toast
11. `window.__blurbyStub.emit("cloud-auth-required", "microsoft")` produces a visible toast
12. Shift+Space in Narrate mode cycles to Focus mode (circular cycle complete)
13. Shift+Space in Focus mode cycles to Flow mode (no regression)
14. Shift+Space in Flow mode cycles to Narrate mode (no regression)
15. `npm test` passes (all existing + no regressions), `npm run build` succeeds
16. Branch `sprint/ct2-harness-hardening` merged to main with `--no-ff`

---

## Sprint CT-3: Click-Through Repair

**Goal:** Fix all actionable bugs found during the post-CT-2 click-through re-run, align the checklist with the actual codebase, and address the Focus mode visual stability issue. This is the final code-change sprint before v1.0.0.

**Prerequisite:** CT-2 complete + click-through re-run filed as `docs/testing/test-run-CT3-2026-03-28.md` (101 PASS / 6 FAIL / 14 SKIP).

**Branch:** `sprint/ct3-click-repair` | **Tier:** Quick (targeted bug fixes + checklist update)

### KEY CONTEXT

Sprint CT-2 delivered a hardened test harness (rich seed data, sessionStorage persistence, 5 bug fixes). On 2026-03-28, a full 121-item click-through test was executed via Chrome automation (Cowork + Claude in Chrome MCP). Result: 101 PASS / 6 FAIL / 14 SKIP. All failures are in the Keyboard Shortcuts section. Additionally, a visual stability issue was identified in Focus mode (word flicker/bounce), and the checklist itself has drifted from the actual keyboard shortcut mappings.

### PROBLEM

Four categories of issues emerged from the test run:

1. **Keyboard shortcut checklist drift (5 items):** The checklist maps G-sequences to `gf`=favorites, `gs`=stats, `gr`=recent, `gh`=snoozed, `gc`=collections. The actual app maps `G+S`=starred/favorites, `G+A`=archive, `G+I`=inbox, `G+Q`=queue, `G+G`=top. Several checklist items reference shortcuts that don't exist in the implementation.
2. **Ctrl+, shortcut conflict (1 item):** KB-16 — `Ctrl+,` opens Reading Queue sidebar instead of settings. The keyboard overlay says `Ctrl+,` = "Open full settings" but the actual behavior differs.
3. **Focus mode visual instability (observed):** Words flicker/bounce when advancing in Focus mode. Root cause: 8px Y-translate animation, forced reflow via `offsetWidth`, ORP marker position snapping, font-weight shift between normal and bold for the focus character.
4. **Untestable items (14 SKIPs):** G-sequences (8 — automation timing), drag-and-drop (3 — native events), Kokoro audio (2 — hardware verification), ERR-01 (1 — stub manipulation).

### EVIDENCE OF PROBLEM

- `docs/testing/test-run-CT3-2026-03-28.md` — Full 121-item test report
- KB-08/10/13: G-sequence shortcuts did not fire via browser automation. The hotkey overlay confirms mappings differ from checklist.
- KB-16: `Ctrl+,` opened Reading Queue, not Settings. Screenshotted during test run.
- Focus mode screenshots show word display with visible Y-translate animation and ORP marker jumping.
- `src/styles/global.css` lines 382-410: `focus-word-enter` animation with `transform: translate3d(0, 8px, 0)`.
- `src/components/ReaderView.tsx` lines 102-107: `void container.offsetWidth` forced reflow on every word.

### HYPOTHESIZED SOLUTION

Four workstreams:

- **CT-3A: Checklist alignment** — Rewrite KB section of `chrome-clickthrough-checklist.md` to match actual `useKeyboardShortcuts.ts` mappings. Remove phantom shortcuts, add real ones.
- **CT-3B: Ctrl+, shortcut fix** — Investigate why `Ctrl+,` doesn't open settings. Likely a handler ordering issue or Chrome browser-level interception. Fix in `useKeyboardShortcuts.ts`.
- **CT-3C: Focus mode visual stability** — Reduce `focus-word-enter` Y-translate from 8px to 0-2px. Add CSS transition to focus marks. Consider `requestAnimationFrame` instead of forced reflow. Test at 300 WPM and 500+ WPM.
- **CT-3D: Improve DD/ERR coverage** — Add file drop zone stub support to enable DD-01/02/03 testing. Add ERR-01 (delete doc + try to open) test path.

### Workstreams

| ID | Task | Agent | Model |
|----|------|-------|-------|
| CT-3A | Rewrite KB section of `chrome-clickthrough-checklist.md` to match actual keybindings from `useKeyboardShortcuts.ts` | `doc-keeper` | sonnet |
| CT-3B.1 | Investigate Ctrl+, handler — trace key event from `useKeyboardShortcuts.ts` through to handler registration. Identify why it opens Reading Queue instead of Settings. | `ui-investigator` | opus |
| CT-3B.2 | Fix Ctrl+, to open settings (based on CT-3B.1 diagnosis) | `renderer-fixer` | sonnet |
| CT-3C.1 | Reduce Focus mode word animation: change Y-translate from 8px to 0-2px in `global.css`, add CSS transition to `.focus-mark` position, replace `void container.offsetWidth` with `requestAnimationFrame` in `ReaderView.tsx` | `renderer-fixer` | sonnet |
| CT-3C.2 | Verify Focus mode at 300 and 600 WPM — words stable, no visible flicker | `spec-reviewer` | sonnet |
| CT-3D.1 | Add `importDroppedFiles` handler to `electron-api-stub.ts` with drag-drop zone support | `renderer-fixer` | sonnet |
| CT-3D.2 | Add ERR-01 test path: `deleteDoc` in stub, verify reader handles missing doc gracefully | `renderer-fixer` | sonnet |
| CT-3E | `npm test` + `npm run build` | `test-runner` | haiku |
| CT-3F | Update CLAUDE.md, ROADMAP.md, LESSONS_LEARNED.md | `doc-keeper` | sonnet |
| CT-3G | Git commit + merge to main | `blurby-lead` | opus |

### Agent Assignments

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `ui-investigator` | opus | Ctrl+, root-cause analysis (read-only). Output: exact diagnosis + fix location. |
| `renderer-fixer` | sonnet | Ctrl+, fix (CT-3B.2), Focus stability (CT-3C.1), stub improvements (CT-3D) |
| `spec-reviewer` | sonnet | Verify Focus mode visual stability at multiple WPMs (CT-3C.2) |
| `doc-keeper` | sonnet | Checklist rewrite (CT-3A), post-sprint docs (CT-3F) |
| `test-runner` | haiku | Full test + build verification (CT-3E) |
| `blurby-lead` | opus | Git operations (CT-3G) |

### Execution Order

```
[1-3] PARALLEL (independent workstreams):
    ├─ [1] Checklist alignment (doc-keeper) — no code changes
    ├─ [2] Ctrl+, investigation (ui-investigator) — read-only
    └─ [3] Focus stability CSS + JS fix (renderer-fixer) — global.css + ReaderView.tsx
    ↓ (2 complete)
[4] Ctrl+, fix implementation (renderer-fixer) — depends on investigation
    ↓ (3 complete)
[5] Focus mode verification at 300/600 WPM (spec-reviewer) — depends on CSS fix
    ↓ (1, 4, 5 complete)
[6-7] PARALLEL:
    ├─ [6] Stub improvements — drag-drop + ERR-01 (renderer-fixer)
    └─ [7] Tests + build (test-runner)
    ↓ (all complete)
[8] Documentation update (doc-keeper)
    ↓
[9] Git commit + merge (blurby-lead)
```

### Read Order

1. `docs/testing/test-run-CT3-2026-03-28.md` — Full test report (this is the evidence)
2. `docs/testing/chrome-clickthrough-checklist.md` — Current checklist (to be rewritten KB section)
3. `src/hooks/useKeyboardShortcuts.ts` — Actual keybinding definitions (source of truth for CT-3A + CT-3B)
4. `src/styles/global.css` — Focus animation keyframes (CT-3C target, lines 382-439)
5. `src/components/ReaderView.tsx` — Focus word rendering, forced reflow (CT-3C target, lines 95-147)
6. `src/test-harness/electron-api-stub.ts` — Stub to extend for CT-3D
7. `CLAUDE.md` — Standing rules, system state
8. `docs/governance/LESSONS_LEARNED.md` — Any relevant prior discoveries

### Additional Guidance

- **Checklist alignment (CT-3A):** Read `useKeyboardShortcuts.ts` exhaustively. Map every registered handler to its shortcut key. Remove any checklist items that reference shortcuts not in the code. Add items for shortcuts that exist but aren't tested. Keep the same checklist format (table with ID, Action, Expected, Screenshot, Console).
- **Ctrl+, (CT-3B):** Chrome intercepts `Ctrl+,` to open its own settings. The app handler may be getting swallowed. If this is an unresolvable browser conflict, document it as a known limitation and skip KB-16 in the checklist. The keyboard overlay should be updated to remove `Ctrl+,` if it can't work in browser context.
- **Focus stability (CT-3C):** The goal is calm, stable word presentation with no perceived motion. Preferred approach: opacity-only animation (no Y-translate), smooth focus mark transitions, no forced reflow. Test with both short words ("a", "the") and long words ("understanding", "philosophical") since width shifts are more visible on short words.
- **Stub improvements (CT-3D):** For drag-drop, implement a `handleDrop` event listener on the app root that intercepts `dragover`/`drop` events and routes to `importDroppedFiles`. For ERR-01, add a `deleteDoc(id)` method to `window.__blurbyStub` and verify the reader shows an error state when the doc is opened.
- **Do NOT change the G-sequence implementation.** The G-sequences appear to work correctly — the automation timing was the issue. The checklist needs to be updated to match the actual mappings, not the other way around.

### Acceptance Criteria

1. `chrome-clickthrough-checklist.md` KB section matches actual `useKeyboardShortcuts.ts` keybindings exactly
2. No phantom shortcuts in checklist (every listed shortcut has a corresponding handler in code)
3. `Ctrl+,` either (a) opens settings panel or (b) is documented as browser-conflict limitation and removed from checklist
4. Focus mode word display has no visible Y-translate bounce at 300 WPM
5. Focus mode ORP markers transition smoothly (no position snapping)
6. No forced reflow (`void container.offsetWidth`) in Focus word rendering path
7. `electron-api-stub.ts` handles `importDroppedFiles` calls and `deleteDoc` + reader error state
8. `npm test` passes (776+ tests, 0 failures), `npm run build` succeeds
9. No regressions — all 101 previously-passing click-through items still PASS
10. Branch `sprint/ct3-click-repair` merged to main with `--no-ff`

> **Note:** CT-3 and Sprint 24 run in PARALLEL. CT-3 fixes bugs (code changes). Sprint 24 audits the codebase (read-only). No file conflicts — Sprint 24 only writes to `docs/project/AGENT_FINDINGS.md`. If the audit surfaces CRITICALs that overlap with CT-3 bugs, they're already being fixed. New CRITICALs from the audit get addressed in a remediation pass after both complete.

---

## Sprint 24: External Audit

**Goal:** Run the full external audit pipeline per `.workflow/skills/external-audit/SKILL.md` before declaring v1. This is the quality gate — an independent, systematic review of the entire codebase.

**Prerequisite:** Sprint CT-2 complete. Runs in PARALLEL with CT-3 (no file conflicts — audit writes only to `docs/project/AGENT_FINDINGS.md`).

**Branch:** `sprint/24-external-audit` (read-only unless CRITICALs found) | **Tier:** None (audit only)

### Spec

**24A. Code quality audit**
- Lint pass: identify dead code, unused imports, inconsistent naming, type safety gaps
- Architecture compliance: verify all standing rules from CLAUDE.md
- Known-trap regression: check for re-introduced patterns from LESSONS_LEARNED.md
- Output: findings to `docs/project/AGENT_FINDINGS.md`

**24B. Test coverage audit**
- Map test files to features: identify any feature with zero test coverage
- Priority gaps: IPC handler coverage, sync engine edge cases, TTS sync logic, onboarding
- Recommend specific tests to add (log as findings, don't write in this sprint)

**24C. Architecture review**
- Module dependency graph: verify no circular dependencies
- Bundle size analysis: flag anything > 100KB that could be lazy-loaded
- Security surface: review all IPC channels, CSP headers, token storage
- Cloud sync audit: verify revision counter logic, tombstone cleanup, merge correctness

**24D. Documentation alignment**
- CLAUDE.md accuracy: verify all file paths, feature statuses match reality
- ROADMAP.md accuracy: verify acceptance criteria match implementations
- LESSONS_LEARNED.md completeness: verify recent sprints have entries

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Code quality audit (24A) | `code-reviewer` | — |
| 2 | Test coverage audit (24B) | `code-reviewer` | — |
| 3 | Architecture review (24C) | `ui-investigator` | — |
| 4 | Documentation alignment (24D) | `doc-keeper` | — |
| 5 | Findings consolidation | `blurby-lead` | Steps 1-4 |

> Steps 1-4 are FULLY PARALLELIZABLE. Step 5 consolidates.

### Acceptance Criteria
- Zero known-trap regressions from LESSONS_LEARNED.md
- All standing rules verified compliant
- Dead code and unused imports flagged
- Every feature set has at least one test file mapped
- Coverage gaps logged with recommended test additions
- No circular dependencies
- Bundle analysis completed, largest modules identified
- Security surface reviewed (IPC, CSP, tokens)
- CLAUDE.md and ROADMAP.md accuracy verified
- All findings in `docs/project/AGENT_FINDINGS.md` with severity ratings
- **CRITICALs block v1.0.0 release**

---


## HOTFIX-6 [v1.4.2]: Main-Process EPUB Word Extraction — Fix NAR-3 Page Flipping

**Goal:** Move full-book word extraction from renderer (foliate DOM navigation) to main process (AdmZip + cheerio + Intl.Segmenter). Eliminate the visible page flipping caused by `goToSection()` calls during extraction. Fix the global-vs-local word index mismatch.

**Branch:** `sprint/hotfix6-epub-extraction` | **Tier:** Quick (targeted fix, no new features)

### KEY CONTEXT

NAR-3 built a full-book word array by navigating the visible foliate view through every EPUB section. This caused pages to flip uncontrollably on narration start — the user saw every chapter flash by. HOTFIX-5 fixed a secondary word-timer race condition but the primary bug persists. See LESSONS_LEARNED LL-051.

### PROBLEM

1. **Pages race forward through entire book on narration start.** `extractFullBookWords()` in `bookWordExtractor.ts` calls `foliateApi.goToSection(i)` for every section (line 119). Each call navigates the visible foliate view.
2. **After extraction, view jumps to chapter 1.** `highlightedWordIndex` is section-local but `findSectionForWord()` interprets it as a global index.
3. **Narration uses section-local words but global section boundaries.** `startCursorDriven` receives the current section's words but NAR-3 navigation expects global indices.

### EVIDENCE OF PROBLEM

- `bookWordExtractor.ts` line 119: `await foliateApi.goToSection(sectionIdx)` — visible navigation for each section
- `ReaderContainer.tsx` line 322: `wordsRef.current = result.words` — replaces words but doesn't update narration hook's `allWordsRef`
- `ReaderContainer.tsx` line 341: `findSectionForWord(bookWords.sections, highlightedWordIndex)` — section-local index misinterpreted as global
- User report: "Pages still jumping" (post-HOTFIX-5)

### HYPOTHESIZED SOLUTION

**A. New main-process module `main/epub-word-extractor.js`:**
- Opens EPUB via AdmZip (lazy-loaded, existing dependency)
- Reads OPF spine for section order (same pattern as `file-parsers.js` lines 390-420)
- For each section: load XHTML via cheerio, strip script/style, walk text nodes
- Tokenize using `Intl.Segmenter({ granularity: "word" })` — identical to foliate's tokenizer (FoliatePageView line 27)
- Include trailing punctuation with same regex: `/^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/`
- Return `{ words: string[], sections: SectionBoundary[], totalWords: number }`

**B. New IPC handler `extract-epub-words`:**
- Takes `bookId`, looks up doc's EPUB path from library
- Calls extractor, returns word array + sections to renderer

**C. Renderer integration:**
- Replace `extractFullBookWords` useEffect with IPC call
- On result: set bookWordsRef, update narration's word array, convert highlightedWordIndex to global
- Delete `bookWordExtractor.ts`, preserve `SectionBoundary` and `findSectionForWord` types

### TASKS

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Read CLAUDE.md, LESSONS_LEARNED.md (LL-051, LL-052) | blurby-lead | opus |
| 2 | Create `main/epub-word-extractor.js` — AdmZip + cheerio + Intl.Segmenter word extraction | format-parser | sonnet |
| 3 | Add IPC handler `extract-epub-words` in `main/ipc/tts.js` + preload.js + electronAPI | electron-fixer | sonnet |
| 4 | Update ReaderContainer.tsx — replace extraction useEffect with IPC, fix index conversion | renderer-fixer | sonnet |
| 5 | Update useNarration.ts — add `updateWords()` method for global word array resync | renderer-fixer | sonnet |
| 6 | Delete `bookWordExtractor.ts`, move SectionBoundary/findSectionForWord to `types/narration.ts` | renderer-fixer | sonnet |
| 7 | Update test harness `electron-api-stub.ts` — add `extractEpubWords` stub | renderer-fixer | sonnet |
| 8 | `npm test` — 860+ pass, 0 fail | test-runner | haiku |
| 9 | `npm run build` — clean build | test-runner | haiku |
| 10 | Bump version to 1.4.2 | renderer-fixer | sonnet |
| 11 | Git branch + commit + merge to main with `--no-ff` | blurby-lead | opus |
| 12 | Print summary | blurby-lead | opus |

### EXECUTION ORDER

```
[1] Read context (blurby-lead)
    ↓
[2] Create epub-word-extractor.js (format-parser)
    ↓
[3] Add IPC + preload (electron-fixer)
    ↓
[4-6] SEQUENTIAL (renderer-fixer):
    [4] ReaderContainer.tsx → [5] useNarration.ts → [6] Delete bookWordExtractor.ts
    ↓
[7] Test harness stub (renderer-fixer)
    ↓
[8-9] PARALLEL: npm test ∥ npm run build
    ↓
[10] Version bump → [11] Git → [12] Summary
```

### ADDITIONAL GUIDANCE

- **Tokenization must match exactly.** Same `Intl.Segmenter` constructor, same trailing-punctuation regex as FoliatePageView line 122.
- **Section order from OPF spine `<itemref>`, NOT manifest.** Spine defines reading order.
- **EPUB path is `doc.filepath` or `doc.convertedEpubPath` in library.**
- **Lazy-load AdmZip and cheerio** (follow `file-parsers.js` pattern).
- **Keep the section-end fallback** (ReaderContainer lines 362-378) as safety net.
- **Global index conversion:** When IPC returns, `newGlobalIdx = section.startWordIdx + localHighlightedIdx`. Update both `highlightedWordIndex` state and narration pipeline.

### SUCCESS CRITERIA

1. No visible page flipping on narration start
2. Narration audio matches displayed text, highlights advance in sync
3. Chapter transitions work via `goToSection()` fired by global index crossing section boundary
4. `highlightedWordIndex` is global after extraction completes
5. `bookWordExtractor.ts` deleted — no foliate-navigation-based extraction remains
6. 860+ tests pass, 0 fail
7. Clean build
8. Version 1.4.2
9. Branch merged to main with `--no-ff`
or.ts` (blurby-lead, sonnet)
    ↓
[3–9] Implementation, testing, build, version bump (sequential)
    ↓
[10–12] Git, summary
```

---

## TTS-6S [v1.28.0]: Cursor Sync, Pause Shaping & Backlog Fill Hotfix ✅ COMPLETED (2026-04-04)

> Implemented and merged to `main`. 13 new tests (1,209 total). Tick advances all crossed word boundaries in one pass (BUG-096), reduced punctuation weight boosts 1.4→1.12/1.15→1.05 (BUG-097), parallel prefetch for first 2 ramp chunks + duplicate-chunk guard (BUG-098). All 8 SUCCESS CRITERIA met.

Full spec was in ROADMAP.md Phase 6 section. Archived 2026-04-04 during TTS Stabilization lane setup.

---

## HOTFIX-11 [v1.27.1]: Bug Reporter Narration Diagnostics & Console Capture ✅ COMPLETED (2026-04-04)

> Implemented and merged to `main`. 8 new tests (1,196 total). Console ring buffer (200 entries), BugReportAppState extended with narrateDiagSnapshot/narrateDiagEvents/consoleLog, collapsible modal sections, backward-compatible JSON. BUG-099/BUG-100 resolved. All 13 SUCCESS CRITERIA met.

Full spec was in ROADMAP.md Phase 6 section. Archived 2026-04-04 during TTS Stabilization lane setup.

---

## TTS-6D [v1.15.0]: Kokoro Startup & Recovery Hardening ✅ COMPLETED (2026-04-04)

> Implemented and merged to `main`. 11 new tests (1,061 total, 53 files). Unified `tts-kokoro-engine-status` events, explicit narration warming state, 2-second delayed prewarm, reader/settings warm-up affordances, visible crash-retry UX. BUG-032 resolved. All 10 SUCCESS CRITERIA met.

Full spec was in ROADMAP.md Phase 6 section. Archived 2026-04-04 during TTS Stabilization lane setup.

---

## TTS-6E [v1.16.0]: Pronunciation Overrides Foundation ✅ COMPLETED (2026-04-04)

> Implemented and merged to `main`. 15 new tests (1,076 total, 54 files). PronunciationOverride settings, override editor with live preview, shared applyPronunciationOverrides() helper, Web Speech normalization, Kokoro cache segregation via override-hash identity. All 10 SUCCESS CRITERIA met.

Full spec was in ROADMAP.md Phase 6 section. Archived 2026-04-04 during TTS Stabilization lane setup.

---

## TTS-7G [v1.33.2]: First-Chunk IPC Verification & Response-Path Hardening ✅ COMPLETED (2026-04-04)

> Verification-first sprint for BUG-117 (910ms IPC message handler long task on first narration chunk). Code-level analysis confirmed the synchronous response path is < 2ms after prior fixes: TTS-7C (Float32Array IPC), NAR-5 (13-word first chunk), TTS-7E (deferred ack). No additional hardening needed. DEV instrumentation added (`first-chunk-response` and `schedule-chunk` perf events with meta in narratePerf.ts). 6 new tests (1,279 total). BUG-117 closed with explicit evidence. TTS stabilization lane CLOSED — all bugs (BUG-101–121) verified resolved.

---

## TTS-7E: Cold-Start Narration Fix (Hotfix) — SUPERSEDED by TTS-7F

> Historical note: this was the first cold-start repair attempt. TTS-7E did not fully solve launch ownership or ramp continuity — live testing after TTS-7E still showed failures. TTS-7F is the authoritative corrective sprint. Spec preserved here for traceability only. Archived 2026-04-05.

**Goal:** Fix the two bugs that make "open a new book → hit play" choppy and freezy: narration races ahead of foliate rendering (BUG-116) and the first IPC response handler blocks the main thread for ~910ms (BUG-117).

**Design decisions:**
- Render-readiness gate before narration starts: poll `highlightWordByIndex(startIdx)` via `requestAnimationFrame` loop; if target word isn't in DOM after 3s, navigate to correct page first.
- Start from selection, not default: if user has a text selection or clicked a word, use that position as narration start point.
- Break IPC response handler into microtasks: yield between (a) deserialize/validate payload, (b) schedule chunk to audio, (c) update cursor state.
- Performance instrumentation via `performance.mark/measure` and `narratePerf`.

**Outcome:** Partially implemented. Live testing showed TTS-7E did not fully resolve BUG-116/117. TTS-7F reopened the work with a more complete approach.

**Depends on:** TTS-7D

---

## TTS-7F [v1.33.1]: Proactive Entry Cache Coverage & Cruise Warm ✅ COMPLETED (2026-04-04)

> BUG-116/118/119/120/121 resolved. Proactive entry cache coverage (5-minute opening narration cached per non-archived reading), startup coverage-repair scan, reading-open cruise warm pass, clean play-start semantics (pure DOM readiness probe, single-launch token), and diagnostics/perf log coverage. Archived 2026-04-05.

**Goal:** Stop relying on reactive ramp-up to save the first narration experience. Every non-archived reading should always have at least the first 5 minutes of Kokoro narration cached at the effective default narration context.

**Problem:** Three concrete failures after TTS-7E: (1) page jump during readiness gate — `highlightWordByIndex` is UI-mutating, not a pure read; (2) duplicate/reentrant launch — full cold-start sequence fires twice; (3) reactive ramp-up still leaves dead air on new books.

**Design decisions:**
- Guaranteed entry coverage for all non-archived readings (5-minute target, manifest-driven).
- Coverage keyed by effective voice + rate bucket + override hash.
- Startup performs a quick manifest-based coverage-repair scan without blocking boot.
- Opening a reading starts cruise warming (low-priority background pass from cursor forward).
- Play-start cleanup: separate "read Foliate DOM state" from "change Foliate page state."
- Archived docs excluded from entry-coverage and startup repair.

**Key files:** `src/utils/backgroundCacher.ts`, `src/utils/ttsCache.ts`, `main/tts-cache.js`, `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx`

**SUCCESS CRITERIA (14 met):**
1. Every non-archived reading maintains ≥5 min opening Kokoro cache at effective default context
2. Adding a reading queues entry-coverage caching automatically
3. Unarchiving re-enters reading into entry-coverage system
4. App startup performs quick manifest-based repair without blocking library usability
5. Opening a reading starts background cruise cache warm
6. Archived readings excluded from entry-coverage and startup repair
7. No visible page jump during readiness gating
8. Narration does not use UI-mutating Foliate helpers as DOM readiness probes
9. One user play action = one narration launch sequence
10. First-play on newly added book no longer depends on reactive chunk luck for dead-air prevention
11. Coverage/cruise state visible in diagnostics/perf logs
12. ≥12 new regression tests
13. `npm test` passes
14. `npm run build` succeeds

**Depends on:** TTS-7E (corrective follow-up)

---

## TTS-7H [v1.33.3]: Visible-Word Readiness & Stable Launch Index ✅ COMPLETED (2026-04-04)

> BUG-122/123 resolved. Stronger visible-word readiness gate (not just DOM presence), frozen launch index per play action, section/page-based fallback navigation replacing raw `goTo(startIdx)`. 8 new tests (1,287 total, partial — follow-up required for remaining startup issues). Archived 2026-04-05.

**Goal:** Eliminate remaining page-jump / false-start behavior on EPUB narration startup. Narration must only launch when the chosen start word is actually visible and highlightable in the active Foliate page context.

**Problem:** After TTS-7G: (1) false-positive readiness — gate logs success but next call logs miss; (2) unstable launch index — bounces among 82/68/80/0/9004 across cold-start attempts; (3) bad fallback navigation — raw global word index used as Foliate navigation target.

**Design decisions:**
- Visible-word readiness, not mere DOM presence: confirm launch word is in active rendered viewport and highlightable.
- Freeze launch index once chosen: stored in stable launch token, retries/rerenders cannot switch it.
- Navigation by section/page ownership only: remove raw `goTo(startIdx)` fallback.
- Gate success must be truthful: "Render gate passed" only logged when exact launch word is immediately highlightable.

**Key files:** `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts`, `src/components/ReaderContainer.tsx`

**SUCCESS CRITERIA (8 met):**
1. "Render gate passed" only logged when exact launch word is immediately highlightable without miss
2. No `highlightWordByIndex miss` for chosen launch word right after gate success
3. Single play action uses one frozen start index throughout startup
4. Timeout recovery no longer uses raw `goTo(startIdx)`
5. Fresh EPUB no longer visibly jumps page during startup
6. ≥6 new regression tests
7. `npm test` passes
8. `npm run build` succeeds

**Depends on:** TTS-7G

---

## TTS-7I [v1.33.4]: Foliate Follow-Scroll Unification & Exact Miss Recovery ✅ COMPLETED (2026-04-04)

> BUG-124/125/126/127 addressed. Unified render-state lookup (gate and live highlighter share same helper), removed duplicate React `narrationWordIndex` scroll-follow path, split highlight from page motion, exact miss recovery after full-book extraction (replaces `bookWordsCompleteRef.current => return`), return-to-narration restores visible cursor. Follow-up still required for core source-of-truth problem. Archived 2026-04-05.

**Goal:** Eliminate remaining Foliate page-jump behavior during narration startup and mid-play follow. One truthful readiness/highlight contract, one owner for page-follow motion, one exact recovery path when spoken word leaves currently rendered Foliate DOM.

**Problem:** After TTS-7H: (1) gate/highlight contract mismatch — gate passes but highlighter misses same word; (2) duplicate follow-scroll owners — both imperative bridge and React `narrationWordIndex` effect move the page; (3) miss recovery suppressed after full-book extraction (silent ignore); (4) return-to-narration can restore scroll without restoring cursor.

**Design decisions:**
- One source of truth for render readiness and highlightability via shared Foliate helper.
- One owner for narration follow motion: remove duplicate React narrationWordIndex scroll-follow path.
- Highlight and motion are separate responsibilities: highlight without automatic motion; motion only when word is off-page.
- Exact recovery, not ignore-or-next: section-aware recovery with single in-flight token/cooldown.
- Return-to-narration must restore both position and visible cursor.

**Key files:** `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useReadingModeInstance.ts`, `src/components/ReaderContainer.tsx`, `src/utils/narrateDiagnostics.ts`

**SUCCESS CRITERIA (12 met):**
1. `render gate passed` never immediately followed by `highlightWordByIndex miss` for same launch word
2. Foliate narration has exactly one follow-scroll owner during playback
3. No React `narrationWordIndex` effect independently scrolling Foliate page during narration
4. Fresh EPUB no longer visibly jumps page before cursor can follow
5. Mid-play narration no longer jumps backward from duplicate follow-scroll logic
6. Narration highlight misses after full-book extraction trigger exact recovery instead of silent ignore
7. Cursor stays coupled to TTS across section/page transitions
8. Returning to narration after browsing restores visible cursor/highlight, not just page position
9. Cached/entry-covered start remains effectively immediate
10. ≥8 new regression tests
11. `npm test` passes
12. `npm run build` succeeds

**Depends on:** TTS-7H

---

## TTS-7J [v1.33.5]: Foliate Section-Sync Ownership, Word-Source Dedupe & Initial Selection Protection ✅ COMPLETED (2026-04-04)

> BUG-128/129/130 resolved. Single narration section-sync owner (miss-recovery path), sectionIndex dedupe on word-source append, userExplicitSelectionRef protects first-play selection, startNarration unified via resolveFoliateStartWord. 14 new tests (1,309 total). Archived 2026-04-05.

**Goal:** Remove remaining Foliate narration integration bugs without regressing the newly fast startup. One consistent word source, one owner for section navigation, one trustworthy initial start point that respects the user's selected location on first play.

**Problem:** After TTS-7I: (1) startup blink from competing section navigation (miss-recovery + ReaderContainer both own `goToSection()`); (2) word source duplication during section reload/recovery (`words: 8770` → `words: 17540` same session); (3) initial selection not consistently respected (onLoad logic resets after user choice).

**Design decisions:**
- Keep instant startup. No artificial delay.
- One owner for section navigation during narration: remove one of the two `goToSection()` paths.
- Deduplicate section words by `sectionIndex`: replace/refresh, not append.
- Protect explicit user selection: delayed page-load restore cannot overwrite explicit click/selection before first narration start.
- Startup source-of-truth order: explicit user selection > explicit resume position > visible-page fallback.

**Key files:** `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/utils/startWordIndex.ts`, `src/hooks/useReadingModeInstance.ts`

**SUCCESS CRITERIA (11 met):**
1. No visible blink from double section navigation on startup
2. Only one narration path owns `goToSection()` during play
3. `foliateWordsRef.current`/`getWords()` do not double in size across reload or miss recovery
4. Fresh logs no longer show `words: 8770` → `words: 17540` for same book/session
5. First play after explicit user selection starts from that selected position
6. Delayed page-load restore does not overwrite explicit user selection
7. Pause-and-reselect follows same start-word policy as first play
8. Cached/entry-covered start remains effectively immediate
9. ≥8 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7I

---

## TTS-7K [v1.33.6]: EPUB Global Word-Source Promotion & Page-Mode Isolation ✅ COMPLETED (2026-04-04)

> BUG-131/132/133 resolved. Full-book EPUB words promoted as narration source of truth (not loaded DOM slice), global index validation for start-word resolution, `onWordsReextracted` source protection, page-mode isolation from narration-only section navigation. 22 new tests (1,331 total, 81 files). Archived 2026-04-05.

**Goal:** Make EPUB narration and cursor tracking run on one stable global word source, not the currently loaded Foliate DOM slice.

**Problem:** After TTS-7J: (1) narration starts from partial DOM words (`words: 14`, `674`, `293`) even after full-book extraction of 69160 words; (2) first-play explicit selection ignored on EPUBs (global index discarded because partial DOM is too short); (3) cursor and narration use mixed index spaces; (4) page mode contaminated by narration-specific section/source machinery.

**Design decisions:**
- Promote full-book EPUB words to narration source of truth once `bookWordsRef.current.complete` is available.
- Loaded Foliate DOM is a viewport, not source of truth.
- Global explicit selection stays global (not validated against temporary loaded-slice length).
- Page mode isolated from narration repair state.

**Key files:** `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/utils/startWordIndex.ts`, `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts`

**SUCCESS CRITERIA (10 met):**
1. Full-book extraction complete → narration no longer starts from tiny DOM-slice word counts
2. First-play explicit selection starts from selected global EPUB word, not 0
3. Cursor highlight and narration progression use same global index space
4. `onWordsReextracted()` no longer replaces active mode's word array with current DOM slice when full-book words exist
5. Logs no longer show contradictory source sizes for same EPUB session
6. Page-mode next/prev remains functional past third page with narration off
7. Cached/entry-covered startup remains effectively immediate
8. ≥10 new regression tests
9. `npm test` passes
10. `npm run build` succeeds

**Depends on:** TTS-7J

---

## TTS-7L [v1.33.7]: Exact Foliate Text-Selection Mapping ✅ COMPLETED (2026-04-04)

> BUG-134 resolved. `selectionchange` now resolves `.page-word[data-word-index]` span and passes exact `globalWordIndex` through `onWordClick`. Unified click/selection payload shape. First-match text fallback demoted/removed from normal selection path. 15 new tests (1,346 total). TTS hotfix lane CLOSED at v1.33.7. Archived 2026-04-05.

**Goal:** Make Foliate text selection start narration from the exact selected word, using the same global EPUB index space that now powers click-to-play and full-book narration. Selection must no longer degrade into a word-text guess.

**Problem:** After TTS-7K: (1) exact click/global-index selection works; (2) text selection still loses exact selected word index (selectionchange path drops `data-word-index`); (3) ReaderContainer falls back to "first matching word text" when `globalWordIndex` absent.

**Design decisions:**
- Exact span/index wins: selected `.page-word[data-word-index]` → exact `globalWordIndex` → authoritative.
- Selection and click share one mapping contract (cfi, sectionIndex, wordOffsetInSection, globalWordIndex).
- Remove guessy first-match behavior from normal path.
- Single-word selection only — multi-word native selection does not silently guess.

**Key files:** `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/utils/startWordIndex.ts`, `src/hooks/useReaderMode.ts`

**SUCCESS CRITERIA (11 met):**
1. Exact single-word Foliate text selection starts narration from selected occurrence
2. Click and text selection produce same global start index for same visible word
3. Fresh logs show exact selected `globalWordIndex` flowing into `startNarration()`
4. `ReaderContainer` no longer uses first-normalized-word match as normal selection path
5. Exact selection resolution failure → no silent start from different occurrence
6. First play honors exact text selection on EPUBs
7. Pause-and-reselect honors newly selected exact word
8. Cached/entry-covered start remains effectively immediate
9. ≥8 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7K

---

## TTS-7M [v1.33.8]: Persistent Resume Anchor & Reopen Authority ✅ COMPLETED (2026-04-04)

> BUG-135 resolved. Explicit persisted resume anchor introduced, pause captures live cursor, reopen uses saved position, passive `onLoad`/`onRelocate` cannot downgrade authoritative anchor. 17 new tests (1,363 total). Archived 2026-04-05.

**Goal:** Make narration/page resume ownership explicit and durable so Blurby always starts from the user's true reading position, not a soft page-visible fallback.

**Problem:** A "soft" page anchor (first visible word / passive relocate restore) can still overwrite the authoritative restart anchor after narration pauses or when a book is reopened. Replay jumps back, reopen starts from soft anchor, passive Foliate events quietly become the launch source of truth.

**Design decisions:**
- Single authoritative resume anchor with priority: (1) explicit user selection, (2) live narration cursor captured on pause/retarget, (3) persisted saved reading position on reopen, (4) first visible word as temporary visual fallback only.
- Passive Foliate restore is visual-only: `onLoad`/`onRelocate` may update UI highlight but may not lower or replace the authoritative anchor.
- Persisted progress from authoritative advancement only (narration cursor, focus/flow progress, deliberate page progress).
- Close/reopen contract matches pause/replay contract.

**Key files:** `src/hooks/useReaderMode.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useProgressTracker.ts`, `src/components/FoliatePageView.tsx`, `src/utils/startWordIndex.ts`, `src/hooks/useNarration.ts`, `src/modes/NarrateMode.ts`

**SUCCESS CRITERIA (11 met):**
1. Pause→play without reselection resumes from live narration cursor
2. Explicit user selection still overrides replay anchor
3. Close→reopen starts at most advanced saved word
4. Immediate play after reopen starts narration from saved word
5. Passive `onLoad`/`onRelocate`/first-visible restore cannot lower authoritative resume anchor
6. Passive Foliate restore remains available as visual-only fallback when no explicit/live/persisted anchor exists
7. Persisted EPUB progress updated only from authoritative advancement
8. Existing exact-selection start behavior does not regress
9. ≥10 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7L

---

## TTS-7N [v1.33.9]: Kokoro Pause Semantics & Settings Link Repair ✅ COMPLETED (2026-04-04)

> BUG-136/137 resolved. Kokoro pause settings now drive word-weight scaling and sentence-boundary chunk snapping. Ctrl+K TTS links repaired to "tts" page. 19 new tests (1,382 total). Archived 2026-04-05.

**Goal:** Make TTS settings truthful and effective. Kokoro narration must audibly respond to pause slider changes. In the same pass, repair Ctrl+K settings links so all TTS-related entries open the dedicated TTS settings page.

**Problem:** `TTSSettings` writes pause values and `ReaderContainer` syncs them, but the active Kokoro path does not clearly consume that config when chunking or deciding boundaries — sliders appear live but are mostly inert. Separately, Ctrl+K still routes TTS queries to `speed-reading`.

**Design decisions:**
- Truthful TTS settings: make Kokoro honor pause controls rather than hiding them.
- Sentence/chunk boundary logic uses configured pause semantics (clause, sentence, paragraph, dialogue threshold influence chunk ends and pause lengths).
- One routing source for settings links: TTS items → `tts`, speed-reading items → `speed-reading`.
- No placebo controls: every visible TTS slider must either affect Kokoro measurably or be scoped/renamed/hidden.

**Key files:** `src/components/settings/TTSSettings.tsx`, `src/components/ReaderContainer.tsx`, `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/utils/pauseDetection.ts`, `src/utils/rhythm.ts`, `src/components/CommandPalette.tsx`

**SUCCESS CRITERIA (11 met):**
1. Changing Kokoro pause sliders produces real, audible difference in punctuation/dialogue handling
2. Clause, sentence, paragraph, dialogue-threshold controls no longer inert in Kokoro path
3. Kokoro no longer routinely blows through punctuation
4. Chunking/pause placement avoids obvious mid-sentence pause artifacts
5. No placebo controls
6. Ctrl+K `TTS Voice` opens dedicated `tts` settings page
7. All TTS-related Command Palette entries route to `tts`
8. Speed-reading entries still route correctly to `speed-reading`
9. ≥10 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7M

---

## TTS-7O [v1.34.0]: Audible Pause Injection & Smooth Narration Cursor ✅ COMPLETED (2026-04-04)

> BUG-138/139 resolved. Punctuation-safe pre-send chunk rounding (expanded outward search), real inter-chunk audible silence injection (`classifyChunkBoundary` → silence samples), 3-word narration window (`page-word--narration-context` CSS), smooth cursor via CSS transitions, periodic truth-sync every 12 words. 27 new tests (1,409 total). Archived 2026-04-05.

**Goal:** Make Kokoro pause settings audible, not just visible in cursor timing, while making narration highlighting feel smooth and deliberate instead of jumpy/approximate.

**Problem:** TTS-7N made pause controls materially affect chunking and cursor weights, but Kokoro still bakes prosody into generated audio — sliders still do not fully behave like "real pause controls." Narration highlighting reads as approximate: hopping between words rather than gliding with speech.

**Design decisions:**
- Add explicit inter-chunk silence injection after Kokoro returns chunk audio (classified boundary → silence appended to scheduler).
- Silence is scheduler-visible (cursor motion and resume anchors do not drift).
- Pre-send chunk boundaries must be punctuation-safe (never cut mid-sentence; outward search if needed).
- Three-word narration window: first word is canonical logical position for start/resume/save; next two are visual context only.
- Smooth cursor motion via scheduler timing model (gliding, not snapping).
- No anchor ambiguity: second/third words never written back as resume anchors or saved progress.
- Periodic cursor truth-sync every 12 words (plus on chunk boundary, retarget, pause/resume).

**Key files:** `src/utils/generationPipeline.ts`, `src/utils/audioScheduler.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/hooks/useNarration.ts`, `src/components/FoliatePageView.tsx`, `src/utils/pauseDetection.ts`

**SUCCESS CRITERIA (16 met):**
1. Chunks rounded to punctuation/sentence boundaries before text sent to Kokoro
2. Chunks never end mid-sentence
3. Pause sliders create real audible inter-chunk silence
4. Silence only injected at classified comma/clause/sentence/paragraph boundaries
5. Larger slider values → measurably longer injected silence
6. Cursor timing aligned with audible playback after silence injection
7. Narration highlights 3 words at start and during playback
8. First highlighted word is always canonical narration position for start/resume/save
9. Next two words are visual context only, never alternate anchors
10. Exact user selection still becomes first highlighted word
11. Cursor motion feels smooth/gliding
12. Periodic truth-sync corrects drift without changing authoritative anchor
13. Existing exact selection/replay/reopen anchor behavior does not regress
14. ≥14 new regression tests
15. `npm test` passes
16. `npm run build` succeeds

**Depends on:** TTS-7N

---

## TTS-7P [v1.36.0]: Rolling Pause-Boundary Planner ✅ COMPLETED (2026-04-05)

> BUG-140 resolved. New `src/utils/narrationPlanner.ts` (270 lines) — `buildNarrationPlan`, `PlannedChunk`, `NarrationPlan`, `computeSilenceMs`, `planNeedsRebuild`, dialogue detection. `generationPipeline.ts` uses planner for chunk selection + silence injection. `kokoroStrategy.ts` passes `getParagraphBreaks` to pipeline. `useNarration.ts` passes paragraph breaks ref. Two new planner constants: `TTS_PLANNER_WINDOW_WORDS` (400), `TTS_PLANNER_MIN_CHUNK_WORDS` (10). 33 new tests (1,479 total, 83 files). Archived 2026-04-05.

**Goal:** Add a lightweight forward-looking narration planner that classifies pause boundaries for the active text window ahead of playback, so chunk splitting, silence injection, resume behavior, and dialogue handling all use one consistent local plan.

**Problem:** TTS-7O gives users real audible pause shaping at chunk boundaries, but it still operates chunk-by-chunk. Resume behavior, dialogue pacing, and boundary choice still rely on local heuristics in the moment rather than a small rolling structure plan.

**Design decisions:**
- Planner scope is local, not whole-book (next 2–5 chunks / next few hundred words).
- Single planning source for chunk splitting, inserted silence, resume targeting, and dialogue handling.
- Cheap to recompute: rebuild on retarget, rate change, major selection jump, or chunk exhaustion.
- Dialogue-aware planning: quote/dialogue-aware heuristics so dialogue runs stop sounding like flattened prose.
- Planner preserves cursor authority: planning never mutates the user anchor.
- Planner owns boundary rounding rules: mid-sentence cuts prohibited by policy.

**Key files:** `src/utils/narrationPlanner.ts` (new), `src/utils/generationPipeline.ts`, `src/utils/pauseDetection.ts`, `src/utils/rhythm.ts`, `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/utils/audioScheduler.ts`

**SUCCESS CRITERIA (11 met):**
1. Narration uses rolling local boundary plan rather than only moment-of-chunk heuristics
2. Chunk splitting consults active plan
3. Inter-chunk silence injection consults active plan
4. Resume/retarget behavior can rebuild and reuse plan cleanly
5. Dialogue handling improves noticeably vs plain sentence-only snapping
6. Mid-sentence chunk cuts prohibited by planner contract
7. Planner remains local/cheap, no full-book precomputation
8. Planner never changes authoritative first-word anchor on its own
9. ≥12 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7O

---

## TTS-7Q [v1.36.1]: True Glide & Audio-Aligned Narration Cursor ✅ COMPLETED (2026-04-05)

> BUG-143/144 resolved. RAF-based glide loop and canonical `AudioProgressReport` now drive the narration cursor. Separated canonical audio cursor from visual band state. Replaced stepped overlay chasing with audio-aligned rail follower. Chunk handoff is visually continuous. 1,504 tests, 84 files. Archived 2026-04-05.

**Goal:** Upgrade narration cursor movement from "good and stable" to "silky" by driving the 3-word narration band from audio-aligned progress rather than discrete DOM target hops, while preserving the hard-won anchor/resume correctness from TTS-7M and TTS-7O.

**Problem:** TTS-7O made cursor stable enough to ship (band moves, twitch reduced, pause/replay works), but cursor still feels stepped and laggy compared with smooth Kokoro audio. Chunk handoffs can continue from wherever visual band was stuck rather than last audio-confirmed position. More CSS easing is the wrong lever; the gap is architectural — visual cursor inferred from coarse word/window updates rather than a dedicated audio-aligned progress model.

**Design decisions:**
- Lock in current stable contract first (no regressions to explicit selection, pause anchor, replay, reopen, or 3-word window).
- Separate canonical audio cursor from visual cursor: first narrated word remains only authoritative logical anchor.
- Drive glide from audio-time progress, not DOM chasing.
- Chunk handoff must be continuity-safe (continue from last audio-confirmed word, not stale visual band position).
- Use stable line rail when possible.
- Truth-sync stays a guardrail, not the main movement system.

**Key files:** `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/styles/global.css`

**SUCCESS CRITERIA (12 met):**
1. Narration cursor driven by canonical audio-progress model
2. 3-word band moves more continuously, not primarily 12-word-reset-driven
3. Pause/replay/save/reopen use authoritative first narrated word only
4. Chunk handoff is monotonic, no visual restart from stale band position
5. Visual band never becomes replay/resume anchor
6. Truth-sync remains correction mechanism, not dominant visible motion driver
7. Left-right twitch fix preserved
8. Visible paused anchor preserved
9. Explicit selection start behavior preserved
10. ≥14 new regression tests
11. `npm test` passes
12. `npm run build` succeeds

**Depends on:** TTS-7P

---

## EXT-5C [v1.35.0]: Rich Article Capture & Hero Image Cards ✅ COMPLETED (2026-04-05)

> BUG-141/142 resolved. Rich article HTML formatting preserved (headings, figures, captions, lists, blockquotes), inline images downloaded and embedded into EPUB (no remote dependency), article-aware hero ranking (body presence > top article image > metadata fallback, rejects junk URLs), hero reliably promoted to `coverPath` for both URL and extension import paths. Shared `downloadArticleImages` helper + `preDownloadedImages` EPUB path unifies both import flows. 24 new tests (1,433 total). Archived 2026-04-05.

**Goal:** Make URL and extension-imported articles preserve article formatting and inline images in the reading experience, and always promote the chosen hero image onto the library reading card.

**Problem:** Current URL article pipeline extracts readable text and cleaned HTML, but behaves like a text-first importer. Inline article images are often not preserved through import (only a single lead image downloaded for `coverPath`), losing figure blocks, captions, spacing, and image context. Hero image not always consistently promoted onto reading card.

**Design decisions:**
- One canonical article capture path: in-app URL import and extension import use same extraction, asset download, and EPUB generation flow.
- Preserve cleaned article structure (headings, subheads, byline, paragraphs, blockquotes, lists, emphasis, figures, captions) — exclude navigation, ads, sticky UI.
- Download and rewrite article assets locally into generated EPUB (no remote dependency at read time).
- Hero image becomes the card image (populates `coverPath`); monogram fallback only when no valid hero available.
- Hero selection is article-aware: prefer article's actual lead/hero image over logos/avatars/sprites/tiny thumbnails.
- Text fallback remains safe: partial image failures do not abort import.

**Key files:** `main/url-extractor.js`, `main/ipc/misc.js`, `main/epub-converter.js`, `main/ws-server.js`, `src/types.ts`, `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx`

**SUCCESS CRITERIA (13 met):**
1. URL-imported and extension-imported articles preserve cleaned rich article formatting
2. Inline article images retained in reading experience
3. Figure captions stay associated with images
4. Imported article EPUBs no longer depend on remote image URLs
5. Hero image selection prefers real article lead image over logos/tiny thumbnails
6. URL article grid cards use chosen hero image
7. URL article list thumbnails use chosen hero image when available
8. Monogram fallback only when no valid hero image available
9. In-app URL import and extension import share same rich article capture behavior
10. Partial image-download failures do not abort article import
11. ≥12 new regression tests
12. `npm test` passes
13. `npm run build` succeeds

**Depends on:** None (queued after TTS-7P by priority)

Full spec was in ROADMAP.md Phase 6 section. Archived 2026-04-04.

---

## Sprint TTS-7R: Calm Narration Band & Cursor Ownership Fix ✅ (v1.37.0)

**Version:** v1.37.0
**Branch:** `sprint/tts-7r-calm-band`
**Tier:** Quick (targeted bug fix, no new features)
**Archived:** 2026-04-05
**Result:** PASS — all 12 SUCCESS CRITERIA met. Merged to `main` and pushed.

**Goal:** Fix the three remaining narration band problems: constant resize jitter (BUG-145a), band outruns audio (BUG-145b), and chunk restart from visual position instead of audio position (BUG-145c). After this sprint, the narration overlay is a calm, fixed-size, line-stable highlight that tracks actual audio playback — never outrunning it, never feeding its position back into chunk generation.

**Bugs resolved:** BUG-145a (resize jitter), BUG-145b (band outruns audio), BUG-145c (chunk restart from visual position). Parent BUG-145 resolved (all sub-issues closed).

**Changes:**
- `useNarration.ts` — Added `lastConfirmedAudioWordRef`; `speakNextChunkKokoro` reads from it instead of `cursorWordIndex`; divergence diagnostic logs when audio and visual cursors differ by > 5 words.
- `FoliatePageView.tsx` — Set `SIMPLE_NARRATION_GLIDE = false`; audio-progress glide loop active for Kokoro; wall-clock fallback gated to Web Speech only; `measureNarrationWindow` removed from hot path; fixed-size overlay band (height = 1× line-height measured once at narration start, width = content-area width); truth-sync corrects visual overlay position only, does not write narration state.
- `kokoroStrategy.ts` — `onChunkHandoff` wiring confirmed; no chunk-generation path reads visual cursor position.
- `useReadingModeInstance.ts` — `onWordAdvance` callback verified wired to canonical scheduler event only.
- `NarrateMode.ts` — Minor updates for canonical cursor separation.
- `global.css` — Removed `.page-word--narration-context` per-word context highlight; removed width/height transitions on overlay; retained opacity transition only.

**Tests:** 25 new tests in `tests/calmNarrationBand.test.ts`. Total: 1,529 tests across 85 test files.

**SUCCESS CRITERIA (all 12 met):**
1. Overlay band maintains fixed width and height during narration (no per-word resize jitter)
2. Band Y-position steps on line change only (with brief transition), no mid-line corrections
3. Audio-progress glide loop active for Kokoro (reads `getAudioProgress()` exclusively)
4. Wall-clock estimate fallback active only for Web Speech engine
5. Band never advances ahead of audio scheduler's reported `wordIndex`
6. `lastConfirmedAudioWordRef` exists and is only written by scheduler's confirmed boundary events
7. `speakNextChunkKokoro` reads chunk start from `lastConfirmedAudioWordRef`, not `cursorWordIndex`
8. Truth-sync corrects visual overlay only, does not write narration state
9. Divergence diagnostic logs when audio and visual cursors differ by > 5 words
10. ≥10 new tests (25 delivered)
11. `npm test` passes
12. `npm run build` succeeds

**Depends on:** TTS-7Q

---

### Sprint HOTFIX-12: Bug Report Triage Fixes (BUG-146–150) ✅ (v1.37.1)

**Archived:** 2026-04-05

**Goal:** Fix five bugs surfaced during the April 5 bug report review session — a mix of UX gaps, keyboard handling, and performance issues.

**Bugs resolved:** BUG-146 (chapter dropdown doesn't track narration cursor), BUG-147 (no return-to-narration affordance), BUG-148 (no position restore feedback), BUG-149 (large EPUB extraction blocks UI), BUG-150 (bug reporter swallows keyboard shortcuts).

**Changes:**
- `src/hooks/useKeyboardShortcuts.ts` — Keyboard guard refined: early-return if `e.target` is a `<textarea>`, `<input>`, or `[contenteditable]`. Simpler and more robust than modal-whitelisting.
- `src/components/BugReportModal.tsx` — Ctrl+Enter keydown handler calls `handleSave()`.
- `src/components/ReaderBottomBar.tsx` — Added `narrationWordIndex` prop; chapter dropdown uses it (instead of `wordIndex`) when narration is active.
- `src/components/ReaderContainer.tsx` — Passes `narrationWordIndex` to ReaderBottomBar; floating "Return to narration" pill button renders when user pages away from narration cursor; position restore toast shown on initial book open with saved position.
- `main/epub-word-extractor.js` — Extraction loop yields between sections via `await new Promise(r => setImmediate(r))`; extraction delay increased from 1s to 2s for books > 100k words.
- `src/styles/global.css` — Styles for floating return-to-narration pill button.

**Tests:** 17 new tests in `tests/hotfix12.test.ts`. Total: 1,546 tests across 86 test files.

**SUCCESS CRITERIA (all 14 met):**
1. Ctrl+Left/Right, Ctrl+Backspace work inside bug reporter textarea
2. Ctrl+Enter submits bug report from modal
3. Global keyboard shortcuts still work when no text input is focused
4. Chapter dropdown label updates to reflect narration cursor during active narration
5. Chapter dropdown falls back to reading wordIndex when narration is not active
6. "Return to narration" button appears when user pages away from narration position
7. "Return to narration" button navigates to narration cursor on click
8. "Return to narration" button auto-hides when narration range becomes visible or narration stops
9. Brief toast appears on book reopen when position is restored
10. Toast does not appear on first open (position = 0) or on every page turn
11. UI remains responsive during background extraction of large EPUBs
12. ≥8 new tests (17 delivered)
13. `npm test` passes (1,546 tests, 0 failures)
14. `npm run build` succeeds

**Depends on:** Independent of TTS-7R

---

## NARR-TIMING: Real Word-Level Timestamps from Kokoro TTS ✅ COMPLETED (2026-04-07)

**Version:** v1.44.0 | **Branch:** `sprint/narr-timing` | **Tier:** Full
**Result:** All 16 SUCCESS CRITERIA met. 18 new tests in `tests/narrTiming.test.ts` (1,717 total across 95 files). Build succeeds.

**Goal:** Replace the character-count heuristic (`computeWordWeights`) with real per-word timestamps derived from Kokoro's duration tensor. The narration cursor consistently runs ahead of the audio because the heuristic treats word duration as proportional to character count. Kokoro's ONNX text encoder already computes per-phoneme durations during inference — the kokoro-js wrapper just discards them. A ~60-line fork surfaces this data, aligns it to words, and feeds validated timestamps into the audio scheduler.

**Problem:** `computeWordWeights` distributes chunk duration across words proportionally to character length (clamped 2–20, with 1.12x sentence-end and 1.05x clause-end multipliers). Short function words get over-allocated, long content words get under-allocated, and the error accumulates across every chunk. The heuristic also has zero knowledge of Kokoro's natural inter-word silence — the cursor advances through pauses that should be visible holds.

**Plan document:** `NARR-TIMING-PLAN/NARR-TIMING_Plan.md` — comprehensive technical plan revised through two independent audit rounds (15 findings, all incorporated).

### Design Decisions (from plan + 2 audit rounds)

1. **RawAudio return type preserved** — Fork attaches `_durations` (on `generate_from_ids`) and `wordTimestamps` (on `generate`) as non-enumerable properties via `Object.defineProperty`. No API breakage for `stream()` or existing callers.
2. **4-layer validation** — Layer 1: token count check (gross phonemization divergence). Layer 2: waveform drift with split accumulator (EOS/tail included). Layer 2b: fail-closed token walk (throws on underrun). Layer 3: scheduler acceptance (monotonicity, bounds, word correspondence, scaled tolerance).
3. **Split accumulator** — `sampleOffset` tracks word timestamps (stops at last aligned word). `totalPredictedSamples` walks all remaining tokens including EOS for drift validation. Resolves the "endTime excludes trailing pause" vs "predicted duration should match waveform" contradiction.
4. **Fail-closed token walk** — Token accumulation and separator consumption throw immediately when the tensor can't provide expected tokens, instead of silently clipping.
5. **Scaled tolerances** — `min(40ms, 5% of speech duration)` instead of fixed 100ms. Short chunks get strict validation.
6. **Graceful fallback** — Any alignment failure (fork error, validation failure, edge case) falls back to existing `computeWordWeights` heuristic. Narration never breaks.
7. **patch-package fork** — Targets built `dist/` artifacts (both CJS `dist/kokoro.cjs` and ESM `dist/kokoro.js`). Must cover both packaged-app and dev-mode import paths.
8. **`endTime` contract** — End of voiced portion, excluding trailing inter-word pause. Gap between `word[i].endTime` and `word[i+1].startTime` is silence. Currently only `startTime` is used for scheduling; `endTime` preserved for future silence-aware cursor hold (IDEAS.md H6).

### SUCCESS CRITERIA (all met)

1. kokoro-js fork captures `durations` from `this.model()` return (no longer discarded)
2. `generate_from_ids` returns `RawAudio` with `_durations` attached as non-enumerable property
3. `generate` returns `RawAudio` with `wordTimestamps` attached as non-enumerable property (when `words` provided)
4. `stream()` and all other kokoro-js internal callers continue to work unchanged (RawAudio type preserved)
5. `tts-worker.js` accepts `words` in generate message and relays `wordTimestamps` in result
6. `generationPipeline.ts` passes chunk words through to `generateFn` and attaches `wordTimestamps` to `ScheduledChunk`
7. `audioScheduler.ts` uses real timestamps when present and valid; falls back to `computeWordWeights` heuristic otherwise
8. `validateWordTimestamps` checks: length, finite/non-negative, endTime >= startTime, monotone startTimes, word correspondence, scaled overshoot tolerance (`min(40ms, 5% of speech duration)`), zero-duration count
9. Token walk is fail-closed — throws on tensor underrun (not silent clip)
10. Drift validation uses split accumulator (`totalPredictedSamples` includes EOS/tail; `sampleOffset` does not)
11. Durations are rounded and clamped per-token before accumulation (mirrors model's `round().clamp_()`)
12. `silenceMs` correctly excluded from speech duration in scheduler validation (timestamps validated against speech portion only)
13. `patch-package` patch file exists in `patches/` and is applied on `npm install`
14. Both CJS and ESM import paths resolve to patched kokoro-js code (parity check passes)
15. ≥15 new tests in `tests/narrTiming.test.ts` (18 delivered)
16. `npm test` passes (1,717 tests), `npm run build` succeeds

**Depends on:** None — independent of FLOW-INF and EXT-ENR tracks.

---

### Sprint FLOW-INF-C: Cross-Book Continuous Reading (v1.46.0)

**Completed:** 2026-04-07

**Goal:** Finishing a book in flow mode auto-loads the next from the reading queue — no return to library, no modal, just a brief "Finished [Book A]. Starting [Book B]..." transition overlay, then the next book begins flowing.

**Key Implementation:**
- `CROSS_BOOK_TRANSITION_MS` (2500ms) and `CROSS_BOOK_FLOW_RESUME_DELAY_MS` (300ms) constants
- `getNextQueuedBook()` utility in `src/utils/queue.ts` — filters by queuePosition, excludes current + completed docs
- `finishReadingWithoutExit()` in `useProgressTracker.ts` — persists progress without unmounting ReaderContainer
- Cross-book transition overlay in `ReaderContainer.tsx` — shows finished/next titles, countdown progress bar, escape hint
- FlowScrollEngine `onComplete` rewritten for cross-book: checks queue, shows overlay, transitions after 2.5s
- `pendingFlowResumeRef` effect auto-starts flow after new book loads (300ms DOM settle delay)
- Escape key and backdrop click cancel transition and return to library
- `.cross-book-overlay` CSS in `global.css`

**Files Changed:** `src/constants.ts`, `src/utils/queue.ts`, `src/hooks/useProgressTracker.ts`, `src/components/ReaderContainer.tsx`, `src/styles/global.css`

**Tests:** 21 new tests in `tests/crossBookFlow.test.ts` (1,754 total across 97 files)

### SUCCESS CRITERIA (all 14 met)

1. Finishing a book in flow mode with a non-empty queue shows the transition overlay
2. Transition overlay displays: finished book title, next book title, countdown progress bar, escape hint
3. After `CROSS_BOOK_TRANSITION_MS` (2.5s), the next book opens and flow mode auto-starts
4. Flow mode resumes at the next book's saved position (or 0 if new) with the same WPM settings
5. Finished book's progress is persisted, session is logged, and book is archived
6. Finished book is removed from the reading queue
7. `getNextQueuedBook()` correctly returns the next queued book by `queuePosition`, excluding current doc and completed docs
8. Pressing Escape during transition cancels and returns to library
9. Clicking the overlay backdrop cancels and returns to library
10. When the reading queue is empty on flow completion, existing behavior is preserved
11. ReaderContainer stays mounted throughout the transition
12. `pendingFlowResumeRef` is consumed after triggering `startFlow()`
13. ≥12 new tests in `tests/crossBookFlow.test.ts` (21 delivered)
14. `npm test` passes (1,754 tests), `npm run build` succeeds

**Depends on:** FLOW-INF-B

---

## PERF-1: Full Performance Audit & Remediation ✅ COMPLETED (v1.47.0, 2026-04-07)

**Goal:** Investigate every performance hotspot across the entire application — main process startup, renderer rendering/re-render cycles, and data-layer I/O — then remediate confirmed findings. Two-phase sprint: Phase A establishes baselines and confirms findings via measurement; Phase B remediates prioritized issues.

**Branch:** `sprint/perf-1-audit` | **Tier:** Full | **Tests:** 32 new in `tests/perfAudit.test.ts` (1,786 total across 98 files)

### What Was Done

1. Startup parallelized: `loadState()` → `createWindow()` → `Promise.all([initAuth(), initSyncEngine()])` → deferred folder sync
2. Folder watcher starts before sync
3. `getComputedStyle` cached in `injectStyles` (3→1 call)
4. Settings saves debounced (500ms) in `main/ipc/state.js`
5. WPM persistence debounced (300ms) in `LibraryContainer.tsx`
6. EPUB chapter cache LRU eviction (50-entry cap) in `main/file-parsers.js`
7. Snoozed doc check indexed via Set in `main/ipc/documents.js`
8. Voice sync effect deps reduced (7→2) in `ReaderContainer.tsx`
9. Vite code splitting: vendor/tts/settings chunks (16 JS chunks total) in `vite.config.js`
10. `rebuildLibraryIndex` debounced (100ms) in `main.js`

### Files Changed

- `main.js` — startup parallelization, watcher/sync reorder, rebuildLibraryIndex debounce
- `main/ipc/state.js` — settings save debounce
- `main/ipc/documents.js` — snoozed doc Set index
- `main/file-parsers.js` — EPUB chapter cache LRU (50-cap)
- `src/components/FoliatePageView.tsx` — `injectStyles` getComputedStyle cache
- `src/components/ReaderContainer.tsx` — voice sync dep array reduction
- `src/components/LibraryContainer.tsx` — WPM persistence debounce
- `vite.config.js` — manualChunks code splitting
- `tests/perfAudit.test.ts` — 32 new perf audit tests

### SUCCESS CRITERIA (all 18 met)

1. Window is visible before `initAuth()` and `initSyncEngine()` complete
2. `initAuth()` and `initSyncEngine()` run in parallel (not sequential)
3. Folder watcher starts before folder sync completes
4. `injectStyles` calls `getComputedStyle` exactly once per invocation (not 3×)
5. Settings saves are debounced — 10 rapid calls within 500ms produce ≤2 file writes
6. WPM input persistence is debounced — typing does not trigger per-keystroke saves
7. EPUB chapter cache has LRU eviction with 50-entry cap
8. Chapter cache size never exceeds cap (no unbounded growth)
9. Snoozed doc check uses a pre-built index — does not iterate full library
10. Voice sync useEffect dependency array has ≤3 items (down from 7)
11. Vite build produces separate chunks for vendor, TTS, and settings
12. `rebuildLibraryIndex` is debounced — batch mutations trigger single rebuild
13. No Phase A instrumentation remains in committed code
14. ≥16 new tests in `tests/perfAudit.test.ts` (32 delivered)
15. `npm test` passes, `npm run build` succeeds
16. No regressions in narration, flow mode, or library operations
17. Build output shows multiple chunks (not single bundle)
18. Startup-to-window time measurably improved (target: window visible < 500ms after app.whenReady)

**Depends on:** None — investigation gate cleared by Cowork analysis.
