# Blurby — Development Roadmap

**Last updated**: 2026-04-01 — Post-FLOW-3B. 940 tests, 47 files. v1.6.1.
**Current branch**: `main`
**Current state**: Phase 3 complete (FLOW-3A + FLOW-3B). Phase 4 next (Blurby Readings).
**Governing roadmap**: `docs/project/ROADMAP_V2.md` (7-phase product roadmap)

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`. Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 1 Exit Gate (Step 3 re-audit) ── PASS (2026-04-01)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 2:                  Phase 1.5:
EPUB Content Fidelity     Test Coverage
(✅ EPUB-2A + EPUB-2B)   (parallel, non-blocking)
    │
    ▼
Phase 3: Flow Mode Redesign (✅ FLOW-3A + FLOW-3B done)
    │
    ▼
Phase 4: Blurby Readings (4A ✅, 4B next, 4C queued)
    │
    ▼
Phase 5: Read Later + Chrome Extension (5A queued)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 6:                  Phase 7:
E-ink Display Mode        Cloud Sync Hardening
(full phase — decouple
from theme system)
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 8: APK Wrapper (+2 modularization sprints)
```

---

## Phase 2 — EPUB Content Fidelity

**Goal:** The existing EPUB converter preserves formatting, images, and structure from all source formats. EPUB becomes the true single canonical internal format with no legacy text fallback.

**Baseline:** `main/epub-converter.js` (769 lines) already converts TXT, MD, HTML, PDF, MOBI/AZW → EPUB. The import pipeline (`main/ipc/library.js`) routes all non-EPUB files through `convertToEpub()`. Foliate renders EPUBs. Legacy text fallback path (`main/legacy-parsers.js`) remains as dead-end for failed conversions.

**Gaps addressed:**
- BUG-033: Book formatting stripped too aggressively (bold, italic, lists, headings lost)
- BUG-034: Images in books stripped during import (not extracted or embedded)
- BUG-075/079: EPUB pipeline completion (DOCX support, URL→EPUB, single rendering path)

---

### Sprint EPUB-2A: Content Fidelity ✅ COMPLETED (v1.5.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-033/034 resolved. 18 new tests. APPROVED_WITH_CONCERNS (PDF bold/italic and image extraction limited by pdf-parse).

---

### Sprint EPUB-2B: Pipeline Completion ✅ COMPLETED (v1.5.1, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-075/079 resolved. 16 new tests. APPROVED — all SUCCESS CRITERIA met. URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path.

---

## Phase 3 — Flow Mode Redesign

**Goal:** Replace the current paginated cursor-on-pages Flow Mode with an infinite-scroll reading experience. Text flows continuously and scrolls upward at WPM speed through a reading zone in the upper third of the viewport. A shrinking underline cursor paces the reader line-by-line. Works for both plain text/HTML docs and foliate-rendered EPUBs.

**Baseline:** `FlowMode.ts` (163 lines) drives word-by-word timing via setTimeout chain. `FlowCursorController.ts` (240 lines) slides a CSS-transitioned bar across paginated lines. Both operate within PageReaderView. `FoliatePageView.tsx` hardcodes `flow="paginated"` — foliate-js supports `flow="scrolled"` natively but Blurby has never used it.

**Architecture decision:** Flow Mode gets its own scroll-based rendering path. This reverses LL-013 ("Flow belongs in Page View") — infinite scroll is fundamentally incompatible with pagination. Page Mode stays paginated. Flow Mode switches to continuous scroll. This is a clean separation: the mode vertical (`FlowMode.ts`) drives timing, a new `FlowScrollEngine` manages the scroll container and cursor rendering.

