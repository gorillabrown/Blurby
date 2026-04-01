# Blurby — Development Roadmap

**Last updated**: 2026-04-01 — Post-EPUB-2B. 897 tests, 46 files. v1.5.1.
**Current branch**: `main`
**Current state**: Phase 2 complete. EPUB-2A (content fidelity) + EPUB-2B (pipeline completion) done. Phase 3 next (Flow Mode redesign).
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
Phase 3: Flow Mode Redesign
    │
    ▼
Phase 4: Blurby Readings
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 5:                  Phase 6:
Read Later + News         Cloud Sync Hardening
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 7: APK Wrapper (+2 modularization sprints)
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

### Sprint FLOW-3A: Flow Mode Infinite Scroll

**Version:** v1.6.0
**Branch:** `sprint/flow-3a-redesign`
**Tier:** Full (new feature + architecture change)
**Baseline:** v1.5.1, 897 tests / 46 files

#### WHERE (read in order before coding)

1. `docs/governance/LESSONS_LEARNED.md` — LL-013 (Flow in Page View), LL-014 (imperative animation), LL-015 (forced reflow), LL-016 (state batching)
2. `src/modes/FlowMode.ts` — Current timing engine (setTimeout chain, rhythm pauses)
3. `src/utils/FlowCursorController.ts` — Current cursor renderer (line map, CSS transitions, page turn)
4. `src/components/FoliatePageView.tsx` — Line ~480: `flow="paginated"` attribute, section-load hooks, style injection
5. `src/components/ScrollReaderView.tsx` — Existing scroll-based reader (reference for scroll container patterns)
6. `src/components/ReaderContainer.tsx` — Mode switching logic, reader view selection
7. `src/hooks/useReaderMode.ts` — Mode lifecycle (start/stop/pause/resume)
8. `src/hooks/useKeyboardShortcuts.ts` — Flow-mode keyboard bindings
9. `src/utils/constants.ts` — Flow-related constants
10. `src/styles/global.css` — Flow cursor CSS classes

#### Tasks

| # | Agent | Task | Model |
|---|-------|------|-------|
| 1 | renderer-fixer | **FlowScrollEngine class** — New imperative class (`src/utils/FlowScrollEngine.ts`) replacing FlowCursorController. Attaches to foliate's scrolled-mode container (all docs are EPUB post-EPUB-2B). Owns cursor DOM element, animation timers, and line map. Public API: `start(container, wordIndex, wpm)`, `stop()`, `pause()`, `resume()`, `setWpm(n)`, `jumpToWord(n)`, `jumpToLine(direction)`, `jumpToParagraph(direction)`, `getState()`, `destroy()`. Internal: `buildLineMap()` scans `[data-word-index]` spans to compute line positions. `animateLine()` renders the shrinking underline via CSS transition (`width` from 100% to 0 over line-duration ms). `advanceLine()` moves to next line, resets cursor. `scrollToLine(lineIdx)` smooth-scrolls the container so the active line sits at ~25% viewport height (reading zone). `requestAnimationFrame` loop for scroll synchronization. **Note:** No separate FlowScrollView component — since EPUB-2B, all documents are EPUB, so FlowScrollEngine operates exclusively on foliate's `flow="scrolled"` container. | opus |
| 2 | renderer-fixer | **FoliatePageView flow integration** — Add `flowMode: boolean` prop to `FoliatePageView`. When `flowMode=true`: set `flow="scrolled"` (line ~480), disable pagination controls, expose the scrollable container ref to FlowScrollEngine. FlowScrollEngine attaches to foliate's scroll container and overlays the shrinking cursor. Word position mapping uses existing `[data-word-index]` spans injected by `onSectionLoad`. Section boundaries: hook foliate's `relocate` event to detect when scroll crosses into a new EPUB section and re-build line map. When `flowMode=false` (or on mode exit): restore `flow="paginated"`, re-enable pagination. | opus |
| 3 | renderer-fixer | **ReaderContainer mode routing** — Update `ReaderContainer.tsx` to pass `flowMode={true}` to FoliatePageView when Flow Mode is active. Page Mode, Focus Mode, and Narrate Mode continue with `flow="paginated"` (unchanged). Mode switch from Flow → Page must restore paginated layout and correct page position. | sonnet |
| 4 | renderer-fixer | **FlowMode.ts update** — Adapt the timing engine to work with FlowScrollEngine instead of FlowCursorController. The setTimeout chain still drives word advancement and rhythm pauses. New: `onLineComplete` callback triggers FlowScrollEngine's `advanceLine()`. `onWordAdvance` now also updates scroll position (FlowScrollEngine auto-scrolls to keep active line in reading zone). Remove page-turn logic (no pages in infinite scroll). Add `updateWords()` for dynamic word loading (EPUB section boundaries). | sonnet |
| 5 | renderer-fixer | **Keyboard navigation** — Update `useKeyboardShortcuts.ts` for Flow Mode scroll context. ↑/↓ = jump to prev/next line (FlowScrollEngine.jumpToLine). Shift+↑/↓ = jump to prev/next paragraph (FlowScrollEngine.jumpToParagraph, using paragraphBreaks set). ←/→ = coarse WPM adjust (±25). Space = pause/resume. Escape = exit Flow Mode. Shift+←/→ = jump to paragraph boundaries (BUG-069). Mouse scroll wheel = manual scroll override that pauses auto-scroll, resumes after 2s idle (BUG-070 partial). | sonnet |
| 6 | renderer-fixer | **CSS + theming** — New CSS classes in `global.css`: `.flow-scroll-container` (full viewport height, `overflow-y: auto`, smooth scroll behavior), `.flow-reading-zone` (visual indicator — subtle gradient or line at ~25% height, optional), `.flow-shrink-cursor` (position absolute, height 3px, background `var(--accent)`, transition `width Xms linear`), `.flow-shrink-cursor--reset` (transition: none for instant reset). E-ink mode: thicker cursor (4px), no smooth scroll (jump-scroll instead). Dark theme: cursor uses `var(--accent)` (already theme-aware). WCAG: cursor contrast ratio ≥ 4.5:1 against all theme backgrounds. | sonnet |
| 7 | renderer-fixer | **Constants extraction** — Add to `src/utils/constants.ts`: `FLOW_READING_ZONE_POSITION = 0.25` (fraction of viewport height for active line), `FLOW_CURSOR_HEIGHT = 3` (px), `FLOW_CURSOR_EINK_HEIGHT = 4` (px), `FLOW_SCROLL_RESUME_DELAY = 2000` (ms after manual scroll to resume auto-scroll), `FLOW_LINE_ADVANCE_BUFFER = 50` (ms pause between lines for eye movement). Remove `FLOW_PAGE_TURN_PAUSE_MS` (no page turns in new model). | haiku |
| 8 | test-runner | **Tests** — New test file `tests/flow-scroll-engine.test.js`. Unit tests for FlowScrollEngine: line map building, cursor position calculation, WPM-to-scroll-speed conversion, line advancement, paragraph jumping, reading zone positioning. Integration tests: mode switch Page→Flow→Page preserves position, EPUB flow="scrolled" attribute toggle, keyboard nav in flow context, pause/resume state machine, word index tracking across line boundaries. Target: ≥20 new tests. Run `npm test` + `npm run build`. | haiku |
| 9 | spec-compliance-reviewer | **Spec compliance review** — Verify all 12 SUCCESS CRITERIA. | sonnet |
| 10 | doc-keeper | **Documentation** — Update CLAUDE.md (v1.6.0, test count, architecture — FlowScrollEngine replaces FlowCursorController, foliate-only Flow rendering, LL-013 reversal note), SPRINT_QUEUE.md (remove FLOW-3A, add to completed), ROADMAP.md (mark FLOW-3A complete), LESSONS_LEARNED.md (new entries for any discoveries), TECHNICAL_REFERENCE.md (Flow Mode architecture section rewrite), BUG_REPORT.md (BUG-069 resolved, BUG-070 partial). | sonnet |

