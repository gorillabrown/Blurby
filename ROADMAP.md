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

### Sprint FLOW-3A: Flow Mode Infinite Scroll ✅ COMPLETED (v1.6.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. All 12 SUCCESS CRITERIA met. 35 new tests (932 total, 47 files). FlowScrollEngine replaces FlowCursorController. LL-013 reversed (see LL-067).

---

### Sprint FLOW-3B: Flow Mode Polish ✅ COMPLETED (v1.6.1, 2026-04-01)

> Dead code removal (FlowScrollView, FlowCursorController, FLOW_PAGE_TURN_PAUSE_MS). Edge case hardening (empty doc, zero-width lines, font size rebuild). BUG-091/084 confirmed resolved by FLOW-3A. Bottom bar verified visible. Truncation fix for FoliatePageView.tsx + useKeyboardShortcuts.ts. 8 new tests (940 total).

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