**Key design decisions:**
- **Reading zone:** Upper third of viewport. Active line ~25% from top. Upcoming text fills the bottom 75%. Already-read text scrolls off the top.
- **Shrinking underline cursor:** Full-width `var(--accent)` underline appears under the active line, contracts from left-to-right at WPM speed. When it reaches zero width → next line begins with fresh full-width underline. The cursor IS the pacer — no separate scroll speed control.
- **EPUB support via foliate scrolled mode:** `flow="scrolled"` gives us a native scrollable container. Cursor overlays on top. Narration sync deferred to FLOW-3B.
- **LL-014 still applies:** Cursor animation is imperative (class-based, not React effects). New `FlowScrollEngine` class replaces `FlowCursorController`.

---

### Sprint FLOW-3A: Flow Mode Infinite Scroll ✅ COMPLETED (v1.6.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. All 12 SUCCESS CRITERIA met. 35 new tests (932 total, 47 files). FlowScrollEngine replaces FlowCursorController. LL-013 reversed (see LL-067).

---

### Sprint FLOW-3B: Flow Mode Polish ✅ COMPLETED (v1.6.1, 2026-04-01)

> Dead code removal (FlowScrollView, FlowCursorController, FLOW_PAGE_TURN_PAUSE_MS). Edge case hardening (empty doc, zero-width lines, font size rebuild). BUG-091/084 confirmed resolved by FLOW-3A. Bottom bar verified visible. Truncation fix for FoliatePageView.tsx + useKeyboardShortcuts.ts. 8 new tests (940 total).

---

## Phase 4 — Blurby Readings

<<<<<<< Updated upstream
**Goal:** Transform the library and reading queue into a curated reading experience. Cards show richer metadata at a glance. The reading queue becomes an explicit, reorderable list with "Add to Queue" as a first-class action. New-import dots auto-clear when the user scrolls past them.

**Baseline:** Library cards (DocGridCard 193 lines, DocCard 210 lines) already render 3 lines: Title / Author / book data (`formatBookDataLine`). ReadingQueue.tsx (110 lines) splits "Continue Reading" / "Unread" sections inside MenuFlap.tsx (224 lines, default view = "queue"). `sortReadingQueue()` in queue.ts sorts by `lastReadAt` (in-progress) then `created` (unread). `seenAt` field exists on BlurbyDoc but auto-clear via IntersectionObserver is not wired. DocGridCard has a disabled "Add to Queue" context menu button (line 106).

**Gaps addressed:**
- BUG-050: 3-line library cards — book data line needs format update to "45% · 3h 12m left"
- BUG-078: Reading Queue — explicit `queuePosition` ordering with drag-to-reorder
- BUG-067: "New" dot auto-clear — IntersectionObserver on library cards, passive `seenAt` stamping

**Phase 4 split:** READINGS-4A = Cards + Queue + New dot (this sprint). READINGS-4B = Author normalization (BUG-074), Metadata Wizard (BUG-077), First-run folder picker (BUG-076).

---

### Sprint READINGS-4A: Library Cards, Queue, New Dot (v1.7.0)

**Branch:** `sprint/readings-4a`
**Tier:** Full (new feature, multiple components, data model change)
**Estimate:** ~35 tool uses (single dispatch)
=======
**Goal:** Transform the library into a curated reading experience. Richer card metadata, explicit reading queue, author normalization, metadata enrichment, and first-run onboarding.

**Phase 4 split:**
- READINGS-4A ✅ (cards + queue + new dot) — v1.7.0
- READINGS-4B = Author normalization + First-run folder picker
- READINGS-4C = Metadata Wizard

---

### Sprint READINGS-4B: Author Normalization + First-Run Folder Picker (v1.8.0)

**Branch:** `sprint/readings-4b`
**Tier:** Quick (targeted fixes, no architecture change)
**Estimate:** ~25 tool uses (single dispatch)