#### SUCCESS CRITERIA

1. **Infinite scroll renders** — Flow Mode displays all document text in a continuous scrollable container (no page breaks, no CSS columns). Non-EPUB and EPUB both render continuously.
2. **Auto-scroll at WPM** — Container scrolls upward automatically so the active line stays at ~25% viewport height. Scroll speed derived from WPM setting. Changing WPM immediately adjusts scroll speed.
3. **Shrinking underline cursor** — `var(--accent)` underline spans full line width, contracts left-to-right at WPM-derived speed. When width reaches 0, next line's underline appears at full width. Transition is smooth (CSS transition on `width`).
4. **Reading zone** — Active line consistently positioned at ~25% from top of viewport (upper third). Upcoming text visible below. Already-read text scrolls off top.
5. **EPUB foliate integration** — `FoliatePageView` uses `flow="scrolled"` when Flow Mode is active. FlowScrollEngine attaches to foliate's scroll container. Cursor overlay renders correctly over foliate content. Switching back to Page Mode restores `flow="paginated"`.
6. **Keyboard nav parity** — ↑/↓ = line jump, Shift+↑/↓ = paragraph jump (BUG-069), ←/→ = WPM adjust, Space = pause/resume, Escape = exit. All work in both non-EPUB and EPUB.
7. **Pause/resume** — Space pauses auto-scroll and cursor animation. Space again resumes from exact position. Manual scroll (mouse wheel) pauses auto-scroll, resumes after 2s idle.
8. **Position preservation** — Switching Page→Flow→Page preserves reading position (word index or CFI for EPUBs). Exiting Flow Mode returns to the correct page.
9. **Word index tracking** — `FlowMode.ts` wordIndex stays accurate throughout scroll. `onWordAdvance` fires for each word at correct WPM timing. Progress bar in bottom bar reflects true position.
10. **Tests pass** — ≥20 new tests in `tests/flow-scroll-engine.test.js`. `npm test` passes (≥917 total). `npm run build` succeeds.
11. **No regressions** — Page Mode, Focus Mode, and Narrate Mode unaffected. Existing keyboard shortcuts in non-Flow modes unchanged.
12. **Theming** — Cursor uses `var(--accent)`. E-ink mode uses thicker cursor + jump-scroll. Dark/light themes render correctly. WCAG 2.1 AA contrast met.

#### DONE WHEN

All 12 SUCCESS CRITERIA pass spec-compliance review. `npm test` ≥ 917. `npm run build` PASS. No regressions in Page/Focus/Narrate modes.

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
| BUG-069 | Paragraph jump shortcuts | Shift+Left/Right jumps to paragraph boundaries |
| BUG-070 | Scroll wheel word advance | Mouse wheel = word advance in reading modes |

### Phase 4: Blurby Readings
| ID | Feature | Description |
|----|---------|-------------|
| BUG-078 | Reading Queue | Ordered reading list, drag-to-reorder |
| BUG-050 | 3-line library cards | Title, Author, Book Data (progress %, pages, time) |
| BUG-067 | "New" dot auto-clear | IntersectionObserver + seenAt timestamp |
| BUG-074 | Author name normalization | Standardize to "Last, First" format |
| BUG-077 | Metadata Wizard | Batch metadata enrichment |
| BUG-076 | First-run library folder picker | Mandatory onboarding step |

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