**Scope:** Two independent features: (1) normalize all author names to "Last, First" format during import and provide a one-time batch normalization for existing library, (2) add a folder picker step to the first-run onboarding flow so users select their library folder before seeing the empty library.
>>>>>>> Stashed changes

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
<<<<<<< Updated upstream
2. `docs/governance/LESSONS_LEARNED.md` — scan for library, queue, card-related entries
3. `ROADMAP.md` — this section (full spec)
4. `src/types.ts` — BlurbyDoc interface (add `queuePosition`)
5. `src/utils/bookData.ts` — `formatBookDataLine` (format update)
6. `src/utils/queue.ts` — `sortReadingQueue` (queuePosition support)
7. `src/components/ReadingQueue.tsx` — drag-to-reorder, queue sections
8. `src/components/DocGridCard.tsx` — wire "Add to Queue" context menu
9. `src/components/DocCard.tsx` — add "Add to Queue" context menu
10. `src/components/MenuFlap.tsx` — pass queue callbacks
11. `src/components/LibraryContainer.tsx` — IntersectionObserver for seenAt
12. `main/ipc/library.js` — IPC handlers for queue operations
13. `src/styles/global.css` — drag-to-reorder styles
=======
2. `docs/governance/LESSONS_LEARNED.md` — scan for library, import, onboarding entries
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbyDoc interface (`author`, `authorFull`)
5. `main/epub-converter.js` — where author metadata is extracted during import
6. `main/ipc/library.js` — import pipeline, rescan logic, where author is first stored
7. `src/components/AddEditPanel.tsx` — existing Last/First name split UI
8. `src/components/OnboardingOverlay.tsx` — current 3-step welcome tour (no folder picker)
9. `main/ipc/state.js` — `select-folder` IPC handler
10. `src/components/LibraryContainer.tsx` — `!settings.firstRunCompleted` guard
>>>>>>> Stashed changes

#### Tasks

| # | Agent | Task | Files |
|---|-------|------|-------|
<<<<<<< Updated upstream
| 1 | renderer-fixer | **Book data line format** — Update `formatBookDataLine` to show `"45% · 3h 12m left"` for in-progress docs. Zero-progress docs show `"323p · 6.2h"` (keep current). "Left" means remaining time, not elapsed. Drop page count from in-progress format. | `src/utils/bookData.ts` |
| 2 | renderer-fixer | **Add `queuePosition` to BlurbyDoc** — Optional `number`. `undefined` = not in queue. Integer starting at 0. Update `sortReadingQueue()`: if any doc has `queuePosition !== undefined`, sort queued docs by `queuePosition` first, then non-queued by current logic (lastReadAt / created). | `src/types.ts`, `src/utils/queue.ts` |
| 3 | electron-fixer | **Queue IPC handlers** — `add-to-queue(docId)`: assigns next `queuePosition` (max + 1). `remove-from-queue(docId)`: clears `queuePosition`, compacts remaining positions. `reorder-queue(docId, newPosition)`: moves doc to `newPosition`, shifts others. All persist to `library.json`. | `main/ipc/library.js`, `preload.js` |
| 4 | renderer-fixer | **Wire "Add to Queue" on cards** — DocGridCard: enable existing disabled button (line 106), call `window.electronAPI.addToQueue(doc.id)`. DocCard: add matching "Add to Queue" action button. Both: show "Remove from Queue" if `doc.queuePosition !== undefined`. | `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx` |
| 5 | renderer-fixer | **Drag-to-reorder in ReadingQueue** — HTML5 drag-and-drop on queue items. `draggable="true"`, `onDragStart`/`onDragOver`/`onDrop`. Visual drag indicator (CSS class `queue-item-dragging`). On drop, call `window.electronAPI.reorderQueue(docId, newPosition)`. Only queued items are draggable. Keep "Continue Reading" / "Unread" section headers but render queued items at top in a "Queue" section. | `src/components/ReadingQueue.tsx`, `src/styles/global.css` |
| 6 | renderer-fixer | **"New" dot auto-clear via IntersectionObserver** — In LibraryContainer or LibraryView, create a single IntersectionObserver (threshold 0.5). Observe every card's root element. When a card with `unread === true` intersects for ≥1 second, call existing `seenAt` logic to stamp `seenAt` and clear `unread`. Debounce via `setTimeout` + `Map<string, timeout>` to avoid flicker on fast scroll. Clean up observer on unmount. | `src/components/LibraryContainer.tsx` |
| 7 | renderer-fixer | **Pass queue callbacks through MenuFlap** — MenuFlap needs to pass `onAddToQueue`, `onRemoveFromQueue`, `onReorderQueue` down to ReadingQueue. Add props to MenuFlapProps. Wire from LibraryContainer → MenuFlap → ReadingQueue. | `src/components/MenuFlap.tsx`, `src/components/LibraryContainer.tsx` |
| 8 | test-runner | **Tests** — Unit tests for: `formatBookDataLine` new format (in-progress shows remaining time), `sortReadingQueue` with `queuePosition`, queue IPC handlers (add/remove/reorder/compact), IntersectionObserver auto-clear behavior. ≥15 new tests. | `tests/` |
| 9 | test-runner | **`npm test` + `npm run build`** | — |
| 10 | spec-reviewer | **Spec compliance review** | — |
| 11 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 12 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. DocGridCard and DocCard show 3 lines: Title / Author / `"45% · 3h 12m left"` (in-progress) or `"323p · 6.2h"` (unread)
2. `queuePosition` field on BlurbyDoc, persisted to library.json
3. "Add to Queue" / "Remove from Queue" works from both card types (grid + list)
4. ReadingQueue shows "Queue" section (ordered by `queuePosition`) above "Continue Reading" and "Unread"
5. Drag-to-reorder works in ReadingQueue — positions update correctly and persist
6. "New" dot (unread indicator) auto-clears when card is visible for ≥1 second via IntersectionObserver
7. Queue operations round-trip through IPC: add, remove, reorder all persist
8. `sortReadingQueue` respects `queuePosition` — queued items always sort first
9. `npm test` passes (≥955 tests across ≥48 files)
10. `npm run build` succeeds
11. No regressions to library grid, list view, or MenuFlap navigation
12. Existing reading queue behavior preserved for docs without `queuePosition` (backward compatible)
=======
| 1 | renderer-fixer | **Author normalization utility** — Create `src/utils/authorNormalize.ts`. Function `normalizeAuthor(raw: string): string` handles: single author ("John Smith" → "Smith, John"), already normalized ("Smith, John" → no-op), multi-word last names (heuristic: last word is last name unless known prefix like "de", "van", "von", "al-", "el-"), multiple authors (split on " and ", " & ", "; " → normalize each → join with "; "). Edge cases: single-word names (unchanged), empty/undefined (return as-is), `authorFull` (never normalize — display-only byline). | `src/utils/authorNormalize.ts` |
| 2 | electron-fixer | **Apply normalization on import** — Call `normalizeAuthor()` in the import pipeline wherever `author` is first assigned from metadata extraction. Apply to file imports, URL imports, and rescan. Do NOT touch `authorFull`. | `main/ipc/library.js`, `main/epub-converter.js` |
| 3 | electron-fixer | **Batch normalize IPC** — New `normalize-all-authors` IPC handler. Iterates library, applies `normalizeAuthor()` to every doc with an `author` field, persists changes. Returns `{ updated: number }`. Idempotent (already-normalized names pass through unchanged). | `main/ipc/library.js`, `preload.js` |
| 4 | renderer-fixer | **"Normalize Authors" button in Library Layout settings** — Add a button to LibraryLayoutSettings (or wherever library management lives) that calls `window.electronAPI.normalizeAllAuthors()` and shows a toast with count. One-time action, not automatic. | `src/components/settings/LibraryLayoutSettings.tsx` |
| 5 | renderer-fixer | **First-run folder picker** — Add a folder picker step to OnboardingOverlay between "welcome" and the tour. New phase: `"folder"`. Shows "Choose your library folder" with a button that calls `window.electronAPI.selectFolder()`. "Skip" proceeds without folder (existing behavior). Disable "Next" until folder is selected or user skips. | `src/components/OnboardingOverlay.tsx` |
| 6 | test-runner | **Tests** — Unit tests for `normalizeAuthor()`: single name, multi-word, prefixed ("de Souza"), multi-author, already normalized, empty, `authorFull` passthrough. Integration: batch normalize IPC. ≥12 new tests. | `tests/` |
| 7 | test-runner | **`npm test`** | — |
| 8 | spec-reviewer | **Spec compliance** | — |
| 9 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `normalizeAuthor("John Smith")` → `"Smith, John"`
2. `normalizeAuthor("Smith, John")` → `"Smith, John"` (idempotent)
3. `normalizeAuthor("João de Souza")` → `"de Souza, João"` (prefix handling)
4. `normalizeAuthor("Alice Smith and Bob Jones")` → `"Smith, Alice; Jones, Bob"` (multi-author)
5. Author normalization applied automatically on all new imports
6. "Normalize Authors" button in settings normalizes existing library, shows toast with count
7. `authorFull` field is never modified by normalization
8. First-run onboarding includes folder picker step before tour
9. Folder picker calls existing `select-folder` IPC — no new Electron dialog code
10. Skipping folder picker proceeds to tour (existing behavior preserved)
11. `npm test` passes (≥969 tests)
12. No regressions to import pipeline, library display, or onboarding flow

---

### Sprint READINGS-4C: Metadata Wizard (v1.9.0)

**Branch:** `sprint/readings-4c`
**Tier:** Full (new feature, new UI component, IPC + data model)
**Estimate:** ~35 tool uses (single dispatch)

**Scope:** Batch metadata enrichment wizard. Scans library for docs with missing or incomplete metadata (no author, no cover, generic title). Offers auto-fill from EPUB/file metadata, filename parsing, and manual editing. No external API calls in 4C — local-only enrichment. API enrichment (Open Library, Google Books) deferred to future sprint.

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbyDoc interface
5. `main/epub-converter.js` — `extractEpubMetadata()` function
6. `main/ipc/library.js` — library read/write, existing metadata extraction
7. `src/components/AddEditPanel.tsx` — current metadata editor (title + author only)
8. `src/components/LibraryContainer.tsx` — modal/dialog patterns
9. `src/styles/global.css` — wizard styling patterns

#### Tasks

| # | Agent | Task | Files |
|---|-------|------|-------|
| 1 | electron-fixer | **Metadata scan IPC** — New `scan-library-metadata` IPC handler. Returns `MetadataScanResult[]`: for each doc, reports which fields are missing or likely wrong (no author, title matches filename, no cover). Extracts embedded EPUB metadata via `extractEpubMetadata()` for docs that have `convertedEpubPath`. Returns both current values and suggested values. | `main/ipc/library.js`, `preload.js` |
| 2 | electron-fixer | **Filename parser utility** — `parseFilenameMetadata(filename: string)`: extracts title, author from common filename patterns: `"Author - Title.epub"`, `"Title (Author).epub"`, `"Title.epub"`. Returns `{ suggestedTitle?, suggestedAuthor? }`. | `main/metadata-utils.js` |
| 3 | electron-fixer | **Batch update IPC** — New `apply-metadata-updates` IPC handler. Takes `Array<{ docId, updates: Partial<BlurbyDoc> }>`, applies updates, persists. Only allowed fields: `title`, `author`, `coverPath`. | `main/ipc/library.js`, `preload.js` |
| 4 | renderer-fixer | **MetadataWizard component** — New modal component. Steps: (a) scan results table showing docs with issues, (b) per-doc row with current vs suggested values, checkboxes to accept suggestions, (c) inline editing for manual override, (d) "Apply" button applies all accepted changes via batch update IPC. Accessible: focus trap, keyboard nav, escape to close. | `src/components/MetadataWizard.tsx`, `src/styles/global.css` |
| 5 | renderer-fixer | **Wizard trigger** — "Metadata Wizard" button in Library Layout settings page. Opens MetadataWizard modal. Also accessible via Ctrl+Shift+M keyboard shortcut. | `src/components/settings/LibraryLayoutSettings.tsx`, `src/hooks/useKeyboardShortcuts.ts` |
| 6 | renderer-fixer | **Wire wizard to LibraryContainer** — State management for wizard open/close, pass library docs and callbacks. Refresh library after wizard applies changes. | `src/components/LibraryContainer.tsx` |
| 7 | test-runner | **Tests** — Unit tests for `parseFilenameMetadata()` (10+ patterns). Integration tests for scan and batch update IPCs. MetadataWizard component: renders, selects, applies. ≥15 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `scan-library-metadata` returns scan results for all docs with missing/incomplete metadata
2. `parseFilenameMetadata("Author - Title.epub")` → `{ suggestedAuthor: "Author", suggestedTitle: "Title" }`
3. `parseFilenameMetadata("Title.epub")` → `{ suggestedTitle: "Title" }`
4. `apply-metadata-updates` batch-applies accepted suggestions, persists to library.json
5. MetadataWizard modal shows scan results with current vs suggested values
6. User can accept/reject individual suggestions and manually edit values
7. "Apply" button updates all accepted changes in one batch
8. Wizard accessible via settings button AND Ctrl+Shift+M
9. Focus trap, keyboard nav, escape-to-close on wizard modal
10. `npm test` passes (≥984 tests)
11. `npm run build` succeeds
12. No regressions to library, import pipeline, or existing metadata editing

---

## Phase 5 — Read Later + Chrome Extension

**Goal:** Harden the Chrome extension → desktop pipeline with automated E2E tests. Integrate extension-sourced articles with the reading queue (READINGS-4A). Articles sent from the extension auto-join the queue and display with clear "web" source attribution.

**Baseline:** Chrome extension (7 files, ~1,700 lines) already sends articles via WebSocket to `main/ws-server.js` (441 lines). Articles are extracted via Readability.js, converted to EPUB, and added to library with `source: "url"`, `unread: true`. Existing WS test file (`tests/ws-server.test.js`, 317 lines) covers frame encoding and message shapes but has no integration tests. `handleAddArticle()` (ws-server.js line 226) does NOT set `queuePosition` — articles land in library but not in the reading queue.

---

### Sprint EXT-5A: Chrome Extension E2E Tests + Queue Integration (v1.10.0)

**Branch:** `sprint/ext-5a`
**Tier:** Full (new test infrastructure, data model integration, IPC change)
**Estimate:** ~35 tool uses (single dispatch)

**Scope:** Two tracks: (1) E2E test suite covering the full article ingestion pipeline (article → WS message → EPUB conversion → library entry → queue position), (2) Wire extension-sourced articles into the reading queue automatically.

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `main/ws-server.js` — `handleAddArticle()` (line 226) — the integration point
5. `tests/ws-server.test.js` — existing WS tests (317 lines, 15 tests)
6. `main/ipc/library.js` — queue IPC handlers (`add-to-queue`, `reorder-queue`)
7. `src/utils/queue.ts` — `sortReadingQueue()` with `queuePosition`
8. `main/epub-converter.js` — `htmlToEpub()` used by article ingestion
9. `chrome-extension/service-worker.js` — message protocol reference
10. `chrome-extension/content-script.js` — article extraction shape

#### Tasks

| # | Agent | Task | Files |
|---|-------|------|-------|
| 1 | electron-fixer | **Auto-queue extension articles** — In `handleAddArticle()`, after doc creation: assign `queuePosition` = next available (max existing + 1). Extension articles always enter the reading queue. Set `unread: true` (already done). Set `seenAt: undefined` (ensures "New" dot appears). | `main/ws-server.js` |
| 2 | electron-fixer | **Author normalization on extension articles** — If READINGS-4B has landed, call `normalizeAuthor()` on `article.author` before storing. If not yet landed, add a TODO comment with sprint reference. | `main/ws-server.js` |
| 3 | test-runner | **E2E pipeline test module** — New `tests/extension-pipeline.test.js`. Tests the full article → doc flow WITHOUT starting a real WebSocket server (mock the WS layer, test the processing pipeline directly). Test cases: (a) valid article → doc created with correct fields, (b) article → EPUB conversion succeeds (mock `htmlToEpub` return), (c) doc gets `queuePosition` assigned, (d) doc has `unread: true` and `source: "url"`, (e) missing `textContent` → error response, (f) EPUB conversion failure → doc still created with text fallback, (g) article with `htmlContent` → used instead of plain text wrapping, (h) `authorFull` preserved alongside normalized `author`. | `tests/extension-pipeline.test.js` |
| 4 | test-runner | **WS protocol round-trip tests** — Extend `tests/ws-server.test.js`. New tests: (a) `add-article` with complete payload → `ok` response shape, (b) `add-article` with minimal payload (title + textContent only) → succeeds, (c) `add-article` with empty textContent → error, (d) `auth` with wrong token → `auth-failed`, (e) unknown message type → error response, (f) ping → pong response. | `tests/ws-server.test.js` |
| 5 | test-runner | **Queue integration tests** — In `tests/extension-pipeline.test.js`: (a) first article gets `queuePosition: 0`, (b) second article gets `queuePosition: 1`, (c) `sortReadingQueue` places queued extension articles in correct order, (d) extension article appears in "Queue" section of ReadingQueue (not just "Unread"). | `tests/extension-pipeline.test.js` |
| 6 | renderer-fixer | **Source badge prominence for extension articles** — In DocGridCard and DocCard, ensure `source: "url"` articles show the "web" badge prominently. If `sourceDomain` exists, show domain name instead of generic "web". Verify existing badge logic handles this (may be a no-op if already working). | `src/components/DocGridCard.tsx`, `src/components/DocCard.tsx` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-reviewer | **Spec compliance** | — |
| 9 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Extension-sourced articles automatically get `queuePosition` (next available integer)
2. Extension articles appear in ReadingQueue "Queue" section immediately after ingestion
3. `unread: true` and `seenAt: undefined` set on extension articles (triggers "New" dot)
4. E2E pipeline tests cover: valid article, missing fields, EPUB conversion success/failure, queue assignment
5. WS protocol tests cover: auth success/failure, add-article success/failure, ping/pong, unknown type
6. Queue integration tests verify `queuePosition` auto-increment and sort order
7. ≥20 new tests in `tests/extension-pipeline.test.js`
8. ≥6 new tests in `tests/ws-server.test.js`
9. `npm test` passes (≥1,010 tests)
10. `npm run build` succeeds
11. Existing WS tests (15 tests) still pass — no regressions
12. Source badge shows domain name for URL-sourced articles (e.g., "nytimes.com" not just "web")

---

## Phase 5 Exit Gate

Phase 5A is complete when:
1. Extension articles auto-enter reading queue
2. E2E test coverage exists for the full article ingestion pipeline
3. All existing extension functionality preserved (no regressions)

Phase 5B (RSS/News feeds) will be scoped after 5A ships.
>>>>>>> Stashed changes

---

## Phase 2 Exit Gate

Phase 2 is complete when:
1. Import any supported format → EPUB generated → opens in foliate with formatting intact
2. URL articles → EPUB (not PDF)
3. Narration extracts words correctly from converted EPUBs
4. All 4 reading modes work on converted content
5. No legacy text rendering path remains
6. `npm test` passes, `npm run build` succeeds
7. Sprint Queue depth ≥3 with Phase 3 spec'd

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
<<<<<<< Updated upstream
| READINGS-4A | v1.7.0 | 🔜 NEXT | Library cards, reading queue, "New" dot auto-clear. Phase 4 start. |
=======
| EXT-5A | v1.10.0 | 🔜 QUEUED | Chrome extension E2E tests + queue integration. Phase 5 start. |
| READINGS-4C | v1.9.0 | 🔜 QUEUED | Metadata Wizard — batch scan, filename parsing, local enrichment. |
| READINGS-4B | v1.8.0 | 🔜 NEXT | Author normalization + first-run folder picker. |
| HOTFIX-ARM | v1.7.0+ | ✅ DONE | ONNX ARM64 fix — onnxruntime-node 1.24.3 override, cpuinfo suppression. |
| READINGS-4A | v1.7.0 | ✅ DONE | Library cards, reading queue, "New" dot auto-clear. 17 new tests. |
>>>>>>> Stashed changes
| FLOW-3B | v1.6.1 | ✅ DONE | Flow Mode polish. Dead code removal, edge cases, truncation fix. 8 new tests. |
| FLOW-3A | v1.6.0 | ✅ DONE | Flow Mode infinite scroll. FlowScrollEngine, shrinking underline cursor, reading zone. 35 new tests. |
| EPUB-2B | v1.5.1 | ✅ DONE | URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path. 16 new tests. |
| EPUB-2A | v1.5.0 | ✅ DONE | Content fidelity — formatting, images, DOCX support. 18 new tests. |
| Phase 1 (AUDIT-FIX 1A-1F) | v1.4.9–v1.4.14 | ✅ DONE | 42 audit findings addressed. 7 CRITICAL, 8+ MAJOR, 6 MODERATE fixed. 9 MODERATE deferred. |
| HOTFIX-11 | v1.4.8 | ✅ DONE | ONNX worker thread crash patch. 863 tests / 44 files. |
| NAR-5 + prior | v1.4.7 | ✅ DONE | Narration pipeline complete. See `docs/project/ROADMAP_ARCHIVE.md`. |

**Full sprint history:** `docs/project/ROADMAP_ARCHIVE.md`

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by phase alignment per ROADMAP_V2.

### Phase 3: Flow Mode Redesign
| ID | Feature | Description |
|----|---------|-------------|
| ~~BUG-069~~ | ~~Paragraph jump shortcuts~~ | ✅ RESOLVED (FLOW-3A) — Shift+↑/↓ jumps paragraphs in Flow Mode |
| BUG-070 | Scroll wheel word advance | Partially resolved (FLOW-3A) — mouse wheel pauses auto-scroll, resumes after 2s. Full word-advance deferred. |

### Phase 4: Blurby Readings
| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| ~~BUG-078~~ | ~~Reading Queue~~ | ✅ 4A | Ordered reading list, drag-to-reorder |
| ~~BUG-050~~ | ~~3-line library cards~~ | ✅ 4A | Title, Author, Book Data (progress %, pages, time) |
| ~~BUG-067~~ | ~~"New" dot auto-clear~~ | ✅ 4A | IntersectionObserver + seenAt timestamp |
| BUG-074 | Author name normalization | 4B | Standardize to "Last, First" format |
| BUG-076 | First-run library folder picker | 4B | Mandatory onboarding step |
| BUG-077 | Metadata Wizard | 4C | Batch metadata enrichment (local-only, no API) |

### Phase 5: Read Later + Blurby News
| ID | Feature | Description |
|----|---------|-------------|
| BUG-055–059 | Settings/command palette UX | Combined settings pages, Ctrl+K searchable settings |

### Backlog (Unphased)
| ID | Feature | Description |
|----|---------|-------------|
| BUG-037 | E-ink as display mode | Decouple from theme system |
| BUG-060–062 | Branding | Icon, theme, sample prefix |
| BUG-070 | Scroll wheel word advance | Mouse wheel = word advance in reading modes |
| BUG-038 | Hotkey coaching in reader | Keyboard shortcut suggestions on mouse click |

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support
- Import/export (backup library, stats to CSV)
- Streaming ZIP parsing for large EPUBs
- Time-window stats archival
- Toast queue system
- Version-pin critical dependencies
- iOS app, Firefox extension, Safari extension
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         